import { WorkOrder } from '../core/types/business';
import { WorkOrderRepository } from './workOrderRepository';
import { db } from '../storage/dexieDatabase';

export class DexieWorkOrderRepository implements WorkOrderRepository {
  async getAll(): Promise<WorkOrder[]> {
    return await db.workOrders.filter(w => w.syncStatus !== 'deleted').toArray();
  }

  async getById(id: string): Promise<WorkOrder | undefined> {
    const workOrder = await db.workOrders.get(id);
    if (workOrder && workOrder.syncStatus === 'deleted') return undefined;
    return workOrder;
  }

  async add(workOrder: WorkOrder): Promise<void> {
    const toSave = { ...workOrder, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: workOrder.updatedAt || new Date().toISOString() } as WorkOrder;
    await db.workOrders.add(toSave);
  }

  async update(workOrder: WorkOrder): Promise<void> {
    await db.workOrders.put({
      ...workOrder,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncUpdatedAt: Date.now(),
    } as WorkOrder);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.workOrders.get(id);
    if (existing) {
      const toSave = { ...existing, syncStatus: 'deleted', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as WorkOrder;
      await db.workOrders.put(toSave);
    }
  }

  async bulkAdd(workOrders: WorkOrder[]): Promise<void> {
    const toSave = workOrders.map(w => ({ ...w, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() })) as WorkOrder[];
    await db.workOrders.bulkAdd(toSave);
  }
}

export const dexieWorkOrderRepository = new DexieWorkOrderRepository();
