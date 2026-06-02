/* eslint-disable no-restricted-imports */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../domain/budget';
import { clientProposalService } from '../../services/clientProposalService';
import { ClientProposal } from '../../features/clientPortal/storage/clientProposalStorage';
import { workOrderService } from '../../services/workOrderService';
import { WorkOrder, Client } from '../../core/types/business';
import { clientService } from '../../services/clientService';
import { siteService } from '../../services/siteService';
import { Site } from '../../domain/site';
import { SimpleFinanceService } from '../../services/SimpleFinanceService';
import { SimpleFinanceRecord } from '../../domain/finance';
import { useFinancialCycleSummary } from '../../features/finance/hooks/useFinancialCycleSummary';
import { useOperationsSummary } from '../../features/operations/hooks/useOperationsSummary';
import { useCloudSyncState, SyncState } from '../../hooks/useCloudSyncState';
import { MaintenancePlan } from '../../domain/maintenancePlan';
import { maintenancePlanService } from '../../services/maintenancePlanService';
import { db } from '../../storage/dexieDatabase';
import { Attendance } from '../../domain/attendance';

export interface ActivityEvent {
  id: string;
  type: 'proposal_approved' | 'budget_created' | 'service_started' | 'service_completed' | 'payment_received' | 'client_created' | 'site_registered';
  title: string;
  subtitle: string;
  timestamp: string;
}

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
  timelineEvents: ActivityEvent[];
  refresh: () => Promise<void>;
}

export function useHomeAttentionStack(): HomeAttentionStack {
  const { budgets, isLoading: isBudgetsLoading, refresh: refreshBudgets } = useBudgetHistory();
  const financialSummary = useFinancialCycleSummary();
  const operationsSummary = useOperationsSummary();
  const { isOnline, pendingCount, syncState, refresh: refreshSync } = useCloudSyncState();

  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>([]);
  const [financeRecords, setFinanceRecords] = useState<SimpleFinanceRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const findAttendanceForWorkOrder = useCallback((wo: WorkOrder) => {
    return attendances.find(a => a.id === wo.attendanceId) ?? 
           (wo.budgetId ? attendances.find(a => {
             const b = budgets.find(bg => bg.id === wo.budgetId);
             return b && b.attendanceId === a.id;
           }) : undefined);
  }, [attendances, budgets]);

  const loadData = useCallback(async () => {
    try {
      const financeService = new SimpleFinanceService();
      const [allProposals, allWorkOrders, allClients, allFinance, allPlans, allSites, allAttendances] = await Promise.all([
        clientProposalService.getAll(),
        workOrderService.getAll(),
        clientService.getAll(),
        financeService.listRecords(),
        maintenancePlanService.getAll(),
        siteService.getAll(),
        db.attendances.toArray()
      ]);
      setProposals(allProposals);
      setWorkOrders(allWorkOrders);
      setClients(allClients);
      setFinanceRecords(allFinance);
      setMaintenancePlans(allPlans);
      setSites(allSites);
      setAttendances(allAttendances);
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
      const att = findAttendanceForWorkOrder(wo);
      const attStatus = att ? att.status : wo.status;
      if (attStatus === 'em_execucao' && wo.priority === 'urgent') {
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
      const att = findAttendanceForWorkOrder(wo);
      const attStatus = att ? att.status : wo.status;
      if (attStatus === 'autorizado' && wo.scheduledDate && wo.scheduledDate < todayStr) {
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
  }, [workOrders, proposals, financeRecords, maintenancePlans, attendances]);

  const p1 = useMemo<AttentionItem[]>(() => {
    const list: AttentionItem[] = [];

    // 1. Awaiting Scheduling (Only read from WorkOrder draft)
    workOrders.forEach((wo) => {
      const att = findAttendanceForWorkOrder(wo);
      const attStatus = att ? att.status : wo.status;
      if (attStatus === 'iniciado') {
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
  }, [budgets, proposals, workOrders, maintenancePlans, attendances]);

  const p2 = useMemo(() => {
    const list: AttentionItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's Jobs (WorkOrders that are scheduled for today)
    workOrders.forEach((wo) => {
      const att = findAttendanceForWorkOrder(wo);
      const attStatus = att ? att.status : wo.status;
      if (attStatus === 'autorizado' && wo.scheduledDate?.startsWith(todayStr)) {
        const client = clients.find(c => c.id === wo.clientId);
        const site = sites.find(s => s.id === wo.siteId);
        const siteName = site ? ` — ${site.name}` : '';
        list.push({
          id: wo.id,
          type: 'today_job',
          title: wo.title,
          subtitle: `${client?.name || 'Cliente'}${siteName}`,
          severity: 'low',
          actionLabel: 'Detalhes',
          metadata: { 
            workOrderId: wo.id, 
            status: attStatus, 
            date: wo.scheduledDate,
            phone: client?.phone,
            address: site?.fullAddress
          }
        });
      }
    });

    // Receivables (Saldo Aberto real from Finance)
    const receivables = financeRecords.reduce((sum, record) => sum + record.openBalance, 0);

    const executingCount = attendances.filter(att => att.status === 'em_execucao').length;

    return {
      todayJobs: list,
      todayJobsCount: list.length,
      executingCount,
      receivables,
      revenueKPIs: financialSummary
    };
  }, [workOrders, clients, financeRecords, financialSummary, attendances, sites]);

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
    const inProgress = workOrders.find(wo => {
      if (wo.status !== 'in-progress') return false;
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att ? att.status === 'em_execucao' : true;
    });
    if (inProgress) {
      const client = clients.find(c => c.id === inProgress.clientId);
      const site = sites.find(s => s.id === inProgress.siteId);
      return {
          id: inProgress.id,
          type: 'today_job',
          title: inProgress.title,
          subtitle: `${client?.name || 'Cliente'}${site ? ` — ${site.name}` : ''}`,
          severity: 'high',
          actionLabel: 'Continuar',
          metadata: { 
            workOrderId: inProgress.id, 
            status: inProgress.status, 
            date: inProgress.scheduledDate,
            phone: client?.phone,
            address: site?.fullAddress
          }
      } as AttentionItem;
    }
    if (p2.todayJobs.length > 0) {
      return p2.todayJobs[0];
    }
    return undefined;
  }, [workOrders, clients, sites, p2.todayJobs, attendances]);

  const timelineEvents = useMemo<ActivityEvent[]>(() => {
    const events: ActivityEvent[] = [];

    // 1. Budgets (created, approved)
    (budgets || []).forEach(b => {
      if (b.createdAt) {
        events.push({
          id: `${b.id}-created`,
          type: 'budget_created',
          title: 'Nova Proposta Criada',
          subtitle: `${b.clientName || 'Cliente avulso'} · ${b.title}`,
          timestamp: b.createdAt
        });
      }
      const bStatus = b.status as string;
      if (bStatus === BUDGET_STATUS.AUTORIZADO || bStatus === BUDGET_STATUS.EM_EXECUCAO || bStatus === 'autorizado') {
        events.push({
          id: `${b.id}-approved`,
          type: 'proposal_approved',
          title: 'Orçamento Aprovado',
          subtitle: `${b.clientName || 'Cliente avulso'} · ${b.title}`,
          timestamp: b.updatedAt || b.createdAt || new Date().toISOString()
        });
      }
    });

    // 2. Work Orders (started, completed)
    workOrders.forEach(wo => {
      const client = clients.find(c => c.id === wo.clientId);
      const clientName = client?.name || 'Cliente';
      const att = findAttendanceForWorkOrder(wo);
      const attStatus = att ? att.status : wo.status;

      if (attStatus === 'em_execucao') {
        events.push({
          id: `${wo.id}-started`,
          type: 'service_started',
          title: 'Atendimento Iniciado',
          subtitle: `${clientName} · ${wo.title}`,
          timestamp: wo.updatedAt || wo.createdAt || new Date().toISOString()
        });
      }
      if (attStatus === 'finalizado' || attStatus === 'concluido') {
        events.push({
          id: `${wo.id}-completed`,
          type: 'service_completed',
          title: 'Serviço Concluído',
          subtitle: `${clientName} · ${wo.title}`,
          timestamp: wo.updatedAt || wo.createdAt || new Date().toISOString()
        });
      }
    });

    // 3. Finance records (payment received)
    financeRecords.forEach(f => {
      if (f.receivedValue > 0) {
        events.push({
          id: `${f.id}-payment`,
          type: 'payment_received',
          title: 'Pagamento Confirmado',
          subtitle: `${f.clientName || 'Cliente'} · Recebido R$ ${f.receivedValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
          timestamp: f.updatedAt || f.createdAt || new Date().toISOString()
        });
      }
    });

    // 4. Clients
    clients.forEach(c => {
      if (c.createdAt) {
        events.push({
          id: `${c.id}-client`,
          type: 'client_created',
          title: 'Cliente Cadastrado',
          subtitle: c.name,
          timestamp: c.createdAt
        });
      }
    });

    // 5. Sites
    sites.forEach(s => {
      if (s.createdAt) {
        events.push({
          id: `${s.id}-site`,
          type: 'site_registered',
          title: 'Ponto de Visita Ativado',
          subtitle: s.name,
          timestamp: s.createdAt
        });
      }
    });

    // Sort by timestamp desc and limit to top 5
    return events
      .filter(e => e.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [budgets, workOrders, financeRecords, clients, sites, attendances]);

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
    timelineEvents,
    refresh: refreshAll
  };
}
