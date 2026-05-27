/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Budget, BUDGET_STATUS, BudgetStatus } from '../domain/budget';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { operationalFacade } from '../features/workflow/operationalFacade';

const persistenceService = new BudgetPersistenceService();
// service const removed as we use facade now

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export interface BudgetEditPermissions {
  canEditTitle: boolean;
  canEditClient: boolean;
  canEditItems: boolean;
  canEditFinancials: boolean;
  canEditNotes: boolean;
  canEditStatus: boolean;
}

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
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(!!initialBudgetId);
  const [isSaving, setIsSaving] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = useMemo((): BudgetEditPermissions => {
    const s = budget.status;
    
    // 1. Totalmente Editável: rascunho (INICIADO) ou em_analise (ENVIADO)
    if (s === BUDGET_STATUS.INICIADO || s === BUDGET_STATUS.ENVIADO) {
      return { canEditTitle: true, canEditClient: true, canEditItems: true, canEditFinancials: true, canEditNotes: true, canEditStatus: true };
    }
    
    // 2. Read-Only Operacional (Bloqueado) mas permite notas e avanço de status
    if (s === BUDGET_STATUS.AUTORIZADO || s === BUDGET_STATUS.EM_EXECUCAO) {
      return { canEditTitle: false, canEditClient: false, canEditItems: false, canEditFinancials: false, canEditNotes: true, canEditStatus: true };
    }
    
    if (s === BUDGET_STATUS.FINALIZADO) {
      return { canEditTitle: false, canEditClient: false, canEditItems: false, canEditFinancials: false, canEditNotes: false, canEditStatus: true };
    }

    // 3. Arquivados / Recusados (Tudo bloqueado)
    return { canEditTitle: false, canEditClient: false, canEditItems: false, canEditFinancials: false, canEditNotes: false, canEditStatus: false };
  }, [budget.status]);

  useEffect(() => {
    async function load() {
      if (initialBudgetId) {
        setIsLoading(true);
        setError(null);
        try {
          const existing = await persistenceService.getBudget(initialBudgetId);
          if (existing) {
            setBudget(existing);
          } else {
            setError('Orçamento não encontrado no banco de dados.');
          }
        } catch (e) {
          console.error('Failed to load budget:', e);
          const message = e instanceof Error ? e.message : 'Erro ao carregar o orçamento do banco de dados.';
          setError(message);
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

  const updateField = useCallback(<K extends keyof Budget>(field: K, value: Budget[K]) => {
    const s = budget.status;
    
    // Total read-only states
    if (s === BUDGET_STATUS.FINALIZADO || s === BUDGET_STATUS.ARQUIVADO || s === BUDGET_STATUS.RECUSADO) return;

    // Granular locking
    if (field === 'title' && !permissions.canEditTitle) return;
    if ((field === 'clientId' || field === 'clientName') && !permissions.canEditClient) return;
    if (field === 'items' && !permissions.canEditItems) return;
    
    const financialFields: Array<keyof Budget> = ['chargedValue', 'materialCost', 'travelCost', 'helperCost', 'fees', 'discounts', 'otherCosts'];
    if (financialFields.includes(field) && !permissions.canEditFinancials) return;

    setBudget(prev => ({ ...prev, [field]: value }));
  }, [budget.status, permissions]);

  const saveDraft = async () => {
    if (isSaving || isLoading) return;
    setIsSaving(true);
    setError(null);
    try {
      await operationalFacade.saveBudget(budget);
      const updated = await persistenceService.getBudget(budget.id);
      if (updated) setBudget(updated);
    } catch (e) {
      console.error('Failed to save draft:', e);
      const message = e instanceof Error ? e.message : 'Erro ao salvar o rascunho do orçamento.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: BudgetStatus) => {
    if (isSaving || isLoading || !permissions.canEditStatus) return;
    setIsSaving(true);
    setError(null);
    try {
      await operationalFacade.changeBudgetStatus(budget.id, newStatus, budget);
      const updated = await persistenceService.getBudget(budget.id);
      if (updated) setBudget(updated);
    } catch (e) {
      console.error('Failed to change status:', e);
      const message = e instanceof Error ? e.message : 'Erro ao alterar o status do orçamento.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const markAsSent = () => handleStatusChange(BUDGET_STATUS.ENVIADO);
  const markAsAuthorized = () => handleStatusChange(BUDGET_STATUS.AUTORIZADO);
  const markAsRejected = () => handleStatusChange(BUDGET_STATUS.RECUSADO);
  const markAsExecuting = () => handleStatusChange(BUDGET_STATUS.EM_EXECUCAO);
  const archiveBudget = () => handleStatusChange(BUDGET_STATUS.ARQUIVADO);

  const requestFinalize = () => setShowFinalizeModal(true);
  const cancelFinalize = () => setShowFinalizeModal(false);

  const confirmFinalize = async () => {
    if (isSaving || isLoading) return;
    setIsSaving(true);
    setError(null);
    try {
      await operationalFacade.finalizeBudget(budget.id, budget);
      const finalized = await persistenceService.getBudget(budget.id);
      if (finalized) setBudget(finalized);
    } catch (e) {
      console.error('Failed to finalize budget:', e);
      const message = e instanceof Error ? e.message : 'Erro ao finalizar o orçamento.';
      setError(message);
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
    isReadOnly: !permissions.canEditFinancials && !permissions.canEditItems && !permissions.canEditTitle,
    permissions,
    showFinalizeModal,
    saveDraft,
    markAsSent,
    markAsAuthorized,
    markAsRejected,
    markAsExecuting,
    archiveBudget,
    requestFinalize,
    cancelFinalize,
    confirmFinalize,
    error,
    clearError: () => setError(null),
  };
}
