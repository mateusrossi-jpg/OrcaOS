/**
 * OperationalFeedProjection — ERP-grade feed item interface.
 *
 * This is a PROJECTION, not a source-of-truth.
 * Feed items are derived from OperationalEvents via the severity model.
 * They are append-only, deterministic, replay-safe, and rebuild-safe.
 *
 * The feed is never persisted independently — it is always rebuildable
 * from the Event Store. This guarantees multi-device and offline-first safety.
 */

import { EventSeverity } from './eventSeverity';

export interface OperationalFeedItem {
  /** Unique feed item ID (derived from event.id) */
  id: string;

  /** The aggregate this event belongs to */
  aggregateId: string;

  /** The aggregate type (budget, proposal, workorder, client, finance) */
  aggregateType: string;

  /** Who triggered the event */
  actor: string;

  /** The original operational event type */
  eventType: string;

  /** Human-readable title for feed display */
  title: string;

  /** Human-readable description */
  description: string;

  /** Event timestamp (ISO string) */
  timestamp: string;

  /** Derived severity (info, success, warning, critical) */
  severity: EventSeverity;

  /** Derived priority (0-5, higher = more urgent) */
  priority: number;

  /** Correlation chain for tracing related events */
  correlationId?: string;

  /** Reference to the timeline entry */
  timelineReference?: string;

  /** Tags for filtering and analytics (e.g., ['sla', 'overdue']) */
  operationalTags: string[];

  /** Whether this item can participate in future unread tracking */
  unreadCapable: boolean;

  /** Whether this item is relevant for SLA tracking */
  slaRelevant: boolean;
}

/**
 * Subscription payload for feed listeners.
 * Contains only the NEW items (incremental), not the full feed.
 */
export interface OperationalFeedSubscriptionPayload {
  /** New items since last emission (newest first) */
  newItems: OperationalFeedItem[];

  /** Total count in the full feed (for pagination readiness) */
  totalCount: number;
}

/**
 * Alert item — a feed item with severity >= warning.
 * This is a filtered view, not a separate entity.
 */
export type OperationalAlertItem = OperationalFeedItem & {
  severity: 'warning' | 'critical';
};
