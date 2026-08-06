import { db } from '../database/db';
import type { WorkOrder } from '../database/schema';
import { createId } from '../../app/utils/idHelpers';

export class WorkOrderRepository {
  async getById(id: string): Promise<WorkOrder | undefined> {
    return db.work_orders.get(id);
  }

  async getAll(): Promise<WorkOrder[]> {
    return db.work_orders.orderBy('created_at').reverse().toArray();
  }

  async findActive(): Promise<WorkOrder[]> {
    return db.work_orders.toArray().then(arr => arr.filter(wo => wo.status !== 'cancelled' && wo.status !== 'completed'));
  }

  async create(wo: Omit<WorkOrder, 'id'>, customId?: string): Promise<WorkOrder> {
    const id = customId || createId('wo');
    const newWo = { ...wo, id } as WorkOrder;
    await db.work_orders.add(newWo);
    return newWo;
  }

  async update(id: string, updates: Partial<WorkOrder>): Promise<void> {
    await db.work_orders.update(id, updates);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await db.work_orders.update(id, { status: status as any });
  }

  async delete(id: string): Promise<void> {
    await db.work_orders.delete(id);
  }
}

export const workOrderRepository = new WorkOrderRepository();
