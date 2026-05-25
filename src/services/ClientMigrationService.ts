import { db } from '../storage/dexieDatabase';
import { dexieClientRepository } from '../repositories/dexieClientRepository';
import { dexieWorkOrderRepository } from '../repositories/dexieWorkOrderRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { loadClients, loadWorkOrders, loadActiveWorkOrderId } from '../features/clients/storage/clientWorkOrderStorage';

export class ClientMigrationService {
  static MIGRATION_KEY = 'migration:clients-workorders:v1';
  static ACTIVE_WORK_ORDER_KEY = 'activeWorkOrderId';

  async runIfNeeded(): Promise<void> {
    const migration = await db.migrations.get(ClientMigrationService.MIGRATION_KEY);
    if (migration?.done) return;

    console.info('Starting Client and WorkOrder migration to Dexie...');

    try {
      const legacyClients = loadClients();
      const legacyWorkOrders = loadWorkOrders();
      const legacyActiveId = loadActiveWorkOrderId();

      if (legacyClients.length > 0) {
        await dexieClientRepository.bulkAdd(legacyClients);
        console.info(`Migrated ${legacyClients.length} clients.`);
      }

      if (legacyWorkOrders.length > 0) {
        await dexieWorkOrderRepository.bulkAdd(legacyWorkOrders);
        console.info(`Migrated ${legacyWorkOrders.length} work orders.`);
      }

      if (legacyActiveId) {
        await settingsRepository.set(ClientMigrationService.ACTIVE_WORK_ORDER_KEY, legacyActiveId);
        console.info('Migrated active work order ID.');
      }

      await db.migrations.put({ key: ClientMigrationService.MIGRATION_KEY, done: true });
      console.info('Client and WorkOrder migration completed successfully.');
    } catch (error) {
      console.error('Migration failed:', error);
      // We don't mark as done so it can retry next time
    }
  }
}

export const clientMigrationService = new ClientMigrationService();
