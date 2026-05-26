import { db } from '../storage/dexieDatabase';
import { SimpleFinanceService } from './SimpleFinanceService';
import { SimpleFinanceRecord } from '../domain/finance';

const STORAGE_KEY = 'orcaos:simple-finance-records:v1';

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is SimpleFinanceRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<SimpleFinanceRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.clientName === 'string' &&
    (record.status === 'forecast' || record.status === 'realized' || typeof record.status === 'undefined') &&
    isNumber(record.receivedAmount) &&
    isNumber(record.materialCost) &&
    isNumber(record.travelCost) &&
    isNumber(record.cardFee) &&
    isNumber(record.estimatedTax) &&
    isNumber(record.otherCosts) &&
    (typeof record.sourceBudgetId === 'string' || typeof record.sourceBudgetId === 'undefined') &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

function loadLegacyRecords(): SimpleFinanceRecord[] {
  // eslint-disable-next-line no-restricted-syntax
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return [];
  // eslint-disable-next-line no-restricted-syntax
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecord).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  } catch {
    return [];
  }
}

const MIGRATION_KEY = 'migration:simpleFinance:dexie';

export class SimpleFinanceMigrationService {
  /**
   * Reads legacy simpleFinanceStorage from localStorage and migrates to Dexie.
   * Runs exactly once.
   */
  static async runIfNeeded(): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      const migrationRecord = await db.migrations.get(MIGRATION_KEY);
      if (migrationRecord?.done) {
        return; // Already migrated
      }

      // Read from legacy storage
      const legacyRecords = loadLegacyRecords();
      
      if (legacyRecords.length > 0) {
        const financeService = new SimpleFinanceService();
        // Insert records safely (avoiding duplicates if it partially failed before)
        for (const record of legacyRecords) {
          try {
            await financeService.saveRecord(record);
          } catch (e) {
            console.error(`Failed to migrate simple finance record ${record.id}:`, e);
          }
        }
      }

      // Mark migration as complete
      await db.migrations.put({
        key: MIGRATION_KEY,
        done: true
      });
      
      console.log('Simple Finance migration to Dexie completed successfully.');
    } catch (error) {
      console.error('Error during Simple Finance migration:', error);
      // We don't throw here to avoid breaking app bootstrap
    }
  }
}
