export type RiskLevel = 'HEALTHY' | 'ATTENTION' | 'AT_RISK' | 'CRITICAL';

export interface CustomerHealth {
  id: string;
  companyId: string;
  workspaceId: string;
  clientId: string;
  healthScore: number; // 0 a 100
  riskLevel: RiskLevel;
  lastCalculatedAt: string;
}

export interface CustomerRisk {
  id: string;
  companyId: string;
  workspaceId: string;
  clientId: string;
  mrrAtRisk: number;
  riskFactors: string[];
  detectedAt: string;
}

export interface CustomerAction {
  id: string;
  companyId: string;
  workspaceId: string;
  clientId: string;
  type: 'CALL' | 'VISIT' | 'PROPOSAL' | 'REVIEW' | 'RENEGOTIATE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CustomerEngagement {
  id: string;
  companyId: string;
  workspaceId: string;
  clientId: string;
  engagementScore: number; // 0 a 100
  lastPortalAccess?: string;
  proposalsApproved: number;
  totalInteractions: number;
  calculatedAt: string;
}

export interface CustomerSuccessPlan {
  id: string;
  companyId: string;
  workspaceId: string;
  clientId: string;
  objective: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'FAILED';
  createdAt: string;
}
