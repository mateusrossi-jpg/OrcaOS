// operationalEventService import removed as it is now in SubscriptionService
import { operationalTimelineService } from './operationalTimelineService';
import { safeString, safeTimestamp } from '../core/runtime/safeGuards';
import {
  OperationalPipelineProjection,
  OperationalMetricsProjection,
  OperationalBoardProjection,
  OperationalCardProjection,
  ClientPipelineProjection,
  OperationalActivityProjection
} from '../domain/operationalProjections';
import { BudgetStatus } from '../domain/budget';
import { ClientProposalStatus } from '../features/clientPortal/storage/clientProposalStorage';
import { ServiceStatus } from '../core/types/business';
import { BudgetPersistenceService } from './BudgetPersistenceService';
import { QueueWorkflowInput } from '../core/workflow/queueEngine';
import { operationalFeedService } from './operationalFeedService';
import { getOperationalEventSeverity } from '../domain/eventSeverity';

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
      case 'crm': this.crmPipelineCache = null; break;
      case 'activity': this.activityCache = null; break;
      case 'feed': operationalFeedService.invalidateFeed(); break;
    }
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
        const amount = Number(evt.snapshot?.revenue) || 0;
        const adjustment = Number(evt.snapshot?.receivedAmount) || 0;
        revenueRealized += (amount + adjustment);
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
    
    // Very simplified CRM pipeline derived from events
    const allEvents = await operationalTimelineService.getGlobalTimeline();
    const crm: Record<string, Mutable<ClientPipelineProjection>> = {};
    
    for (const evt of allEvents) {
      // Logic for CRM pipeline extraction would go here
      // For now, we mock basic aggregation to fulfill readiness without creating parallel tables
      const clientId = evt.aggregateId; // assuming correlation or derived
      if (!crm[clientId]) {
        crm[clientId] = {
          clientId,
          clientName: 'Client ' + clientId,
          status: 'lead',
          totalRevenue: 0,
          lastInteractionAt: evt.timestamp,
          activeBudgets: 1
        };
      }
      
      if (evt.eventType === 'PROPOSAL_SENT') crm[clientId].status = 'proposal_sent';
      if (evt.eventType === 'PROPOSAL_APPROVED') crm[clientId].status = 'approved';
      if (evt.eventType === 'BUDGET_EXECUTION_STARTED') crm[clientId].status = 'execution';
      if (evt.eventType === 'BUDGET_FINALIZED') crm[clientId].status = 'finalized';
      
      if (safeTimestamp(evt.timestamp) > safeTimestamp(crm[clientId].lastInteractionAt)) {
        crm[clientId].lastInteractionAt = evt.timestamp;
      }
    }
    
    this.crmPipelineCache = crm;
    return crm;
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

    await this.getPipelineProjection();
    await this.getMetricsProjection();
    await this.getBoardProjection();
    await this.getClientPipelineProjection();
    await this.getActivityProjection();
  }
}

export const operationalReadModelService = new OperationalReadModelService();
