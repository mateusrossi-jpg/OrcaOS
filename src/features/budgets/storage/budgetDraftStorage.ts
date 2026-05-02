import type { BudgetItem } from '../../../core/types/business';

const STORAGE_KEY = 'orcaos:budget-draft:v1';

export interface BudgetDraftStorageState {
  clientName: string;
  budgetTitle: string;
  discount: number;
  travelCost: number;
  additionalFees: number;
  paymentTerms: string;
  validity: string;
  guarantee: string;
  executionDeadline: string;
  commercialNotes: string;
  technicalNotes: string;
  items: BudgetItem[];
  updatedAt: string;
}

type BudgetDraftSaveInput = Pick<BudgetDraftStorageState, 'clientName' | 'budgetTitle' | 'discount' | 'items'> &
  Partial<Omit<BudgetDraftStorageState, 'clientName' | 'budgetTitle' | 'discount' | 'items' | 'updatedAt'>>;

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
      travelCost: typeof parsed.travelCost === 'number' && Number.isFinite(parsed.travelCost) ? parsed.travelCost : 0,
      additionalFees: typeof parsed.additionalFees === 'number' && Number.isFinite(parsed.additionalFees) ? parsed.additionalFees : 0,
      paymentTerms: typeof parsed.paymentTerms === 'string' ? parsed.paymentTerms : '',
      validity: typeof parsed.validity === 'string' ? parsed.validity : '',
      guarantee: typeof parsed.guarantee === 'string' ? parsed.guarantee : '',
      executionDeadline: typeof parsed.executionDeadline === 'string' ? parsed.executionDeadline : '',
      commercialNotes: typeof parsed.commercialNotes === 'string' ? parsed.commercialNotes : '',
      technicalNotes: typeof parsed.technicalNotes === 'string' ? parsed.technicalNotes : '',
      items: parsed.items,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveBudgetDraft(state: BudgetDraftSaveInput): BudgetDraftStorageState | null {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  const payload: BudgetDraftStorageState = {
    clientName: state.clientName,
    budgetTitle: state.budgetTitle,
    discount: state.discount,
    travelCost: state.travelCost ?? 0,
    additionalFees: state.additionalFees ?? 0,
    paymentTerms: state.paymentTerms ?? '',
    validity: state.validity ?? '',
    guarantee: state.guarantee ?? '',
    executionDeadline: state.executionDeadline ?? '',
    commercialNotes: state.commercialNotes ?? '',
    technicalNotes: state.technicalNotes ?? '',
    items: state.items,
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
