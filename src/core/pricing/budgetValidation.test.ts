import { describe, expect, it } from 'vitest';
import type { Budget } from '../types/business';
import { hasBlockingBudgetIssues, validateBudgetForProposal, validateBudgetItem } from './budgetValidation';

const validBudget: Budget = {
  id: 'budget',
  title: 'Proposta',
  status: 'draft',
  discount: 10,
  clientId: 'client-1',
  notes: 'client-confirmed',
  items: [
    { id: 'item-1', description: 'Instalação de tomada', quantity: 2, unitPrice: 80, category: 'labor' },
  ],
};

describe('budget validation', () => {
  it('accepts a valid budget', () => {
    expect(validateBudgetForProposal(validBudget)).toEqual([]);
  });

  it('blocks an empty budget', () => {
    const issues = validateBudgetForProposal({ ...validBudget, items: [] });
    expect(issues.map((issue) => issue.code)).toContain('budget-empty');
    expect(hasBlockingBudgetIssues(issues)).toBe(true);
  });

  it('blocks invalid item fields', () => {
    const issues = validateBudgetItem({ id: 'bad', description: '', quantity: 0, unitPrice: -1, category: 'other' });
    expect(issues.map((issue) => issue.code)).toEqual(['item-description-required', 'item-quantity-invalid', 'item-price-negative']);
  });

  it('warns for zero value items', () => {
    const issues = validateBudgetItem({ id: 'free', description: 'Cortesia', quantity: 1, unitPrice: 0, category: 'other' });
    expect(issues[0]).toMatchObject({ code: 'item-price-zero', severity: 'warning' });
    expect(hasBlockingBudgetIssues(issues)).toBe(false);
  });

  it('blocks zero value items when generating a proposal', () => {
    const issues = validateBudgetForProposal({
      ...validBudget,
      items: [{ id: 'free', description: 'Cortesia', quantity: 1, unitPrice: 0, category: 'other' }],
    });
    expect(issues).toContainEqual(expect.objectContaining({ code: 'item-price-zero', severity: 'error' }));
    expect(hasBlockingBudgetIssues(issues)).toBe(true);
  });

  it('blocks discount greater than subtotal', () => {
    const issues = validateBudgetForProposal({ ...validBudget, discount: 999 });
    expect(issues.map((issue) => issue.code)).toContain('discount-too-high');
  });

  it('warns when client is missing', () => {
    const issues = validateBudgetForProposal({ ...validBudget, clientId: undefined, notes: '' });
    expect(issues.map((issue) => issue.code)).toContain('client-missing');
  });

  it('warns for expired and cancelled status', () => {
    expect(validateBudgetForProposal({ ...validBudget, status: 'expired' }).map((issue) => issue.code)).toContain('status-expired');
    expect(validateBudgetForProposal({ ...validBudget, status: 'cancelled' }).map((issue) => issue.code)).toContain('status-cancelled');
  });
});
