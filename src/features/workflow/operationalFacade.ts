import { BudgetPersistenceService } from '../../services/BudgetPersistenceService';
import { BudgetService } from '../../services/budgetService';
import { clientProposalService } from '../../services/clientProposalService';
import { workOrderService } from '../../services/workOrderService';
import { operationalEventService } from '../../services/operationalEventService';
import { SimpleFinanceService } from '../../services/SimpleFinanceService';
import { clientService } from '../../services/clientService';
import { BUDGET_STATUS, Budget, BudgetStatus } from '../../domain/budget';
import { ClientProposalStatus } from '../clientPortal/storage/clientProposalStorage';
import { WorkOrder } from '../../core/types/business';
import { OperationalEventType, FinancialDiff } from '../../domain/operationalEvent';

const getFinancialDiff = (oldB: Budget, newB: Budget): FinancialDiff[] => {
  const fields: (keyof Budget & string)[] = [
    'chargedValue', 'materialCost', 'travelCost', 'helperCost', 'fees', 'discounts', 'otherCosts'
  ];
  return fields.reduce((acc, field) => {
    const ov = Number(oldB[field as keyof Budget]) || 0;
    const nv = Number(newB[field as keyof Budget]) || 0;
    if (ov !== nv) acc.push({ field, oldValue: ov, newValue: nv });
    return acc;
  }, [] as FinancialDiff[]);
};

/**
 * OperationalFacade: O ÚNICO maestro operacional do sistema.
 */
export const operationalFacade = {

  // --- BUDGET OPERATIONS ---

  saveBudget: async (budget: Budget): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const existing = await budgetPersistence.getBudget(budget.id);
    
    if (existing) {
      const diff = getFinancialDiff(existing, budget);
      if (diff.length > 0) {
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'FINANCIAL_MUTATION',
          metadata: { diff, title: budget.title, clientId: budget.clientId, correlationId: budget.id },
          snapshot: { ...budget }
        });
      } else {
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'BUDGET_UPDATED',
          metadata: { title: budget.title, clientId: budget.clientId, correlationId: budget.id }
        });
      }
    } else {
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_CREATED',
        metadata: { clientId: budget.clientId, correlationId: budget.id },
        snapshot: { ...budget }
      });
    }

    await budgetPersistence.saveBudget(budget);
  },

  changeBudgetStatus: async (budgetId: string, nextStatus: BudgetStatus, budgetSnapshot?: Budget): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budgetService = new BudgetService();
    
    const budget = budgetSnapshot ?? await budgetPersistence.getBudget(budgetId);
    if (!budget) return;

    if (budgetSnapshot) {
      await budgetPersistence.saveBudget(budgetSnapshot);
    }
    
    if (budget.status !== nextStatus) {
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
          snapshot: { ...budget, status: nextStatus }
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

    const budget = budgetSnapshot ?? await budgetPersistence.getBudget(budgetId);
    if (!budget) return;

    // FASE 4F: Validation Gate
    if (!budget.clientId) {
      throw new Error(`[OperationalGate] Cannot finalize budget ${budgetId} without a valid client.`);
    }

    if (budgetSnapshot) {
      await budgetPersistence.saveBudget(budgetSnapshot);
    }
    
    if (budget.status !== BUDGET_STATUS.FINALIZADO) {
      await budgetService.finalizeBudget(budget);
      
      const finalSnapshot = { ...budget, status: BUDGET_STATUS.FINALIZADO };
      
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_FINALIZED',
        snapshot: finalSnapshot
      });
    }
  },

  archiveBudget: async (budgetId: string): Promise<void> => {
    await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.ARQUIVADO);
  },

  deleteBudget: async (budgetId: string): Promise<void> => {
    const budgetPersistence = new BudgetPersistenceService();
    const budget = await budgetPersistence.getBudget(budgetId);
    await budgetPersistence.deleteBudget(budgetId);
    await operationalEventService.emitEvent({
      aggregateId: budgetId,
      aggregateType: 'budget',
      eventType: 'BUDGET_DELETED',
      metadata: { clientId: budget?.clientId, correlationId: budgetId },
    });
  },

  // --- FINANCE OPERATIONS ---

  registerPayment: async (workOrderId: string, amount: number): Promise<void> => {
    const financeService = new SimpleFinanceService();
    
    const record = await financeService.registerPayment(workOrderId, amount);

    if (record) {
      await operationalEventService.emitEvent({
        aggregateId: workOrderId,
        aggregateType: 'finance',
        eventType: 'FINANCE_RECORD_REALIZED',
        metadata: { adjustment: true, paymentAmount: amount },
        snapshot: { ...record }
      });
    }
  },

  // --- CLIENT PROPOSAL TRANSITIONS ---

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
      const budgetPersistence = new BudgetPersistenceService();
      const budget = await budgetPersistence.getBudget(proposal.budgetId);
      if (budget) {
        await operationalFacade.authorizeBudget(proposal.budgetId, budget);
        
        if (budget.clientId) {
          const newOsId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `os-${Date.now()}`;
          const derivedWorkOrder: WorkOrder = {
            id: newOsId,
            clientId: budget.clientId,
            siteId: budget.siteId,
            budgetId: budget.id,
            title: `[OS] ${budget.title}`,
            status: 'draft',
            paymentStatus: 'pending',
            items: budget.items ? JSON.parse(JSON.stringify(budget.items)) : [],
            executedValue: budget.chargedValue,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await operationalFacade.createWorkOrder(derivedWorkOrder);
        }
      }
    }
  },

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
      metadata: { clientId: proposal.clientName, correlationId: proposal.budgetId },
      snapshot: { status: 'rejected' }
    });

    if (proposal.budgetId) {
      const budgetPersistence = new BudgetPersistenceService();
      const budgetService = new BudgetService();
      const budget = await budgetPersistence.getBudget(proposal.budgetId);
      if (budget && budget.status !== BUDGET_STATUS.RECUSADO) {
        await budgetService.changeStatus(budget, BUDGET_STATUS.RECUSADO);
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'BUDGET_REJECTED',
          metadata: { clientId: budget.clientId, correlationId: budget.id },
          snapshot: { status: BUDGET_STATUS.RECUSADO }
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

  createWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.add(workOrder);
    
    await operationalEventService.emitEvent({
      aggregateId: workOrder.id,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CREATED',
      snapshot: { status: workOrder.status }
    });
  },

  updateWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.update(workOrder);

    if (workOrder.status === 'in-progress') {
      await operationalEventService.emitEvent({
        aggregateId: workOrder.id,
        aggregateType: 'workorder',
        eventType: 'WORKORDER_STARTED',
        metadata: { clientId: workOrder.clientId, correlationId: workOrder.budgetId || workOrder.id },
        snapshot: { status: 'in-progress' }
      });
      if (workOrder.budgetId) {
        await operationalFacade.executeBudget(workOrder.budgetId);
      }
    }

    if (workOrder.status === 'done' && workOrder.budgetId) {
      await operationalFacade.finalizeBudget(workOrder.budgetId);
    } else if (workOrder.status === 'cancelled' && workOrder.budgetId) {
      const budgetPersistence = new BudgetPersistenceService();
      const budgetService = new BudgetService();
      const budget = await budgetPersistence.getBudget(workOrder.budgetId);
      if (budget && budget.status !== BUDGET_STATUS.CANCELADO) {
        await budgetService.changeStatus(budget, BUDGET_STATUS.CANCELADO);
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'BUDGET_CANCELLED',
          metadata: { clientId: budget.clientId, correlationId: budget.id },
          snapshot: { status: BUDGET_STATUS.CANCELADO }
        });
      }
    }
    
    if (workOrder.status === 'cancelled') {
      await operationalEventService.emitEvent({
        aggregateId: workOrder.id,
        aggregateType: 'workorder',
        eventType: 'WORKORDER_CANCELLED',
        metadata: { clientId: workOrder.clientId, correlationId: workOrder.budgetId || workOrder.id },
        snapshot: { status: 'cancelled' }
      });
    }
  },

  completeWorkOrder: async (workOrderId: string, executedValue: number, receivedValue: number, notes?: string): Promise<void> => {
    const wo = await workOrderService.getById(workOrderId);
    if (!wo) return;
    
    wo.status = 'done';
    wo.executedValue = executedValue;
    if (notes) {
      wo.description = wo.description ? `${wo.description}\n\n[Checkout] ${notes}` : `[Checkout] ${notes}`;
    }
    wo.updatedAt = new Date().toISOString();
    await workOrderService.update(wo);

    await operationalEventService.emitEvent({
      aggregateId: wo.id,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_COMPLETED',
      metadata: { clientId: wo.clientId, correlationId: wo.budgetId || wo.id },
      snapshot: { status: 'done', executedValue, receivedValue }
    });

    const client = await clientService.getById(wo.clientId);
    const clientName = client?.name || 'CLIENTE_ID_' + wo.clientId.slice(0, 8);

    const financeService = new SimpleFinanceService();
    await financeService.saveRecord({
      title: wo.title,
      clientName: clientName,
      workOrderId: wo.id,
      expectedValue: executedValue,
      receivedValue: receivedValue,
      materialCost: 0,
      travelCost: 0,
      cardFee: 0,
      estimatedTax: 0,
      otherCosts: 0
    });

    if (wo.budgetId) {
      await operationalFacade.finalizeBudget(wo.budgetId);
    }
  }

};