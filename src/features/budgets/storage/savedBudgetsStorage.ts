import type { Budget, BudgetItem } from '../../../core/types/business';

const STORAGE_KEY = 'orcaos:saved-budgets:v1';

export type SavedBudgetStatus = Budget['status'];

export interface SavedBudgetRecord {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface SaveBudgetRecordInput {
  id?: string | null;
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
}

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `budget-${Date.now()}`;
}

function isBrowserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isValidStatus(value: unknown): value is SavedBudgetStatus {
  return value === 'draft' || value === 'sent' || value === 'approved' || value === 'rejected' || value === 'expired' || value === 'cancelled';
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
      travelCost: record.travelCost ?? 0,
      additionalFees: record.additionalFees ?? 0,
      paymentTerms: record.paymentTerms ?? '',
      validity: record.validity ?? '',
      guarantee: record.guarantee ?? '',
      executionDeadline: record.executionDeadline ?? '',
      commercialNotes: record.commercialNotes ?? '',
      technicalNotes: record.technicalNotes ?? '',
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
    id: existingRecord?.id ?? input.id ?? createId(),
    clientName: input.clientName,
    title: input.title,
    status: input.status,
    discount: input.discount,
    travelCost: input.travelCost ?? 0,
    additionalFees: input.additionalFees ?? 0,
    paymentTerms: input.paymentTerms ?? '',
    validity: input.validity ?? '',
    guarantee: input.guarantee ?? '',
    executionDeadline: input.executionDeadline ?? '',
    commercialNotes: input.commercialNotes ?? '',
    technicalNotes: input.technicalNotes ?? '',
    templateId: input.templateId,
    items: input.items,
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
