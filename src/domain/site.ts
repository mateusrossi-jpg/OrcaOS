export interface Site {
  id: string;
  clientId: string;
  name: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
