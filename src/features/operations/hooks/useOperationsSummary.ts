import { useMemo } from 'react';
import { useBudgetHistory } from '../../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../../domain/budget';

export interface OperationsSummary {
  executingCount: number;
  pendingCount: number;
  authorizedCount: number;
}

/**
 * useOperationsSummary: The Operations Authority for current counts.
 * Responsibility: Counting objects in specific operational phases.
 * Source of Truth: Budget & Work Order State Store.
 */
export function useOperationsSummary(): OperationsSummary {
  const { budgets } = useBudgetHistory();

  return useMemo(() => {
    const all = budgets || [];
    const executingCount = all.filter(b => b.status === BUDGET_STATUS.EM_EXECUCAO).length;
    const pendingCount = all.filter(b => b.status === BUDGET_STATUS.ENVIADO).length;
    const authorizedCount = all.filter(b => b.status === BUDGET_STATUS.AUTORIZADO).length;

    return { executingCount, pendingCount, authorizedCount };
  }, [budgets]);
}
