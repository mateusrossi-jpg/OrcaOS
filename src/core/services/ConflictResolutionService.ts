import { workOrderRepository } from '../repositories/WorkOrderRepository';
import { workOrderAggregateResolver } from './WorkOrderAggregateResolver';
import type { WorkOrder } from '../database/schema';

export class ConflictResolutionService {
  async getConflictDiff(workOrderId: string): Promise<{ local: WorkOrder | undefined, remote: WorkOrder | undefined }> {
    const { supabase } = await import('../database/supabaseClient');

    const local = await workOrderRepository.getById(workOrderId);
    let remote: WorkOrder | undefined;

    if (local) {
      const { data } = await supabase.from('work_orders').select('*').eq('id', workOrderId).maybeSingle();
      if (data) remote = data as WorkOrder;
    }
    return { local, remote };
  }

  async resolveWorkOrderConflict(workOrderId: string, resolution: 'keep_mine' | 'use_server' | 'merge_safe') {
    await workOrderAggregateResolver.resolve(workOrderId, resolution);
  }
}

export const conflictResolutionService = new ConflictResolutionService();
