import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSavedBudgets, deleteSavedBudget, loadSavedBudgets, saveBudgetRecord } from './savedBudgetsStorage';

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(data.keys())[index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}

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
