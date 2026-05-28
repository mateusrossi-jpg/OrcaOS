import { db } from '../storage/dexieDatabase';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { Budget } from '../domain/budget';
import { aferixLogger } from '../core/debug/aferixLogger';

export interface HardeningReport {
  budgetId: string;
  isConsistent: boolean;
  driftValue: number;
  eventsCount: number;
  fixed: boolean;
}

/**
 * BudgetHardeningService: Responsável por garantir a integridade total
 * dos cálculos e sincronismo via Event Store.
 */
export const budgetHardeningService = {

  /**
   * Reconstrói o estado financeiro de um orçamento baseado APENAS no Event Store.
   * Isso prova se o Event Store é uma fonte da verdade confiável.
   */
  async reconstructFromEvents(budgetId: string): Promise<Partial<Budget>> {
    const events = await db.operationalEvents
      .where('aggregateId')
      .equals(budgetId)
      .toArray();

    // Ordenar por timestamp e depois por sequence (se existir)
    const sortedEvents = events.sort((a, b) => {
      const timeDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (timeDiff !== 0) return timeDiff;
      return (a.sequence || 0) - (b.sequence || 0);
    });

    let reconstructed: Partial<Budget> = {};

    for (const event of sortedEvents) {
      if (event.eventType === 'BUDGET_CREATED' && event.snapshot) {
        reconstructed = { ...event.snapshot } as Partial<Budget>;
      } else if (event.eventType === 'FINANCIAL_MUTATION' && event.metadata?.diff) {
        const diffs = event.metadata.diff as { field: string; newValue: number }[];
        diffs.forEach(d => {
          (reconstructed as Record<string, unknown>)[d.field] = d.newValue;
        });
      } else if (event.snapshot) {
        // Snapshots em transições de status também servem como pontos de sincronismo
        reconstructed = { ...reconstructed, ...event.snapshot } as Partial<Budget>;
      }
    }

    return reconstructed;
  },

  /**
   * Audita um orçamento comparando o estado atual com o motor de cálculo e os eventos.
   */
  async auditBudget(budgetId: string): Promise<HardeningReport> {
    const budget = await db.budgets.get(budgetId);
    if (!budget) throw new Error('Budget not found');

    const events = await db.operationalEvents.where('aggregateId').equals(budgetId).toArray();
    const engineResult = calculateBudget(budget);
    
    let isConsistent = true;
    let driftValue = 0;

    // 1. Validar contra snapshot financeiro (se finalizado)
    if (budget.status === 'finalizado' && budget.financialSnapshot) {
      driftValue = Math.abs(budget.financialSnapshot.lucroBruto - engineResult.lucroBruto);
      if (driftValue > 0.01) isConsistent = false;
    }

    // 2. Validar contra reconstrução de eventos (se houver eventos de mutação)
    const hasFinancialEvents = events.some(e => e.eventType === 'FINANCIAL_MUTATION');
    if (hasFinancialEvents) {
      const fromEvents = await this.reconstructFromEvents(budgetId);
      const fields: (keyof Budget & string)[] = ['chargedValue', 'materialCost', 'travelCost'];
      for (const field of fields) {
        if ((fromEvents as Record<string, unknown>)[field] !== (budget as unknown as Record<string, unknown>)[field]) {
          isConsistent = false;
          aferixLogger.warn('Hardening', `Drift detected in ${field} for budget ${budgetId}`);
        }
      }
    }

    return {
      budgetId,
      isConsistent,
      driftValue,
      eventsCount: events.length,
      fixed: false
    };
  },

  /**
   * Repara inconsistências financeiras forçando o recalculo e snapshot.
   */
  async repairBudget(budgetId: string): Promise<boolean> {
    const budget = await db.budgets.get(budgetId);
    if (!budget) return false;

    const engineResult = calculateBudget(budget);
    
    if (budget.status === 'finalizado') {
      budget.financialSnapshot = {
        custoTotal: engineResult.totalCost,
        lucroBruto: engineResult.lucroBruto,
        margemPercentual: engineResult.marginPercent,
        statusLucro: engineResult.statusLucro,
        createdAt: budget.financialSnapshot?.createdAt || new Date().toISOString()
      };
      
      await db.budgets.put(budget);
      aferixLogger.audit('Hardening', `Repaired financial snapshot for budget ${budgetId}`);
      return true;
    }

    return false;
  }
};
