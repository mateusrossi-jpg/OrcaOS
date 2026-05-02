import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import { clearSavedBudgets, deleteSavedBudget, loadSavedBudgets, saveBudgetRecord } from './savedBudgetsStorage';

describe('saved budgets storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    clearSavedBudgets();
    vi.unstubAllGlobals();
  });

  it('saves a budget record', () => {
    const saved = saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento A',
      status: 'draft',
      discount: 0,
      items: [],
    });

    const records = loadSavedBudgets();

    expect(saved?.id).toBeDefined();
    expect(records).toHaveLength(1);
    expect(records[0].clientName).toBe('Cliente A');
  });

  it('updates an existing budget record', () => {
    const saved = saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento A',
      status: 'draft',
      discount: 0,
      items: [],
    });

    saveBudgetRecord({
      id: saved?.id,
      clientName: 'Cliente B',
      title: 'Orçamento atualizado',
      status: 'approved',
      discount: 10,
      items: [],
    });

    const records = loadSavedBudgets();

    expect(records).toHaveLength(1);
    expect(records[0].clientName).toBe('Cliente B');
    expect(records[0].status).toBe('approved');
    expect(records[0].createdAt).toBe(saved?.createdAt);
  });

  it('loads legacy records with professional commercial fields defaulted', () => {
    window.localStorage.setItem('orcaos:saved-budgets:v1', JSON.stringify([
      {
        id: 'legacy',
        clientName: 'Cliente legado',
        title: 'Orçamento antigo',
        status: 'draft',
        discount: 0,
        items: [],
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
    ]));

    const [record] = loadSavedBudgets();

    expect(record.travelCost).toBe(0);
    expect(record.additionalFees).toBe(0);
    expect(record.paymentTerms).toBe('');
  });

  it('supports expired and cancelled status', () => {
    saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento vencido',
      status: 'expired',
      discount: 0,
      items: [],
    });

    saveBudgetRecord({
      clientName: 'Cliente B',
      title: 'Orçamento cancelado',
      status: 'cancelled',
      discount: 0,
      items: [],
    });

    expect(loadSavedBudgets().map((record) => record.status)).toEqual(['cancelled', 'expired']);
  });

  it('keeps saved budgets sorted by most recent update', () => {
    window.localStorage.setItem('orcaos:saved-budgets:v1', JSON.stringify([
      {
        id: 'old',
        clientName: 'Cliente antigo',
        title: 'Antigo',
        status: 'draft',
        discount: 0,
        items: [],
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
      {
        id: 'new',
        clientName: 'Cliente novo',
        title: 'Novo',
        status: 'sent',
        discount: 0,
        items: [],
        createdAt: '2026-05-02T00:00:00.000Z',
        updatedAt: '2026-05-02T00:00:00.000Z',
      },
    ]));

    expect(loadSavedBudgets().map((record) => record.id)).toEqual(['new', 'old']);
  });

  it('deletes a saved budget record', () => {
    const saved = saveBudgetRecord({
      clientName: 'Cliente A',
      title: 'Orçamento A',
      status: 'draft',
      discount: 0,
      items: [],
    });

    deleteSavedBudget(saved?.id ?? 'missing');

    expect(loadSavedBudgets()).toHaveLength(0);
  });

  it('ignores invalid stored records', () => {
    window.localStorage.setItem('orcaos:saved-budgets:v1', JSON.stringify([{ id: 123 }]));

    expect(loadSavedBudgets()).toHaveLength(0);
  });

  it('returns an empty list when storage is unavailable', () => {
    vi.unstubAllGlobals();

    expect(loadSavedBudgets()).toEqual([]);
  });
});
