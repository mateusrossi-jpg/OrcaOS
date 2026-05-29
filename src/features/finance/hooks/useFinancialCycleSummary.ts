import { useMemo } from 'react';
import { useBudgetHistory } from '../../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../../domain/budget';
import { calculateBudget } from '../../../domain/aferixFinanceEngine';

export interface FinancialCycleSummary {
  revenue: number;
  costs: number;
  profit: number;
}

/**
 * useFinancialCycleSummary: The Finance Authority for the current cycle.
 * Responsibility: Calculate revenue, costs, and profit for the current active cycle.
 * Source of Truth: Financial Mutations & Budget Snapshots.
 */
export function useFinancialCycleSummary(): FinancialCycleSummary {
  const { budgets } = useBudgetHistory();

  return useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const all = budgets || [];
    const monthlyFinalized = all.filter(b => b.status === BUDGET_STATUS.FINALIZADO && new Date(b.updatedAt) >= startOfMonth);
    
    const profit = monthlyFinalized.reduce((acc, b) => acc + (b.financialSnapshot?.lucroBruto || calculateBudget(b).lucroBruto), 0);
    const revenue = monthlyFinalized.reduce((acc, b) => acc + (b.financialSnapshot ? (b.chargedValue - b.discounts) : calculateBudget(b).totalComercial), 0);
    const costs = revenue - profit;

    return { revenue, costs, profit };
  }, [budgets]);
}
