export type BusinessTaxRegime = 'mei' | 'simples' | 'lucro-presumido' | 'lucro-real' | 'custom';
export type PurchaseUseCase = 'estoque-revenda' | 'insumo-servico' | 'uso-proprio-obra' | 'ferramenta-equipamento';

export interface PurchaseTaxRecord {
  id: string;
  supplierName: string;
  documentNumber?: string;
  purchaseDate: string;
  productDescription: string;
  ncm?: string;
  cfop?: string;
  useCase: PurchaseUseCase;
  taxRegime: BusinessTaxRegime;
  quantity: number;
  unitCost: number;
  freightCost: number;
  otherCosts: number;
  travelCost: number;
  icmsValue: number;
  ipiValue: number;
  pisValue: number;
  cofinsValue: number;
  issValue: number;
  cbsValue: number;
  ibsValue: number;
  creditableTaxValue: number;
  desiredNetMarginPercent: number;
  estimatedSaleTaxPercent: number;
  cardFeePercent: number;
  reservePercent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseTaxSummary {
  grossProductsCost: number;
  grossAcquisitionCost: number;
  taxIncludedInPurchase: number;
  managerialCredit: number;
  netAcquisitionCost: number;
  unitNetCost: number;
  saleVariablePercent: number;
  suggestedSalePrice: number;
  suggestedUnitSalePrice: number;
  expectedGrossProfit: number;
  expectedNetMarginValue: number;
  markupPercent: number;
}

const STORAGE_KEY = 'orcaos:purchase-tax-records:v1';

function safeParseRecords(value: string | null): PurchaseTaxRecord[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PurchaseTaxRecord => {
      if (!item || typeof item !== 'object') return false;
      const record = item as Partial<PurchaseTaxRecord>;
      return typeof record.id === 'string' && typeof record.productDescription === 'string' && typeof record.quantity === 'number';
    });
  } catch {
    return [];
  }
}

export function loadPurchaseTaxRecords(): PurchaseTaxRecord[] {
  if (typeof window === 'undefined') return [];
  return safeParseRecords(window.localStorage.getItem(STORAGE_KEY)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function savePurchaseTaxRecords(records: PurchaseTaxRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function createPurchaseTaxRecordId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `purchase-tax-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function calculatePurchaseTaxSummary(record: PurchaseTaxRecord): PurchaseTaxSummary {
  const quantity = Math.max(record.quantity, 0);
  const grossProductsCost = quantity * Math.max(record.unitCost, 0);
  const taxIncludedInPurchase = Math.max(record.icmsValue, 0) + Math.max(record.ipiValue, 0) + Math.max(record.pisValue, 0) + Math.max(record.cofinsValue, 0) + Math.max(record.issValue, 0) + Math.max(record.cbsValue, 0) + Math.max(record.ibsValue, 0);
  const grossAcquisitionCost = grossProductsCost + Math.max(record.freightCost, 0) + Math.max(record.otherCosts, 0) + Math.max(record.travelCost, 0) + taxIncludedInPurchase;
  const managerialCredit = Math.min(Math.max(record.creditableTaxValue, 0), grossAcquisitionCost);
  const netAcquisitionCost = Math.max(grossAcquisitionCost - managerialCredit, 0);
  const unitNetCost = quantity > 0 ? netAcquisitionCost / quantity : 0;
  const saleVariablePercent = Math.min(Math.max(record.estimatedSaleTaxPercent, 0) + Math.max(record.cardFeePercent, 0) + Math.max(record.reservePercent, 0) + Math.max(record.desiredNetMarginPercent, 0), 95);
  const suggestedSalePrice = saleVariablePercent < 95 ? netAcquisitionCost / (1 - saleVariablePercent / 100) : netAcquisitionCost;
  const suggestedUnitSalePrice = quantity > 0 ? suggestedSalePrice / quantity : 0;
  const expectedGrossProfit = suggestedSalePrice - netAcquisitionCost;
  const expectedNetMarginValue = suggestedSalePrice * Math.max(record.desiredNetMarginPercent, 0) / 100;
  const markupPercent = netAcquisitionCost > 0 ? ((suggestedSalePrice / netAcquisitionCost) - 1) * 100 : 0;

  return {
    grossProductsCost,
    grossAcquisitionCost,
    taxIncludedInPurchase,
    managerialCredit,
    netAcquisitionCost,
    unitNetCost,
    saleVariablePercent,
    suggestedSalePrice,
    suggestedUnitSalePrice,
    expectedGrossProfit,
    expectedNetMarginValue,
    markupPercent,
  };
}

export function taxRegimeLabel(regime: BusinessTaxRegime): string {
  const labels: Record<BusinessTaxRegime, string> = {
    mei: 'MEI',
    simples: 'Simples Nacional',
    'lucro-presumido': 'Lucro Presumido',
    'lucro-real': 'Lucro Real',
    custom: 'Personalizado/contador',
  };
  return labels[regime];
}

export function purchaseUseCaseLabel(useCase: PurchaseUseCase): string {
  const labels: Record<PurchaseUseCase, string> = {
    'estoque-revenda': 'Estoque para revenda',
    'insumo-servico': 'Insumo aplicado em serviço',
    'uso-proprio-obra': 'Uso próprio em obra/cliente',
    'ferramenta-equipamento': 'Ferramenta/equipamento',
  };
  return labels[useCase];
}
