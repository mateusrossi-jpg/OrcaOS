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
  createdAt: string; // ISO String for better serialization in Dexie
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
