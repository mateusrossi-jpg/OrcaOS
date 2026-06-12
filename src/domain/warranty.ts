export type WarrantyStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CLAIMED' | 'REJECTED' | 'RESOLVED';
export type RecurrenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WarrantyCoverage {
  id: string;
  companyId: string;
  workspaceId: string;
  assetId: string;
  partName: string;
  provider: 'MANUFACTURER' | 'INTERNAL_SERVICE';
  startDate: string;
  expirationDate: string;
  status: WarrantyStatus;
  originalExecutionId?: string;
  costProtected: number;
}

export interface WarrantyClaim {
  id: string;
  companyId: string;
  workspaceId: string;
  coverageId: string;
  assetId: string;
  claimDate: string;
  reason: string;
  status: WarrantyStatus;
  financialRecovery: number;
}

export interface WarrantyAlert {
  id: string;
  companyId: string;
  workspaceId: string;
  coverageId: string;
  assetId: string;
  type: 'EXPIRING_SOON' | 'EXPIRED' | 'RECURRENCE_RISK';
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface WarrantyIncident {
  id: string;
  companyId: string;
  workspaceId: string;
  assetId: string;
  partName?: string;
  incidentDate?: string;
  symptom?: string;
  isRecurrence: boolean;
  recurrenceLevel: RecurrenceLevel;
}
