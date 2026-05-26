import { BudgetStatus } from './budget';
import { ClientProposalStatus } from '../features/clientPortal/storage/clientProposalStorage';
import { ServiceStatus } from '../core/types/business';
import { EventSeverity } from './eventSeverity';

export interface OperationalPipelineProjection {
  readonly budgetId: string;
  readonly budgetStatus: BudgetStatus;
  readonly proposalId?: string;
  readonly proposalStatus?: ClientProposalStatus;
  readonly workOrderId?: string;
  readonly workOrderStatus?: ServiceStatus;
  readonly lastUpdatedAt: string;
}

export interface OperationalMetricsProjection {
  readonly totalBudgets: number;
  readonly totalProposalsSent: number;
  readonly totalProposalsApproved: number;
  readonly totalWorkOrdersCompleted: number;
  readonly revenueRealized: number;
  readonly lastUpdatedAt: string;
}

export interface OperationalCardProjection {
  readonly id: string;
  readonly clientName: string;
  readonly title: string;
  readonly currentStatus: string;
  readonly proposalStatus?: string;
  readonly workOrderStatus?: string;
  readonly revenue: number;
  readonly netProfit: number;
  readonly margin: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly aging: number;
  readonly assignedTechnician?: string;
  readonly priority: 'low' | 'normal' | 'high' | 'urgent';
  readonly slaBreached: boolean;
  readonly overdue: boolean;
  readonly executionDelay: number;
  readonly approvalDelay: number;
  readonly stalledWorkflow: boolean;
}

export interface OperationalBoardProjection {
  readonly draft: readonly OperationalCardProjection[];
  readonly sent: readonly OperationalCardProjection[];
  readonly approved: readonly OperationalCardProjection[];
  readonly authorized: readonly OperationalCardProjection[];
  readonly inExecution: readonly OperationalCardProjection[];
  readonly finalized: readonly OperationalCardProjection[];
  readonly archived: readonly OperationalCardProjection[];
}

export interface ClientPipelineProjection {
  readonly clientId: string;
  readonly clientName: string;
  readonly status: 'lead' | 'proposal_sent' | 'approved' | 'execution' | 'finalized' | 'recurring_candidate';
  readonly totalRevenue: number;
  readonly lastInteractionAt: string;
  readonly activeBudgets: number;
}

export interface OperationalActivityProjection {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly actor: string;
  readonly eventType: string;
  readonly title: string;
  readonly description: string;
  readonly timestamp: string;
  readonly severity: EventSeverity;
  readonly correlationId?: string;
}
