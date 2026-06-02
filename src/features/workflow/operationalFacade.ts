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
import { db } from '../../storage/dexieDatabase';
import { attendanceAggregationService } from '../../services/AttendanceAggregationService';

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
      if (!budget.clientId && budget.clientName) {
        const newClient = await clientService.add({
          name: budget.clientName,
          phone: '',
          notes: 'Cadastrado automaticamente via Orçamento (Rápido)',
        });
        budget.clientId = newClient.id;
      }
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_CREATED',
        metadata: { clientId: budget.clientId, correlationId: budget.id },
        snapshot: { ...budget }
      });
    }

    if (!existing) {
      const activeAttendanceId = typeof window !== 'undefined' ? localStorage.getItem('aferix_active_attendance_id') : null;
      if (activeAttendanceId) {
        budget.attendanceId = activeAttendanceId;
      }
    }

    await budgetPersistence.saveBudget(budget);

    // Link active attendance if exists
    if (!existing && budget.attendanceId) {
      try {
        await db.attendances.update(budget.attendanceId, {
          clientId: budget.clientId || '',
          siteId: budget.siteId || 'default-site',
          updatedAt: new Date().toISOString()
        });
        localStorage.removeItem('aferix_active_attendance_id');
      } catch (err) {
        console.error("Erro ao vincular orçamento ao atendimento:", err);
      }
    }

    if (budget.attendanceId) {
      await attendanceAggregationService.recalculate(budget.attendanceId);
    }
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

      if (budget.attendanceId) {
        await attendanceAggregationService.recalculate(budget.attendanceId);
      }
      
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

  // Authorize a budget and automatically create a linked work order
  authorizeBudget: async (budgetId: string, budgetSnapshot?: Budget): Promise<void> => {
    // Change status to AUTORIZADO first
    await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.AUTORIZADO, budgetSnapshot);
    // After authorization, create a minimal work order linked to this budget
    const budget = budgetSnapshot ?? await new BudgetPersistenceService().getBudget(budgetId);
    const workOrder = {
      id: crypto.randomUUID(),
      clientId: budget?.clientId || '',
      siteId: budget?.siteId || 'default-site',
      title: `OS para orçamento ${budgetId}`,
      status: 'draft' as const,
      paymentStatus: 'pending' as const,
      budgetId,
      attendanceId: budget?.attendanceId,
    } as any; // cast to WorkOrder (will be refined by service)
    await workOrderService.add(workOrder);
    // The createWorkOrder flow will trigger execution of the budget via operationalFacade.executeBudget
    await operationalFacade.createWorkOrder(workOrder);
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
      
      if (budget.attendanceId) {
        await attendanceAggregationService.recalculate(budget.attendanceId);
      }
      
      const finalSnapshot = { ...budget, status: BUDGET_STATUS.FINALIZADO };
      
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_FINALIZED',
        snapshot: finalSnapshot
      });
    }
  },

  finalizeBudgetCycle: async (budgetId: string): Promise<void> => {
    await operationalFacade.finalizeBudget(budgetId);
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
    // After proposal approval, ensure the related budget is authorized
    if (proposal.budgetId) {
      await operationalFacade.authorizeBudget(proposal.budgetId);
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

    // Vincular e Sincronizar OS com o Atendimento
    if (workOrder.budgetId && !workOrder.attendanceId) {
      try {
        const budget = await db.budgets.get(workOrder.budgetId);
        if (budget && budget.attendanceId) {
          workOrder.attendanceId = budget.attendanceId;
          await db.workOrders.update(workOrder.id, { attendanceId: budget.attendanceId });
        }
      } catch (err) {
        console.error("Erro ao resolver attendanceId para a OS:", err);
      }
    }

    if (workOrder.attendanceId) {
      await attendanceAggregationService.recalculate(workOrder.attendanceId);
    }
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

    if (workOrder.attendanceId) {
      await attendanceAggregationService.recalculate(workOrder.attendanceId);
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
      clientId: wo.clientId,
      siteId: wo.siteId,
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

    if (wo.attendanceId) {
      await attendanceAggregationService.recalculate(wo.attendanceId);
    }
  },

  deleteAttendance: async (attendanceId: string): Promise<void> => {
    // 1. Fetch children
    const [budgets, workOrders] = await Promise.all([
      db.budgets.where('attendanceId').equals(attendanceId).toArray(),
      db.workOrders.where('attendanceId').equals(attendanceId).toArray()
    ]);

    const budgetIds = budgets.map(b => b.id);
    const osIds = workOrders.map(w => w.id);

    // 2. Cascade delete SimpleFinanceRecords related to these OSs
    if (osIds.length > 0) {
      const financeRecords = await db.simpleFinanceRecords.where('workOrderId').anyOf(osIds).toArray();
      const financeIds = financeRecords.map(f => f.id);
      if (financeIds.length > 0) {
        await db.simpleFinanceRecords.bulkDelete(financeIds);
      }
    }

    // 3. Cascade delete WorkOrders
    if (osIds.length > 0) {
      await db.workOrders.bulkDelete(osIds);
      for (const id of osIds) {
        await operationalEventService.emitEvent({
          aggregateId: id,
          aggregateType: 'workorder',
          eventType: 'WORKORDER_CANCELLED',
          metadata: { correlationId: attendanceId }
        });
      }
    }

    // 4. Cascade delete Budgets
    if (budgetIds.length > 0) {
      await db.budgets.bulkDelete(budgetIds);
      for (const id of budgetIds) {
        await operationalEventService.emitEvent({
          aggregateId: id,
          aggregateType: 'budget',
          eventType: 'BUDGET_DELETED',
          metadata: { correlationId: attendanceId }
        });
      }
    }

    // 5. Delete Attendance itself
    await db.attendances.delete(attendanceId);
    await operationalEventService.emitEvent({
      aggregateId: attendanceId,
      aggregateType: 'attendance',
      eventType: 'ATTENDANCE_DELETED' as any,
      metadata: { correlationId: attendanceId }
    });
  },

  softDeleteAttendance: async (attendanceId: string, userId = 'user'): Promise<void> => {
    const deletedAt = new Date().toISOString();

    // 1. Fetch budgets and work orders
    const [budgets, workOrders] = await Promise.all([
      db.budgets.where('attendanceId').equals(attendanceId).toArray(),
      db.workOrders.where('attendanceId').equals(attendanceId).toArray()
    ]);

    const budgetIds = budgets.map(b => b.id);
    const osIds = workOrders.map(w => w.id);

    // 2. Cascade soft-delete SimpleFinanceRecords
    if (osIds.length > 0) {
      const financeRecords = await db.simpleFinanceRecords.where('workOrderId').anyOf(osIds).toArray();
      for (const f of financeRecords) {
        await db.simpleFinanceRecords.update(f.id, {
          isDeleted: true,
          deletedAt,
          deletedBy: userId
        });
      }
    }

    // 3. Cascade soft-delete WorkOrders
    if (osIds.length > 0) {
      for (const id of osIds) {
        await db.workOrders.update(id, {
          isDeleted: true,
          deletedAt,
          deletedBy: userId,
          syncStatus: 'pending'
        });
        await operationalEventService.emitEvent({
          aggregateId: id,
          aggregateType: 'workorder',
          eventType: 'WORKORDER_CANCELLED',
          metadata: { isDeleted: true },
          snapshot: { isDeleted: true, deletedAt },
          correlationId: attendanceId
        });
      }
    }

    // 4. Cascade soft-delete Budgets
    if (budgetIds.length > 0) {
      for (const id of budgetIds) {
        await db.budgets.update(id, {
          isDeleted: true,
          deletedAt,
          deletedBy: userId,
          syncStatus: 'pending'
        });
        await operationalEventService.emitEvent({
          aggregateId: id,
          aggregateType: 'budget',
          eventType: 'BUDGET_DELETED',
          metadata: { isDeleted: true },
          snapshot: { isDeleted: true, deletedAt },
          correlationId: attendanceId
        });
      }
    }

    // 5. Soft-delete Attendance itself
    await db.attendances.update(attendanceId, {
      isDeleted: true,
      deletedAt,
      deletedBy: userId,
      syncStatus: 'pending'
    });

    await operationalEventService.emitEvent({
      aggregateId: attendanceId,
      aggregateType: 'attendance',
      eventType: 'ATTENDANCE_DELETED' as any,
      metadata: { isDeleted: true },
      snapshot: { isDeleted: true, deletedAt },
      correlationId: attendanceId
    });
  },

  softDeleteBudget: async (budgetId: string, userId = 'user'): Promise<void> => {
    const deletedAt = new Date().toISOString();
    const budget = await db.budgets.get(budgetId);
    if (!budget) return;

    await db.budgets.update(budgetId, {
      isDeleted: true,
      deletedAt,
      deletedBy: userId,
      syncStatus: 'pending'
    });

    await operationalEventService.emitEvent({
      aggregateId: budgetId,
      aggregateType: 'budget',
      eventType: 'BUDGET_DELETED',
      metadata: { clientId: budget.clientId, isDeleted: true },
      snapshot: { isDeleted: true, deletedAt },
      correlationId: budgetId
    });

    if (budget.attendanceId) {
      await attendanceAggregationService.recalculate(budget.attendanceId);
    }
  },

  softDeleteWorkOrder: async (workOrderId: string, userId = 'user'): Promise<void> => {
    const deletedAt = new Date().toISOString();
    const wo = await db.workOrders.get(workOrderId);
    if (!wo) return;

    await db.workOrders.update(workOrderId, {
      isDeleted: true,
      deletedAt,
      deletedBy: userId,
      syncStatus: 'pending'
    });

    await operationalEventService.emitEvent({
      aggregateId: workOrderId,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CANCELLED',
      metadata: { clientId: wo.clientId, isDeleted: true },
      snapshot: { isDeleted: true, deletedAt },
      correlationId: workOrderId
    });

    if (wo.attendanceId) {
      await attendanceAggregationService.recalculate(wo.attendanceId);
    }
  }
};