import type { Budget, BudgetItem } from '../types/business';
import { ensurePositiveNumber } from '../validation/numberValidation';

export function calculateBudgetItemTotal(item: BudgetItem): number {
  ensurePositiveNumber(item.quantity, 'Quantidade');
  ensurePositiveNumber(item.unitPrice, 'Preço unitário');

  return item.quantity * item.unitPrice;
}

export function calculateBudgetSubtotal(items: BudgetItem[]): number {
  return items.reduce((total, item) => total + calculateBudgetItemTotal(item), 0);
}

export function calculateBudgetCommercialSubtotal(budget: Budget): number {
  const subtotal = calculateBudgetSubtotal(budget.items);
  const travelCost = budget.travelCost ?? 0;
  const additionalFees = budget.additionalFees ?? 0;

  if (travelCost < 0) {
    throw new Error('Deslocamento não pode ser negativo.');
  }

  if (additionalFees < 0) {
    throw new Error('Taxas adicionais não podem ser negativas.');
  }

  return subtotal + travelCost + additionalFees;
}

export function calculateBudgetTotal(budget: Budget): number {
  const subtotal = calculateBudgetCommercialSubtotal(budget);
  const discount = budget.discount ?? 0;

  if (discount < 0) {
    throw new Error('Desconto não pode ser negativo.');
  }

  return Math.max(subtotal - discount, 0);
}
