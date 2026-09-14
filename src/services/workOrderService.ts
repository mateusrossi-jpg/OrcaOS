import { dexieWorkOrderRepository } from '../repositories/dexieWorkOrderRepository';
import { WorkOrder } from '../core/types/business';

export class WorkOrderService {
  constructor(private readonly repository = dexieWorkOrderRepository) {}

  async getAll(): Promise<WorkOrder[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<WorkOrder | undefined> {
    return await this.repository.getById(id);
  }

  async add(workOrder: WorkOrder): Promise<void> {
    await this.repository.add(workOrder);
  }

  async update(workOrder: WorkOrder): Promise<void> {
    await this.repository.update(workOrder);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getByAttendanceId(attendanceId: string): Promise<WorkOrder | undefined> {
    const all = await this.repository.getAll();
    return all.find(w => w.attendanceId === attendanceId);
  }

  async getRecentCompleted(limit: number): Promise<WorkOrder[]> {
    const all = await this.repository.getAll();
    return all
      .filter(w => w.status === 'done')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, limit);
  }
}

export const workOrderService = new WorkOrderService();
