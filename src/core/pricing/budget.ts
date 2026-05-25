import { budgetCalculator } from '../../services/BudgetCalculatorService';
import { BudgetItem, Budget } from '../../domain/budget';

/**
 * Compatibility layer for core/pricing/budget imports.
 */

export function calculateBudgetItemTotal(item: BudgetItem): number {
  return budgetCalculator.calculateItemTotal(item);
}

export function calculateBudgetSubtotal(items: BudgetItem[]): number {
  return (items || []).reduce((sum, item) => sum + calculateBudgetItemTotal(item), 0);
}

export function calculateBudgetCommercialSubtotal(budget: Partial<Budget>): number {
  const result = budgetCalculator.calculateBudget(budget as Budget);
  return result.totalComercial;
}

export function calculateBudgetTotal(budget: Partial<Budget>): number {
  const result = budgetCalculator.calculateBudget(budget as Budget);
  return result.totalComercial;
}
