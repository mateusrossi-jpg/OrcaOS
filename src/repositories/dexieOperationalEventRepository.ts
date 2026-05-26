import { db } from '../storage/dexieDatabase';
import { OperationalEvent } from '../domain/operationalEvent';

export interface OperationalEventRepository {
  add(event: OperationalEvent): Promise<void>;
  getByAggregateId(aggregateId: string): Promise<OperationalEvent[]>;
  getAll(): Promise<OperationalEvent[]>;
}

export class DexieOperationalEventRepository implements OperationalEventRepository {
  async add(event: OperationalEvent): Promise<void> {
    await db.operationalEvents.add(event);
  }

  async getByAggregateId(aggregateId: string): Promise<OperationalEvent[]> {
    return db.operationalEvents.where('aggregateId').equals(aggregateId).sortBy('timestamp');
  }

  async getAll(): Promise<OperationalEvent[]> {
    return db.operationalEvents.orderBy('timestamp').toArray();
  }
}

export const dexieOperationalEventRepository = new DexieOperationalEventRepository();
