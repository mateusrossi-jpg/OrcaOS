export interface Anomaly {
  id: string;
  companyId: string;
  workspaceId: string;
  clientId: string;
  siteId: string;
  assetId: string;
  workOrderId?: string;
  assetExecutionId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'OPEN' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  recommendedAction?: string;
  photoUuids: string[];
  createdBy: string;
  createdAt: string;
  quotedAt?: string;
  approvedAt?: string;
  resolvedAt?: string;
}

export interface Proposal {
  id: string;
  companyId: string;
  workspaceId: string;
  anomalyId: string;
  clientId: string;
  siteId?: string;
  assetId?: string;
  title?: string;
  description?: string;
  amount?: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}
