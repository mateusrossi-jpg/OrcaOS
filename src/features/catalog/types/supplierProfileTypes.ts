import { generateUUID } from '../../../core/utils/idGenerator';
export interface SupplierProfile {
  id: string;
  name: string;
  document: string;
  stateRegistration?: string;
  segment: string;
  city?: string;
  state?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  catalogUrl?: string;
  paymentTerms?: string;
  averageDeliveryDays?: number;
  defaultTaxNotes?: string;
  purchaseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export function createSupplierProfileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return generateUUID();
  return `supplier-profile-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}
