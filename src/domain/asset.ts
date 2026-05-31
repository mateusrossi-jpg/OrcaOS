export type AssetType = 'EQUIPMENT' | 'SYSTEM' | 'INFRASTRUCTURE' | 'INSTALLATION';
export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'CRITICAL' | 'REPLACED' | 'DECOMMISSIONED';

export interface Asset {
  id: string;
  clientId: string;
  siteId: string;
  name: string;
  assetType: AssetType;
  category: string;
  serialNumber?: string;
  tag?: string;
  manufacturer?: string;
  model?: string;
  location?: string;
  assetStatus: AssetStatus;
  installDate?: string;
  manufacturerWarrantyUntil?: string;
  serviceWarrantyUntil?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
