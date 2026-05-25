import { db } from '../storage/dexieDatabase';
import { loadCatalogHubItems, loadCatalogSuppliers } from '../features/catalog/storage/catalogHubStorage';
import { loadSupplierProfiles } from '../features/catalog/storage/supplierProfileStorage';

export class CatalogMigrationService {
  static MIGRATION_KEY = 'migration:catalog:v1';

  async runIfNeeded(): Promise<void> {
    const migration = await db.migrations.get(CatalogMigrationService.MIGRATION_KEY);
    if (migration?.done) return;

    console.info('Starting Catalog migration to Dexie...');

    const legacyItems = loadCatalogHubItems();
    const legacySuppliers = loadCatalogSuppliers();
    const legacyProfiles = loadSupplierProfiles();

    await db.transaction('rw', db.catalog, db.catalogSuppliers, db.supplierProfiles, db.migrations, async () => {
      if (legacyItems.length > 0) {
        await db.catalog.bulkPut(legacyItems);
        console.info(`Migrated ${legacyItems.length} catalog items.`);
      }

      if (legacySuppliers.length > 0) {
        await db.catalogSuppliers.bulkPut(legacySuppliers);
        console.info(`Migrated ${legacySuppliers.length} catalog suppliers.`);
      }

      if (legacyProfiles.length > 0) {
        await db.supplierProfiles.bulkPut(legacyProfiles);
        console.info(`Migrated ${legacyProfiles.length} supplier profiles.`);
      }

      await db.migrations.put({ key: CatalogMigrationService.MIGRATION_KEY, done: true });
    });

    console.info('Catalog migration completed successfully.');
  }
}

export const catalogMigrationService = new CatalogMigrationService();
