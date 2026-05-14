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
      materialCost: typeof parsed.materialCost === 'number' && Number.isFinite(parsed.materialCost) ? parsed.materialCost : 0,
      operationalCost: typeof parsed.operationalCost === 'number' && Number.isFinite(parsed.operationalCost) ? parsed.operationalCost : 0,
      taxRate: typeof parsed.taxRate === 'number' && Number.isFinite(parsed.taxRate) ? parsed.taxRate : typeof parsed.aliquota_imposto === 'number' && Number.isFinite(parsed.aliquota_imposto) ? parsed.aliquota_imposto : 6,
      total_servicos: typeof parsed.total_servicos === 'number' && Number.isFinite(parsed.total_servicos) ? parsed.total_servicos : 0,
      custo_materiais: typeof parsed.custo_materiais === 'number' && Number.isFinite(parsed.custo_materiais) ? parsed.custo_materiais : typeof parsed.materialCost === 'number' && Number.isFinite(parsed.materialCost) ? parsed.materialCost : 0,
      custos_operacionais: typeof parsed.custos_operacionais === 'number' && Number.isFinite(parsed.custos_operacionais) ? parsed.custos_operacionais : typeof parsed.operationalCost === 'number' && Number.isFinite(parsed.operationalCost) ? parsed.operationalCost : 0,
      aliquota_imposto: typeof parsed.aliquota_imposto === 'number' && Number.isFinite(parsed.aliquota_imposto) ? parsed.aliquota_imposto : typeof parsed.taxRate === 'number' && Number.isFinite(parsed.taxRate) ? parsed.taxRate : 6,
      lucro_liquido: typeof parsed.lucro_liquido === 'number' && Number.isFinite(parsed.lucro_liquido) ? parsed.lucro_liquido : 0,
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
    materialCost: state.materialCost ?? 0,
    operationalCost: state.operationalCost ?? 0,
    taxRate: state.taxRate ?? state.aliquota_imposto ?? 6,
    total_servicos: state.total_servicos ?? 0,
    custo_materiais: state.custo_materiais ?? state.materialCost ?? 0,
    custos_operacionais: state.custos_operacionais ?? state.operationalCost ?? 0,
    aliquota_imposto: state.aliquota_imposto ?? state.taxRate ?? 6,
    lucro_liquido: state.lucro_liquido ?? 0,
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
