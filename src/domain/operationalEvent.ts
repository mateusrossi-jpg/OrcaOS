export type EventAggregateType = 'budget' | 'proposal' | 'workorder' | 'client' | 'finance' | 'site' | 'asset' | 'maintenance_plan' | 'contract' | 'dispatch' | 'attendance';

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
  | 'ASSET_MAINTAINED'
  | 'ASSET_ARCHIVED'
  | 'KNOWLEDGE_CREATED'
  | 'CASE_SOLVED'
  | 'CASE_REUSED'
  | 'PLAYBOOK_CREATED'
  | 'KNOWLEDGE_RATED'
  // CUSTOMER SUCCESS EVENTS
  | 'CUSTOMER_HEALTH_CHANGED'
  | 'CUSTOMER_AT_RISK'
  | 'RETENTION_ACTION_CREATED'
  | 'RETENTION_ACTION_COMPLETED'
  // INVENTORY EVENTS
  | 'ITEM_RESERVED'
  | 'STOCK_LOW'
  | 'PURCHASE_REQUEST_CREATED'
  | 'PURCHASE_ORDER_CREATED'
  | 'STOCK_REPLENISHED'
  | 'TECHNICAL_FAILURE_REPORTED'
  | 'WORKORDER_ASSET_LINKED'
  | 'MAINTENANCE_PLAN_CREATED'
  | 'MAINTENANCE_PLAN_UPDATED'
  | 'MAINTENANCE_PLAN_ARCHIVED'
  | 'PREVENTIVE_WORKORDER_GENERATED'
  | 'CONTRACT_CREATED'
  | 'CONTRACT_UPDATED'
  | 'CONTRACT_ARCHIVED'
  | 'RECURRING_BILLING_GENERATED'
  | 'DISPATCH_CREATED'
  | 'TECHNICIAN_ASSIGNED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'SLA_BREACHED'
  | 'EMERGENCY_ESCALATED'
  | 'CONTRACT_RENEWAL_STARTED'
  | 'CONTRACT_RENEWAL_GENERATED'
  | 'CONTRACT_RENEWED'
  | 'CONTRACT_EXPIRED'
  | 'CONTRACT_AT_RISK'
  | 'CHURN_RISK_DETECTED'
  | 'WARRANTY_CREATED'
  | 'WARRANTY_EXPIRING'
  | 'WARRANTY_CLAIMED'
  | 'WARRANTY_RESOLVED'
  | 'RECURRENCE_DETECTED'
  | 'WARRANTY_ALERT';

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
