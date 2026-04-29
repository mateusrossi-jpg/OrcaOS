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

export function calculateBudgetTotal(budget: Budget): number {
  const subtotal = calculateBudgetSubtotal(budget.items);
  const discount = budget.discount ?? 0;

  if (discount < 0) {
    throw new Error('Desconto não pode ser negativo.');
  }

  return Math.max(subtotal - discount, 0);
}
