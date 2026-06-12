import { BudgetStatus } from './budget';
import { ClientProposalStatus } from '../features/clientPortal/storage/clientProposalStorage';
import { ServiceStatus } from '../core/types/business';
import { EventSeverity } from './eventSeverity';
import { Asset } from './asset';

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
  readonly revenuePlanned?: number;
  readonly revenueExecuted?: number;
  readonly totalProposals?: number;
  readonly totalProposalsApproved?: number;
}

export type ClientCRMStatus = 'ACTIVE' | 'WARM' | 'INACTIVE' | 'AT_RISK' | 'DEBTOR' | 'VIP';

export interface ClientCRMProjection {
  readonly clientId: string;
  readonly clientName: string;
  readonly phone?: string;
  readonly totalRevenue: number;
  readonly openBalance: number;
  readonly totalWorkOrders: number;
  readonly totalBudgets: number;
  readonly lastInteractionAt: string;
  readonly daysInactive: number;
  readonly relationshipStatus: ClientCRMStatus[];
  readonly relationshipScore: number; // 0-100
}

export interface CRMAlertHubProjection {
  readonly debtors: readonly ClientCRMProjection[];
  readonly inactive: readonly ClientCRMProjection[];
  readonly vipInactive: readonly ClientCRMProjection[];
  readonly commercialFollowUp: readonly any[]; // Proposals needing attention
  readonly stalledBudgets: readonly any[]; // Budgets not moving
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

export interface ClientDossierProjection {
  readonly summary: ClientCRMProjection;
  readonly timeline: readonly OperationalActivityProjection[];
}

export interface AssetDossierProjection {
  readonly asset: Asset;
  readonly healthScore: number;
  readonly totalMaintenanceCost: number;
  readonly lastMaintenanceDate?: string;
  readonly timeline: readonly OperationalActivityProjection[];
}

export interface RecurringMaintenanceProjection {
  readonly clientId: string;
  readonly clientName: string;
  readonly sourceBudgetId: string;
  readonly serviceTitle: string;
  readonly lastExecutionDate: string;
  readonly nextSuggestedDate: string;
  readonly recurrenceIntervalDays: number;
  readonly priority: 'low' | 'normal' | 'high';
  readonly status: 'pending' | 'notified' | 'scheduled' | 'dismissed';
}
