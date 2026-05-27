import { Budget } from '../domain/budget';
import { aferixLogger } from '../core/debug/aferixLogger';

export type OperationalAnomaly = {
  budgetId: string;
  issue: string;
  severity: 'low' | 'high' | 'critical';
};

export const operationalConsistencyService = {
  validateBudgetLifecycle(budget: Budget): boolean {
    if (budget.status === 'finalizado' && budget.chargedValue === undefined) {
      return false; // Cannot finalize without a value
    }
    if (budget.status !== 'iniciado' && budget.status !== 'em_revisao' && (!budget.clientId)) {
      return false; // Active budget must have a client
    }
    return true;
  },

  detectInvalidTransitions(currentStatus: string, nextStatus: string): boolean {
    if (currentStatus === 'finalizado' && nextStatus === 'em_execucao') return true; // Invalid
    if (currentStatus === 'arquivado' && nextStatus !== 'iniciado') return true; // Invalid
    if (currentStatus === 'recusado' && nextStatus === 'em_execucao') return true; // Invalid

    return false;
  },

  validateFinancialConsistency(budget: Budget): boolean {
    // If it has costs, it should technically have a defined chargedValue if it's past aprovado
    if (['em_execucao', 'finalizado'].includes(budget.status)) {
      if ((budget.chargedValue || 0) < 0) return false;
    }
    return true;
  },

  detectOperationalAnomalies(budgets: Budget[]): OperationalAnomaly[] {
    const anomalies: OperationalAnomaly[] = [];
    
    for (const b of budgets) {
      if (!this.validateBudgetLifecycle(b)) {
        anomalies.push({ budgetId: b.id, issue: 'Lifecycle transition invalid', severity: 'high' });
      }
      if (!this.validateFinancialConsistency(b)) {
        anomalies.push({ budgetId: b.id, issue: 'Financial inconsistency', severity: 'critical' });
      }
      if (b.status === 'finalizado' && !b.clientId) {
        anomalies.push({ budgetId: b.id, issue: 'Finalized without client', severity: 'critical' });
      }
    }
    
    return anomalies;
  },

  generateOperationalReport(budgets: Budget[]): { totalAnomalies: number; criticalAnomalies: number; anomalies: OperationalAnomaly[] } {
    const anomalies = this.detectOperationalAnomalies(budgets);
    const criticals = anomalies.filter(a => a.severity === 'critical');
    
    if (anomalies.length > 0) {
      aferixLogger.warn('OperationalConsistency', `Detected ${anomalies.length} anomalies.`);
    }

    return {
      totalAnomalies: anomalies.length,
      criticalAnomalies: criticals.length,
      anomalies
    };
  }
};
