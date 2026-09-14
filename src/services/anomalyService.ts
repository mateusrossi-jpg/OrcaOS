/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { db } from '../storage/dexieDatabase';
import { Anomaly } from '../domain/revenue';

export class AnomalyService {
  async getAll(): Promise<Anomaly[]> {
    return await db.anomalies.toArray();
  }

  async getById(id: string): Promise<Anomaly | undefined> {
    return await db.anomalies.get(id);
  }

  async getByStatus(status: Anomaly['status']): Promise<Anomaly[]> {
    return await db.anomalies.where('status').equals(status).toArray();
  }

  async getByClientId(clientId: string): Promise<Anomaly[]> {
    return await db.anomalies.where('clientId').equals(clientId).toArray();
  }

  async update(id: string, changes: Partial<Anomaly>): Promise<void> {
    await db.anomalies.update(id, changes);
  }

  async add(anomaly: Anomaly): Promise<void> {
    await db.anomalies.add(anomaly);
  }

  async upsert(anomaly: Anomaly): Promise<void> {
    await db.anomalies.put(anomaly);
  }
}

export const anomalyService = new AnomalyService();
