export type AutomationTrigger =
  | 'AGING_THRESHOLD'
  | 'SLA_RISK'
  | 'WORKFLOW_BLOCKED'
  | 'RECURRING_CANDIDATE'
  | 'ABANDONED_PROPOSAL'
  | 'STALLED_EXECUTION'
  | 'INACTIVE_CLIENT'
  | 'TECHNICIAN_OVERLOAD';

export type AutomationDecisionType =
  | 'SEND_FOLLOWUP'
  | 'ESCALATE_SLA'
  | 'REASSIGN_TECHNICIAN'
  | 'SUGGEST_MAINTENANCE'
  | 'ARCHIVE_STALE'
  | 'FLAG_RISK';

export type AutomationSeverity = 'info' | 'warning' | 'critical';
export type AutomationDispatchState = 'PENDING' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'DISCARDED';

export interface AutomationRecommendation {
  readonly recommendationId: string;
  readonly message: string;
  readonly actionLabel: string;
  readonly severity: AutomationSeverity;
}

export interface AutomationDecision {
  readonly decisionId: string;
  readonly type: AutomationDecisionType;
  readonly recommendation: AutomationRecommendation;
}

export interface AutomationEnvelope {
  readonly automationId: string;
  readonly correlationId?: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly triggerType: AutomationTrigger;
  readonly decision: AutomationDecision;
  readonly confidence: number;
  readonly timestamp: string;
  readonly deviceId: string;
  readonly dispatchState: AutomationDispatchState;
}
