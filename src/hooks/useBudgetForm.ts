import { generateUUID } from '../core/utils/idGenerator';
/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Budget, BUDGET_STATUS, BudgetStatus, type BudgetItem } from '../domain/budget';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { trustLayer } from '../core/trust/TrustLayer';
import type { CatalogHubItem } from '../features/catalog/types/catalogTypes';

const persistenceService = new BudgetPersistenceService();
// service const removed as we use facade now

const generateId = () => {
  try {
    return generateUUID();
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
    siteId: '',
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
      trustLayer.emit({
        type: 'success',
        title: 'Orçamento Salvo',
        description: 'As alterações foram salvas localmente.',
        status: 'local'
      });
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
      trustLayer.emit({
        type: 'success',
        title: 'Status Atualizado',
        description: `Orçamento alterado para ${newStatus}.`,
        status: 'synced'
      });
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
      trustLayer.emit({
        type: 'success',
        title: 'Orçamento Finalizado',
        description: `A OS foi enviada para o Financeiro.`,
        status: 'synced'
      });
    } catch (e) {
      console.error('Failed to finalize budget:', e);
      const message = e instanceof Error ? e.message : 'Erro ao finalizar o orçamento.';
      setError(message);
    } finally {
      setIsSaving(false);
      setShowFinalizeModal(false);
    }
  };
const addItem = useCallback((item: Partial<CatalogHubItem>) => {
  const newItem = {
    id: generateId(),
    description: item.title || 'Novo Item',
    quantity: item.defaultQuantity || 1,
    unitPrice: item.defaultUnitValue || 0,
    category: (item.kind === 'labor' ? 'labor' : item.kind === 'material' ? 'material' : 'other') as 'labor' | 'material' | 'other',
    catalogId: item.id
  };
  setBudget(prev => {
    const newItems = [...(prev.items || []), newItem];
    // Optional: Auto-calculate total if it's 0 or based on items
    const newChargedValue = prev.chargedValue === 0 
      ? newItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0)
      : prev.chargedValue;

    return { 
      ...prev, 
      items: newItems,
      chargedValue: newChargedValue 
    };
  });
}, []);

const removeItem = useCallback((itemId: string) => {
  setBudget(prev => ({
    ...prev,
    items: (prev.items || []).filter(it => it.id !== itemId)
  }));
}, []);

  const updateItem = useCallback((itemId: string, updates: Partial<BudgetItem>) => {
    setBudget(prev => ({
      ...prev,
      items: (prev.items || []).map(it => it.id === itemId ? { ...it, ...updates } : it)
    }));
  }, []);

  return {
    budget,
    isLoading,
    updateField,
    addItem,
    removeItem,
    updateItem,
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
