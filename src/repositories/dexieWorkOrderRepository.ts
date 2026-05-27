import { WorkOrder } from '../core/types/business';
import { WorkOrderRepository } from './workOrderRepository';
import { db } from '../storage/dexieDatabase';

export class DexieWorkOrderRepository implements WorkOrderRepository {
  async getAll(): Promise<WorkOrder[]> {
    return await db.workOrders.toArray();
  }

  async getById(id: string): Promise<WorkOrder | undefined> {
    return await db.workOrders.get(id);
  }

  async add(workOrder: WorkOrder): Promise<void> {
    const toSave = { ...workOrder, syncStatus: 'pending', updatedAt: Date.now() } as any;
    await db.workOrders.add(toSave);
  }

  async update(workOrder: WorkOrder): Promise<void> {
    await db.workOrders.put({
      ...workOrder,
      updatedAt: Date.now(),
      syncStatus: 'pending',
    } as any);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.workOrders.get(id);
    if (existing) {
      const toSave = { ...existing, syncStatus: 'deleted', updatedAt: Date.now() } as any;
      await db.workOrders.put(toSave);
    }
  }

  async bulkAdd(workOrders: WorkOrder[]): Promise<void> {
    const toSave = workOrders.map(w => ({ ...w, syncStatus: 'pending', updatedAt: Date.now() })) as any;
    await db.workOrders.bulkAdd(toSave);
  }
}

export const dexieWorkOrderRepository = new DexieWorkOrderRepository();
