import { describe, it, expect } from 'vitest';
import { validateBudgetItem, validateBudgetForProposal } from './budgetValidation';
import type { Budget } from '../types/business';

describe('Budget Validation', () => {
  const validBudget: Budget = {
    id: 'b-1',
      siteId: 'site-1',
      title: 'Orçamento Teste',
    status: 'iniciado',
    items: [
      { id: 'item-1', description: 'Instalação de tomada', quantity: 2, unitPrice: 80, category: 'labor' },
    ],
    chargedValue: 160,
    materialCost: 0,
    travelCost: 0,
    helperCost: 0,
    fees: 0,
    discounts: 10,
    otherCosts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('validates a correct item', () => {
    const issues = validateBudgetItem({ id: '1', description: 'Test', quantity: 1, unitPrice: 10, category: 'labor' });
    expect(issues).toHaveLength(0);
  });

  it('detects missing description', () => {
    const issues = validateBudgetItem({ id: '1', description: ' ', quantity: 1, unitPrice: 10, category: 'labor' });
    expect(issues.some(i => i.code === 'item-description-required')).toBe(true);
  });

  it('detects negative price', () => {
    const issues = validateBudgetItem({ id: 'bad', description: 'Test', quantity: 1, unitPrice: -1, category: 'other' });
    expect(issues.some(i => i.code === 'item-price-negative')).toBe(true);
  });

  it('warns about zero price', () => {
    const issues = validateBudgetItem({ id: 'free', description: 'Cortesia', quantity: 1, unitPrice: 0, category: 'other' });
    expect(issues.some(i => i.code === 'item-price-zero')).toBe(true);
  });

  it('validates a complete budget', () => {
    const issues = validateBudgetForProposal(validBudget);
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('blocks empty items', () => {
    const issues = validateBudgetForProposal({ ...validBudget, items: [] });
    expect(issues.some(i => i.code === 'budget-empty')).toBe(true);
  });

  it('blocks discount greater than subtotal', () => {
    const issues = validateBudgetForProposal({ ...validBudget, discounts: 999 });
    expect(issues.some(i => i.code === 'discount-too-high')).toBe(true);
  });

  it('detects negative additional values', () => {
    const issues = validateBudgetForProposal({ ...validBudget, discounts: -1, travelCost: -10, fees: -5 });
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(3);
  });
});
