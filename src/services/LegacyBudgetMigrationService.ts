// src/services/LegacyBudgetMigrationService.ts
// Migration service – the sole authorized reader of the legacy savedBudgetsStorage (localStorage).
// It runs once, migrates all legacy records to Dexie, and records a flag in the Dexie "migrations" table.

import { db } from '../storage/dexieDatabase';
import { DexieBudgetRepository } from '../repositories/dexieBudgetRepository';
import { loadSavedBudgets, mapToNewBudget, SavedBudgetRecord } from '../features/budgets/storage/savedBudgetsStorage';

/**
 * LegacyBudgetMigrationService
 * ---------------------------
 * * Reads legacy budgets from localStorage (via savedBudgetsStorage).
 * * Persists each record to Dexie using DexieBudgetRepository.
 * * Uses an explicit up‑sert: check existence by id, then update or create.
 * * Writes a migration‑completed flag to the Dexie "migrations" table **only after** all records have been
 *   successfully migrated.
 * * Idempotent – subsequent runs detect the flag and bail out.
 */
export class LegacyBudgetMigrationService {
  private static readonly MIGRATION_KEY = 'legacy-budget-migration-done';
  private readonly repo = new DexieBudgetRepository();

  /** Run migration if it hasn't been executed before. */
  async runIfNeeded(): Promise<void> {
    // Check flag in migrations table.
    const flag = await db.migrations.where('key').equals(LegacyBudgetMigrationService.MIGRATION_KEY).first();
    if (flag && flag.done) {
      // Migration already performed.
      return;
    }

    // Load all legacy records.
    const legacyRecords: SavedBudgetRecord[] = loadSavedBudgets();
    // Migrate each record safely.
    for (const legacy of legacyRecords) {
      const budget = mapToNewBudget(legacy);
      // Preserve original id (mapToNewBudget already copies it).
      const existing = await this.repo.getBudgetById(budget.id);
      if (existing) {
        await this.repo.updateBudget(budget);
      } else {
        await this.repo.createBudget(budget);
      }
    }

    // All records migrated successfully – write flag.
    await db.migrations.put({ key: LegacyBudgetMigrationService.MIGRATION_KEY, done: true });
  }
}
