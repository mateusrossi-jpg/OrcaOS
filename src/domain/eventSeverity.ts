/**
 * EventSeverity — ERP-grade severity model for operational events.
 *
 * This module provides deterministic severity classification and priority
 * derivation from OperationalEventType. Used by the feed projection
 * and alert derivation pipeline.
 *
 * Severity is NOT persisted — it is always derived from the event type.
 * This guarantees replay-safety and deterministic rebuild.
 */

export type EventSeverity = 'info' | 'success' | 'warning' | 'critical';

/**
 * Deterministic severity map.
 * Every known event type maps to exactly one severity.
 * Unknown events default to 'info'.
 */
const SEVERITY_MAP: Record<string, EventSeverity> = {
  // Success events
  PROPOSAL_APPROVED: 'success',
  WORKORDER_COMPLETED: 'success',
  FINANCE_RECORD_REALIZED: 'success',
  BUDGET_FINALIZED: 'success',
  BUDGET_AUTHORIZED: 'success',

  // Warning events
  WORKFLOW_STALLED: 'warning',
  WORKORDER_CANCELLED: 'warning',
  BUDGET_CANCELLED: 'warning',
  BUDGET_REJECTED: 'warning',
  PROPOSAL_REJECTED: 'warning',

  // Critical events
  SLA_BREACHED: 'critical',

  // Info events
  BUDGET_ARCHIVED: 'info',
  BUDGET_CREATED: 'info',
  BUDGET_SENT: 'info',
  BUDGET_APPROVED: 'info',
  BUDGET_EXECUTION_STARTED: 'info',
  PROPOSAL_SENT: 'info',
  WORKORDER_CREATED: 'info',
  WORKORDER_STARTED: 'info',
  CLIENT_CREATED: 'info',
  CLIENT_UPDATED: 'info',
};

/**
 * Priority map — higher number = more urgent.
 * 0 = routine, 1 = low, 2 = normal, 3 = elevated, 4 = high, 5 = critical.
 */
const PRIORITY_MAP: Record<string, number> = {
  SLA_BREACHED: 5,
  WORKFLOW_STALLED: 4,
  WORKORDER_CANCELLED: 3,
  BUDGET_CANCELLED: 3,
  BUDGET_REJECTED: 3,
  PROPOSAL_REJECTED: 3,
  PROPOSAL_APPROVED: 2,
  WORKORDER_COMPLETED: 2,
  BUDGET_FINALIZED: 2,
  BUDGET_AUTHORIZED: 2,
  FINANCE_RECORD_REALIZED: 2,
  BUDGET_EXECUTION_STARTED: 1,
  PROPOSAL_SENT: 1,
  WORKORDER_CREATED: 1,
  WORKORDER_STARTED: 1,
  BUDGET_CREATED: 0,
  BUDGET_SENT: 0,
  BUDGET_APPROVED: 0,
  BUDGET_ARCHIVED: 0,
  CLIENT_CREATED: 0,
  CLIENT_UPDATED: 0,
};

/**
 * Get the severity for an operational event type.
 * Returns 'info' for unknown event types (safe default).
 */
export function getOperationalEventSeverity(eventType: string): EventSeverity {
  return SEVERITY_MAP[eventType] ?? 'info';
}

/**
 * Get the priority for an operational event type.
 * Returns 0 for unknown event types (lowest priority).
 */
export function getOperationalEventPriority(eventType: string): number {
  return PRIORITY_MAP[eventType] ?? 0;
}

/**
 * Check if a severity level qualifies as an operational alert.
 * Only 'warning' and 'critical' are alert-worthy.
 */
export function isOperationalAlertSeverity(severity: EventSeverity): boolean {
  return severity === 'warning' || severity === 'critical';
}
