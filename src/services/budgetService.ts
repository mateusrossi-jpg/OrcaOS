import { Budget, BUDGET_STATUS, BudgetStatus } from '../domain/budget';
import { BudgetRepository } from '../repositories/budgetRepository';
import { calculateBudget, BudgetInputs } from '../domain/aferixFinanceEngine';

export class BudgetService {
  constructor(private repository: BudgetRepository) {}

  async saveDraft(input: Budget): Promise<void> {
    const now = new Date().toISOString();
    const existing = await this.repository.getBudgetById(input.id);
    
    if (existing) {
      await this.updateBudget(input);
    } else {
      await this.repository.createBudget({
        ...input,
        status: BUDGET_STATUS.INICIADO,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async updateBudget(budget: Budget): Promise<void> {
    if (budget.status === BUDGET_STATUS.FINALIZADO) {
      console.warn("Attempted to update a finalized budget directly.");
      return;
    }
    
    await this.repository.updateBudget({
      ...budget,
      updatedAt: new Date().toISOString(),
    });
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
