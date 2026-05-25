import { Budget } from '../domain/budget';
import { BudgetRepository } from './BudgetRepository';
import { db } from '../storage/dexieDatabase';

export class DexieBudgetRepository implements BudgetRepository {
  async save(budget: Budget): Promise<void> {
    await db.budgets.add(budget);
  }

  async update(budget: Budget): Promise<void> {
    await db.budgets.put(budget);
  }

  async getById(id: string): Promise<Budget | undefined> {
    return await db.budgets.get(id);
  }

  async getAll(): Promise<Budget[]> {
    return await db.budgets.toArray();
  }

  async delete(id: string): Promise<void> {
    await db.budgets.delete(id);
  }
}
