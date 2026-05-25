import { useState, useMemo, useEffect } from 'react';
import { Budget, BUDGET_STATUS, BudgetStatus } from '../domain/budget';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { BudgetService } from '../services/budgetService';
import { DexieBudgetRepository } from '../repositories/DexieBudgetRepository';

const repository = new DexieBudgetRepository();
const service = new BudgetService(repository);

export function useBudgetForm(initialBudget?: Budget) {
  const [budget, setBudget] = useState<Budget>(initialBudget || {
    id: crypto.randomUUID(),
    title: '',
    clientId: '',
    status: BUDGET_STATUS.INICIADO,
    chargedValue: 0,
    materialCost: 0,
    travelCost: 0,
    helperCost: 0,
    fees: 0,
    discounts: 0,
    otherCosts: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const [isSaving, setIsSaving] = useState(false);

  const calculation = useMemo(() => {
    return calculateBudget({
      chargedValue: budget.chargedValue,
      materialCost: budget.materialCost,
      travelCost: budget.travelCost,
      helperCost: budget.helperCost,
      fees: budget.fees,
      discounts: budget.discounts,
      otherCosts: budget.otherCosts,
    });
  }, [budget]);

  const updateField = (field: keyof Budget, value: any) => {
    if (budget.status === BUDGET_STATUS.FINALIZADO) return;
    setBudget(prev => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await service.saveBudget(budget);
    } finally {
      setIsSaving(false);
    }
  };

  const sendToClient = async () => {
    const updated = { ...budget, status: BUDGET_STATUS.ENVIADO as BudgetStatus };
    setBudget(updated);
    await service.saveBudget(updated);
  };

  const finalize = async () => {
    await service.finalizeBudget(budget);
    const finalized = await service.getBudget(budget.id);
    if (finalized) {
      setBudget(finalized);
    }
  };

  return {
    budget,
    updateField,
    calculation,
    save,
    sendToClient,
    finalize,
    isSaving,
    isReadOnly: budget.status === BUDGET_STATUS.FINALIZADO,
  };
}
