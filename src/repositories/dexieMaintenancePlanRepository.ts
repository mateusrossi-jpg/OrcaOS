import { generateUUID } from '../core/utils/idGenerator';
import { db } from '../storage/dexieDatabase';
import { MaintenancePlan } from '../domain/maintenancePlan';

export class DexieMaintenancePlanRepository {
  async getAll(): Promise<MaintenancePlan[]> {
    const all = await db.maintenancePlans.toArray();
    return all.filter(p => p.syncStatus !== 'deleted');
  }

  async getById(id: string): Promise<MaintenancePlan | undefined> {
    const plan = await db.maintenancePlans.get(id);
    if (plan && plan.syncStatus === 'deleted') return undefined;
    return plan;
  }

  async getByAssetId(assetId: string): Promise<MaintenancePlan[]> {
    return await db.maintenancePlans
      .where('assetId').equals(assetId)
      .filter(p => p.syncStatus !== 'deleted')
      .toArray();
  }

  async getActivePlans(): Promise<MaintenancePlan[]> {
    return await db.maintenancePlans
      .where('isActive').equals(1) // Assuming Boolean is stored as 1/0 or check schema
      .filter(p => p.syncStatus !== 'deleted')
      .toArray();
  }

  async add(plan: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenancePlan> {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? generateUUID() 
      : `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
    const now = new Date().toISOString();
    const newPlan: MaintenancePlan = {
      ...plan,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    await db.maintenancePlans.add(newPlan);
    return newPlan;
  }

  async update(plan: MaintenancePlan): Promise<void> {
    const now = new Date().toISOString();
    await db.maintenancePlans.update(plan.id, {
      ...plan,
      updatedAt: now,
      syncStatus: 'pending'
    });
  }

  async delete(id: string): Promise<void> {
    await db.maintenancePlans.delete(id);
  }

  async save(plan: MaintenancePlan): Promise<void> {
    await db.maintenancePlans.put(plan);
  }
}

export const dexieMaintenancePlanRepository = new DexieMaintenancePlanRepository();
