import { BudgetStatus } from './budget';
import { ClientProposalStatus } from '../features/clientPortal/storage/clientProposalStorage';
import { ServiceStatus } from '../core/types/business';

export interface OperationalPipelineProjection {
  budgetId: string;
  budgetStatus: BudgetStatus;
  proposalId?: string;
  proposalStatus?: ClientProposalStatus;
  workOrderId?: string;
  workOrderStatus?: ServiceStatus;
  lastUpdatedAt: string;
}

export interface OperationalMetricsProjection {
  totalBudgets: number;
  totalProposalsSent: number;
  totalProposalsApproved: number;
  totalWorkOrdersCompleted: number;
  revenueRealized: number;
  lastUpdatedAt: string;
}

export interface OperationalCardProjection {
  id: string;
  clientName: string;
  title: string;
  currentStatus: string;
  proposalStatus?: string;
  workOrderStatus?: string;
  revenue: number;
  netProfit: number;
  margin: number;
  createdAt: string;
  updatedAt: string;
  aging: number; // days since creation or last update
  assignedTechnician?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  slaBreached: boolean;
  overdue: boolean;
  executionDelay: number; // in days
  approvalDelay: number; // in days
  stalledWorkflow: boolean;
}

export interface OperationalBoardProjection {
  draft: OperationalCardProjection[];
  sent: OperationalCardProjection[];
  approved: OperationalCardProjection[];
  authorized: OperationalCardProjection[];
  inExecution: OperationalCardProjection[];
  finalized: OperationalCardProjection[];
  archived: OperationalCardProjection[];
}

export interface ClientPipelineProjection {
  clientId: string;
  clientName: string;
  status: 'lead' | 'proposal_sent' | 'approved' | 'execution' | 'finalized' | 'recurring_candidate';
  totalRevenue: number;
  lastInteractionAt: string;
  activeBudgets: number;
}

export interface OperationalActivityProjection {
  id: string; // usually event.id
  aggregateId: string;
  aggregateType: string;
  actor: string;
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  correlationId?: string;
}
