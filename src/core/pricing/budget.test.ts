import { describe, expect, it } from 'vitest';
import type { Budget } from '../types/business';
import { calculateBudgetItemTotal, calculateBudgetSubtotal, calculateBudgetTotal } from './budget';

describe('budget pricing', () => {
  const budget: Budget = {
    id: 'test-budget',
    title: 'Orçamento de teste',
    status: 'draft',
    discount: 20,
    items: [
      {
        id: 'labor-1',
        description: 'Mão de obra para ponto de tomada',
        quantity: 2,
        unitPrice: 80,
        category: 'labor',
      },
      {
        id: 'material-1',
        description: 'Módulo de tomada',
        quantity: 3,
        unitPrice: 18,
        category: 'material',
      },
    ],
  };

  it('calculates item total', () => {
    expect(calculateBudgetItemTotal(budget.items[0])).toBe(160);
  });

  it('calculates subtotal', () => {
    expect(calculateBudgetSubtotal(budget.items)).toBe(214);
  });

  it('calculates total with discount', () => {
    expect(calculateBudgetTotal(budget)).toBe(194);
  });

  it('never returns a negative total', () => {
    expect(calculateBudgetTotal({ ...budget, discount: 999 })).toBe(0);
  });

  it('rejects negative discount', () => {
    expect(() => calculateBudgetTotal({ ...budget, discount: -1 })).toThrow('Desconto');
  });

  it('rejects invalid quantity', () => {
    expect(() =>
      calculateBudgetItemTotal({
        id: 'invalid',
        description: 'Item inválido',
        quantity: 0,
        unitPrice: 10,
        category: 'other',
      }),
    ).toThrow('Quantidade');
  });

  it('rejects invalid unit price', () => {
    expect(() =>
      calculateBudgetItemTotal({
        id: 'invalid-price',
        description: 'Item inválido',
        quantity: 1,
        unitPrice: 0,
        category: 'other',
      }),
    ).toThrow('Preço unitário');
  });
});
