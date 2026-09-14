import { MultiTenantEntity } from '../core/types/business';

export type ClientProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';

export interface ClientProposalPublicItem {
  id: string;
  description: string;
  quantity: number;
  unitLabel?: string;
  unitPrice?: number;
  totalPrice?: number;
  category: 'service' | 'material' | 'orientation' | 'other';
  visibleToClient: boolean;
  notes?: string;
}

export interface ClientPurchaseMaterialItem {
  id: string;
  description: string;
  quantity: number;
  referenceUnitValue?: number;
  referenceTotalValue?: number;
  specificationNotes?: string;
  requiredBeforeService?: boolean;
}

export interface ClientProposal extends MultiTenantEntity {
  id: string;
  publicToken: string;
  status: ClientProposalStatus;
  professionalId?: string;
  clientId?: string;
  workOrderId?: string;
  budgetId?: string;
  title: string;
  clientName: string;
  professionalDisplayName: string;
  professionalContact?: string;
  summary: string;
  items: ClientProposalPublicItem[];
  clientPurchaseMaterials: ClientPurchaseMaterialItem[];
  subtotal: number;
  discount: number;
  total: number;
  validityText: string;
  paymentTerms: string;
  publicNotes: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  decidedAt?: string;
}