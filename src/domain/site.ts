import { MultiTenantEntity } from '../core/types/business';

export interface Site extends MultiTenantEntity {
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
