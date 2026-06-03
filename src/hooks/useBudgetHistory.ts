import { generateUUID } from '../core/utils/idGenerator';
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

  // Duplicate a budget and refresh list
  const duplicateBudget = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const original = await persistence.getBudget(id);
      if (!original) throw new Error('Orçamento original não encontrado.');
      const clone: Budget = {
        ...original,
        id: generateUUID(),
        title: `${original.title} (Cópia)`,
        status: BUDGET_STATUS.INICIADO,
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await operationalFacade.saveBudget(clone);
      await loadBudgets();
    } catch (e) {
      const err = e as Error;
      console.error('Failed to duplicate budget:', err);
      setError(err.message || 'Erro ao duplicar o orçamento.');
    } finally {
      setIsLoading(false);
    }
  }, [loadBudgets]);

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
    duplicateBudget,
    error,
    clearError: () => setError(null),
  };
}
