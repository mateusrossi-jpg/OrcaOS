const STORAGE_KEY = 'orcaos:simple-finance-records:v1';

export interface SimpleFinanceRecord {
  id: string;
  title: string;
  clientName: string;
  status: 'forecast' | 'realized';
  receivedAmount: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
  sourceBudgetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleFinanceRecordInput {
  id?: string | null;
  title: string;
  clientName: string;
  status?: 'forecast' | 'realized';
  receivedAmount: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
  sourceBudgetId?: string;
}

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `finance-${Date.now()}`;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is SimpleFinanceRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<SimpleFinanceRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.clientName === 'string' &&
    (record.status === 'forecast' || record.status === 'realized' || typeof record.status === 'undefined') &&
    isNumber(record.receivedAmount) &&
    isNumber(record.materialCost) &&
    isNumber(record.travelCost) &&
    isNumber(record.cardFee) &&
    isNumber(record.estimatedTax) &&
    isNumber(record.otherCosts) &&
    (typeof record.sourceBudgetId === 'string' || typeof record.sourceBudgetId === 'undefined') &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

export function loadSimpleFinanceRecords(): SimpleFinanceRecord[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecord).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  } catch {
    return [];
  }
}

function persist(records: SimpleFinanceRecord[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function saveSimpleFinanceRecord(input: SimpleFinanceRecordInput): SimpleFinanceRecord | null {
  if (!hasStorage()) return null;
  const currentRecords = loadSimpleFinanceRecords();
  const existingRecord = input.id ? currentRecords.find((record) => record.id === input.id) : undefined;
  const now = new Date().toISOString();
  const record: SimpleFinanceRecord = {
    id: existingRecord?.id ?? input.id ?? createId(),
    title: input.title,
    clientName: input.clientName,
    status: input.status ?? existingRecord?.status ?? 'realized',
    receivedAmount: input.receivedAmount,
    materialCost: input.materialCost,
    travelCost: input.travelCost,
    cardFee: input.cardFee,
    estimatedTax: input.estimatedTax,
    otherCosts: input.otherCosts,
    sourceBudgetId: input.sourceBudgetId,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  };
  persist([record, ...currentRecords.filter((item) => item.id !== record.id)]);
  return record;
}

export function deleteSimpleFinanceRecord(id: string): SimpleFinanceRecord[] {
  const nextRecords = loadSimpleFinanceRecords().filter((record) => record.id !== id);
  persist(nextRecords);
  return nextRecords;
}
