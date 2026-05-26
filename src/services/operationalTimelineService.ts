import { operationalEventService } from './operationalEventService';
import { OperationalEvent } from '../domain/operationalEvent';

export class OperationalTimelineService {
  /**
   * Retrieves the full chronological timeline for a specific aggregate.
   */
  async getAggregateTimeline(aggregateId: string): Promise<OperationalEvent[]> {
    return await operationalEventService.getTimelineForAggregate(aggregateId);
  }

  /**
   * Retrieves a consolidated timeline of all events in the system,
   * sorted by timestamp descending (newest first).
   */
  async getGlobalTimeline(): Promise<OperationalEvent[]> {
    const events = await operationalEventService.getFullTimeline();
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Groups a list of events by their aggregateId.
   */
  groupEventsByAggregate(events: OperationalEvent[]): Record<string, OperationalEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.aggregateId]) {
        acc[event.aggregateId] = [];
      }
      acc[event.aggregateId].push(event);
      return acc;
    }, {} as Record<string, OperationalEvent[]>);
  }

  /**
   * Identifies the current active state (last event) for each aggregate in the provided event list.
   */
  getAggregateSnapshots(events: OperationalEvent[]): Record<string, OperationalEvent> {
    const grouped = this.groupEventsByAggregate(events);
    const snapshots: Record<string, OperationalEvent> = {};
    for (const [id, aggEvents] of Object.entries(grouped)) {
      const sorted = aggEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      snapshots[id] = sorted[sorted.length - 1];
    }
    return snapshots;
  }
}

export const operationalTimelineService = new OperationalTimelineService();
