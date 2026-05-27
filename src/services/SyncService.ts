import { db } from '../storage/dexieDatabase';

export class SyncService {
  /**
   * Retrieves all records across synchronized tables that are marked as pending.
   * This acts as the foundation for the future sync queue.
   */
  async getPendingChanges() {
    const pendingBudgets = await db.budgets.where('syncStatus').anyOf('pending', 'deleted').toArray();
    const pendingClients = await db.clients.where('syncStatus').anyOf('pending', 'deleted').toArray();
    const pendingWorkOrders = await db.workOrders.where('syncStatus').anyOf('pending', 'deleted').toArray();

    return {
      budgets: pendingBudgets,
      clients: pendingClients,
      workOrders: pendingWorkOrders,
      totalPending: pendingBudgets.length + pendingClients.length + pendingWorkOrders.length
    };
  }
}

export const syncService = new SyncService();
