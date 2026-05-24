/**
 * Creates a safe copy of a saved budget record.
 * The new record is saved via `saveBudgetRecord` and receives status 'iniciado'.
 * All other fields are preserved.
 */
import { saveBudgetRecord } from '../storage/savedBudgetsStorage';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';

export function duplicateBudget(record: SavedBudgetRecord): SavedBudgetRecord | null {
  return saveBudgetRecord({
    clientId: record.clientId,
    workOrderId: record.workOrderId,
    clientName: record.clientName,
    title: `${record.title || 'Orçamento'} (cópia)`,
    status: 'iniciado',
    discount: record.discount,
    travelCost: record.travelCost,
    additionalFees: record.additionalFees,
    paymentTerms: record.paymentTerms,
    validity: record.validity,
    guarantee: record.guarantee,
    executionDeadline: record.executionDeadline,
    commercialNotes: record.commercialNotes,
    technicalNotes: record.technicalNotes,
    templateId: record.templateId,
    items: record.items,
    materialCost: record.materialCost,
    operationalCost: record.operationalCost,
    taxRate: record.taxRate,
    total_servicos: record.total_servicos,
    custo_materiais: record.custo_materiais,
    custos_operacionais: record.custos_operacionais,
    aliquota_imposto: record.aliquota_imposto,
    lucro_liquido: record.lucro_liquido,
  });
}
