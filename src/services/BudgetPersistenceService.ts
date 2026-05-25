import { BudgetRepository } from '../repositories/budgetRepository';
import { DexieBudgetRepository } from '../repositories/dexieBudgetRepository';
import { Budget } from '../domain/budget';

/**
 * Service encapsulating persistence of Budget entities.
 * It delegates to a BudgetRepository implementation (Dexie based).
 * All hooks should use this service instead of accessing storage directly.
 */
export class BudgetPersistenceService {
  private repository: BudgetRepository;

  constructor(repository?: BudgetRepository) {
    // Allow injection for testing; default to Dexie implementation.
    this.repository = repository ?? new DexieBudgetRepository();
  }

  /** Save or update a draft budget (non‑finalized). */
  async saveDraft(budget: Budget): Promise<void> {
    const existing = await this.repository.getBudgetById(budget.id);
    if (existing) {
      await this.repository.updateBudget({
        ...budget,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await this.repository.createBudget({
        ...budget,
        status: budget.status ?? 'iniciado',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /** Retrieve all budgets (raw, unsorted). */
  async listBudgets(): Promise<Budget[]> {
    return this.repository.listBudgets();
  }

  /** Retrieve a single budget by id. */
  async getBudget(id: string): Promise<Budget | undefined> {
    return this.repository.getBudgetById(id);
  }

  /** Update an existing budget (e.g., status change). */
  async updateBudget(budget: Budget): Promise<void> {
    await this.repository.updateBudget(budget);
  }

  /** Delete a budget by id. */
  async deleteBudget(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
