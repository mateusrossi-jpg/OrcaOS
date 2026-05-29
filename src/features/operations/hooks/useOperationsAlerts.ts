import { useMemo } from 'react';
import { useBudgetHistory } from '../../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../../domain/budget';

export type AlertType = 'BLOCKED' | 'PENDING_CLIENT' | 'URGENT_QUOTE' | 'REJECTED';

export interface OperationsAlert {
  id: string;
  type: AlertType;
  title: string;
  priority: number; // Domain-level severity (1-10)
  destination: string;
  meta?: Record<string, any>;
}

/**
 * useOperationsAlerts: The Operations Authority for anomaly detection.
 * Responsibility: Identifying anomalies (Blocked Services) or high-priority needs.
 * Source of Truth: Operational state engine.
 */
export function useOperationsAlerts(): OperationsAlert[] {
  const { budgets } = useBudgetHistory();

  return useMemo(() => {
    const all = budgets || [];
    const alerts: OperationsAlert[] = [];

    all.forEach(b => {
      // Rule: Blocked (P0)
      if (b.status === BUDGET_STATUS.PAUSADO) {
        alerts.push({
          id: b.id,
          type: 'BLOCKED',
          title: b.title,
          priority: 10,
          destination: 'budgets',
        });
      }
      
      // Rule: Rejected (P0)
      if (b.status === BUDGET_STATUS.RECUSADO) {
        alerts.push({
          id: b.id,
          type: 'REJECTED',
          title: b.title,
          priority: 9,
          destination: 'budgets',
        });
      }

      // Rule: Pending Client Approval (P1)
      if (b.status === BUDGET_STATUS.ENVIADO) {
        alerts.push({
          id: b.id,
          type: 'PENDING_CLIENT',
          title: b.title,
          priority: 5,
          destination: 'budgets',
        });
      }
    });

    return alerts.sort((a, b) => b.priority - a.priority);
  }, [budgets]);
}
