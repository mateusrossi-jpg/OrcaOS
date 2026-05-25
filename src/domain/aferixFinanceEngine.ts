import { Budget } from './budget';
import { budgetCalculator, BudgetCalculationResult } from '../services/BudgetCalculatorService';

/**
 * Domain Facade for Budget Calculations.
 * Consolidates all finance engine logic into a single entry point.
 */

export interface BudgetInputs extends Partial<Budget> {
  // Add specific input overrides here if needed in the future
  _dummy?: never;
}

export function calculateBudget(budget: Partial<Budget>): BudgetCalculationResult {
  return budgetCalculator.calculateBudget(budget as Budget);
}
