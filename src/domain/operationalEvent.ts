export type EventAggregateType = 'budget' | 'proposal' | 'workorder' | 'client' | 'finance' | 'site' | 'asset' | 'maintenance_plan' | 'contract';

export type OperationalEventType =
  | 'BUDGET_CREATED'
  | 'BUDGET_UPDATED'
  | 'BUDGET_DELETED'
  | 'BUDGET_SENT'
  | 'BUDGET_APPROVED'
  | 'BUDGET_AUTHORIZED'
  | 'BUDGET_EXECUTION_STARTED'
  | 'BUDGET_FINALIZED'
  | 'BUDGET_ARCHIVED'
  | 'BUDGET_CANCELLED'
  | 'BUDGET_REJECTED'
  | 'PROPOSAL_SENT'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_REJECTED'
  | 'WORKORDER_CREATED'
  | 'WORKORDER_STARTED'
  | 'WORKORDER_COMPLETED'
  | 'WORKORDER_CANCELLED'
  | 'FINANCE_RECORD_REALIZED'
  | 'FINANCIAL_MUTATION'
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'CLIENT_ARCHIVED'
  | 'SITE_CREATED'
  | 'SITE_UPDATED'
  | 'SITE_ARCHIVED'
  | 'ASSET_REGISTERED'
  | 'ASSET_UPDATED'
  | 'ASSET_ARCHIVED'
  | 'TECHNICAL_FAILURE_REPORTED'
  | 'WORKORDER_ASSET_LINKED'
  | 'MAINTENANCE_PLAN_CREATED'
  | 'MAINTENANCE_PLAN_UPDATED'
  | 'MAINTENANCE_PLAN_ARCHIVED'
  | 'PREVENTIVE_WORKORDER_GENERATED'
  | 'CONTRACT_CREATED'
  | 'CONTRACT_UPDATED'
  | 'CONTRACT_ARCHIVED'
  | 'RECURRING_BILLING_GENERATED';

export interface FinancialDiff {
  field: string;
  oldValue: number;
  newValue: number;
}

export interface OperationalEvent {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: EventAggregateType;
  readonly eventType: OperationalEventType;
  readonly timestamp: string;
  readonly sequence?: number; // For ordered Event Store reconciliation
  readonly actor: string;
  readonly source: string;
  readonly metadata?: Readonly<Record<string, unknown>> & {
    diff?: FinancialDiff[];
    clientId?: string;
    correlationId?: string;
  };
  readonly snapshot?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly createdAt: string;
}
