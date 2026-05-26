import { BudgetPersistenceService } from '../../services/BudgetPersistenceService';
import { BudgetService } from '../../services/budgetService';
import { clientProposalService } from '../../services/clientProposalService';
import { workOrderService } from '../../services/workOrderService';
import { BUDGET_STATUS } from '../../domain/budget';
import { ClientProposalStatus } from '../clientPortal/storage/clientProposalStorage';
import { WorkOrder } from '../../core/types/business';

/**
 * OperationalFacade: O ÚNICO maestro operacional do sistema.
 * Todas as transições de workflow (orçamento, proposta, ordem de serviço)
 * devem passar por aqui para garantir propagação automatizada
 * e manter o Budget como o único Source-of-Truth.
 */
export const operationalFacade = {

  // --- BUDGET TRANSITIONS (Base Source of Truth) ---

  authorizeBudget: async (budgetId: string): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();
    const budget = await budgetPersistence.getBudget(budgetId);
    if (budget && budget.status !== BUDGET_STATUS.AUTORIZADO) {
      await budgetService.changeStatus(budget, BUDGET_STATUS.AUTORIZADO);
    }
  },

  executeBudget: async (budgetId: string): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();
    const budget = await budgetPersistence.getBudget(budgetId);
    if (budget && budget.status !== BUDGET_STATUS.EM_EXECUCAO) {
      await budgetService.changeStatus(budget, BUDGET_STATUS.EM_EXECUCAO);
    }
  },

  finalizeBudget: async (budgetId: string): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();
    const budget = await budgetPersistence.getBudget(budgetId);
    if (budget && budget.status !== BUDGET_STATUS.FINALIZADO) {
      await budgetService.finalizeBudget(budget);
    }
  },

  archiveBudget: async (budgetId: string): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();
    const budget = await budgetPersistence.getBudget(budgetId);
    if (budget && budget.status !== 'arquivado') {
      await budgetService.changeStatus(budget, 'arquivado');
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

    if (proposal.budgetId) {
      const budgetPersistence = new BudgetPersistenceService();
      const budgetService = new BudgetService();
      const budget = await budgetPersistence.getBudget(proposal.budgetId);
      if (budget && budget.status !== 'recusado') {
        await budgetService.changeStatus(budget, 'recusado');
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
  },

  // --- WORK ORDER TRANSITIONS ---

  /**
   * Cria/inicia a OS e AUTOMATICAMENTE marca o orçamento atrelado como 'em_execucao'.
   */
  createWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.add(workOrder);
    if (workOrder.budgetId) {
      await operationalFacade.executeBudget(workOrder.budgetId);
    }
  },

  /**
   * Atualiza a OS. Se passar para 'done', finaliza o orçamento.
   */
  updateWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.update(workOrder);

    if (workOrder.status === 'done' && workOrder.budgetId) {
      await operationalFacade.finalizeBudget(workOrder.budgetId);
    } else if (workOrder.status === 'cancelled' && workOrder.budgetId) {
      const budgetPersistence = new BudgetPersistenceService();
      const budgetService = new BudgetService();
      const budget = await budgetPersistence.getBudget(workOrder.budgetId);
      if (budget && budget.status !== 'cancelado') {
        await budgetService.changeStatus(budget, 'cancelado');
      }
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

    if (wo.budgetId) {
      await operationalFacade.finalizeBudget(wo.budgetId);
    }
  }

};
