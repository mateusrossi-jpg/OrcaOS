import { db } from '../database/db';
import type { BootstrapWorkOrder, BootstrapWorkOrderItem, BootstrapStockReservation } from '../database/schema';

export class BootstrapRepository {
  static async saveWorkOrders(items: BootstrapWorkOrder[]) {
    await db.bootstrap_work_orders.bulkPut(items);
  }

  static async saveItems(items: BootstrapWorkOrderItem[]) {
    await db.bootstrap_work_order_items.bulkPut(items);
  }

  static async saveReservations(items: BootstrapStockReservation[]) {
    await db.bootstrap_stock_reservations.bulkPut(items);
  }

  static async getWorkOrder(id: string): Promise<BootstrapWorkOrder | undefined> {
    return await db.bootstrap_work_orders.get(id);
  }

  static async getItemsByWorkOrderId(workOrderId: string): Promise<BootstrapWorkOrderItem[]> {
    return await db.bootstrap_work_order_items.where('work_order_id').equals(workOrderId).toArray();
  }

  static async getReservationsByWorkOrderId(workOrderId: string): Promise<BootstrapStockReservation[]> {
    return await db.bootstrap_stock_reservations.where('work_order_id').equals(workOrderId).toArray();
  }

  static async clearStagingForWorkOrderTx(tx: any, workOrderId: string) {
    await tx.table('bootstrap_work_orders').delete(workOrderId);
    const itemIds = await tx.table('bootstrap_work_order_items').where('work_order_id').equals(workOrderId).primaryKeys();
    await tx.table('bootstrap_work_order_items').bulkDelete(itemIds);
    const reservationIds = await tx.table('bootstrap_stock_reservations').where('work_order_id').equals(workOrderId).primaryKeys();
    await tx.table('bootstrap_stock_reservations').bulkDelete(reservationIds);
  }
}
