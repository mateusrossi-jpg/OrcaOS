import { MultiTenantEntity } from '../core/types/business';

export interface Client extends MultiTenantEntity {
  id: string;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  
  /** @deprecated O endereço está migrando integralmente para a entidade Site (Site-First Architecture) */
  address?: string;
  /** @deprecated Utilize Site */
  street?: string;
  /** @deprecated Utilize Site */
  addressNumber?: string;
  /** @deprecated Utilize Site */
  complement?: string;
  /** @deprecated Utilize Site */
  district?: string;
  /** @deprecated Utilize Site */
  city?: string;
  /** @deprecated Utilize Site */
  state?: string;
  /** @deprecated Utilize Site */
  postalCode?: string;
  
  stateRegistration?: string;
  contributorType?: 'not-informed' | 'individual' | 'taxpayer' | 'exempt' | 'non-taxpayer';
  creditLimit?: string;
  additionalContacts?: string;
  salesHistoryNotes?: string;
  notes?: string;
  createdAt?: string; // ISO String for better serialization in Dexie
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
