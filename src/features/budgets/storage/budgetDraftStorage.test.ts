import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import { clearBudgetDraft, loadBudgetDraft, saveBudgetDraft } from './budgetDraftStorage';

describe('budget draft storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    clearBudgetDraft();
    vi.unstubAllGlobals();
  });

  it('saves and loads a budget draft', () => {
    const saved = saveBudgetDraft({
      clientName: 'Cliente teste',
      budgetTitle: 'Instalação elétrica',
      discount: 15,
      travelCost: 25,
      additionalFees: 10,
      paymentTerms: '50% entrada',
      validity: '10 dias',
      guarantee: '90 dias',
      executionDeadline: '2 dias úteis',
      commercialNotes: 'Material incluso.',
      technicalNotes: 'Validar quadro.',
      items: [
        {
          id: 'item-1',
          description: 'Ponto de tomada',
          quantity: 2,
          unitPrice: 80,
          category: 'labor',
        },
      ],
    });

    const loaded = loadBudgetDraft();

    expect(saved?.updatedAt).toBeDefined();
    expect(loaded?.clientName).toBe('Cliente teste');
    expect(loaded?.budgetTitle).toBe('Instalação elétrica');
    expect(loaded?.discount).toBe(15);
    expect(loaded?.travelCost).toBe(25);
    expect(loaded?.additionalFees).toBe(10);
    expect(loaded?.paymentTerms).toBe('50% entrada');
    expect(loaded?.guarantee).toBe('90 dias');
    expect(loaded?.items).toHaveLength(1);
  });

  it('clears a saved budget draft', () => {
    saveBudgetDraft({
      clientName: 'Cliente teste',
      budgetTitle: 'Teste',
      discount: 0,
      items: [],
    });

    clearBudgetDraft();

    expect(loadBudgetDraft()).toBeNull();
  });

  it('returns null for invalid stored JSON', () => {
    window.localStorage.setItem('orcaos:budget-draft:v1', '{invalid-json');

    expect(loadBudgetDraft()).toBeNull();
  });

  it('returns null when browser storage is unavailable', () => {
    vi.unstubAllGlobals();

    expect(loadBudgetDraft()).toBeNull();
  });
});
