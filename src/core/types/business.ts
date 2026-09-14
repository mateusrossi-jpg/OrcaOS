export interface MultiTenantEntity {
  companyId: string;
  workspaceId: string;
}

export interface ConsumedPartItem {
  id: string;
  sku?: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface Client extends Partial<MultiTenantEntity> {
  id: string;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  street?: string;
  addressNumber?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  stateRegistration?: string;
  contributorType?: 'not-informed' | 'individual' | 'taxpayer' | 'exempt' | 'non-taxpayer';
  creditLimit?: string;
  additionalContacts?: string;
  salesHistoryNotes?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BudgetTemplateId = 'professional' | 'technical' | 'simple' | 'premiumModern' | 'premiumDetailed';
export type ReportTemplateId = 'technicalSimple' | 'technicalDetailed' | 'managerial';

export interface BusinessProfile {
  businessName: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  logoDataUrl: string;
  responsibleName: string;
  defaultPaymentTerms: string;
  defaultValidity: string;
  defaultGuarantee: string;
  defaultExecutionDeadline: string;
  defaultNotes: string;
  defaultBudgetTemplateId: BudgetTemplateId;
  defaultReportTemplateId: ReportTemplateId;
}

export interface CatalogItem {
  id: string;
  description: string;
  category: 'labor' | 'material' | 'other';
  unitPrice: number;
  defaultQuantity: number;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'labor' | 'material' | 'other';
  sourceId?: string;
  catalogId?: string;
}

export type CoreBudgetStatus =
  | 'iniciado'
  | 'em_revisao'
  | 'enviado'
  | 'autorizado'
  | 'em_execucao'
  | 'finalizado'
  | 'arquivado'
  | 'recusado'
  | 'cancelado'
  | 'pausado';

export type LegacyBudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'cancelled';

export type BudgetStatus = CoreBudgetStatus | LegacyBudgetStatus;

export interface Budget extends Partial<MultiTenantEntity> {
  id: string;
  clientId?: string;
  clientName?: string;
  siteId?: string;
  attendanceId?: string;
  title: string;
  items: BudgetItem[];
  chargedValue?: number;
  discount?: number;
  travelCost?: number;
  helperCost?: number;
  fees?: number;
  discounts?: number;
  additionalFees?: number;
  notes?: string;
  commercialNotes?: string;
  technicalNotes?: string;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  materialCost?: number;
  operationalCost?: number;
  otherCosts?: number;
  taxRate?: number;
  total_servicos?: number;
  custo_materiais?: number;
  custos_operacionais?: number;
  aliquota_imposto?: number;
  lucro_liquido?: number;
  status: BudgetStatus;
  templateId?: BudgetTemplateId | string;
  evidences?: string[];
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
  finalizedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted?: boolean;
  budgetGroupId?: string;
  selectionMode?: 'exclusive' | 'combinable';
  isPrimary?: boolean;
}

export type ServiceStatus =
  | 'in-progress'
  | 'done'
  | 'cancelled'
  | 'draft'
  | 'scheduled'
  | 'awaiting_schedule'
  | 'completed';

export interface Service extends Partial<MultiTenantEntity> {
  id: string;
  clientId?: string;
  siteId?: string;
  attendanceId?: string;
  budgetId?: string; // Vínculo com o orçamento aprovado/autorizado
  title: string;
  description?: string;
  address?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status: ServiceStatus;
  scheduledDate?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  executedValue?: number;
  assetIds?: string[];
  consumedParts?: ConsumedPartItem[];
  items?: BudgetItem[];
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type WorkOrder = Service;
