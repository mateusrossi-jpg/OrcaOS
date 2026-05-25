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
    await db.workOrders.add(workOrder);
  }

  async update(workOrder: WorkOrder): Promise<void> {
    await db.workOrders.put({
      ...workOrder,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    await db.workOrders.delete(id);
  }

  async bulkAdd(workOrders: WorkOrder[]): Promise<void> {
    await db.workOrders.bulkAdd(workOrders);
  }
}

export const dexieWorkOrderRepository = new DexieWorkOrderRepository();
