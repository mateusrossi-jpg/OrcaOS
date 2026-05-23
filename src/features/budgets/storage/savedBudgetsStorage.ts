import { createId } from '../../../app/utils/idHelpers';
import type { Budget, BudgetItem, BudgetStatus } from '../../../core/types/business';

const STORAGE_KEY = 'orcaos:saved-budgets:v1';

export type SavedBudgetStatus = Budget['status'];

export interface SavedBudgetRecord {
  id: string;
  clientId?: string;
  workOrderId?: string;
  clientName: string;
  title: string;
  status: SavedBudgetStatus;
  discount: number;
  travelCost: number;
  additionalFees: number;
  paymentTerms: string;
  validity: string;
  guarantee: string;
  executionDeadline: string;
  commercialNotes: string;
  technicalNotes: string;
  templateId?: string;
  items: BudgetItem[];
  materialCost: number;
  operationalCost: number;
  taxRate: number;
  total_servicos: number;
  custo_materiais: number;
  custos_operacionais: number;
  aliquota_imposto: number;
  lucro_liquido: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBudgetRecordInput {
  id?: string | null;
  clientId?: string;
  workOrderId?: string;
  clientName: string;
  title: string;
  status: SavedBudgetStatus;
  discount: number;
  travelCost?: number;
  additionalFees?: number;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  commercialNotes?: string;
  technicalNotes?: string;
  templateId?: string;
  items: BudgetItem[];
  materialCost?: number;
  operationalCost?: number;
  taxRate?: number;
  total_servicos?: number;
  custo_materiais?: number;
  custos_operacionais?: number;
  aliquota_imposto?: number;
  lucro_liquido?: number;
}

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

export function normalizeBudgetStatus(value: unknown): BudgetStatus | null {
  if (value === 'draft') return 'iniciado';
  if (value === 'sent') return 'enviado';
  if (value === 'approved') return 'autorizado';
  if (value === 'rejected') return 'recusado';
  if (value === 'expired') return 'recusado';
  if (value === 'cancelled') return 'cancelado';

  if (
    value === 'iniciado' ||
    value === 'em_revisao' ||
    value === 'enviado' ||
    value === 'autorizado' ||
    value === 'em_execucao' ||
    value === 'finalizado' ||
    value === 'recusado' ||
    value === 'cancelado'
  ) {
    return value;
  }

  return null;
}

function isValidStatus(value: unknown): value is SavedBudgetStatus {
  return normalizeBudgetStatus(value) !== null;
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

function isSavedBudgetRecord(value: unknown): value is SavedBudgetRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<SavedBudgetRecord>;

  return (
    typeof record.id === 'string' &&
    typeof record.clientName === 'string' &&
    typeof record.title === 'string' &&
    isValidStatus(record.status) &&
    typeof record.discount === 'number' &&
    Number.isFinite(record.discount) &&
    Array.isArray(record.items) &&
    record.items.every(isBudgetItem) &&
    (typeof record.travelCost === 'number' || typeof record.travelCost === 'undefined') &&
    (typeof record.additionalFees === 'number' || typeof record.additionalFees === 'undefined') &&
    (typeof record.paymentTerms === 'string' || typeof record.paymentTerms === 'undefined') &&
    (typeof record.validity === 'string' || typeof record.validity === 'undefined') &&
    (typeof record.guarantee === 'string' || typeof record.guarantee === 'undefined') &&
    (typeof record.executionDeadline === 'string' || typeof record.executionDeadline === 'undefined') &&
    (typeof record.commercialNotes === 'string' || typeof record.commercialNotes === 'undefined') &&
    (typeof record.technicalNotes === 'string' || typeof record.technicalNotes === 'undefined') &&
    (typeof record.materialCost === 'number' || typeof record.materialCost === 'undefined') &&
    (typeof record.operationalCost === 'number' || typeof record.operationalCost === 'undefined') &&
    (typeof record.taxRate === 'number' || typeof record.taxRate === 'undefined') &&
    (typeof record.total_servicos === 'number' || typeof record.total_servicos === 'undefined') &&
    (typeof record.custo_materiais === 'number' || typeof record.custo_materiais === 'undefined') &&
    (typeof record.custos_operacionais === 'number' || typeof record.custos_operacionais === 'undefined') &&
    (typeof record.aliquota_imposto === 'number' || typeof record.aliquota_imposto === 'undefined') &&
    (typeof record.lucro_liquido === 'number' || typeof record.lucro_liquido === 'undefined') &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

export function loadSavedBudgets(): SavedBudgetRecord[] {
  if (!isBrowserStorageAvailable()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedBudgetRecord).map((record) => ({
      ...record,
      status: normalizeBudgetStatus(record.status) ?? 'iniciado',
      discount: sanitizeNonNegative(record.discount),
      travelCost: sanitizeNonNegative(record.travelCost),
      additionalFees: sanitizeNonNegative(record.additionalFees),
      paymentTerms: record.paymentTerms ?? '',
      validity: record.validity ?? '',
      guarantee: record.guarantee ?? '',
      executionDeadline: record.executionDeadline ?? '',
      commercialNotes: record.commercialNotes ?? '',
      technicalNotes: record.technicalNotes ?? '',
      materialCost: sanitizeNonNegative(record.materialCost),
      operationalCost: sanitizeNonNegative(record.operationalCost),
      taxRate: sanitizeNonNegative(record.taxRate ?? record.aliquota_imposto, 6),
      total_servicos: sanitizeNonNegative(record.total_servicos),
      custo_materiais: sanitizeNonNegative(record.custo_materiais ?? record.materialCost),
      custos_operacionais: sanitizeNonNegative(record.custos_operacionais ?? record.operationalCost),
      aliquota_imposto: sanitizeNonNegative(record.aliquota_imposto ?? record.taxRate, 6),
      lucro_liquido: sanitizeNonNegative(record.lucro_liquido),
      items: cloneBudgetItems(record.items),
    })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function persistSavedBudgets(records: SavedBudgetRecord[]): void {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function saveBudgetRecord(input: SaveBudgetRecordInput): SavedBudgetRecord | null {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  const currentRecords = loadSavedBudgets();
  const existingRecord = input.id ? currentRecords.find((record) => record.id === input.id) : undefined;
  const now = new Date().toISOString();

  const record: SavedBudgetRecord = {
    id: existingRecord?.id ?? input.id ?? createId('budget'),
    clientId: input.clientId ?? existingRecord?.clientId,
    workOrderId: input.workOrderId ?? existingRecord?.workOrderId,
    clientName: input.clientName,
    title: input.title,
    status: normalizeBudgetStatus(input.status) ?? 'iniciado',
    discount: sanitizeNonNegative(input.discount),
    travelCost: sanitizeNonNegative(input.travelCost),
    additionalFees: sanitizeNonNegative(input.additionalFees),
    paymentTerms: input.paymentTerms ?? '',
    validity: input.validity ?? '',
    guarantee: input.guarantee ?? '',
    executionDeadline: input.executionDeadline ?? '',
    commercialNotes: input.commercialNotes ?? '',
    technicalNotes: input.technicalNotes ?? '',
    materialCost: sanitizeNonNegative(input.materialCost),
    operationalCost: sanitizeNonNegative(input.operationalCost),
    taxRate: sanitizeNonNegative(input.taxRate ?? input.aliquota_imposto, 6),
    total_servicos: sanitizeNonNegative(input.total_servicos),
    custo_materiais: sanitizeNonNegative(input.custo_materiais ?? input.materialCost),
    custos_operacionais: sanitizeNonNegative(input.custos_operacionais ?? input.operationalCost),
    aliquota_imposto: sanitizeNonNegative(input.aliquota_imposto ?? input.taxRate, 6),
    lucro_liquido: sanitizeNonNegative(input.lucro_liquido),
    templateId: input.templateId,
    items: cloneBudgetItems(input.items),
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  };

  const nextRecords = [record, ...currentRecords.filter((saved) => saved.id !== record.id)];
  persistSavedBudgets(nextRecords);

  return record;
}

export function deleteSavedBudget(id: string): SavedBudgetRecord[] {
  const nextRecords = loadSavedBudgets().filter((record) => record.id !== id);
  persistSavedBudgets(nextRecords);
  return nextRecords;
}

export function clearSavedBudgets(): void {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
