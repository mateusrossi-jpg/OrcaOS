import { db } from '../storage/dexieDatabase';
const generateId = () => Math.random().toString(36).substring(2, 15);
import { OperationalEventType } from '../domain/operationalEvent';

export class TimelineEventService {
  static async logEvent(params: {
    companyId: string;
    workspaceId: string;
    aggregateId: string;
    aggregateType: 'asset' | 'client' | 'workorder' | 'proposal' | 'anomaly';
    eventType: OperationalEventType | string;
    title: string;
    description: string;
    actor: string;
    metadata?: Record<string, any>;
  }) {
    const event = {
      id: generateId(),
      aggregateId: params.aggregateId,
      aggregateType: params.aggregateType as any,
      eventType: params.eventType as any,
      timestamp: new Date().toISOString(),
      actor: params.actor,
      source: 'TimelineEventService',
      metadata: {
        title: params.title,
        description: params.description,
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        ...params.metadata
      },
      createdAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    await db.operationalEvents.put(event as any);
    return event;
  }
}
