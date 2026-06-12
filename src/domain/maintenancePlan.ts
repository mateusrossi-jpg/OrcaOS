export type MaintenanceFrequency = 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';

import { MultiTenantEntity } from '../core/types/business';

export interface MaintenancePlan extends MultiTenantEntity {
  id: string;
  assetId: string;
  clientId: string;
  siteId: string;
  title: string;
  frequency: MaintenanceFrequency;
  nextExecutionDate: string; // ISO Date
  lastExecutionDate?: string;
  checklistTemplate?: string[]; // List of tasks
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
