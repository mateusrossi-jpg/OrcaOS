import { Budget } from '../domain/budget';

export interface BudgetRepository {
  createBudget(budget: Budget): Promise<void>;
  updateBudget(budget: Budget): Promise<void>;
  getBudgetById(id: string): Promise<Budget | undefined>;
  listBudgets(): Promise<Budget[]>;
  listFinalizedByMonth(year: number, month: number): Promise<Budget[]>;
  delete(id: string): Promise<void>;
}
