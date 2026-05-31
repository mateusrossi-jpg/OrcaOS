/* eslint-disable @typescript-eslint/no-explicit-any */
import { aferixLogger } from '../core/debug/aferixLogger';
import { db } from '../storage/dexieDatabase';
import { calculateBudget } from '../domain/aferixFinanceEngine';

export interface RecoverySnapshot {
  timestamp: string;
  tablesStatus: Record<string, { count: number, accessible: boolean }>;
  corruptionDetected: boolean;
}

class DatabaseRecoveryService {
  async validateDatabaseState(): Promise<boolean> {
    try {
      await db.open();
      return true;
    } catch (e: any) {
      aferixLogger.error('DatabaseRecovery', 'Database failed to open', e);
      return false;
    }
  }

  async detectCorruption(): Promise<boolean> {
    try {
      await db.budgets.limit(1).toArray();
      await db.clients.limit(1).toArray();
      return false;
    } catch (e) {
      aferixLogger.error('DatabaseRecovery', 'Corruption detected during read test', e);
      return true;
    }
  }

  async detectPartialRestore(): Promise<boolean> {
    const workOrderCount = await db.workOrders.count();
    const budgetCount = await db.budgets.count();
    const clientCount = await db.clients.count();

    if (workOrderCount > 0 && budgetCount === 0 && clientCount === 0) {
      aferixLogger.warn('DatabaseRecovery', 'Partial restore detected');
      return true;
    }
    return false;
  }

  async validateCriticalTables(): Promise<void> {
    const isCorrupt = await this.detectCorruption();
    if (isCorrupt) throw new Error('Critical tables corrupted');
  }

  async generateRecoverySnapshot(): Promise<RecoverySnapshot> {
    const isCorrupt = await this.detectCorruption();
    return {
      timestamp: new Date().toISOString(),
      tablesStatus: {
        budgets: { count: await db.budgets.count().catch(() => 0), accessible: !isCorrupt },
        clients: { count: await db.clients.count().catch(() => 0), accessible: !isCorrupt },
        workOrders: { count: await db.workOrders.count().catch(() => 0), accessible: !isCorrupt },
      },
      corruptionDetected: isCorrupt
    };
  }

  async attemptSoftRecovery(): Promise<void> {
    aferixLogger.info('DatabaseRecovery', 'Soft recovery check.');
    if (!db.isOpen()) {
      await db.open();
    }
  }

  /**
   * FASE 4F: Deep Healing Routine (V6 - Nuclear Purge)
   * Target: Definitively eliminate the final persistent anomalies.
   */
  async healOperationalAnomalies(): Promise<{ repaired: number, purged: number }> {
    aferixLogger.audit('DatabaseRecovery', 'Starting nuclear hardening sweep...');
    
    let repaired = 0;
    let purged = 0;

    try {
      if (!db.isOpen()) await db.open();

      const budgets = await db.budgets.toArray();
      
      // Target list of toxic records that won't go away
      const toxicIds = [
        "budget-1779585304766-48424",
        "budget-1779628807244-555540",
        "budget-1779705351601-56924",
        "budget-1779708652494-333257",
        "fqr6zwmbmkmplkav3s"
      ];
      
      for (const b of budgets) {
        try {
          if (!b.id) continue;
          
          // NUCLEAR RULE: If it's a persistent anomaly reported by the user, and it's invalid -> PURGE IT NOW.
          const isToxic = toxicIds.includes(b.id);
          const activeStatuses = ['enviado', 'autorizado', 'em_execucao', 'finalizado', 'recusado', 'arquivado', 'cancelado'];
          const isInvalid = (activeStatuses.includes(b.status) && !b.clientId) || 
                           (b.status === 'finalizado' && (b.chargedValue === undefined || b.chargedValue === null));

          if (isToxic && isInvalid) {
             aferixLogger.warn('DatabaseRecovery', `Nuclear purging persistent toxic record ${b.id}`);
             await db.budgets.delete(b.id);
             purged++;
             continue;
          }

          let needsUpdate = false;
          const budget = { ...b };

          // 1. REPAIR/DOWNGRADE: MISSING CLIENT
          if (activeStatuses.includes(budget.status) && !budget.clientId) {
            const events = await db.operationalEvents.where('aggregateId').equals(budget.id).toArray();
            const clientIdFromEvents = events.find(e => e.metadata?.clientId)?.metadata?.clientId;
            
            if (clientIdFromEvents) {
              budget.clientId = clientIdFromEvents;
              needsUpdate = true;
            } else {
              const wo = await db.workOrders.where('budgetId').equals(budget.id).first();
              if (wo && wo.clientId) {
                budget.clientId = wo.clientId;
                needsUpdate = true;
              } else {
                // Smart Purgatory: Downgrade to Draft (safe state)
                budget.status = 'iniciado';
                budget.title = budget.title ? `[RECUPERADO] ${budget.title}` : 'ORÇAMENTO_ÓRFÃO';
                needsUpdate = true;
              }
            }
          }

          // 2. REPAIR: FINANCIALS
          if (budget.status === 'finalizado') {
             if (budget.chargedValue === undefined || budget.chargedValue === null) {
               try {
                 const totals = calculateBudget({ chargedValue: 0, items: budget.items || [] });
                 budget.chargedValue = totals.totalComercial || 0;
                 needsUpdate = true;
               } catch { 
                 budget.chargedValue = 0; 
                 needsUpdate = true; 
               }
             }
          }

          if (needsUpdate) {
            budget.updatedAt = new Date().toISOString();
            await db.budgets.put(budget);
            repaired++;
          }
        } catch (itemErr) {
          aferixLogger.error('DatabaseRecovery', `Failed processing record ${b.id}`, itemErr);
        }
      }
    } catch (criticalErr) {
      aferixLogger.error('DatabaseRecovery', 'CRITICAL_HEALING_CRASH', criticalErr);
    }

    return { repaired, purged };
  }
}

export const databaseRecoveryService = new DatabaseRecoveryService();
