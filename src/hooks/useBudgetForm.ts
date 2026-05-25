import { useState, useMemo, useCallback, useEffect } from 'react';
import { Budget, BUDGET_STATUS, BudgetStatus } from '../domain/budget';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { BudgetService } from '../services/budgetService';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { DexieBudgetRepository } from '../repositories/dexieBudgetRepository';

const persistenceService = new BudgetPersistenceService();
const repository = new DexieBudgetRepository();
const service = new BudgetService(repository);

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export function useBudgetForm(initialBudgetId?: string | null) {
  const [budget, setBudget] = useState<Budget>({
    id: generateId(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(!!initialBudgetId);
  const [isSaving, setIsSaving] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (initialBudgetId) {
        setIsLoading(true);
        try {
          const existing = await persistenceService.getBudget(initialBudgetId);
          if (existing) {
            setBudget(existing);
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
    load();
  }, [initialBudgetId]);

  const preview = useMemo(() => {
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

  const updateField = useCallback((field: keyof Budget, value: any) => {
    if (budget.status === BUDGET_STATUS.FINALIZADO) return;
    setBudget(prev => ({ ...prev, [field]: value }));
  }, [budget.status]);

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await persistenceService.saveDraft(budget);
      const updated = await persistenceService.getBudget(budget.id);
      if (updated) setBudget(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: BudgetStatus) => {
    setIsSaving(true);
    try {
      await service.changeStatus(budget, newStatus);
      const updated = await persistenceService.getBudget(budget.id);
      if (updated) setBudget(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const markAsSent = () => handleStatusChange(BUDGET_STATUS.ENVIADO);
  const markAsAuthorized = () => handleStatusChange(BUDGET_STATUS.AUTORIZADO);
  const markAsRejected = () => handleStatusChange(BUDGET_STATUS.RECUSADO);

  const requestFinalize = () => setShowFinalizeModal(true);
  const cancelFinalize = () => setShowFinalizeModal(false);

  const confirmFinalize = async () => {
    setIsSaving(true);
    try {
      await service.finalizeBudget(budget);
      const finalized = await persistenceService.getBudget(budget.id);
      if (finalized) setBudget(finalized);
    } finally {
      setIsSaving(false);
      setShowFinalizeModal(false);
    }
  };

  return {
    budget,
    isLoading,
    updateField,
    preview,
    isSaving,
    isReadOnly: budget.status === BUDGET_STATUS.FINALIZADO,
    showFinalizeModal,
    saveDraft,
    markAsSent,
    markAsAuthorized,
    markAsRejected,
    requestFinalize,
    cancelFinalize,
    confirmFinalize,
  };
}
