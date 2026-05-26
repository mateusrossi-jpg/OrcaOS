import { dexieOperationalEventRepository, OperationalEventRepository } from '../repositories/dexieOperationalEventRepository';
import { OperationalEvent, EventAggregateType, OperationalEventType } from '../domain/operationalEvent';

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

type EventListener = (event: OperationalEvent) => void;

export class OperationalEventService {
  private subscribers: EventListener[] = [];

  constructor(private readonly repository: OperationalEventRepository = dexieOperationalEventRepository) {}

  subscribe(listener: EventListener): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== listener);
    };
  }

  async emitEvent(params: {
    aggregateId: string;
    aggregateType: EventAggregateType;
    eventType: OperationalEventType;
    actor?: string;
    source?: string;
    metadata?: Record<string, unknown>;
    snapshot?: Record<string, unknown>;
    correlationId?: string;
    causationId?: string;
  }): Promise<OperationalEvent> {
    const timestamp = new Date().toISOString();
    const event: OperationalEvent = {
      id: createId('evt'),
      aggregateId: params.aggregateId,
      aggregateType: params.aggregateType,
      eventType: params.eventType,
      timestamp,
      actor: params.actor ?? 'system',
      source: params.source ?? 'AferixUI',
      metadata: params.metadata,
      snapshot: params.snapshot,
      correlationId: params.correlationId,
      causationId: params.causationId,
      createdAt: timestamp,
    };

    await this.repository.add(event);
    
    // Fanout (snapshot array to prevent mutation-during-iteration)
    for (const sub of [...this.subscribers]) {
      try { sub(event); } catch (err) { console.error('Error in event listener:', err); }
    }
    
    return event;
  }

  async getTimelineForAggregate(aggregateId: string): Promise<OperationalEvent[]> {
    return this.repository.getByAggregateId(aggregateId);
  }

  async getFullTimeline(): Promise<OperationalEvent[]> {
    return this.repository.getAll();
  }
}

export const operationalEventService = new OperationalEventService();
