import type { CalculationCapture, MaterialSupplyMode } from '../../../core/types/workflow';

export interface ReportCaptureMetrics {
  reportItems: CalculationCapture[];
  itemsWithImage: number;
  diagnostics: number;
}

export function normalizeDecimalValue(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsedValue = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function calculateCaptureCommercialTotal(capture: CalculationCapture): number {
  const quantity = normalizeDecimalValue(capture.quantity, 1);
  const unitValue = normalizeDecimalValue(capture.unitValue);
  return quantity * unitValue;
}

export function calculateCaptureReferenceTotal(capture: CalculationCapture): number {
  const quantity = normalizeDecimalValue(capture.quantity, 1);
  const referenceUnitValue = normalizeDecimalValue(capture.materialReferenceUnitValue ?? capture.unitValue);
  return quantity * referenceUnitValue;
}

export function isClientPurchaseMaterial(capture: CalculationCapture): boolean {
  return (
    capture.itemType === 'material' &&
    (capture.clientPurchaseRequired || capture.materialSupplyMode === 'client' || capture.materialSupplyMode === 'mixed' || capture.materialSupplyMode === 'undefined')
  );
}

export function isReportCapture(capture: CalculationCapture): boolean {
  return Boolean(
    capture.reportReady ||
      capture.destination === 'survey' ||
      capture.destination === 'both' ||
      capture.itemType === 'diagnostic' ||
      capture.itemType === 'projectSpecification',
  );
}

export function getReportCaptureMetrics(captures: CalculationCapture[]): ReportCaptureMetrics {
  const reportItems = captures.filter(isReportCapture);
  return {
    reportItems,
    itemsWithImage: reportItems.filter((capture) => Boolean(capture.imageDataUrl)).length,
    diagnostics: reportItems.filter((capture) => capture.itemType === 'diagnostic').length,
  };
}

export function materialSupplyLabel(mode: MaterialSupplyMode | undefined): string {
  if (mode === 'client') return 'Cliente compra';
  if (mode === 'mixed') return 'Misto / alinhar';
  if (mode === 'undefined') return 'A definir depois';
  return 'Profissional fornece';
}

export function buildMaterialSupplyPatch(capture: CalculationCapture, mode: MaterialSupplyMode): Partial<CalculationCapture> {
  const isProfessionalSupply = mode === 'professional';
  const currentReference = capture.materialReferenceUnitValue ?? capture.unitValue ?? '0';
  return {
    materialSupplyMode: mode,
    materialSupplyLabel: materialSupplyLabel(mode),
    materialReferenceUnitValue: currentReference,
    clientPurchaseRequired: !isProfessionalSupply,
    shouldGenerateBudgetItem: isProfessionalSupply,
    unitValue: isProfessionalSupply ? currentReference : '0',
  };
}
