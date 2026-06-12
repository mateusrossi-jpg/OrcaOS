export type ContractStatus = 'active' | 'suspended' | 'expired' | 'draft' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'DRAFT';
export type BillingFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

import { MultiTenantEntity } from '../core/types/business';

export interface Contract extends MultiTenantEntity {
  id: string;
  clientId: string;
  title: string;
  status: ContractStatus;
  startDate: string; // ISO Date
  endDate?: string;  // ISO Date
  billingFrequency: BillingFrequency;
  billingAmount: number;
  siteIds?: string[];
  assetIds?: string[];
  maintenancePlanIds?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
