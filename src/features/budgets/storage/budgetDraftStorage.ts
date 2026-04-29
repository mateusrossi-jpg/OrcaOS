import type { BudgetItem } from '../../../core/types/business';

const STORAGE_KEY = 'orcaos:budget-draft:v1';

export interface BudgetDraftStorageState {
  clientName: string;
  budgetTitle: string;
  discount: number;
  items: BudgetItem[];
  updatedAt: string;
}

function isBrowserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isBudgetItem(value: unknown): value is BudgetItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<BudgetItem>;
  const validCategory = item.category === 'labor' || item.category === 'material' || item.category === 'other';

  return (
    typeof item.id === 'string' &&
    typeof item.description === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    typeof item.unitPrice === 'number' &&
    Number.isFinite(item.unitPrice) &&
    validCategory
  );
}

export function loadBudgetDraft(): BudgetDraftStorageState | null {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<BudgetDraftStorageState>;

    if (!Array.isArray(parsed.items) || !parsed.items.every(isBudgetItem)) {
      return null;
    }

    return {
      clientName: typeof parsed.clientName === 'string' ? parsed.clientName : '',
      budgetTitle: typeof parsed.budgetTitle === 'string' ? parsed.budgetTitle : '',
      discount: typeof parsed.discount === 'number' && Number.isFinite(parsed.discount) ? parsed.discount : 0,
      items: parsed.items,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveBudgetDraft(state: Omit<BudgetDraftStorageState, 'updatedAt'>): BudgetDraftStorageState | null {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  const payload: BudgetDraftStorageState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearBudgetDraft(): void {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
