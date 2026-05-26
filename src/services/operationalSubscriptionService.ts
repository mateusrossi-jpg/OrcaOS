import { operationalEventService } from './operationalEventService';
import { operationalReadModelService } from './operationalReadModelService';
import { operationalFeedService } from './operationalFeedService';
import { OperationalEvent } from '../domain/operationalEvent';
import { OperationalFeedSubscriptionPayload, OperationalAlertItem } from '../domain/operationalFeedProjection';

type ProjectionName = 'pipeline' | 'metrics' | 'board' | 'crm' | 'activity' | 'feed';

// Invalidation Map: Which events invalidate which projections
const ProjectionInvalidationMap: Record<string, ProjectionName[]> = {
  'BUDGET_CREATED': ['pipeline', 'metrics', 'board', 'crm', 'activity', 'feed'],
  'BUDGET_EXECUTED': ['pipeline', 'board', 'crm', 'activity', 'feed'],
  'BUDGET_FINALIZED': ['pipeline', 'metrics', 'board', 'crm', 'activity', 'feed'],
  'PROPOSAL_SENT': ['pipeline', 'metrics', 'board', 'crm', 'activity', 'feed'],
  'PROPOSAL_APPROVED': ['pipeline', 'metrics', 'board', 'crm', 'activity', 'feed'],
  'WORKORDER_COMPLETED': ['pipeline', 'metrics', 'board', 'activity', 'feed'],
  'FINANCE_RECORD_REALIZED': ['metrics', 'activity', 'feed'],
  '*': ['pipeline', 'metrics', 'board', 'crm', 'activity', 'feed'] // Fallback
};

export class OperationalSubscriptionService {
  private boardSubscribers: Set<() => void> = new Set();
  private timelineSubscribers: Set<(aggregateId: string) => void> = new Set();
  private metricsSubscribers: Set<() => void> = new Set();
  private clientPipelineSubscribers: Set<() => void> = new Set();
  private financeOperationalSubscribers: Set<() => void> = new Set();

  constructor() {
    // Single listener on the Event Store — no duplicate fanout
    operationalEventService.subscribe((event: OperationalEvent) => {
      this.handleEventFanout(event);
    });
  }

  private handleEventFanout(event: OperationalEvent) {
    const affectedProjections = ProjectionInvalidationMap[event.eventType] || ProjectionInvalidationMap['*'];
    
    // 1. Targeted Invalidation (partial, not global rebuild)
    affectedProjections.forEach(proj => {
      operationalReadModelService.invalidate(proj);
    });

    // 2. Incremental feed append (NOT a rebuild — single item derivation)
    operationalFeedService.appendEvent(event);

    console.debug(`[SubscriptionService] Fanout: ${event.eventType} affected ${affectedProjections.join(', ')}`);

    // 3. Incremental Refresh Subscriptions (push notification to UI listeners)
    // Snapshot Sets before iteration to prevent mutation-during-iteration
    if (affectedProjections.includes('board')) {
      for (const cb of [...this.boardSubscribers]) {
        try { cb(); } catch (err) { console.error('[SubscriptionService] Board subscriber error:', err); }
      }
    }
    
    if (affectedProjections.includes('metrics')) {
      for (const cb of [...this.metricsSubscribers]) {
        try { cb(); } catch (err) { console.error('[SubscriptionService] Metrics subscriber error:', err); }
      }
    }
    
    if (affectedProjections.includes('crm')) {
      for (const cb of [...this.clientPipelineSubscribers]) {
        try { cb(); } catch (err) { console.error('[SubscriptionService] CRM subscriber error:', err); }
      }
    }

    if (affectedProjections.includes('activity') || affectedProjections.includes('pipeline')) {
      for (const cb of [...this.financeOperationalSubscribers]) {
        try { cb(); } catch (err) { console.error('[SubscriptionService] Finance subscriber error:', err); }
      }
    }

    // Timeline updates are aggregate-specific
    for (const cb of [...this.timelineSubscribers]) {
      try { cb(event.aggregateId); } catch (err) { console.error('[SubscriptionService] Timeline subscriber error:', err); }
    }
  }

  // ---- Core Subscriptions (ERP-Grade) ----

  subscribeBoardUpdates(callback: () => void): () => void {
    this.boardSubscribers.add(callback);
    return () => { this.boardSubscribers.delete(callback); };
  }

  subscribeTimelineUpdates(callback: (aggregateId: string) => void): () => void {
    this.timelineSubscribers.add(callback);
    return () => { this.timelineSubscribers.delete(callback); };
  }

  subscribeMetricsUpdates(callback: () => void): () => void {
    this.metricsSubscribers.add(callback);
    return () => { this.metricsSubscribers.delete(callback); };
  }

  subscribeClientPipelineUpdates(callback: () => void): () => void {
    this.clientPipelineSubscribers.add(callback);
    return () => { this.clientPipelineSubscribers.delete(callback); };
  }

  subscribeFinanceOperationalUpdates(callback: () => void): () => void {
    this.financeOperationalSubscribers.add(callback);
    return () => { this.financeOperationalSubscribers.delete(callback); };
  }

  // ---- Feed & Notification Subscriptions (delegated to FeedService) ----

  subscribeActivityFeed(callback: (payload: OperationalFeedSubscriptionPayload) => void): () => void {
    return operationalFeedService.subscribeActivityFeed(callback);
  }

  subscribeOperationalAlerts(callback: (alerts: OperationalAlertItem[]) => void): () => void {
    return operationalFeedService.subscribeOperationalAlerts(callback);
  }

  subscribeTechnicianFeed(callback: (payload: OperationalFeedSubscriptionPayload) => void): () => void {
    return operationalFeedService.subscribeTechnicianFeed(callback);
  }

  subscribeClientActivity(callback: (payload: OperationalFeedSubscriptionPayload) => void): () => void {
    return operationalFeedService.subscribeClientActivity(callback);
  }
}

export const operationalSubscriptionService = new OperationalSubscriptionService();
