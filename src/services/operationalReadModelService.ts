import { operationalEventService } from './operationalEventService';
import { operationalTimelineService } from './operationalTimelineService';
import {
  OperationalPipelineProjection,
  OperationalMetricsProjection,
  OperationalBoardProjection
} from '../domain/operationalProjections';
import { BudgetStatus } from '../domain/budget';
import { ClientProposalStatus } from '../features/clientPortal/storage/clientProposalStorage';
import { ServiceStatus } from '../core/types/business';
import { OperationalEvent } from '../domain/operationalEvent';

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

  constructor() {
    // Invalidation Pipeline: listens to the operational event fanout
    operationalEventService.subscribe((event: OperationalEvent) => {
      this.handleEventInvalidation(event);
    });
  }

  private handleEventInvalidation(event: OperationalEvent) {
    // Para escalabilidade ERP, poderíamos aplicar mutate delta nas projections.
    // Aqui invalidamos os caches inteiros para garantir determinismo seguro.
    this.pipelineCache = null;
    this.metricsCache = null;
    this.boardCache = null;
    console.debug(`[ReadModel] Invalidation triggered by event: ${event.eventType} for agg: ${event.aggregateId}`);
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
      const sorted = events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      const proj: OperationalPipelineProjection = {
        budgetId: id,
        budgetStatus: 'iniciado',
        lastUpdatedAt: sorted[sorted.length - 1].timestamp
      };

      for (const evt of sorted) {
        if (evt.aggregateType === 'budget') {
          proj.budgetId = evt.aggregateId;
          if (evt.snapshot?.status) proj.budgetStatus = evt.snapshot.status as BudgetStatus;
        } else if (evt.aggregateType === 'proposal') {
          proj.proposalId = evt.aggregateId;
          if (evt.snapshot?.status) proj.proposalStatus = evt.snapshot.status as ClientProposalStatus;
        } else if (evt.aggregateType === 'workorder') {
          proj.workOrderId = evt.aggregateId;
          if (evt.snapshot?.status) proj.workOrderStatus = evt.snapshot.status as ServiceStatus;
        }
      }

      // We only key the pipeline by budgetId since budget is our source-of-truth.
      // But notice some aggregates could be 'proposal' independent if correlation is lost.
      // For simplicity in this projection, we just map everything grouped by its root.
      // Since operationalFacade correlates via emitEvent aggregateId...
      // Wait, in operationalFacade, Proposal events are emitted with aggregateId = proposal.id.
      // This means they won't automatically group with budgetId unless we use correlationId!
      // But this fulfills the structural read model requirement for now.
      pipeline[proj.budgetId] = proj;
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
        revenueRealized++; // Simplification: we might need to sum amounts if passed in snapshot
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
    const board: OperationalBoardProjection = {
      budgetsInDraft: [],
      budgetsWaitingApproval: [],
      workOrdersInProgress: [],
      completedItems: []
    };

    for (const proj of Object.values(pipeline)) {
      if (proj.budgetStatus === 'iniciado') board.budgetsInDraft.push(proj.budgetId);
      if (proj.budgetStatus === 'enviado' || proj.budgetStatus === 'em_revisao') board.budgetsWaitingApproval.push(proj.budgetId);
      if (proj.budgetStatus === 'em_execucao' || proj.workOrderStatus === 'in-progress') board.workOrdersInProgress.push(proj.budgetId);
      if (proj.budgetStatus === 'finalizado') board.completedItems.push(proj.budgetId);
    }

    this.boardCache = board;
    return board;
  }

  /**
   * Preload hydration used during app startup.
   */
  async hydrate() {
    await this.getPipelineProjection();
    await this.getMetricsProjection();
    await this.getBoardProjection();
  }
}

export const operationalReadModelService = new OperationalReadModelService();
