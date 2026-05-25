import { Budget } from '../domain/budget';

export interface BudgetRepository {
  save(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
  getById(id: string): Promise<Budget | undefined>;
  getAll(): Promise<Budget[]>;
  delete(id: string): Promise<void>;
}
