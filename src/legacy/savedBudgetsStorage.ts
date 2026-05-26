/**
 * LEGACY - This file is a legacy bridge for migration.
 * OFFICIAL ARCHITECTURE: DO NOT USE FOR NEW DATA.
 * Only use for LegacyBudgetMigrationService.
 */
import type { BudgetItem } from '../core/types/business';
import { Budget as NewBudget } from '../domain/budget';
import { safeJsonParse } from '../core/runtime/safeGuards';

const STORAGE_KEY = 'orcaos:saved-budgets:v1';

export interface SavedBudgetRecord {
  id: string;
  clientId?: string;
  workOrderId?: string;
  clientName: string;
  title: string;
  status: string;
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
  timeline?: unknown[];
  snapshots?: unknown[];
  financialSnapshot?: unknown;
}

function isBrowserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadSavedBudgets(): SavedBudgetRecord[] {
  if (!isBrowserStorageAvailable()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<unknown[]>(raw, []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  // Shallow validation for migration purposes
  return parsed as SavedBudgetRecord[];
}

export function mapToNewBudget(record: SavedBudgetRecord): NewBudget {
  return {
    id: record.id,
    clientId: record.clientId,
    clientName: record.clientName,
    title: record.title,
    status: record.status as unknown as NewBudget['status'],
    chargedValue: record.total_servicos,
    materialCost: record.materialCost,
    travelCost: record.travelCost,
    helperCost: record.operationalCost, 
    fees: record.additionalFees,
    discounts: record.discount,
    otherCosts: 0,
    items: record.items.map(i => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      category: i.category
    })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    finalizedAt: record.status === 'finalizado' ? record.updatedAt : undefined,
    financialSnapshot: record.financialSnapshot as NewBudget['financialSnapshot'],
    notes: record.commercialNotes,
    paymentTerms: record.paymentTerms,
    validity: record.validity,
    guarantee: record.guarantee,
    executionDeadline: record.executionDeadline
  };
}

export function clearSavedBudgets(): void {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
