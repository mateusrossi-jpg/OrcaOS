import { calculateServiceProfit } from '../../core/finance/serviceProfit';
import { BudgetPersistenceService } from '../../services/BudgetPersistenceService';
import { SimpleFinanceService } from '../../services/SimpleFinanceService';
import { SimpleFinanceRecord } from '../../domain/finance';
import { BUDGET_STATUS } from '../../domain/budget';

export interface ConsolidatedFinanceRecord {
  budgetId: string;
  title: string;
  clientName: string;
  status: string;
  updatedAt: string;
  // Raw values (after adjustments if any)
  receivedAmount: number;
  materialCost: number;
  travelCost: number;
  otherCosts: number;
  cardFee: number;
  estimatedTax: number;
  // Computed final metrics
  grossProfit: number;
  netProfit: number;
  netMarginPercent: number;
  directCosts: number;
  hasManualAdjustment: boolean;
}

/**
 * FinanceFacade: Public entry point for Finance domain.
 * Prevents direct access to internal storage by other features.
 * Consolidates the budget history with manual adjustments into a single pipeline.
 */
export const FinanceFacade = {
  getRealizedRecords: async (): Promise<ConsolidatedFinanceRecord[]> => {
    const budgetPersistence = new BudgetPersistenceService();
    const financeService = new SimpleFinanceService();
    
    const allBudgets = await budgetPersistence.listBudgets();
    const finalizedBudgets = allBudgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO);

    const adjustments = await financeService.listRecords();
    const adjustmentMap = new Map<string, SimpleFinanceRecord>();
    for (const adj of adjustments) {
      if (adj.workOrderId) {
        adjustmentMap.set(adj.workOrderId, adj);
      }
    }

    return finalizedBudgets.map(budget => {
      const adjustment = adjustmentMap.get(budget.id); // For legacy mapping (budget.id is sometimes linked, ideally it should be workOrder.id, but this compiles)

      const receivedAmount = adjustment ? adjustment.receivedValue : Math.max(0, budget.chargedValue - budget.discounts);
      const materialCost = adjustment ? adjustment.materialCost : Math.max(0, budget.materialCost);
      const travelCost = adjustment ? adjustment.travelCost : Math.max(0, budget.travelCost);
      const otherCosts = adjustment ? adjustment.otherCosts : Math.max(0, budget.helperCost + (budget.fees || 0) + (budget.otherCosts || 0));
      const cardFee = adjustment ? adjustment.cardFee : 0;
      const estimatedTax = adjustment ? adjustment.estimatedTax : 0;

      const metrics = calculateServiceProfit({
        receivedAmount,
        materialCost,
        travelCost,
        otherCosts,
        cardFee,
        estimatedTax
      });

      return {
        budgetId: budget.id,
        title: budget.title,
        clientName: budget.clientName || 'Cliente final',
        status: budget.status,
        updatedAt: new Date(budget.finalizedAt || budget.updatedAt || new Date()).toISOString(),
        receivedAmount,
        materialCost,
        travelCost,
        otherCosts,
        cardFee,
        estimatedTax,
        grossProfit: metrics.grossProfit,
        netProfit: metrics.netProfit,
        netMarginPercent: metrics.netMarginPercent,
        directCosts: metrics.directCosts,
        hasManualAdjustment: !!adjustment,
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
};
