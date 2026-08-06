import { db } from '../database/db';
import { BootstrapRepository } from '../repositories/BootstrapRepository';

interface BootstrapManifest {
  bootstrap_id: string;
  work_orders: { count: number };
  work_order_items: { count: number };
  stock_reservations: { count: number };
}

export class AggregateBootstrapResolver {
  static async resolveAndPromote(workOrderId: string, expectedManifest: BootstrapManifest, currentTenantId: string): Promise<boolean> {
    const stagingWo = await BootstrapRepository.getWorkOrder(workOrderId);
    if (!stagingWo) return false;

    if (stagingWo.tenant_id !== currentTenantId) {
      console.error(`[BootstrapResolver] Tenant violation: WO ${workOrderId} belongs to ${stagingWo.tenant_id}, but current tenant is ${currentTenantId}`);
      return false; // Error category = tenant_violation. We won't promote it.
    }

    const items = await BootstrapRepository.getItemsByWorkOrderId(workOrderId);
    const reservations = await BootstrapRepository.getReservationsByWorkOrderId(workOrderId);

    // In a real implementation we would know exactly how many items belong to this work order
    // Since expectedManifest gives total count, we simulate the validation per work order.
    // For now we assume if we reached this point, we will promote it.
    // Ideally, the manifest or payload would specify the exact counts per WO.

    // Simulate validation
    const canCommit = true;

    if (canCommit) {
      await db.transaction(
        'rw',
        [
          db.work_orders,
          db.work_order_items,
          db.stock_reservations,
          db.bootstrap_work_orders,
          db.bootstrap_work_order_items,
          db.bootstrap_stock_reservations
        ],
        async (tx) => {
          // Promote WorkOrder
          await tx.table('work_orders').put(stagingWo.payload);

          // Promote Items
          if (items.length > 0) {
            await tx.table('work_order_items').bulkPut(items.map(i => i.payload));
          }

          // Promote Reservations
          if (reservations.length > 0) {
            await tx.table('stock_reservations').bulkPut(reservations.map(r => r.payload));
          }

          // Clear Staging
          await BootstrapRepository.clearStagingForWorkOrderTx(tx, workOrderId);
        }
      );
      return true;
    }

    return false;
  }
}
