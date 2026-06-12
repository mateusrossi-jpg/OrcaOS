// operationalEventService import removed as it is now in SubscriptionService
import { operationalTimelineService } from './operationalTimelineService';
import { safeString, safeTimestamp } from '../core/runtime/safeGuards';
import {
  OperationalPipelineProjection,
  OperationalMetricsProjection,
  OperationalBoardProjection,
  OperationalCardProjection,
  ClientPipelineProjection,
  OperationalActivityProjection,
  ClientCRMProjection,
  ClientCRMStatus,
  CRMAlertHubProjection,
  ClientDossierProjection,
  AssetDossierProjection
} from '../domain/operationalProjections';
import { Budget, BudgetStatus } from '../domain/budget';
import { ClientProposalStatus } from '../features/clientPortal/storage/clientProposalStorage';
import { ServiceStatus, WorkOrder, Client } from '../core/types/business';
import { BudgetPersistenceService } from './BudgetPersistenceService';
import { QueueWorkflowInput } from '../core/workflow/queueEngine';
import { operationalFeedService } from './operationalFeedService';
import { getOperationalEventSeverity } from '../domain/eventSeverity';
import { clientService } from './clientService';
import { workOrderService } from './workOrderService';
import { db } from '../storage/dexieDatabase';
import { SimpleFinanceService } from './SimpleFinanceService';
import { SimpleFinanceRecord } from '../domain/finance';
import { assetService } from './assetService';
import { Asset } from '../domain/asset';
import { maintenancePlanScheduler } from './MaintenanceSchedulerService';
import { contractBillingScheduler } from './ContractBillingSchedulerService';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * OperationalReadModelService
 * Responsável por materializar as visões (projections) a partir da timeline de eventos operacionais.
 * As projections são mantidas em cache de memória (ou Dexie futuramente) e são reconstruídas /
 * invalidadas mediante eventos.
 */
export class OperationalReadModelService {
  private pipelineCache: Record<string, OperationalPipelineProjection> | null = null;
  private metricsCache: OperationalMetricsProjection | null = null;
  private boardCache: OperationalBoardProjection | null = null;

  private crmPipelineCache: Record<string, ClientPipelineProjection> | null = null;
  private crmListCache: ClientCRMProjection[] | null = null;
  private activityCache: OperationalActivityProjection[] | null = null;

  constructor() {
    // Subscription and invalidation logic moved to OperationalSubscriptionService (Event Fanout Layer)
  }

  /**
   * Invalidation targeting specific projections.
   * Called by OperationalSubscriptionService based on ProjectionInvalidationMap.
   * Supports: pipeline, metrics, board, crm, activity, feed.
   */
  invalidate(projection: 'pipeline' | 'metrics' | 'board' | 'crm' | 'activity' | 'feed') {
    switch (projection) {
      case 'pipeline': this.pipelineCache = null; break;
      case 'metrics': this.metricsCache = null; break;
      case 'board': this.boardCache = null; break;
      case 'crm': 
        this.crmPipelineCache = null; 
        this.crmListCache = null;
        break;
      case 'activity': this.activityCache = null; break;
      case 'feed': operationalFeedService.invalidateFeed(); break;
    }
  }

  async getCRMProjection(): Promise<ClientCRMProjection[]> {
    if (this.crmListCache) return this.crmListCache;

    try {
      console.log('[ReadModel] Starting CRM projection build...');
      const [allClients, allWorkOrders, allBudgets, allFinance] = await Promise.all([
        clientService.getAll().catch(e => { console.error('Clients load failed', e); return []; }),
        workOrderService.getAll().catch(e => { console.error('WorkOrders load failed', e); return []; }),
        new BudgetPersistenceService().listBudgets().catch(e => { console.error('Budgets load failed', e); return []; }),
        new SimpleFinanceService().listRecords().catch(e => { console.error('Finance load failed', e); return []; })
      ]);

      const now = new Date();
      console.log('[ReadModel] CRM Sources loaded:', { clients: allClients.length, wos: allWorkOrders.length, budgets: allBudgets.length, finance: allFinance.length });

      // 1. Group Data by Client
      const clientMap = new Map<string, {
        totalRevenue: number;
        openBalance: number;
        woCount: number;
        budgetCount: number;
        lastInteraction: string;
      }>();

      allClients.forEach((c: Client) => {
        if (c && c.id) {
          clientMap.set(c.id, { 
            totalRevenue: 0, openBalance: 0, woCount: 0, budgetCount: 0, lastInteraction: c.createdAt || now.toISOString() 
          });
        }
      });

      allFinance.forEach((f: SimpleFinanceRecord) => {
        if (f.isDeleted) return;
        const wo = allWorkOrders.find((w: WorkOrder) => w.id === f.workOrderId);
        if (wo && !wo.isDeleted) {
          const stats = clientMap.get(wo.clientId);
          if (stats) {
            stats.totalRevenue += (f.receivedValue || 0);
            stats.openBalance += (f.openBalance || 0);
          }
        }
      });

      allWorkOrders.forEach((wo: WorkOrder) => {
        if (wo.isDeleted) return;
        const stats = clientMap.get(wo.clientId);
        if (stats) {
          stats.woCount++;
          if (safeTimestamp(wo.updatedAt || '') > safeTimestamp(stats.lastInteraction)) {
            stats.lastInteraction = wo.updatedAt!;
          }
        }
      });

      allBudgets.forEach((b: Budget) => {
        if (!b.clientId || b.isDeleted) return;
        const stats = clientMap.get(b.clientId);
        if (stats) {
          stats.budgetCount++;
          if (safeTimestamp(b.updatedAt || '') > safeTimestamp(stats.lastInteraction)) {
            stats.lastInteraction = b.updatedAt;
          }
        }
      });

      // 2. Calculate Percentile for VIP (Top 20%)
      const revenues = Array.from(clientMap.values()).map(s => s.totalRevenue).sort((a, b) => a - b);
      const vipThreshold = revenues.length > 0 ? revenues[Math.floor(revenues.length * 0.8)] : 0;

      // 3. Materialize CRM Projection
      const crmList: ClientCRMProjection[] = allClients.map((client: Client) => {
        const stats = clientMap.get(client.id) || { totalRevenue: 0, openBalance: 0, woCount: 0, budgetCount: 0, lastInteraction: client.createdAt };
        const daysInactive = Math.floor((now.getTime() - safeTimestamp(stats.lastInteraction)) / (1000 * 60 * 60 * 24));
        
        const status: ClientCRMStatus[] = [];
        if (daysInactive < 30) status.push('ACTIVE');
        else if (daysInactive < 90) status.push('WARM');
        else if (daysInactive < 180) status.push('INACTIVE');
        else status.push('AT_RISK');

        if (stats.openBalance > 0) status.push('DEBTOR');
        if (stats.totalRevenue > 0 && stats.totalRevenue >= vipThreshold && revenues.length >= 5) status.push('VIP');

        // 4. Relationship Score (0-100)
        let score = 0;
        score += Math.max(0, 40 - (daysInactive / 2)); // Recency (40 pts)
        score += Math.min(30, stats.woCount * 5); // Frequency (30 pts)
        score += (status.includes('VIP') ? 30 : 15); // Monetary (30 pts)
        if (stats.openBalance > 0) score -= 50; // Debt Penalty
        
        return {
          clientId: client.id,
          clientName: client.name,
          phone: client.phone,
          totalRevenue: stats.totalRevenue,
          openBalance: stats.openBalance,
          totalWorkOrders: stats.woCount,
          totalBudgets: stats.budgetCount,
          lastInteractionAt: stats.lastInteraction,
          daysInactive,
          relationshipStatus: status,
          relationshipScore: Math.max(0, Math.min(100, score))
        };
      });

      this.crmListCache = crmList;
      return crmList;
    } catch (err) {
      console.error('[ReadModel] getCRMProjection critical failure:', err);
      return [];
    }
  }

  async getCRMAlertHubProjection(): Promise<CRMAlertHubProjection> {
    const crm = await this.getCRMProjection();
    const allBudgets = await new BudgetPersistenceService().listBudgets();
    const now = new Date();

    return {
      debtors: crm.filter(c => c.relationshipStatus.includes('DEBTOR')),
      inactive: crm.filter(c => c.relationshipStatus.includes('INACTIVE') || c.relationshipStatus.includes('AT_RISK')),
      vipInactive: crm.filter(c => c.relationshipStatus.includes('VIP') && (c.relationshipStatus.includes('INACTIVE') || c.relationshipStatus.includes('AT_RISK'))),
      commercialFollowUp: allBudgets.filter((b: Budget) => b.status === 'enviado' && (now.getTime() - safeTimestamp(b.updatedAt)) / (1000*60*60*24) > 3),
      stalledBudgets: allBudgets.filter((b: Budget) => b.status === 'em_revisao' || b.status === 'pausado')
    };
  }

  async getClientDossier(clientId: string): Promise<ClientDossierProjection | null> {
    const crm = await this.getCRMProjection();
    const summary = crm.find(c => c.clientId === clientId);
    if (!summary) return null;

    const timeline = await this.getClientTimeline(clientId);

    return {
      summary,
      timeline
    };
  }

  async getAsset360Projection(assetId: string): Promise<AssetDossierProjection | null> {
    const asset = await assetService.getById(assetId);
    if (!asset) return null;

    const allEvents = await operationalTimelineService.getGlobalTimeline();
    const assetEvents = allEvents.filter(e => 
      e.aggregateId === assetId || 
      (e.metadata?.assetId === assetId) ||
      (Array.isArray(e.metadata?.assetIds) && e.metadata?.assetIds.includes(assetId))
    );

    const timeline: OperationalActivityProjection[] = assetEvents.map(e => ({
      id: e.id,
      aggregateId: e.aggregateId,
      aggregateType: e.aggregateType,
      actor: e.actor,
      eventType: e.eventType,
      title: e.eventType, // Simplified for now, reuse feed logic later
      description: `Evento técnico registrado para o ativo ${asset.tag || asset.name}`,
      timestamp: e.timestamp,
      severity: getOperationalEventSeverity(e.eventType)
    }));

    // Calculate Maintenance Metrics
    let totalCost = 0;
    let lastMaintenanceDate: string | undefined = undefined;
    let failureCount = 0;

    assetEvents.forEach(e => {
      if (e.eventType === 'WORKORDER_COMPLETED') {
        const val = Number(e.snapshot?.executedValue) || 0;
        totalCost += val;
        if (!lastMaintenanceDate || new Date(e.timestamp) > new Date(lastMaintenanceDate)) {
          lastMaintenanceDate = e.timestamp;
        }
      }
      if (e.eventType.includes('FAILURE') || (e.eventType as string) === 'TECHNICAL_FAILURE_REPORTED') {
        failureCount++;
      }
    });

    // Asset Health Score Algorithm (0-100)
    let score = 100;
    score -= (failureCount * 20); // Penalty for failures
    if (asset.assetStatus === 'CRITICAL') score -= 50;
    if (asset.assetStatus === 'MAINTENANCE') score -= 10;
    
    const daysSinceMaintenance = lastMaintenanceDate 
      ? Math.floor((new Date().getTime() - new Date(lastMaintenanceDate).getTime()) / (1000*60*60*24))
      : 365;

    if (daysSinceMaintenance > 180) score -= 20; // Needs preventive

    return {
      asset,
      healthScore: Math.max(0, score),
      totalMaintenanceCost: totalCost,
      lastMaintenanceDate,
      timeline
    };
  }

  /**
   * Constrói e cacheia o pipeline operacional consolidado de todos os agregados (budgets).
   */
  async getPipelineProjection(): Promise<Record<string, OperationalPipelineProjection>> {
    if (this.pipelineCache) return this.pipelineCache;

    const allEvents = await operationalTimelineService.getGlobalTimeline();
    const grouped = operationalTimelineService.groupEventsByAggregate(allEvents);
    
    const pipeline: Record<string, OperationalPipelineProjection> = {};

    // Aqui mapeamos as views. No mundo real, a timeline do 'budget' pode ter
    // correlationId com a proposal e a work order.
    for (const [id, events] of Object.entries(grouped)) {
      // Rebuild the state for this aggregate by traversing its events forward in time.
      const sorted = events.sort((a, b) => safeTimestamp(a.timestamp) - safeTimestamp(b.timestamp));
      
      const proj: Mutable<OperationalPipelineProjection> = {
        budgetId: id,
        budgetStatus: 'iniciado',
        lastUpdatedAt: sorted[sorted.length - 1].timestamp
      };

      let isDeleted = false;
      for (const evt of sorted) {
        if (evt.eventType === 'BUDGET_DELETED') {
          isDeleted = true;
          break;
        }
        if (evt.aggregateType === 'budget') {
          proj.budgetId = evt.aggregateId;
          const s = safeString(evt.snapshot?.status);
          if (s) proj.budgetStatus = s as BudgetStatus;
        } else if (evt.aggregateType === 'proposal') {
          proj.proposalId = evt.aggregateId;
          const s = safeString(evt.snapshot?.status);
          if (s) proj.proposalStatus = s as ClientProposalStatus;
        } else if (evt.aggregateType === 'workorder') {
          proj.workOrderId = evt.aggregateId;
          const s = safeString(evt.snapshot?.status);
          if (s) proj.workOrderStatus = s as ServiceStatus;
        }
      }

      if (!isDeleted) {
        // We only key the pipeline by budgetId since budget is our source-of-truth.
        pipeline[proj.budgetId] = proj;
      }
    }

    this.pipelineCache = pipeline;
    return pipeline;
  }

  async getMetricsProjection(): Promise<OperationalMetricsProjection> {
    if (this.metricsCache) return this.metricsCache;

    const allEvents = await operationalTimelineService.getGlobalTimeline();
    
    let totalBudgets = 0;
    let totalProposalsSent = 0;
    let totalProposalsApproved = 0;
    let totalWorkOrdersCompleted = 0;
    let revenueRealized = 0;

    for (const evt of allEvents) {
      if (evt.eventType === 'BUDGET_CREATED') totalBudgets++;
      if (evt.eventType === 'PROPOSAL_SENT') totalProposalsSent++;
      if (evt.eventType === 'PROPOSAL_APPROVED') totalProposalsApproved++;
      if (evt.eventType === 'WORKORDER_COMPLETED') totalWorkOrdersCompleted++;
      if (evt.eventType === 'FINANCE_RECORD_REALIZED') {
        // FASE 1B: A receita agora vem estritamente de pagamentos registrados contra uma OS
        const amount = Number(evt.metadata?.paymentAmount) || Number(evt.snapshot?.receivedValue) || 0;
        revenueRealized += amount;
      }
    }

    this.metricsCache = {
      totalBudgets,
      totalProposalsSent,
      totalProposalsApproved,
      totalWorkOrdersCompleted,
      revenueRealized,
      lastUpdatedAt: allEvents.length ? allEvents[0].timestamp : new Date().toISOString()
    };

    return this.metricsCache;
  }

  async getBoardProjection(): Promise<OperationalBoardProjection> {
    if (this.boardCache) return this.boardCache;

    const pipeline = await this.getPipelineProjection();
    const board: Mutable<OperationalBoardProjection> = {
      draft: [] as Mutable<OperationalCardProjection>[],
      sent: [] as Mutable<OperationalCardProjection>[],
      approved: [] as Mutable<OperationalCardProjection>[],
      authorized: [] as Mutable<OperationalCardProjection>[],
      inExecution: [] as Mutable<OperationalCardProjection>[],
      finalized: [] as Mutable<OperationalCardProjection>[],
      archived: [] as Mutable<OperationalCardProjection>[]
    };

    const budgetPersistence = new BudgetPersistenceService();

    for (const proj of Object.values(pipeline)) {
      const budget = await budgetPersistence.getBudget(proj.budgetId);
      if (!budget) continue;

      const card: Mutable<OperationalCardProjection> = {
        id: budget.id,
        clientName: budget.clientName || 'Cliente sem nome',
        title: budget.title,
        currentStatus: budget.status,
        proposalStatus: proj.proposalStatus,
        workOrderStatus: proj.workOrderStatus,
        revenue: budget.chargedValue || 0,
        netProfit: budget.financialSnapshot?.lucroBruto || 0,
        margin: budget.financialSnapshot?.margemPercentual || 0,
        createdAt: budget.createdAt,
        updatedAt: new Date(budget.updatedAt).toISOString(),
        aging: Math.floor((Date.now() - new Date(budget.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'normal',
        slaBreached: false,
        overdue: false,
        executionDelay: 0,
        approvalDelay: 0,
        stalledWorkflow: false
      };

      if (budget.status === 'iniciado') (board.draft as Mutable<OperationalCardProjection>[]).push(card);
      else if (budget.status === 'enviado' || budget.status === 'em_revisao') (board.sent as Mutable<OperationalCardProjection>[]).push(card);
      else if (proj.proposalStatus === 'approved' && budget.status !== 'autorizado') (board.approved as Mutable<OperationalCardProjection>[]).push(card);
      else if (budget.status === 'autorizado') (board.authorized as Mutable<OperationalCardProjection>[]).push(card);
      else if (budget.status === 'em_execucao' || proj.workOrderStatus === 'in-progress') (board.inExecution as Mutable<OperationalCardProjection>[]).push(card);
      else if (budget.status === 'finalizado') (board.finalized as Mutable<OperationalCardProjection>[]).push(card);
      else if (budget.status === 'arquivado') (board.archived as Mutable<OperationalCardProjection>[]).push(card);
      else (board.draft as Mutable<OperationalCardProjection>[]).push(card); // fallback
    }

    this.boardCache = board;
    return board;
  }

  async getClientPipelineProjection(): Promise<Record<string, ClientPipelineProjection>> {
    if (this.crmPipelineCache) return this.crmPipelineCache;
    
    try {
      const [allAttendances, allClients, allBudgets] = await Promise.all([
        db.attendances.toArray(),
        clientService.getAll(),
        new BudgetPersistenceService().listBudgets()
      ]);
      
      const crm: Record<string, Mutable<ClientPipelineProjection>> = {};
      
      const statusPriority: Record<string, number> = {
        'lead': 1,
        'proposal_sent': 2,
        'approved': 3,
        'execution': 4,
        'finalized': 5,
        'recurring_candidate': 6
      };
      
      for (const att of allAttendances) {
        if (att.status === 'cancelado' || att.status === 'arquivado' || att.isDeleted) continue;
        
        const client = allClients.find(c => c.id === att.clientId);
        if (!client) continue;
        
        // Find ALL budgets associated with this attendance
        const attBudgets = allBudgets.filter(b => b.attendanceId === att.id && !b.isDeleted);
        
        // Receita do Atendimento: Somatório de AUTORIZADO, EM_EXECUCAO, FINALIZADO
        const validBudgetsForRevenue = attBudgets.filter(b => 
          b.status === 'autorizado' || b.status === 'em_execucao' || b.status === 'finalizado'
        );
        
        let revenuePlanned = 0;
        for (const b of validBudgetsForRevenue) {
          if (b.budgetGroupId && b.selectionMode === 'exclusive') {
            if (b.isPrimary) {
              revenuePlanned += (b.chargedValue || 0);
            }
          } else {
            revenuePlanned += (b.chargedValue || 0);
          }
        }

        const revenueExecuted = att.revenueExecuted || 0;
        
        const totalProposals = attBudgets.length;
        const totalProposalsApproved = validBudgetsForRevenue.length;
        
        let crmStatus: ClientPipelineProjection['status'] = 'lead';
        if (att.status === 'iniciado') {
          if (attBudgets.some(b => b.status === 'enviado' || b.status === 'em_revisao')) {
            crmStatus = 'proposal_sent';
          } else {
            crmStatus = 'lead';
          }
        } else if (att.status === 'autorizado') {
          crmStatus = 'approved';
        } else if (att.status === 'em_execucao') {
          crmStatus = 'execution';
        } else if (att.status === 'finalizado' || att.status === 'concluido') {
          crmStatus = 'finalized';
        }
        
        const existing = crm[client.id];
        if (!existing || statusPriority[crmStatus] > statusPriority[existing.status]) {
          crm[client.id] = {
            clientId: client.id,
            clientName: client.name,
            status: crmStatus,
            totalRevenue: existing ? existing.totalRevenue + revenuePlanned : revenuePlanned,
            revenuePlanned: existing && existing.revenuePlanned ? existing.revenuePlanned + revenuePlanned : revenuePlanned,
            revenueExecuted: existing && existing.revenueExecuted ? existing.revenueExecuted + revenueExecuted : revenueExecuted,
            totalProposals: existing && existing.totalProposals ? existing.totalProposals + totalProposals : totalProposals,
            totalProposalsApproved: existing && existing.totalProposalsApproved ? existing.totalProposalsApproved + totalProposalsApproved : totalProposalsApproved,
            lastInteractionAt: att.updatedAt || att.createdAt || new Date().toISOString(),
            activeBudgets: existing ? existing.activeBudgets + validBudgetsForRevenue.length : validBudgetsForRevenue.length
          };
        } else if (existing) {
          crm[client.id] = {
            ...existing,
            totalRevenue: existing.totalRevenue + revenuePlanned,
            revenuePlanned: (existing.revenuePlanned || 0) + revenuePlanned,
            revenueExecuted: (existing.revenueExecuted || 0) + revenueExecuted,
            totalProposals: (existing.totalProposals || 0) + totalProposals,
            totalProposalsApproved: (existing.totalProposalsApproved || 0) + totalProposalsApproved,
            activeBudgets: existing.activeBudgets + validBudgetsForRevenue.length
          };
        }
      }
      
      this.crmPipelineCache = crm;
      return crm;
    } catch (err) {
      console.error('Error computing CRM pipeline projection:', err);
      return {};
    }
  }

  async getClientTimeline(clientId: string): Promise<OperationalActivityProjection[]> {
    const allEvents = await operationalTimelineService.getGlobalTimeline();
    
    // FASE 1D: Filter by metadata.clientId
    const clientEvents = allEvents.filter(evt => evt.metadata?.clientId === clientId);
    
    // Map to activity projection
    const timeline: OperationalActivityProjection[] = clientEvents.map(evt => {
      return {
        id: evt.id,
        aggregateId: evt.aggregateId,
        aggregateType: evt.aggregateType,
        actor: evt.actor,
        eventType: evt.eventType,
        title: `Ação: ${evt.eventType}`,
        description: `Evento registrado via ${evt.source}`,
        timestamp: evt.timestamp,
        severity: getOperationalEventSeverity(evt.eventType),
        correlationId: evt.metadata?.correlationId || evt.correlationId
      };
    });
    
    // Sort chronologically (oldest first)
    timeline.sort((a, b) => safeTimestamp(a.timestamp) - safeTimestamp(b.timestamp));
    
    return timeline;
  }

  async getActivityProjection(): Promise<OperationalActivityProjection[]> {
    if (this.activityCache) return this.activityCache;
    
    const allEvents = await operationalTimelineService.getGlobalTimeline();
    
    const activity: OperationalActivityProjection[] = allEvents.map(evt => {
      return {
        id: evt.id,
        aggregateId: evt.aggregateId,
        aggregateType: evt.aggregateType,
        actor: evt.actor,
        eventType: evt.eventType,
        title: `Ação: ${evt.eventType}`,
        description: `Evento registrado via ${evt.source}`,
        timestamp: evt.timestamp,
        severity: getOperationalEventSeverity(evt.eventType),
        correlationId: evt.correlationId
      };
    });
    
    // Reverse chronological order for feed
    activity.sort((a, b) => safeTimestamp(b.timestamp) - safeTimestamp(a.timestamp));
    
    this.activityCache = activity;
    return activity;
  }

  async getFeedProjection() {
    const feed = operationalFeedService.getFeed();
    if (feed.length > 0) return feed;

    const allEvents = await operationalTimelineService.getGlobalTimeline();
    operationalFeedService.rebuildFromEvents(allEvents);
    return operationalFeedService.getFeed();
  }

  async getOperationalQueue(): Promise<QueueWorkflowInput[]> {
    // Minimally integrate QueueEngine by projecting the queue state from the read model
    // so QueueEngine can act as a pure reader, not a source of truth.
    const allEvents = await operationalTimelineService.getGlobalTimeline();
    const grouped = operationalTimelineService.groupEventsByAggregate(allEvents);
    
    const queue: QueueWorkflowInput[] = [];
    for (const [id, events] of Object.entries(grouped)) {
      const sorted = events.sort((a, b) => safeTimestamp(a.timestamp) - safeTimestamp(b.timestamp));
      
      const wf: QueueWorkflowInput = {
        id,
        status: 'draft',
        createdAt: sorted[0]?.timestamp,
        updatedAt: sorted[sorted.length - 1]?.timestamp,
      };

      for (const evt of sorted) {
        if (evt.eventType === 'PROPOSAL_SENT') { wf.status = 'sent'; wf.sentAt = evt.timestamp; }
        if (evt.eventType === 'BUDGET_AUTHORIZED') { wf.status = 'authorized'; wf.authorizedAt = evt.timestamp; }
        if (evt.eventType === 'BUDGET_EXECUTION_STARTED') { wf.status = 'execution'; wf.executionStartedAt = evt.timestamp; }
        if (evt.eventType === 'BUDGET_FINALIZED') { wf.status = 'finished'; wf.finishedAt = evt.timestamp; }
        if ((evt.eventType as string) === 'WORKFLOW_BLOCKED') { wf.blocked = true; }
        if ((evt.eventType as string) === 'WORKFLOW_UNBLOCKED') { wf.blocked = false; }
      }
      queue.push(wf);
    }
    return queue;
  }

  /**
   * Preload hydration used during app startup.
   */
  async hydrate() {
    const allEvents = await operationalTimelineService.getGlobalTimeline();
    operationalFeedService.rebuildFromEvents(allEvents);

    // Trigger Scheduler for Recurrence (Fase 3D/3F)
    try {
      await maintenancePlanScheduler.processActivePlans();
      await contractBillingScheduler.processContractBilling();
    } catch (err) {
      console.error('[ReadModel] Scheduler error:', err);
    }

    await this.getPipelineProjection();
    await this.getMetricsProjection();
    await this.getBoardProjection();
    await this.getCRMProjection();
    await this.getCRMAlertHubProjection();
    await this.getClientPipelineProjection();
    await this.getActivityProjection();
  }
}

export const operationalReadModelService = new OperationalReadModelService();
