import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBudgetDraft, loadBudgetDraft, saveBudgetDraft } from './budgetDraftStorage';

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
