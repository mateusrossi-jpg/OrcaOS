import { describe, expect, it } from 'vitest';
import type { Budget, BudgetItem } from '../../../core/types/business';
import {
  calculateBudgetItemTotal,
  calculateBudgetSubtotal,
  calculateBudgetCommercialSubtotal,
  calculateBudgetTotal,
} from '../../../core/pricing/budget';

describe('Budget Calculation Flow Protection', () => {
  const sampleItems: BudgetItem[] = [
    {
      id: 'item-1',
      description: 'Mão de obra',
      quantity: 3,
      unitPrice: 150,
      category: 'labor',
    },
    {
      id: 'item-2',
      description: 'Cabo flexível',
      quantity: 10,
      unitPrice: 5.5,
      category: 'material',
    },
  ];

  const sampleBudget: Budget = {
    id: 'b-1',
    title: 'Proposta Comercial',
    status: 'draft',
    discount: 50,
    travelCost: 100,
    additionalFees: 20,
    items: sampleItems,
  };

  it('quantity and unit price generate correct subtotal', () => {
    const item = sampleItems[0];
    expect(calculateBudgetItemTotal(item)).toBe(450);
  });

  it('budget with multiple items sums correctly', () => {
    expect(calculateBudgetSubtotal(sampleItems)).toBe(505);
  });

  it('empty item list returns 0 and does not crash or return NaN', () => {
    expect(calculateBudgetSubtotal([])).toBe(0);
    expect(Number.isNaN(calculateBudgetSubtotal([]))).toBe(false);
  });

  it('travel cost and fees correctly add to the subtotal', () => {
    expect(calculateBudgetCommercialSubtotal(sampleBudget)).toBe(625);
  });

  it('discount calculates correctly and never generates a negative total', () => {
    expect(calculateBudgetTotal(sampleBudget)).toBe(575);
    
    // Test extreme discount
    const highDiscountBudget = { ...sampleBudget, discount: 99999 };
    expect(calculateBudgetTotal(highDiscountBudget)).toBe(0);
  });

  it('NaN or empty values do not break the final price calculations', () => {
    const invalidBudget: Budget = {
      ...sampleBudget,
      discount: undefined,
      travelCost: undefined,
      additionalFees: undefined,
    };
    expect(calculateBudgetTotal(invalidBudget)).toBe(505);
  });
});
