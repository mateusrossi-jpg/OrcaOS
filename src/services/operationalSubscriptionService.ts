import { operationalEventService } from './operationalEventService';
import { operationalReadModelService } from './operationalReadModelService';
import { OperationalEvent } from '../domain/operationalEvent';

type ProjectionName = 'pipeline' | 'metrics' | 'board' | 'crm' | 'activity';

// Invalidation Map: Which events invalidate which projections
const ProjectionInvalidationMap: Record<string, ProjectionName[]> = {
  'BUDGET_CREATED': ['pipeline', 'metrics', 'board', 'crm', 'activity'],
  'BUDGET_EXECUTED': ['pipeline', 'board', 'crm', 'activity'],
  'BUDGET_FINALIZED': ['pipeline', 'metrics', 'board', 'crm', 'activity'],
  'PROPOSAL_SENT': ['pipeline', 'metrics', 'board', 'crm', 'activity'],
  'PROPOSAL_APPROVED': ['pipeline', 'metrics', 'board', 'crm', 'activity'],
  'WORKORDER_COMPLETED': ['pipeline', 'metrics', 'board', 'activity'],
  'FINANCE_RECORD_REALIZED': ['metrics', 'activity'],
  '*': ['pipeline', 'metrics', 'board', 'crm', 'activity'] // Fallback
};

export class OperationalSubscriptionService {
  private boardSubscribers: Set<() => void> = new Set();
  private timelineSubscribers: Set<(aggregateId: string) => void> = new Set();
  private metricsSubscribers: Set<() => void> = new Set();
  private clientPipelineSubscribers: Set<() => void> = new Set();
  private financeOperationalSubscribers: Set<() => void> = new Set();

  constructor() {
    // Single source of truth for event processing to avoid listener leaks
    operationalEventService.subscribe((event: OperationalEvent) => {
      this.handleEventFanout(event);
    });
  }

  private handleEventFanout(event: OperationalEvent) {
    const affectedProjections = ProjectionInvalidationMap[event.eventType] || ProjectionInvalidationMap['*'];
    
    // 1. Targeted Invalidation
    affectedProjections.forEach(proj => {
      operationalReadModelService.invalidate(proj);
    });

    console.debug(`[SubscriptionService] Fanout: ${event.eventType} affected ${affectedProjections.join(', ')}`);

    // 2. Incremental Refresh Subscriptions (Push notification to listeners)
    if (affectedProjections.includes('board')) {
      this.boardSubscribers.forEach(cb => cb());
    }
    
    if (affectedProjections.includes('metrics')) {
      this.metricsSubscribers.forEach(cb => cb());
    }
    
    if (affectedProjections.includes('crm')) {
      this.clientPipelineSubscribers.forEach(cb => cb());
    }

    if (affectedProjections.includes('activity') || affectedProjections.includes('pipeline')) {
      this.financeOperationalSubscribers.forEach(cb => cb());
    }

    // Timeline updates are generally aggregate-specific
    this.timelineSubscribers.forEach(cb => cb(event.aggregateId));
  }

  // ---- Subscriptions ERP-Grade ----

  subscribeBoardUpdates(callback: () => void): () => void {
    this.boardSubscribers.add(callback);
    return () => this.boardSubscribers.delete(callback);
  }

  subscribeTimelineUpdates(callback: (aggregateId: string) => void): () => void {
    this.timelineSubscribers.add(callback);
    return () => this.timelineSubscribers.delete(callback);
  }

  subscribeMetricsUpdates(callback: () => void): () => void {
    this.metricsSubscribers.add(callback);
    return () => this.metricsSubscribers.delete(callback);
  }

  subscribeClientPipelineUpdates(callback: () => void): () => void {
    this.clientPipelineSubscribers.add(callback);
    return () => this.clientPipelineSubscribers.delete(callback);
  }

  subscribeFinanceOperationalUpdates(callback: () => void): () => void {
    this.financeOperationalSubscribers.add(callback);
    return () => this.financeOperationalSubscribers.delete(callback);
  }
}

export const operationalSubscriptionService = new OperationalSubscriptionService();
