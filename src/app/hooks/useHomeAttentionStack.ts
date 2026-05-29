import { useState, useEffect, useMemo, useCallback } from 'react';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { BUDGET_STATUS, Budget } from '../../domain/budget';
import { clientProposalService } from '../../services/clientProposalService';
import { ClientProposal } from '../../features/clientPortal/storage/clientProposalStorage';
import { workOrderService } from '../../services/workOrderService';
import { WorkOrder } from '../../core/types/business';
import { useFinancialCycleSummary } from '../../features/finance/hooks/useFinancialCycleSummary';
import { useOperationsSummary } from '../../features/operations/hooks/useOperationsSummary';
import { useCloudSyncState, SyncState } from '../../hooks/useCloudSyncState';

export interface AttentionItem {
  id: string;
  type: 'blocked_wo' | 'rejected_proposal' | 'overdue_payment' | 'viewed_proposal' | 'approved_proposal' | 'follow_up' | 'today_job';
  title: string;
  subtitle: string;
  severity: 'high' | 'medium' | 'low';
  actionLabel: string;
  metadata?: Record<string, any>;
}

export interface HomeAttentionStack {
  isLoading: boolean;
  isOffline: boolean;
  syncState: SyncState;
  pendingSyncCount: number;
  p0: AttentionItem[];
  p1: AttentionItem[];
  p2: {
    todayJobs: AttentionItem[];
    todayJobsCount: number;
    executingCount: number;
    revenueKPIs: {
      revenue: number;
      profit: number;
      costs: number;
    };
    monthlyGoal: number;
    monthlyGoalProgress: number; // percentage (0 - 100)
  };
  refresh: () => Promise<void>;
}

export function useHomeAttentionStack(): HomeAttentionStack {
  const { budgets, isLoading: isBudgetsLoading, refresh: refreshBudgets } = useBudgetHistory();
  const financialSummary = useFinancialCycleSummary();
  const operationsSummary = useOperationsSummary();
  const { isOnline, pendingCount, syncState, refresh: refreshSync } = useCloudSyncState();

  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [allProposals, allWorkOrders] = await Promise.all([
        clientProposalService.getAll(),
        workOrderService.getAll(),
      ]);
      setProposals(allProposals);
      setWorkOrders(allWorkOrders);
    } catch (e) {
      console.error('[AttentionStack] Failed to load ancillary data:', e);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData, budgets]);

  const refreshAll = useCallback(async () => {
    setIsDataLoading(true);
    await Promise.all([
      refreshBudgets(),
      loadData(),
      refreshSync()
    ]);
  }, [refreshBudgets, loadData, refreshSync]);

  const p0 = useMemo<AttentionItem[]>(() => {
    const list: AttentionItem[] = [];

    // 1. Blocked Work Orders (Status: PAUSADO in budget / low-level work order status 'in-progress' with priority 'urgent')
    budgets.forEach((b) => {
      if (b.status === BUDGET_STATUS.PAUSADO) {
        list.push({
          id: b.id,
          type: 'blocked_wo',
          title: `OS BLOQUEADA: ${b.title.toUpperCase()}`,
          subtitle: `Causa técnica impedindo execução`,
          severity: 'high',
          actionLabel: 'Resolver'
        });
      }
    });

    workOrders.forEach((wo) => {
      if (wo.status === 'in-progress' && wo.priority === 'urgent') {
        const alreadyAdded = list.some(item => item.id === wo.id || item.id === wo.budgetId);
        if (!alreadyAdded) {
          list.push({
            id: wo.id,
            type: 'blocked_wo',
            title: `OPERACIONAL CRÍTICO: ${wo.title.toUpperCase()}`,
            subtitle: `Execução requer atenção urgente`,
            severity: 'high',
            actionLabel: 'Ver OS',
            metadata: { budgetId: wo.budgetId }
          });
        }
      }
    });

    // 2. Rejected Proposals
    proposals.forEach((p) => {
      if (p.status === 'rejected') {
        list.push({
          id: p.id,
          type: 'rejected_proposal',
          title: `PROPOSTA RECUSADA: ${p.title.toUpperCase()}`,
          subtitle: `Cliente ${p.clientName} recusou a proposta`,
          severity: 'high',
          actionLabel: 'Revisar',
          metadata: { budgetId: p.budgetId }
        });
      }
    });

    budgets.forEach((b) => {
      if (b.status === BUDGET_STATUS.RECUSADO) {
        const alreadyAdded = list.some(item => item.metadata?.budgetId === b.id);
        if (!alreadyAdded) {
          list.push({
            id: b.id,
            type: 'rejected_proposal',
            title: `ORÇAMENTO RECUSADO: ${b.title.toUpperCase()}`,
            subtitle: `Proposta comercial não aceita`,
            severity: 'high',
            actionLabel: 'Ver Detalhes'
          });
        }
      }
    });

    // 3. Overdue Payments (done Work Orders with pending paymentStatus)
    workOrders.forEach((wo) => {
      if (wo.status === 'done' && wo.paymentStatus === 'pending') {
        list.push({
          id: wo.id,
          type: 'overdue_payment',
          title: `PAGAMENTO PENDENTE: ${wo.title.toUpperCase()}`,
          subtitle: `Serviço concluído aguardando repasse`,
          severity: 'high',
          actionLabel: 'Cobrar',
          metadata: { budgetId: wo.budgetId }
        });
      }
    });

    return list;
  }, [budgets, workOrders, proposals]);

  const p1 = useMemo<AttentionItem[]>(() => {
    const list: AttentionItem[] = [];

    // 1. Approved Proposals (Ready to be promoted to Work Orders)
    proposals.forEach((p) => {
      if (p.status === 'approved') {
        list.push({
          id: p.id,
          type: 'approved_proposal',
          title: `APROVADO: ${p.title.toUpperCase()}`,
          subtitle: `Aprovado por ${p.clientName} · Iniciar execução`,
          severity: 'medium',
          actionLabel: 'Criar OS',
          metadata: { budgetId: p.budgetId }
        });
      }
    });

    budgets.forEach((b) => {
      if (b.status === BUDGET_STATUS.AUTORIZADO) {
        const alreadyAdded = list.some(item => item.metadata?.budgetId === b.id);
        if (!alreadyAdded) {
          list.push({
            id: b.id,
            type: 'approved_proposal',
            title: `AUTORIZADO: ${b.title.toUpperCase()}`,
            subtitle: `Pronto para iniciar a ordem de serviço`,
            severity: 'medium',
            actionLabel: 'Executar'
          });
        }
      }
    });

    // 2. Viewed Proposals
    proposals.forEach((p) => {
      if (p.status === 'viewed') {
        list.push({
          id: p.id,
          type: 'viewed_proposal',
          title: `VISUALIZADO: ${p.title.toUpperCase()}`,
          subtitle: `${p.clientName} visualizou a proposta comercial`,
          severity: 'medium',
          actionLabel: 'Falar com Cliente',
          metadata: { budgetId: p.budgetId }
        });
      }
    });

    // 3. Follow Ups (Budgets created or sent over 3 days ago without approval)
    budgets.forEach((b) => {
      if (b.status === BUDGET_STATUS.ENVIADO) {
        const alreadyAdded = list.some(item => item.metadata?.budgetId === b.id || item.id === b.id);
        if (!alreadyAdded) {
          const sentDate = new Date(b.updatedAt);
          const diffDays = Math.ceil((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 3) {
            list.push({
              id: b.id,
              type: 'follow_up',
              title: `REVER: ${b.title.toUpperCase()}`,
              subtitle: `Enviado há ${diffDays} dias · Sem retorno`,
              severity: 'medium',
              actionLabel: 'Retornar'
            });
          }
        }
      }
    });

    return list;
  }, [budgets, proposals]);

  const p2 = useMemo(() => {
    const list: AttentionItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's Jobs (Work orders scheduled for today)
    workOrders.forEach((wo) => {
      if (wo.scheduledDate?.startsWith(todayStr)) {
        list.push({
          id: wo.id,
          type: 'today_job',
          title: `COMPROMISSO: ${wo.title.toUpperCase()}`,
          subtitle: `Agendado para hoje`,
          severity: 'low',
          actionLabel: 'Detalhes',
          metadata: { budgetId: wo.budgetId }
        });
      }
    });

    // Default monthly goal for estimation (R$ 15.000,00)
    const monthlyGoal = 15000;
    const currentProfit = financialSummary.profit;
    const progress = monthlyGoal > 0 ? Math.min(100, Math.round((currentProfit / monthlyGoal) * 100)) : 0;

    return {
      todayJobs: list,
      todayJobsCount: list.length,
      executingCount: operationsSummary.executingCount,
      revenueKPIs: financialSummary,
      monthlyGoal,
      monthlyGoalProgress: progress
    };
  }, [workOrders, financialSummary, operationsSummary]);

  const isLoading = isBudgetsLoading || isDataLoading;

  return {
    isLoading,
    isOffline: !isOnline,
    syncState,
    pendingSyncCount: pendingCount,
    p0,
    p1,
    p2,
    refresh: refreshAll
  };
}
