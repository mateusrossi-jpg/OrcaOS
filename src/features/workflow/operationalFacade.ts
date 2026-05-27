import { BudgetPersistenceService } from '../../services/BudgetPersistenceService';
import { BudgetService } from '../../services/budgetService';
import { clientProposalService } from '../../services/clientProposalService';
import { workOrderService } from '../../services/workOrderService';
import { operationalEventService } from '../../services/operationalEventService';
import { SimpleFinanceService } from '../../services/SimpleFinanceService';
import { BUDGET_STATUS, Budget, BudgetStatus } from '../../domain/budget';
import { ClientProposalStatus } from '../clientPortal/storage/clientProposalStorage';
import { WorkOrder } from '../../core/types/business';
import { SimpleFinanceRecordInput } from '../../domain/finance';
import { OperationalEventType } from '../../domain/operationalEvent';

/**
 * OperationalFacade: O ÚNICO maestro operacional do sistema.
 * Todas as transições de workflow (orçamento, proposta, ordem de serviço)
 * devem passar por aqui para garantir propagação automatizada
 * e manter o Budget como o único Source-of-Truth.
 */
export const operationalFacade = {

  // --- BUDGET OPERATIONS ---

  saveBudget: async (budget: Budget): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const existing = await budgetPersistence.getBudget(budget.id);
    await budgetPersistence.saveBudget(budget);

    if (!existing) {
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_CREATED',
        snapshot: { status: budget.status }
      });
    } else {
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_UPDATED',
        metadata: { title: budget.title }
      });
    }
  },

  changeBudgetStatus: async (budgetId: string, nextStatus: BudgetStatus, budgetSnapshot?: Budget): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();
    
    if (budgetSnapshot) {
      await budgetPersistence.saveBudget(budgetSnapshot);
    }

    const budget = budgetSnapshot ?? await budgetPersistence.getBudget(budgetId);
    
    if (budget && budget.status !== nextStatus) {
      await budgetService.changeStatus(budget, nextStatus);
      
      const eventTypeMap: Record<string, OperationalEventType> = {
        [BUDGET_STATUS.ENVIADO]: 'BUDGET_SENT',
        [BUDGET_STATUS.AUTORIZADO]: 'BUDGET_AUTHORIZED',
        [BUDGET_STATUS.EM_EXECUCAO]: 'BUDGET_EXECUTION_STARTED',
        [BUDGET_STATUS.RECUSADO]: 'BUDGET_REJECTED',
        [BUDGET_STATUS.ARQUIVADO]: 'BUDGET_ARCHIVED',
        [BUDGET_STATUS.CANCELADO]: 'BUDGET_CANCELLED'
      };

      const eventType = eventTypeMap[nextStatus];
      if (eventType) {
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType,
          snapshot: { status: nextStatus }
        });
      }
    }
  },

  authorizeBudget: async (budgetId: string, budgetSnapshot?: Budget): Promise<void> => {
    await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.AUTORIZADO, budgetSnapshot);
  },

  executeBudget: async (budgetId: string, budgetSnapshot?: Budget): Promise<void> => {
    await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.EM_EXECUCAO, budgetSnapshot);
  },

  finalizeBudget: async (budgetId: string, budgetSnapshot?: Budget): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();

    if (budgetSnapshot) {
      await budgetPersistence.saveBudget(budgetSnapshot);
    }

    const budget = budgetSnapshot ?? await budgetPersistence.getBudget(budgetId);
    
    if (budget && budget.status !== BUDGET_STATUS.FINALIZADO) {
      await budgetService.finalizeBudget(budget);
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_FINALIZED',
        snapshot: { status: BUDGET_STATUS.FINALIZADO }
      });
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'finance',
        eventType: 'FINANCE_RECORD_REALIZED',
        snapshot: { 
          status: BUDGET_STATUS.FINALIZADO,
          revenue: budget.chargedValue - budget.discounts,
          grossProfit: budget.financialSnapshot?.lucroBruto || 0
        }
      });
    }
  },

  archiveBudget: async (budgetId: string): Promise<void> => {
    await operationalFacade.changeBudgetStatus(budgetId, 'arquivado');
  },

  deleteBudget: async (budgetId: string): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    await budgetPersistence.deleteBudget(budgetId);
    await operationalEventService.emitEvent({
      aggregateId: budgetId,
      aggregateType: 'budget',
      eventType: 'BUDGET_DELETED',
    });
  },

  // --- FINANCE OPERATIONS ---

  recordFinanceAdjustment: async (record: SimpleFinanceRecordInput): Promise<void> => {
    const financeService = new SimpleFinanceService();
    await financeService.saveRecord(record);
    
    if (record.sourceBudgetId) {
      await operationalEventService.emitEvent({
        aggregateId: record.sourceBudgetId,
        aggregateType: 'finance',
        eventType: 'FINANCE_RECORD_REALIZED',
        metadata: { adjustment: true },
        snapshot: { ...record }
      });
    }
  },

  // --- CLIENT PROPOSAL TRANSITIONS ---

  /**
   * Aprova a proposta e AUTOMATICAMENTE autoriza o orçamento atrelado.
   */
  approveProposal: async (proposalId: string): Promise<void> => {
    const proposal = await clientProposalService.getById(proposalId);
    if (!proposal) return;

    proposal.status = 'approved';
    proposal.decidedAt = new Date().toISOString();
    proposal.updatedAt = new Date().toISOString();
    await clientProposalService.update(proposal);

    await operationalEventService.emitEvent({
      aggregateId: proposal.id,
      aggregateType: 'proposal',
      eventType: 'PROPOSAL_APPROVED',
      snapshot: { status: 'approved' }
    });

    if (proposal.budgetId) {
      await operationalFacade.authorizeBudget(proposal.budgetId);
    }
  },

  /**
   * Recusa a proposta e AUTOMATICAMENTE recusa o orçamento atrelado.
   */
  rejectProposal: async (proposalId: string): Promise<void> => {
    const proposal = await clientProposalService.getById(proposalId);
    if (!proposal) return;

    proposal.status = 'rejected';
    proposal.decidedAt = new Date().toISOString();
    proposal.updatedAt = new Date().toISOString();
    await clientProposalService.update(proposal);

    await operationalEventService.emitEvent({
      aggregateId: proposal.id,
      aggregateType: 'proposal',
      eventType: 'PROPOSAL_REJECTED',
      snapshot: { status: 'rejected' }
    });

    if (proposal.budgetId) {
      const budgetPersistence = new BudgetPersistenceService();
      const budgetService = new BudgetService();
      const budget = await budgetPersistence.getBudget(proposal.budgetId);
      if (budget && budget.status !== 'recusado') {
        await budgetService.changeStatus(budget, 'recusado');
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'BUDGET_REJECTED',
          snapshot: { status: 'recusado' }
        });
      }
    }
  },

  changeProposalStatus: async (proposalId: string, status: ClientProposalStatus): Promise<void> => {
    if (status === 'approved') return operationalFacade.approveProposal(proposalId);
    if (status === 'rejected') return operationalFacade.rejectProposal(proposalId);

    const proposal = await clientProposalService.getById(proposalId);
    if (!proposal) return;

    proposal.status = status;
    proposal.updatedAt = new Date().toISOString();
    
    if (status === 'sent' && !proposal.sentAt) proposal.sentAt = new Date().toISOString();
    if (status === 'viewed' && !proposal.viewedAt) proposal.viewedAt = new Date().toISOString();
    
    await clientProposalService.update(proposal);

    if (status === 'sent') {
      await operationalEventService.emitEvent({
        aggregateId: proposal.id,
        aggregateType: 'proposal',
        eventType: 'PROPOSAL_SENT',
        snapshot: { status: 'sent' }
      });
    }
  },

  // --- WORK ORDER TRANSITIONS ---

  /**
   * Cria/inicia a OS e AUTOMATICAMENTE marca o orçamento atrelado como 'em_execucao'.
   */
  createWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.add(workOrder);
    
    await operationalEventService.emitEvent({
      aggregateId: workOrder.id,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CREATED',
      snapshot: { status: workOrder.status }
    });

    if (workOrder.budgetId) {
      await operationalFacade.executeBudget(workOrder.budgetId);
    }
  },

  /**
   * Atualiza a OS. Se passar para 'done', finaliza o orçamento.
   */
  updateWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.update(workOrder);

    if (workOrder.status === 'in-progress') {
      await operationalEventService.emitEvent({
        aggregateId: workOrder.id,
        aggregateType: 'workorder',
        eventType: 'WORKORDER_STARTED',
        snapshot: { status: 'in-progress' }
      });
    }

    if (workOrder.status === 'done' && workOrder.budgetId) {
      await operationalFacade.finalizeBudget(workOrder.budgetId);
    } else if (workOrder.status === 'cancelled' && workOrder.budgetId) {
      const budgetPersistence = new BudgetPersistenceService();
      const budgetService = new BudgetService();
      const budget = await budgetPersistence.getBudget(workOrder.budgetId);
      if (budget && budget.status !== 'cancelado') {
        await budgetService.changeStatus(budget, 'cancelado');
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'BUDGET_CANCELLED',
          snapshot: { status: 'cancelado' }
        });
      }
    }
    
    if (workOrder.status === 'cancelled') {
      await operationalEventService.emitEvent({
        aggregateId: workOrder.id,
        aggregateType: 'workorder',
        eventType: 'WORKORDER_CANCELLED',
        snapshot: { status: 'cancelled' }
      });
    }
  },

  /**
   * Finaliza explicitamente a OS e AUTOMATICAMENTE finaliza o orçamento.
   * Ao finalizar o orçamento, o FinanceFacade passa a reconhecer o lucro.
   */
  completeWorkOrder: async (workOrderId: string): Promise<void> => {
    const wo = await workOrderService.getById(workOrderId);
    if (!wo) return;
    wo.status = 'done';
    wo.updatedAt = new Date().toISOString();
    await workOrderService.update(wo);

    await operationalEventService.emitEvent({
      aggregateId: wo.id,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_COMPLETED',
      snapshot: { status: 'done' }
    });

    if (wo.budgetId) {
      await operationalFacade.finalizeBudget(wo.budgetId);
    }
  }

};
