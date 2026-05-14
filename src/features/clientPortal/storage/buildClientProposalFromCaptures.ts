import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { loadProfessionalProfile } from '../../settings/storage/professionalProfileStorage';
import { createClientProposalDraft, type ClientProposal, type ClientProposalPublicItem, type ClientPurchaseMaterialItem } from './clientProposalStorage';

function parseDecimal(value?: string, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function captureDescription(capture: CalculationCapture): string {
  return capture.editableDescription || capture.summary || capture.calculatorLabel;
}

function isClientPurchaseMaterial(capture: CalculationCapture): boolean {
  return (
    capture.itemType === 'material' &&
    (capture.clientPurchaseRequired || capture.materialSupplyMode === 'client' || capture.materialSupplyMode === 'mixed' || capture.materialSupplyMode === 'undefined')
  );
}

function isBudgetChargedItem(capture: CalculationCapture): boolean {
  if (isClientPurchaseMaterial(capture)) return false;
  if (capture.shouldGenerateBudgetItem === false) return false;
  return capture.destination === 'budget' || capture.destination === 'both' || capture.itemType === 'service' || capture.itemType === 'material';
}

function buildPublicItem(capture: CalculationCapture): ClientProposalPublicItem {
  const quantity = parseDecimal(capture.quantity, 1);
  const unitPrice = parseDecimal(capture.unitValue, 0);
  const totalPrice = quantity * unitPrice;
  const category = capture.itemType === 'service' ? 'service' : capture.itemType === 'material' ? 'material' : 'other';

  return {
    id: capture.id,
    description: captureDescription(capture),
    quantity,
    unitLabel: capture.itemType === 'service' ? 'serviço' : 'un',
    unitPrice,
    totalPrice,
    category,
    visibleToClient: true,
    notes: capture.technicalNote,
  };
}

function buildClientMaterial(capture: CalculationCapture): ClientPurchaseMaterialItem {
  const quantity = parseDecimal(capture.quantity, 1);
  const referenceUnitValue = parseDecimal(capture.materialReferenceUnitValue ?? capture.unitValue, 0);
  const referenceTotalValue = quantity * referenceUnitValue;

  return {
    id: capture.id,
    description: captureDescription(capture),
    quantity,
    referenceUnitValue,
    referenceTotalValue,
    specificationNotes: capture.technicalNote || capture.details.join(' · '),
    requiredBeforeService: true,
  };
}

export function buildClientProposalFromCaptures(input: {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}): ClientProposal {
  const profile = loadProfessionalProfile();
  const chargedItems = input.captures.filter(isBudgetChargedItem).map(buildPublicItem);
  const clientPurchaseMaterials = input.captures.filter(isClientPurchaseMaterial).map(buildClientMaterial);
  const subtotal = chargedItems.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
  const title = input.activeWorkOrder?.title ? `Proposta - ${input.activeWorkOrder.title}` : 'Proposta de serviço';
  const clientName = input.activeClient?.name ?? 'Cliente não vinculado';
  const professionalDisplayName = profile.businessName || profile.professionalName || 'Profissional Aferix';
  const professionalContact = [profile.phone, profile.email].filter(Boolean).join(' · ');

  return createClientProposalDraft({
    professionalId: profile.professionalId,
    companyId: profile.companyId,
    clientId: input.activeClient?.id,
    workOrderId: input.activeWorkOrder?.id,
    title,
    clientName,
    professionalDisplayName,
    professionalContact,
    summary: input.activeWorkOrder?.description || 'Proposta gerada a partir dos itens técnicos do orçamento no Aferix.',
    items: chargedItems,
    clientPurchaseMaterials,
    subtotal,
    discount: 0,
    total: subtotal,
    validityText: '7 dias',
    paymentTerms: 'Condições de pagamento a combinar.',
    publicNotes: clientPurchaseMaterials.length > 0
      ? 'Esta proposta possui materiais que deverão ser adquiridos pelo cliente conforme lista orientativa. Esses materiais não estão incluídos no total cobrado pelo profissional.'
      : 'Valores sujeitos à confirmação após vistoria, disponibilidade de agenda e validação técnica.',
    internalNotes: `Proposta criada automaticamente a partir de ${input.captures.length} item(ns) técnico(s).`,
  });
}
