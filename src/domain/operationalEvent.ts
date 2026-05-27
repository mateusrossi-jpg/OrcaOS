export type EventAggregateType = 'budget' | 'proposal' | 'workorder' | 'client' | 'finance';

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
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED';

export interface OperationalEvent {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: EventAggregateType;
  readonly eventType: OperationalEventType;
  readonly timestamp: string;
  readonly actor: string;
  readonly source: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly snapshot?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly createdAt: string;
}
