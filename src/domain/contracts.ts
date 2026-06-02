export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'PENDING_RENEWAL' | 'RENEWED' | 'EXPIRED' | 'CANCELLED' | 'AT_RISK';
export type ChurnRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ContractHealth {
  id: string;
  companyId: string;
  workspaceId: string;
  contractId: string;
  clientId: string;
  healthScore: number;
  lastCalculatedAt: string;
}

export interface ContractRenewal {
  id: string;
  companyId: string;
  workspaceId: string;
  contractId: string;
  clientId: string;
  proposalId?: string;
  status: 'PENDING' | 'PROPOSAL_GENERATED' | 'SENT' | 'APPROVED' | 'REJECTED';
  generatedAt: string;
  dueDate: string;
}

export interface ContractAlert {
  id: string;
  companyId: string;
  workspaceId: string;
  contractId: string;
  type: 'EXPIRING_SOON' | 'HIGH_CHURN_RISK' | 'SLA_VIOLATION';
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface ContractRevenueProjection {
  id: string;
  companyId: string;
  workspaceId: string;
  contractId: string;
  month: string; // YYYY-MM
  projectedAmount: number;
  realizedAmount: number;
}
