export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type BudgetTemplateId = 'professional' | 'technical' | 'simple' | 'premiumModern' | 'premiumDetailed';

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
  defaultNotes: string;
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
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  templateId?: BudgetTemplateId;
}

export interface WorkOrder {
  id: string;
  clientId?: string;
  title: string;
  description?: string;
  status: 'open' | 'scheduled' | 'in-progress' | 'done' | 'cancelled';
  scheduledDate?: string;
}
