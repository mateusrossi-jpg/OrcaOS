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

export interface OperationalBoardProjection {
  budgetsInDraft: string[];
  budgetsWaitingApproval: string[];
  workOrdersInProgress: string[];
  completedItems: string[];
}
