import { Budget } from '../../domain/budget';

// Pure, safe selectors to be used inside useMemo or useLiveQuery to prevent re-renders

export const selectActiveBudgets = (budgets: Budget[]): Budget[] => {
  return budgets.filter(b => b.status !== 'arquivado' && b.status !== 'recusado' && b.syncStatus !== 'deleted');
};

export const selectFinalizedBudgets = (budgets: Budget[]): Budget[] => {
  return budgets.filter(b => b.status === 'finalizado' && b.syncStatus !== 'deleted');
};

export const selectPendingSyncBudgets = (budgets: Budget[]): Budget[] => {
  return budgets.filter(b => b.syncStatus === 'pending');
};

export const selectRecentOperationalHistory = (budgets: Budget[], limit: number = 50): Budget[] => {
  return [...budgets]
    .filter(b => b.syncStatus !== 'deleted')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
};
