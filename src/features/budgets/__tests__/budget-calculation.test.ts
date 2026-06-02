import { describe, it, expect } from 'vitest';
import type { Budget, BudgetItem } from '../../../core/types/business';
import { 
  calculateBudgetItemTotal, 
  calculateBudgetSubtotal, 
  calculateBudgetCommercialSubtotal,
  calculateBudgetTotal 
} from '../../../core/pricing/budget';

describe('Budget Calculation Engine', () => {
  const sampleItems: BudgetItem[] = [
    { id: '1', description: 'Item 1', quantity: 2, unitPrice: 150, category: 'labor' },
    { id: '2', description: 'Item 2', quantity: 10, unitPrice: 5.5, category: 'material' },
  ];

  const sampleBudget: Budget = {
    id: 'b-1',
      siteId: 'site-1',
      title: 'Test Budget',
    status: 'iniciado',
    items: sampleItems,
    chargedValue: 0,
    materialCost: 55,
    travelCost: 100,
    helperCost: 0,
    fees: 200,
    discounts: 50,
    otherCosts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('calculates single item total correctly', () => {
    expect(calculateBudgetItemTotal(sampleItems[0])).toBe(300);
    expect(calculateBudgetItemTotal(sampleItems[1])).toBe(55);
  });

  it('calculates array of items subtotal correctly', () => {
    expect(calculateBudgetSubtotal(sampleItems)).toBe(355);
  });

  it('quantity and unit price generate correct subtotal', () => {
    const items: BudgetItem[] = [
      { id: '1', description: 'Test', quantity: 3, unitPrice: 100, category: 'labor' }
    ];
    expect(calculateBudgetSubtotal(items)).toBe(300);
  });

  it('travel cost and fees correctly add to the subtotal', () => {
    // subtotal = 355
    // travel = 100
    // fees = 200
    // discounts = 50
    // total = 355 + 100 + 200 - 50 = 605
    expect(calculateBudgetCommercialSubtotal(sampleBudget)).toBe(605);
  });

  it('handles negative or zero values safely', () => {
    const invalidBudget: Budget = {
      ...sampleBudget,
      chargedValue: 0,
      discounts: 1000, // higher than subtotal
      travelCost: 0,
      fees: 0,
      items: [{ id: '1', description: 'Free', quantity: 1, unitPrice: 0, category: 'labor' }]
    };
    
    // total should be 0, not negative
    expect(calculateBudgetTotal(invalidBudget)).toBe(0);
  });
});
