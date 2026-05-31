import { useState, useEffect, useMemo, useCallback } from 'react';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../domain/budget';
import { clientProposalService } from '../../services/clientProposalService';
import { ClientProposal } from '../../features/clientPortal/storage/clientProposalStorage';
import { workOrderService } from '../../services/workOrderService';
import { WorkOrder, Client } from '../../core/types/business';
import { clientService } from '../../services/clientService';
import { SimpleFinanceService } from '../../services/SimpleFinanceService';
import { SimpleFinanceRecord } from '../../domain/finance';
import { useFinancialCycleSummary } from '../../features/finance/hooks/useFinancialCycleSummary';
import { useOperationsSummary } from '../../features/operations/hooks/useOperationsSummary';
import { useCloudSyncState, SyncState } from '../../hooks/useCloudSyncState';
import { MaintenancePlan } from '../../domain/maintenancePlan';
import { maintenancePlanService } from '../../services/maintenancePlanService';

export interface AttentionItem {
  id: string;
  type: 'blocked_wo' | 'rejected_proposal' | 'overdue_payment' | 'viewed_proposal' | 'approved_proposal' | 'follow_up' | 'today_job' | 'late_visit' | 'overdue_preventive' | 'upcoming_maintenance';
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
    receivables: number;
    revenueKPIs: {
      revenue: number;
      profit: number;
      costs: number;
    };
  };
  recommendedAction: {
    title: string;
    reason: string;
    impact: string;
    actionLabel: string;
    buttonLabel?: string;
    tone: 'gold' | 'red' | 'blue' | 'neutral';
    item?: AttentionItem;
  };
  commandStatus: {
    severity: string;
    level: 'healthy' | 'attention' | 'critical';
    counters: {
      blockers: number;
      overdue: number;
      pendingApprovals: number;
      overdueMaintenance: number;
    };
  };
  nextEvent?: AttentionItem;
  refresh: () => Promise<void>;
}

export function useHomeAttentionStack(): HomeAttentionStack {
  const { budgets, isLoading: isBudgetsLoading, refresh: refreshBudgets } = useBudgetHistory();
  const financialSummary = useFinancialCycleSummary();
  const operationsSummary = useOperationsSummary();
  const { isOnline, pendingCount, syncState, refresh: refreshSync } = useCloudSyncState();

  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [financeRecords, setFinanceRecords] = useState<SimpleFinanceRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const financeService = new SimpleFinanceService();
      const [allProposals, allWorkOrders, allClients, allFinance, allPlans] = await Promise.all([
        clientProposalService.getAll(),
        workOrderService.getAll(),
        clientService.getAll(),
        financeService.listRecords(),
        maintenancePlanService.getAll()
      ]);
      setProposals(allProposals);
      setWorkOrders(allWorkOrders);
      setClients(allClients);
      setFinanceRecords(allFinance);
      setMaintenancePlans(allPlans);
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

    // 1. Blocked Work Orders (From WorkOrders only, not Budgets)
    workOrders.forEach((wo) => {
      if (wo.status === 'in-progress' && wo.priority === 'urgent') {
        list.push({
          id: wo.id,
          type: 'blocked_wo',
          title: wo.title.toUpperCase(),
          subtitle: `Atenção urgente requerida`,
          severity: 'high',
          actionLabel: 'Ver OS',
          metadata: { workOrderId: wo.id }
        });
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

    // 3. Overdue Payments (From FinanceRecords, not WorkOrders/Budgets)
    financeRecords.forEach((record) => {
      if ((record.status === 'pending' || record.status === 'partial') && record.openBalance > 0) {
        list.push({
          id: record.id,
          type: 'overdue_payment',
          title: `COBRANÇA PENDENTE: ${record.title.toUpperCase()}`,
          subtitle: `Falta receber: R$ ${record.openBalance.toLocaleString('pt-BR')}`,
          severity: 'high',
          actionLabel: 'Cobrar',
          metadata: { workOrderId: record.workOrderId, value: record.openBalance }
        });
      }
    });

    // 4. Overdue Visits (Visita Atrasada)
    const todayStr = new Date().toISOString().split('T')[0];
    workOrders.forEach((wo) => {
      if (wo.status === 'scheduled' && wo.scheduledDate && wo.scheduledDate < todayStr) {
        list.push({
          id: wo.id,
          type: 'late_visit',
          title: `VISITA ATRASADA: ${wo.title.toUpperCase()}`,
          subtitle: `Agendada para ${new Date(wo.scheduledDate).toLocaleDateString('pt-BR')}`,
          severity: 'high',
          actionLabel: 'Ver OS',
          metadata: { workOrderId: wo.id }
        });
      }
    });

    // 5. Overdue Preventives (Fase 3D)
    maintenancePlans.forEach((plan) => {
      if (plan.isActive && plan.nextExecutionDate < todayStr) {
        list.push({
          id: plan.id,
          type: 'overdue_preventive',
          title: `PREVENTIVA ATRASADA: ${plan.title.toUpperCase()}`,
          subtitle: `Vencida em ${new Date(plan.nextExecutionDate).toLocaleDateString('pt-BR')}`,
          severity: 'high',
          actionLabel: 'Gerar OS',
          metadata: { planId: plan.id, assetId: plan.assetId }
        });
      }
    });

    return list;
  }, [workOrders, proposals, financeRecords, maintenancePlans]);

  const p1 = useMemo<AttentionItem[]>(() => {
    const list: AttentionItem[] = [];

    // 1. Awaiting Scheduling (Only read from WorkOrder draft)
    workOrders.forEach((wo) => {
      if (wo.status === 'draft') {
        list.push({
          id: wo.id,
          type: 'approved_proposal', // Reusing the type to keep UI intact
          title: wo.title.toUpperCase(),
          subtitle: `Aguardando agendamento`,
          severity: 'medium',
          actionLabel: 'Agendar',
          metadata: { workOrderId: wo.id }
        });
      }
    });

    // 2. Viewed Proposals
    proposals.forEach((p) => {
      if (p.status === 'viewed') {
        list.push({
          id: p.id,
          type: 'viewed_proposal',
          title: `VISUALIZADO: ${p.title.toUpperCase()}`,
          subtitle: `${p.clientName} viu a proposta`,
          severity: 'medium',
          actionLabel: 'Falar com Cliente',
          metadata: { budgetId: p.budgetId }
        });
      }
    });

    // 3. Follow Ups
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
              title: `PENDENTE: ${b.title.toUpperCase()}`,
              subtitle: `Sem retorno há ${diffDays} dias`,
              severity: 'medium',
              actionLabel: 'Retornar'
            });
          }
        }
      }
    });

    // 4. Upcoming Maintenance (Fase 3D)
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    maintenancePlans.forEach((plan) => {
      if (plan.isActive && plan.nextExecutionDate >= todayStr && plan.nextExecutionDate <= next7DaysStr) {
        list.push({
          id: plan.id,
          type: 'upcoming_maintenance',
          title: `PRÓXIMA PREVENTIVA: ${plan.title.toUpperCase()}`,
          subtitle: `Vencimento em ${new Date(plan.nextExecutionDate).toLocaleDateString('pt-BR')}`,
          severity: 'medium',
          actionLabel: 'Agendar',
          metadata: { planId: plan.id, assetId: plan.assetId }
        });
      }
    });

    return list;
  }, [budgets, proposals, workOrders, maintenancePlans]);

  const p2 = useMemo(() => {
    const list: AttentionItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's Jobs (WorkOrders that are scheduled for today)
    workOrders.forEach((wo) => {
      if (wo.status === 'scheduled' && wo.scheduledDate?.startsWith(todayStr)) {
        const client = clients.find(c => c.id === wo.clientId);
        list.push({
          id: wo.id,
          type: 'today_job',
          title: wo.title,
          subtitle: `${client?.name || 'Cliente'}`,
          severity: 'low',
          actionLabel: 'Detalhes',
          metadata: { 
            workOrderId: wo.id, 
            status: wo.status, 
            date: wo.scheduledDate
          }
        });
      }
    });

    // Receivables (Saldo Aberto real from Finance)
    const receivables = financeRecords.reduce((sum, record) => sum + record.openBalance, 0);

    const executingCount = workOrders.filter(wo => wo.status === 'in-progress').length;

    return {
      todayJobs: list,
      todayJobsCount: list.length,
      executingCount,
      receivables,
      revenueKPIs: financialSummary
    };
  }, [workOrders, clients, financeRecords, financialSummary]);

  const recommendedAction = useMemo(() => {
    // V8.5 logic: Factual and direct
    
    // 1. P0 Blockers
    const blocked = p0.find(i => i.type === 'blocked_wo');
    if (blocked) return { 
      title: 'Serviço Paralisado', 
      reason: `OS "${blocked.title}" bloqueada.`,
      impact: '',
      actionLabel: 'Resolver',
      tone: 'red' as const,
      item: blocked 
    };

    // 2. Overdue Payments
    const overdue = p0.find(i => i.type === 'overdue_payment');
    if (overdue) return { 
      title: 'Cobrança Atrasada', 
      reason: `Fatura vencida para ${overdue.title}.`,
      impact: '',
      actionLabel: 'Cobrar',
      tone: 'red' as const,
      item: overdue
    };

    // 2.1 Overdue Maintenance (Fase 3D)
    const overdueMaint = p0.find(i => i.type === 'overdue_preventive');
    if (overdueMaint) return {
      title: 'Preventiva Vencida',
      reason: `"${overdueMaint.title}" requer atenção técnica.`,
      impact: '',
      actionLabel: 'Gerar OS',
      tone: 'red' as const,
      item: overdueMaint
    };

    // 3. Approved Proposals
    const approved = p1.find(i => i.type === 'approved_proposal');
    if (approved) return {
      title: 'Proposta Aprovada',
      reason: `"${approved.title}" aguardando execução.`,
      impact: '',
      actionLabel: 'Criar OS',
      tone: 'gold' as const,
      item: approved
    };

    // 4. Viewed Proposals
    const viewed = p1.find(i => i.type === 'viewed_proposal');
    if (viewed) return {
      title: 'Proposta Visualizada',
      reason: `"${viewed.title}" visualizada pelo cliente.`,
      impact: '',
      actionLabel: 'Contatar',
      tone: 'gold' as const,
      item: viewed
    };

    // 5. Today's Jobs
    if (p2.todayJobs.length > 0) {
      const job = p2.todayJobs[0];
      return {
        title: 'Próxima Visita',
        reason: `Agendado: ${job.title}.`,
        impact: '',
        actionLabel: 'Detalhes',
        tone: 'blue' as const,
        item: job
      };
    }

    return { 
      title: 'Criar orçamento', 
      reason: 'Sua operação não possui pendências.',
      impact: '',
      actionLabel: 'PRÓXIMA AÇÃO',
      buttonLabel: 'Nova Demanda',
      tone: 'neutral' as const 
    };
  }, [p0, p1, p2.todayJobs]);

  const commandStatus = useMemo(() => {
    const blockers = p0.filter(i => i.type === 'blocked_wo').length;
    const overdue = p0.filter(i => i.type === 'overdue_payment').length;
    const overdueMaintenance = p0.filter(i => i.type === 'overdue_preventive').length;
    const pendingApprovals = p1.length;

    if (blockers > 0 || overdueMaintenance > 0) {
      return {
        severity: blockers > 0 ? `${blockers} OS Bloqueada${blockers > 1 ? 's' : ''}` : `${overdueMaintenance} preventiva${overdueMaintenance > 1 ? 's' : ''} vencida`,
        level: 'critical' as const,
        counters: { blockers, overdue, pendingApprovals, overdueMaintenance }
      };
    }

    if (pendingApprovals > 0 || overdue > 0) {
      return {
        severity: overdue > 0 ? `${overdue} cobrança${overdue > 1 ? 's' : ''} em atraso` : `${pendingApprovals} pendência${pendingApprovals > 1 ? 's' : ''}`,
        level: 'attention' as const,
        counters: { blockers, overdue, pendingApprovals, overdueMaintenance }
      };
    }

    return {
      severity: 'Tudo em dia',
      level: 'healthy' as const,
      counters: { blockers, overdue, pendingApprovals, overdueMaintenance }
    };
  }, [p0, p1]);

  const nextEvent = useMemo(() => {
    if (p2.todayJobs.length > 0) {
      return p2.todayJobs[0];
    }
    return undefined;
  }, [p2.todayJobs]);

  const isLoading = isBudgetsLoading || isDataLoading;

  return {
    isLoading,
    isOffline: !isOnline,
    syncState,
    pendingSyncCount: pendingCount,
    p0,
    p1,
    p2,
    recommendedAction,
    commandStatus,
    nextEvent,
    refresh: refreshAll
  };
}
