export type AssetType = 'EQUIPMENT' | 'SYSTEM' | 'INFRASTRUCTURE' | 'INSTALLATION';
export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'CRITICAL' | 'REPLACED' | 'DECOMMISSIONED';

import { MultiTenantEntity } from '../core/types/business';

export interface Asset extends MultiTenantEntity {
  id: string;
  clientId?: string;
  siteId?: string;
  name: string;
  assetType?: AssetType;
  category: string;
  serialNumber?: string;
  tag?: string;
  manufacturer?: string;
  model?: string;
  location?: string;
  assetStatus?: AssetStatus;
  status?: string;
  installDate?: string;
  manufacturerWarrantyUntil?: string;
  serviceWarrantyUntil?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
