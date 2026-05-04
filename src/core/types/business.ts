export interface Client {
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
}

export interface Budget {
  id: string;
  clientId?: string;
  title: string;
  items: BudgetItem[];
  discount?: number;
  travelCost?: number;
  additionalFees?: number;
  notes?: string;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  commercialNotes?: string;
  technicalNotes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  templateId?: BudgetTemplateId;
}

export interface WorkOrder {
  id: string;
  clientId?: string;
  title: string;
  description?: string;
  address?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'scheduled' | 'in-progress' | 'done' | 'cancelled';
  scheduledDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
