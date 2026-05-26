import { dexieOperationalEventRepository, OperationalEventRepository } from '../repositories/dexieOperationalEventRepository';
import { OperationalEvent, EventAggregateType, OperationalEventType } from '../domain/operationalEvent';

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export class OperationalEventService {
  constructor(private readonly repository: OperationalEventRepository = dexieOperationalEventRepository) {}

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
