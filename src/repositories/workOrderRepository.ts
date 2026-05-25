import { WorkOrder } from '../core/types/business';

export interface WorkOrderRepository {
  getAll(): Promise<WorkOrder[]>;
  getById(id: string): Promise<WorkOrder | undefined>;
  add(workOrder: WorkOrder): Promise<void>;
  update(workOrder: WorkOrder): Promise<void>;
  delete(id: string): Promise<void>;
  bulkAdd(workOrders: WorkOrder[]): Promise<void>;
}
