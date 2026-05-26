import { loadStoredCaptures } from '../app/storage/calculationCapturesStorage';
import { db } from '../storage/dexieDatabase';

export class CalculationCaptureMigrationService {
  private MIGRATION_KEY = 'calculation_captures_dexie_migration_v1';

  async runIfNeeded(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const migrationRecord = await db.migrations.get(this.MIGRATION_KEY);
      if (migrationRecord?.done) {
        return;
      }

      console.info('Starting CalculationCaptures migration to Dexie...');

      const legacyCaptures = loadStoredCaptures();

      if (legacyCaptures.length > 0) {
        await db.calculationCaptures.bulkAdd(legacyCaptures);
      }

      await db.migrations.put({
        key: this.MIGRATION_KEY,
        done: true,
      });

      console.info('CalculationCaptures migration completed successfully.');
    } catch (err) {
      console.error('Failed to migrate CalculationCaptures to Dexie:', err);
    }
  }
}

export const calculationCaptureMigrationService = new CalculationCaptureMigrationService();
