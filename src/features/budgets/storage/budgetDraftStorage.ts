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
  materialCost: number;
  operationalCost: number;
  taxRate: number;
  total_servicos: number;
  custo_materiais: number;
  custos_operacionais: number;
  aliquota_imposto: number;
  lucro_liquido: number;
  updatedAt: string;
}

type BudgetDraftSaveInput = Pick<BudgetDraftStorageState, 'clientName' | 'budgetTitle' | 'discount' | 'items'> &
  Partial<Omit<BudgetDraftStorageState, 'clientName' | 'budgetTitle' | 'discount' | 'items' | 'updatedAt'>>;

function sanitizeNonNegative(value: number | undefined, fallback = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, value);
}

function cloneBudgetItems(items: BudgetItem[]): BudgetItem[] {
  return items.map((item) => ({
    ...item,
    quantity: sanitizeNonNegative(item.quantity),
    unitPrice: sanitizeNonNegative(item.unitPrice),
  }));
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
      discount: sanitizeNonNegative(typeof parsed.discount === 'number' ? parsed.discount : undefined),
      travelCost: sanitizeNonNegative(typeof parsed.travelCost === 'number' ? parsed.travelCost : undefined),
      additionalFees: sanitizeNonNegative(typeof parsed.additionalFees === 'number' ? parsed.additionalFees : undefined),
      paymentTerms: typeof parsed.paymentTerms === 'string' ? parsed.paymentTerms : '',
      validity: typeof parsed.validity === 'string' ? parsed.validity : '',
      guarantee: typeof parsed.guarantee === 'string' ? parsed.guarantee : '',
      executionDeadline: typeof parsed.executionDeadline === 'string' ? parsed.executionDeadline : '',
      commercialNotes: typeof parsed.commercialNotes === 'string' ? parsed.commercialNotes : '',
      technicalNotes: typeof parsed.technicalNotes === 'string' ? parsed.technicalNotes : '',
      items: cloneBudgetItems(parsed.items),
      materialCost: sanitizeNonNegative(typeof parsed.materialCost === 'number' ? parsed.materialCost : undefined),
      operationalCost: sanitizeNonNegative(typeof parsed.operationalCost === 'number' ? parsed.operationalCost : undefined),
      taxRate: sanitizeNonNegative(typeof parsed.taxRate === 'number' ? parsed.taxRate : (typeof parsed.aliquota_imposto === 'number' ? parsed.aliquota_imposto : undefined), 6),
      total_servicos: sanitizeNonNegative(typeof parsed.total_servicos === 'number' ? parsed.total_servicos : undefined),
      custo_materiais: sanitizeNonNegative(typeof parsed.custo_materiais === 'number' ? parsed.custo_materiais : (typeof parsed.materialCost === 'number' ? parsed.materialCost : undefined)),
      custos_operacionais: sanitizeNonNegative(typeof parsed.custos_operacionais === 'number' ? parsed.custos_operacionais : (typeof parsed.operationalCost === 'number' ? parsed.operationalCost : undefined)),
      aliquota_imposto: sanitizeNonNegative(typeof parsed.aliquota_imposto === 'number' ? parsed.aliquota_imposto : (typeof parsed.taxRate === 'number' ? parsed.taxRate : undefined), 6),
      lucro_liquido: sanitizeNonNegative(typeof parsed.lucro_liquido === 'number' ? parsed.lucro_liquido : undefined),
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
    discount: sanitizeNonNegative(state.discount),
    travelCost: sanitizeNonNegative(state.travelCost),
    additionalFees: sanitizeNonNegative(state.additionalFees),
    paymentTerms: state.paymentTerms ?? '',
    validity: state.validity ?? '',
    guarantee: state.guarantee ?? '',
    executionDeadline: state.executionDeadline ?? '',
    commercialNotes: state.commercialNotes ?? '',
    technicalNotes: state.technicalNotes ?? '',
    items: cloneBudgetItems(state.items),
    materialCost: sanitizeNonNegative(state.materialCost),
    operationalCost: sanitizeNonNegative(state.operationalCost),
    taxRate: sanitizeNonNegative(state.taxRate ?? state.aliquota_imposto, 6),
    total_servicos: sanitizeNonNegative(state.total_servicos),
    custo_materiais: sanitizeNonNegative(state.custo_materiais ?? state.materialCost),
    custos_operacionais: sanitizeNonNegative(state.custos_operacionais ?? state.operationalCost),
    aliquota_imposto: sanitizeNonNegative(state.aliquota_imposto ?? state.taxRate, 6),
    lucro_liquido: sanitizeNonNegative(state.lucro_liquido),
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
