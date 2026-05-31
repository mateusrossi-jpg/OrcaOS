export type ContractStatus = 'active' | 'suspended' | 'expired' | 'draft';
export type BillingFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  status: ContractStatus;
  startDate: string; // ISO Date
  endDate?: string;  // ISO Date
  billingFrequency: BillingFrequency;
  billingAmount: number;
  siteIds: string[];
  assetIds: string[];
  maintenancePlanIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
