import { Budget, BUDGET_STATUS, BudgetStatus } from '../domain/budget';
import { BudgetRepository } from '../repositories/budgetRepository';
import { DexieBudgetRepository } from '../repositories/dexieBudgetRepository';
import { calculateBudget, BudgetInputs } from '../domain/aferixFinanceEngine';

export class BudgetService {
  private repository: BudgetRepository;

  constructor(repository?: BudgetRepository) {
    this.repository = repository ?? new DexieBudgetRepository();
  }

  async changeStatus(budget: Budget, nextStatus: BudgetStatus): Promise<void> {
    if (budget.status === BUDGET_STATUS.FINALIZADO) {
      console.warn("Cannot change status of a finalized budget.");
      return;
    }

    const updatedBudget: Budget = {
      ...budget,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.updateBudget(updatedBudget);
  }

  async finalizeBudget(budget: Budget): Promise<void> {
    if (budget.status === BUDGET_STATUS.FINALIZADO) {
      return; // Already finalized
    }

    const inputs: BudgetInputs = {
      chargedValue: budget.chargedValue,
      materialCost: budget.materialCost,
      travelCost: budget.travelCost,
      helperCost: budget.helperCost,
      fees: budget.fees,
      discounts: budget.discounts,
      otherCosts: budget.otherCosts,
    };

    const calculation = calculateBudget(inputs);
    const now = new Date().toISOString();

    const finalizedBudget: Budget = {
      ...budget,
      status: BUDGET_STATUS.FINALIZADO,
      finalizedAt: now,
      updatedAt: now,
      financialSnapshot: {
        custoTotal: calculation.totalCost,
        lucroBruto: calculation.grossProfit,
        margemPercentual: calculation.marginPercent,
        statusLucro: calculation.statusLucro,
        createdAt: now,
      },
    };

    await this.repository.updateBudget(finalizedBudget);
  }
}
