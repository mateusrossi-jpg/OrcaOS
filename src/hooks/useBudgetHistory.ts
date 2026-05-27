/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { Budget, BUDGET_STATUS } from '../domain/budget';
import { operationalFacade } from '../features/workflow/operationalFacade';

const persistence = new BudgetPersistenceService();

export type HistoryFilter = 'todos' | 'andamento' | 'finalizados';

export function useBudgetHistory() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<HistoryFilter>('todos');
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const domainBudgets = await persistence.listBudgets();
      setBudgets(domainBudgets);
    } catch (e) {
      const err = e as Error;
      console.error('Failed to load budgets:', err);
      setError(err.message || 'Erro ao carregar o histórico de orçamentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a budget and refresh list
  const deleteBudget = useCallback(async (id: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await operationalFacade.deleteBudget(id);
      await loadBudgets();
    } catch (e) {
      const err = e as Error;
      console.error('Failed to delete budget:', err);
      setError(err.message || 'Erro ao excluir o orçamento.');
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgets, isLoading]);

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
    error,
    clearError: () => setError(null),
  };
}
