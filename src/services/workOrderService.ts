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
}

export const workOrderService = new WorkOrderService();
