import { Budget } from '../../domain/budget';
import { financialSafety } from '../finance/financialSafety';

export type FinancialSummary = {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMargin: number;
};

export const selectFinancialSummary = (budgets: Budget[]): FinancialSummary => {
  let totalRevenue = 0;
  let totalCosts = 0;
  let totalProfit = 0;

  const validBudgets = budgets.filter(b => b.syncStatus !== 'deleted' && b.status === 'finalizado');

  for (const b of validBudgets) {
    const rev = financialSafety.safeCurrency(b.chargedValue);
    const cost = financialSafety.safeCurrency(
      (b.materialCost || 0) + (b.travelCost || 0) + (b.helperCost || 0) + (b.otherCosts || 0)
    );
    const profit = financialSafety.safeCurrency(rev - cost);
    
    totalRevenue += rev;
    totalCosts += cost;
    totalProfit += profit;
  }

  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue: financialSafety.normalizeMoney(totalRevenue),
    totalCosts: financialSafety.normalizeMoney(totalCosts),
    totalProfit: financialSafety.normalizeMoney(totalProfit),
    averageMargin: financialSafety.normalizeMoney(averageMargin),
  };
};

export const selectDashboardKPIs = (budgets: Budget[]) => {
  const active = budgets.filter(b => b.status !== 'arquivado' && b.status !== 'recusado' && b.syncStatus !== 'deleted');
  const pendingApproval = active.filter(b => b.status === 'em_revisao').length;
  const inExecution = active.filter(b => b.status === 'em_execucao').length;
  
  return {
    activeCount: active.length,
    pendingApproval,
    inExecution
  };
};
