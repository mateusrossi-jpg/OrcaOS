/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { Budget, BUDGET_STATUS } from '../domain/budget';
import { BudgetRepository } from './budgetRepository';
import { db } from '../storage/dexieDatabase';

export class DexieBudgetRepository implements BudgetRepository {
  async createBudget(budget: Budget): Promise<void> {
    await db.budgets.add(budget);
  }

  async updateBudget(budget: Budget): Promise<void> {
    await db.budgets.put(budget);
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    return await db.budgets.get(id);
  }

  async listBudgets(): Promise<Budget[]> {
    // Dexie's toArray() returns elements in primary key order (or insertion order).
    // We sort in memory to guarantee newest first by createdAt.
    const all = await db.budgets.toArray();
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listFinalizedByMonth(year: number, month: number): Promise<Budget[]> {
    // Fetch all finalized budgets and filter in memory by the finalizedAt month.
    // A more advanced index strategy could be used, but this is simple and robust for the MVP.
    const finalized = await db.budgets.where('status').equals(BUDGET_STATUS.FINALIZADO).toArray();
    
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
    await db.budgets.delete(id);
  }
}
