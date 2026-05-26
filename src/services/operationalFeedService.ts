/**
 * OperationalFeedService — ERP-grade incremental activity feed.
 *
 * This service materializes the operational feed incrementally from events.
 * It is NOT a source-of-truth — the Event Store remains the single source.
 *
 * Responsibilities:
 * - Derive OperationalFeedItem from OperationalEvent (via severity model)
 * - Maintain an in-memory, append-only cache (newest-first)
 * - Expose subscription-based incremental delivery
 * - Provide filtered alert subscriptions (severity >= warning)
 * - Support deterministic rebuild from Event Store
 * - Support future unread tracking, pagination, actor filtering (stubs)
 *
 * What this service does NOT do:
 * - Persist feed items (feed is always rebuildable)
 * - Create a parallel Event Store
 * - Emit synthetic ALERT_DERIVED events to the Event Store
 * - Perform heavy replay or reduce operations
 */

import { OperationalEvent } from '../domain/operationalEvent';
import {
  OperationalFeedItem,
  OperationalFeedSubscriptionPayload,
  OperationalAlertItem,
} from '../domain/operationalFeedProjection';
import {
  getOperationalEventSeverity,
  getOperationalEventPriority,
  isOperationalAlertSeverity,
} from '../domain/eventSeverity';

type FeedListener = (payload: OperationalFeedSubscriptionPayload) => void;
type AlertListener = (alerts: OperationalAlertItem[]) => void;
type Unsubscribe = () => void;

// --- Human-readable title/description derivation ---

const EVENT_TITLES: Record<string, string> = {
  BUDGET_CREATED: 'Orçamento criado',
  BUDGET_SENT: 'Orçamento enviado',
  BUDGET_APPROVED: 'Orçamento aprovado',
  BUDGET_AUTHORIZED: 'Orçamento autorizado',
  BUDGET_EXECUTION_STARTED: 'Execução iniciada',
  BUDGET_FINALIZED: 'Orçamento finalizado',
  BUDGET_ARCHIVED: 'Orçamento arquivado',
  BUDGET_CANCELLED: 'Orçamento cancelado',
  BUDGET_REJECTED: 'Orçamento recusado',
  PROPOSAL_SENT: 'Proposta enviada',
  PROPOSAL_APPROVED: 'Proposta aprovada',
  PROPOSAL_REJECTED: 'Proposta recusada',
  WORKORDER_CREATED: 'Ordem de serviço criada',
  WORKORDER_STARTED: 'Ordem de serviço iniciada',
  WORKORDER_COMPLETED: 'Ordem de serviço concluída',
  WORKORDER_CANCELLED: 'Ordem de serviço cancelada',
  FINANCE_RECORD_REALIZED: 'Receita realizada',
  CLIENT_CREATED: 'Cliente cadastrado',
  CLIENT_UPDATED: 'Cliente atualizado',
  WORKFLOW_STALLED: 'Fluxo paralisado',
  SLA_BREACHED: 'SLA violado',
};

function buildTitle(eventType: string): string {
  return EVENT_TITLES[eventType] ?? `Evento: ${eventType}`;
}

function buildDescription(event: OperationalEvent): string {
  const parts: string[] = [];
  if (event.aggregateType) parts.push(event.aggregateType);
  if (event.actor && event.actor !== 'system') parts.push(`por ${event.actor}`);
  if (event.source) parts.push(`via ${event.source}`);
  return parts.length > 0 ? parts.join(' · ') : 'Evento operacional registrado';
}

function deriveTags(event: OperationalEvent, severity: string): string[] {
  const tags: string[] = [event.aggregateType];
  if (severity === 'critical') tags.push('sla');
  if (event.eventType.includes('CANCELLED') || event.eventType.includes('REJECTED')) tags.push('attention');
  if (event.eventType.includes('COMPLETED') || event.eventType.includes('FINALIZED')) tags.push('milestone');
  if (event.eventType.includes('EXECUTION')) tags.push('execution');
  return tags;
}

function isSlaRelevant(eventType: string): boolean {
  return [
    'SLA_BREACHED',
    'WORKFLOW_STALLED',
    'WORKORDER_COMPLETED',
    'BUDGET_FINALIZED',
    'BUDGET_EXECUTION_STARTED',
  ].includes(eventType);
}

function isUnreadCapable(eventType: string): boolean {
  // Events that a user would want to "mark as read" in the future
  return [
    'PROPOSAL_APPROVED',
    'PROPOSAL_REJECTED',
    'WORKORDER_COMPLETED',
    'WORKORDER_CANCELLED',
    'BUDGET_FINALIZED',
    'BUDGET_REJECTED',
    'SLA_BREACHED',
    'WORKFLOW_STALLED',
  ].includes(eventType);
}

/**
 * Convert an OperationalEvent into a feed item.
 * Pure function — no side effects.
 */
function eventToFeedItem(event: OperationalEvent): OperationalFeedItem {
  const severity = getOperationalEventSeverity(event.eventType);
  const priority = getOperationalEventPriority(event.eventType);

  return {
    id: event.id,
    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    actor: event.actor,
    eventType: event.eventType,
    title: buildTitle(event.eventType),
    description: buildDescription(event),
    timestamp: event.timestamp,
    severity,
    priority,
    correlationId: event.correlationId,
    timelineReference: event.id,
    operationalTags: deriveTags(event, severity),
    unreadCapable: isUnreadCapable(event.eventType),
    slaRelevant: isSlaRelevant(event.eventType),
  };
}

export class OperationalFeedService {
  /** In-memory feed cache, newest-first (append-only during session) */
  private feedCache: OperationalFeedItem[] = [];

  /** Activity feed subscribers (incremental delivery) */
  private feedSubscribers: Set<FeedListener> = new Set();

  /** Alert subscribers (severity >= warning only) */
  private alertSubscribers: Set<AlertListener> = new Set();

  /** Technician feed subscribers */
  private technicianSubscribers: Set<FeedListener> = new Set();

  /** Client activity subscribers */
  private clientActivitySubscribers: Set<FeedListener> = new Set();

  /**
   * Append a new event to the feed.
   * Called by OperationalSubscriptionService during fanout.
   *
   * This is INCREMENTAL — only the new item is derived and pushed.
   * No full rebuild, no replay, no heavy reduce.
   */
  appendEvent(event: OperationalEvent): void {
    const feedItem = eventToFeedItem(event);

    // Idempotency guard: skip if already in cache
    if (this.feedCache.some(item => item.id === feedItem.id)) {
      return;
    }

    // Prepend (newest-first)
    this.feedCache.unshift(feedItem);

    const payload: OperationalFeedSubscriptionPayload = {
      newItems: [feedItem],
      totalCount: this.feedCache.length,
    };

    // Notify activity feed subscribers
    this.feedSubscribers.forEach(cb => {
      try { cb(payload); } catch (err) { console.error('[FeedService] Feed subscriber error:', err); }
    });

    // Notify technician subscribers (workorder-related events)
    if (feedItem.aggregateType === 'workorder' || feedItem.eventType.includes('EXECUTION')) {
      this.technicianSubscribers.forEach(cb => {
        try { cb(payload); } catch (err) { console.error('[FeedService] Technician subscriber error:', err); }
      });
    }

    // Notify client activity subscribers (proposal/client-related events)
    if (feedItem.aggregateType === 'proposal' || feedItem.aggregateType === 'client') {
      this.clientActivitySubscribers.forEach(cb => {
        try { cb(payload); } catch (err) { console.error('[FeedService] Client subscriber error:', err); }
      });
    }

    // Alert derivation (NOT persisted, purely transient)
    if (isOperationalAlertSeverity(feedItem.severity)) {
      const alertItem = feedItem as OperationalAlertItem;
      this.alertSubscribers.forEach(cb => {
        try { cb([alertItem]); } catch (err) { console.error('[FeedService] Alert subscriber error:', err); }
      });
    }
  }

  /**
   * Get the current feed (shallow copy, newest-first).
   * For UI consumption only — do not mutate the returned array.
   */
  getFeed(): OperationalFeedItem[] {
    return [...this.feedCache];
  }

  /**
   * Rebuild the feed from a full event list (e.g., during hydration).
   * Deterministic: same events → same feed.
   * Called once during startup, not on every render.
   */
  rebuildFromEvents(events: OperationalEvent[]): void {
    // Sort chronologically, then reverse for newest-first
    const sorted = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    this.feedCache = sorted.map(eventToFeedItem);
  }

  /**
   * Invalidate the feed cache.
   * Called by OperationalReadModelService during targeted invalidation.
   * Next access will require a rebuild from events.
   */
  invalidateFeed(): void {
    this.feedCache = [];
  }

  // --- Subscriptions (all return unsubscribe callbacks, memory-safe) ---

  subscribeActivityFeed(callback: FeedListener): Unsubscribe {
    this.feedSubscribers.add(callback);
    return () => { this.feedSubscribers.delete(callback); };
  }

  subscribeOperationalAlerts(callback: AlertListener): Unsubscribe {
    this.alertSubscribers.add(callback);
    return () => { this.alertSubscribers.delete(callback); };
  }

  subscribeTechnicianFeed(callback: FeedListener): Unsubscribe {
    this.technicianSubscribers.add(callback);
    return () => { this.technicianSubscribers.delete(callback); };
  }

  subscribeClientActivity(callback: FeedListener): Unsubscribe {
    this.clientActivitySubscribers.add(callback);
    return () => { this.clientActivitySubscribers.delete(callback); };
  }
}

export const operationalFeedService = new OperationalFeedService();
