import { useState, useEffect, useMemo, useCallback } from 'react';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { Budget, BUDGET_STATUS } from '../domain/budget';

const persistence = new BudgetPersistenceService();

export type HistoryFilter = 'todos' | 'andamento' | 'finalizados';

export function useBudgetHistory() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<HistoryFilter>('todos');

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const domainBudgets = await persistence.listBudgets();
      setBudgets(domainBudgets);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a budget and refresh list
  const deleteBudget = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await persistence.deleteBudget(id);
      await loadBudgets();
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgets]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const filteredBudgets = useMemo(() => {
    switch (filter) {
      case 'andamento':
        return budgets.filter(b => b.status !== BUDGET_STATUS.FINALIZADO && b.status !== BUDGET_STATUS.RECUSADO);
      case 'finalizados':
        return budgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO);
      default:
        return budgets;
    }
  }, [budgets, filter]);

  return {
    budgets: filteredBudgets,
    totalCount: budgets.length,
    isLoading,
    filter,
    setFilter,
    refresh: loadBudgets,
    deleteBudget,
  };
}
