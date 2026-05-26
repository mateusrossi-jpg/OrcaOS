export type EventAggregateType = 'budget' | 'proposal' | 'workorder' | 'client' | 'finance';

export type OperationalEventType =
  | 'BUDGET_CREATED'
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
  id: string;
  aggregateId: string;
  aggregateType: EventAggregateType;
  eventType: OperationalEventType;
  timestamp: string;
  actor: string;
  source: string;
  metadata?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  createdAt: string;
}
