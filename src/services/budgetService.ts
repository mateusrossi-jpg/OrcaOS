import { Budget, BUDGET_STATUS } from '../domain/budget';
import { BudgetRepository } from '../repositories/BudgetRepository';
import { calculateBudget } from '../domain/aferixFinanceEngine';

export class BudgetService {
  constructor(private repository: BudgetRepository) {}

  async saveBudget(budget: Budget): Promise<void> {
    const existing = await this.repository.getById(budget.id);
    if (existing) {
      await this.repository.update({
        ...budget,
        updatedAt: Date.now(),
      });
    } else {
      await this.repository.save({
        ...budget,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  async finalizeBudget(budget: Budget): Promise<void> {
    const calculation = calculateBudget({
      chargedValue: budget.chargedValue,
      materialCost: budget.materialCost,
      travelCost: budget.travelCost,
      helperCost: budget.helperCost,
      fees: budget.fees,
      discounts: budget.discounts,
      otherCosts: budget.otherCosts,
    });

    const finalizedBudget: Budget = {
      ...budget,
      status: BUDGET_STATUS.FINALIZADO,
      finalizedAt: Date.now(),
      updatedAt: Date.now(),
      financialSnapshot: {
        materialCost: budget.materialCost,
        travelCost: budget.travelCost,
        helperCost: budget.helperCost,
        otherCosts: budget.otherCosts,
        fees: budget.fees,
        discounts: budget.discounts,
        chargedValue: budget.chargedValue,
        totalCost: calculation.totalCost,
        grossProfit: calculation.grossProfit,
        marginPercent: calculation.marginPercent,
      },
    };

    await this.repository.update(finalizedBudget);
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    return await this.repository.getById(id);
  }

  async getAllBudgets(): Promise<Budget[]> {
    return await this.repository.getAll();
  }
}
