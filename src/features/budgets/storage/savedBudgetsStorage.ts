import { createId } from '../../../app/utils/idHelpers';
import type { Budget, BudgetItem, BudgetStatus, OperationalSnapshot } from '../../../core/types/business';
import { type OperationalTimelineEntry, appendWorkflowEvent, createTimelineEntry, type WorkflowEventType, type WorkflowMutation } from '../../../core/workflow/timeline';
import { validateTransition, getActionBlockReason } from '../../../core/workflow/engine';

const STORAGE_KEY = 'orcaos:saved-budgets:v1';
const MAX_TIMELINE_EVENTS = 80;

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
  timeline?: OperationalTimelineEntry[];
  snapshots?: OperationalSnapshot[];
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
  timeline?: OperationalTimelineEntry[];
  snapshots?: OperationalSnapshot[];
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
    value === 'arquivado' ||
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
      timeline: record.timeline,
      snapshots: record.snapshots,
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

function generateFingerprint(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `v1:${Math.abs(hash).toString(16)}`;
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
    timeline: existingRecord?.timeline ?? [],
    snapshots: existingRecord?.snapshots ?? [],
  };

  const currentStatus = record.status;
  const previousStatus = existingRecord?.status;

  if (previousStatus && previousStatus !== currentStatus) {
    if (!validateTransition(previousStatus, currentStatus, 'admin')) {
      return null;
    }
  }

  function diffBudgetRecords(oldRecord: SavedBudgetRecord, newRecord: SavedBudgetRecord): WorkflowMutation[] {
    const mutations: WorkflowMutation[] = [];
    
    const fieldsToTrack: Array<keyof SavedBudgetRecord> = [
      'title', 'clientName', 'discount', 'commercialNotes', 'technicalNotes', 
      'paymentTerms', 'validity', 'guarantee', 'executionDeadline',
      'total_servicos', 'custo_materiais', 'custos_operacionais'
    ];

    for (const field of fieldsToTrack) {
      if (oldRecord[field] !== newRecord[field]) {
        mutations.push({
          field: field as string,
          oldValue: oldRecord[field],
          newValue: newRecord[field]
        });
      }
    }

    // Diff items safely (shallow level, tracking key properties)
    const oldItems = oldRecord.items || [];
    const newItems = newRecord.items || [];
    
    const oldItemsMap = new Map(oldItems.map((item, index) => [item.id || String(index), item]));
    const newItemsMap = new Map(newItems.map((item, index) => [item.id || String(index), item]));

    // Check for removed and changed items
    for (const [id, oldItem] of oldItemsMap.entries()) {
      const newItem = newItemsMap.get(id);
      
      if (!newItem) {
        // Item removed
        mutations.push({
          field: `items[${id}].removed`,
          oldValue: { 
            id: oldItem.id, 
            description: oldItem.description, 
            category: oldItem.category, 
            total: (oldItem.quantity * oldItem.unitPrice) 
          },
          newValue: null
        });
      } else {
        // Item changed
        const itemFieldsToTrack: Array<keyof BudgetItem> = ['description', 'quantity', 'unitPrice', 'category'];
        for (const itemField of itemFieldsToTrack) {
          if (oldItem[itemField] !== newItem[itemField]) {
            mutations.push({
              field: `items[${id}].${String(itemField)}`,
              oldValue: oldItem[itemField],
              newValue: newItem[itemField]
            });
          }
        }
      }
    }

    // Check for added items
    for (const [id, newItem] of newItemsMap.entries()) {
      if (!oldItemsMap.has(id)) {
        mutations.push({
          field: `items[${id}].added`,
          oldValue: null,
          newValue: { 
            id: newItem.id, 
            description: newItem.description, 
            category: newItem.category, 
            quantity: newItem.quantity, 
            unitPrice: newItem.unitPrice 
          }
        });
      }
    }

    return mutations;
  }

  if (!existingRecord) {
    // New record
    record.timeline = appendWorkflowEvent(record.timeline || [], {
      workflowId: record.id,
      type: 'created',
      operator: 'Operador local',
      context: 'Orçamento gerado.'
    });
  } else {
    const mutations = diffBudgetRecords(existingRecord, record);

    // Enforce lock rules
    if (mutations.length > 0 && previousStatus === currentStatus) {
      const blockReason = getActionBlockReason(previousStatus, 'canEditCriticalValues');
      if (blockReason) {
        // Identify if any critical value changed. 
        // For simplicity, we consider items and totals as critical values.
        const criticalFields = ['items', 'total_servicos', 'custo_materiais', 'custos_operacionais', 'discount'];
        const hasCriticalMutation = mutations.some(m => criticalFields.some(cf => m.field.startsWith(cf)));
        if (hasCriticalMutation) {
          return null;
        }
      }
    }

    if (previousStatus !== currentStatus) {
      // Status changed
      let eventType: WorkflowEventType = 'updated';
      
      // Map status to workflow event
      if (currentStatus === 'enviado') eventType = 'sent';
      else if (currentStatus === 'autorizado') eventType = 'authorized';
      else if (currentStatus === 'em_execucao' || currentStatus === 'iniciado' && previousStatus === 'autorizado') eventType = 'execution_started';
      else if (currentStatus === 'finalizado') eventType = 'finished';
      else if (currentStatus === 'cancelado' || currentStatus === 'recusado' || currentStatus === 'arquivado') eventType = 'archived';
      
      const newEventId = createId('ev');
      record.timeline = appendWorkflowEvent(record.timeline || [], {
        id: newEventId,
        workflowId: record.id,
        type: eventType,
        operator: 'Operador local',
        context: `Status alterado de ${previousStatus} para ${currentStatus}.`,
        meta: { mutations }
      });

      // SNAPSHOT LOGIC: Trigger on critical transitions
      const snapshotTriggerStates: BudgetStatus[] = ['enviado', 'autorizado', 'em_execucao', 'finalizado'];
      if (snapshotTriggerStates.includes(currentStatus)) {
        // Ensure we only snapshot once per state (append-only rule)
        const alreadyHasSnapshot = record.snapshots?.some(s => s.workflowStatus === currentStatus);
        
        if (!alreadyHasSnapshot) {
          const snapshotItems = cloneBudgetItems(record.items);
          const subtotal = record.total_servicos + record.custo_materiais + record.custos_operacionais;
          const finalTotal = subtotal - record.discount;
          
          const snapshotData = {
            items: snapshotItems,
            totals: {
              total_servicos: record.total_servicos,
              custo_materiais: record.custo_materiais,
              custos_operacionais: record.custos_operacionais,
              discount: record.discount,
              subtotal,
              finalTotal,
              taxRate: record.aliquota_imposto,
              lucro_liquido: record.lucro_liquido
            }
          };

          const snapshot: OperationalSnapshot = {
            snapshotId: createId('snap'),
            timestamp: now,
            workflowStatus: currentStatus,
            operator: 'Operador local',
            context: `Snapshot automático na transição para ${currentStatus}`,
            clientSnapshot: {
              name: record.clientName
            },
            items: snapshotItems,
            totals: snapshotData.totals,
            notes: {
              commercial: record.commercialNotes,
              technical: record.technicalNotes
            },
            paymentTerms: record.paymentTerms,
            timelineEventId: newEventId,
            fingerprint: generateFingerprint(snapshotData)
          };

          record.snapshots = [...(record.snapshots || []), snapshot];
        }
      }
    } else if (mutations.length > 0) {
      // Just a normal update with actual mutations
      record.timeline = appendWorkflowEvent(record.timeline || [], {
        workflowId: record.id,
        type: 'updated',
        operator: 'Operador local',
        context: 'Informações atualizadas.',
        meta: { mutations }
      });
    }
  }

  // Apply retention logic to prevent unlimited growth
  if (record.timeline && record.timeline.length > MAX_TIMELINE_EVENTS) {
    record.timeline = record.timeline.slice(-MAX_TIMELINE_EVENTS);
  }

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
