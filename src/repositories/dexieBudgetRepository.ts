/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { Budget, BUDGET_STATUS } from '../domain/budget';
import { BudgetRepository } from './budgetRepository';
import { db } from '../storage/dexieDatabase';

import { validateBudgetIntegrity } from '../domain/guards';
import { aferixLogger } from '../core/debug/aferixLogger';
import { safeTransaction } from '../core/database/safeTransaction';
import { writeLock } from '../core/database/writeLock';
import { idempotency } from '../core/database/idempotency';
import { operationAudit } from '../core/audit/operationAudit';

const BUDGET_LAST_HASH = new Map<string, string>();

export class DexieBudgetRepository implements BudgetRepository {
  async createBudget(budget: Budget): Promise<void> {
    const toSave = { ...budget, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: budget.updatedAt || new Date().toISOString() } as Budget;
    if (!validateBudgetIntegrity(toSave)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid budget creation', toSave);
      throw new Error('Invalid budget integrity');
    }

    const currentHash = idempotency.generateWriteFingerprint(toSave);
    if (BUDGET_LAST_HASH.get(toSave.id) === currentHash) {
      aferixLogger.info('Idempotency', `Duplicate create budget prevented for ${toSave.id}`);
      return;
    }

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(toSave.id, async () => {
        await safeTransaction('createBudget', 'rw', [db.budgets], async () => {
          await db.budgets.add(toSave);
        });
        BUDGET_LAST_HASH.set(toSave.id, currentHash);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'Budget', entityId: toSave.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'Budget', entityId: toSave.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async updateBudget(budget: Budget): Promise<void> {
    const toSave = { ...budget, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as Budget;
    if (!validateBudgetIntegrity(toSave)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid budget update', toSave);
      throw new Error('Invalid budget integrity');
    }

    const currentHash = idempotency.generateWriteFingerprint(toSave);
    if (BUDGET_LAST_HASH.get(toSave.id) === currentHash) {
      aferixLogger.info('Idempotency', `Duplicate update budget prevented for ${toSave.id}`);
      return;
    }

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(toSave.id, async () => {
        await safeTransaction('updateBudget', 'rw', [db.budgets], async () => {
          await db.budgets.put(toSave);
        });
        BUDGET_LAST_HASH.set(toSave.id, currentHash);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'Budget', entityId: toSave.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'Budget', entityId: toSave.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    const budget = await db.budgets.get(id);
    if (budget && budget.syncStatus === 'deleted') return undefined;
    return budget;
  }

  async listBudgets(): Promise<Budget[]> {
    // Dexie's toArray() returns elements in primary key order (or insertion order).
    // We sort in memory to guarantee newest first by createdAt.
    const all = await db.budgets.filter(b => b.syncStatus !== 'deleted').toArray();
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listFinalizedByMonth(year: number, month: number): Promise<Budget[]> {
    // Fetch all finalized budgets and filter in memory by the finalizedAt month.
    // A more advanced index strategy could be used, but this is simple and robust for the MVP.
    const finalized = await db.budgets.where('status').equals(BUDGET_STATUS.FINALIZADO).filter(b => b.syncStatus !== 'deleted').toArray();
    
    return finalized.filter(budget => {
      if (!budget.finalizedAt) return false;
      const date = new Date(budget.finalizedAt);
      // JS getMonth is 0-indexed, so we compare directly with 0-11 if month is 0-indexed,
      // or we adjust if month is 1-12. Assuming year=2026, month=5 for May (1-based).
      // Let's assume month is 1-12.
      return date.getFullYear() === year && (date.getMonth() + 1) === month;
    });
  }
  async countByClientId(clientId: string): Promise<number> {
    const count = await db.budgets.where('clientId').equals(clientId).count();
    return count;
  }
  async delete(id: string): Promise<void> {
    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(id, async () => {
        await safeTransaction('deleteBudget', 'rw', [db.budgets], async () => {
          const b = await db.budgets.get(id);
          if (b) {
            await db.budgets.put({ ...b, syncStatus: 'deleted', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() });
          }
        });
        BUDGET_LAST_HASH.delete(id);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'delete', entity: 'Budget', entityId: id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'delete', entity: 'Budget', entityId: id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }
}
