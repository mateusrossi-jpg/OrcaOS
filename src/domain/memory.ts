export interface WarrantyRecord {
  id: string;
  companyId: string;
  workspaceId: string;
  assetId: string;
  workOrderId?: string;
  proposalId?: string;
  serviceType: string;
  parts: string[];
  startedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'VOIDED';
}
