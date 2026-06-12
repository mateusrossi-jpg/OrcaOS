import { generateUUID } from '../../core/utils/idGenerator';
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
import { writeLock } from '../../core/database/writeLock';
import { celebrationService } from '../../services/CelebrationService';
import { StockService } from '../../services/StockService';

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
          metadata: {
            diff,
            title: budget.title,
            clientId: budget.clientId,
            attendanceId: budget.attendanceId,
            budgetId: budget.id,
            correlationId: budget.id
          },
          snapshot: { ...budget }
        });
      } else {
        await operationalEventService.emitEvent({
          aggregateId: budget.id,
          aggregateType: 'budget',
          eventType: 'BUDGET_UPDATED',
          metadata: {
            title: budget.title,
            clientId: budget.clientId,
            attendanceId: budget.attendanceId,
            budgetId: budget.id,
            correlationId: budget.id
          }
        });
      }
    } else {
      if (!budget.clientId && budget.clientName) {
        const newClient = await clientService.add({
          name: budget.clientName,
          phone: '',
          notes: 'Cadastrado automaticamente via Orçamento (Rápido)',
          companyId: budget.companyId || 'default-company',
          workspaceId: budget.workspaceId || 'default-workspace',
        });
        budget.clientId = newClient.id;
      }
      await operationalEventService.emitEvent({
        aggregateId: budget.id,
        aggregateType: 'budget',
        eventType: 'BUDGET_CREATED',
        metadata: {
          clientId: budget.clientId,
          attendanceId: budget.attendanceId,
          budgetId: budget.id,
          correlationId: budget.id
        },
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
    return writeLock.withDatabaseLock(`auth-${budgetId}`, async () => {
      // Prevent duplicate work orders from rapid double-clicks
      const existingWOs = await db.workOrders.where('budgetId').equals(budgetId).toArray();
      if (existingWOs.length > 0) {
        console.warn(`[operationalFacade] WorkOrder already exists for budget ${budgetId}. Ignoring duplicate authorization request.`);
        return;
      }

      // Change status to AUTORIZADO first
      await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.AUTORIZADO, budgetSnapshot);
      // After authorization, create a minimal work order linked to this budget
      const budget = budgetSnapshot ?? await new BudgetPersistenceService().getBudget(budgetId);
      const workOrder = {
        id: generateUUID(),
        clientId: budget?.clientId || '',
        siteId: budget?.siteId || 'default-site',
        title: budget?.title || `Projeto/OS ${budgetId.substring(0,6)}`,
        status: 'awaiting_schedule' as const,
        paymentStatus: 'pending' as const,
        executedValue: budget?.chargedValue || 0,
        scheduledDate: new Date().toISOString().split('T')[0],
        budgetId,
        attendanceId: budget?.attendanceId,
        items: budget?.items || [],
      } as any; // cast to WorkOrder (will be refined by service)
      await workOrderService.add(workOrder);
      // The createWorkOrder flow will trigger execution of the budget via operationalFacade.executeBudget
      await operationalFacade.createWorkOrder(workOrder);
    });
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

  duplicateBudget: async (budgetId: string): Promise<string> => {
    const budgetPersistence = new BudgetPersistenceService();
    const original = await budgetPersistence.getBudget(budgetId);
    if (!original) throw new Error(`Budget ${budgetId} not found`);

    const newBudgetId = generateUUID();
    const newAttendanceId = generateUUID();

    const newBudget: Budget = {
      ...original,
      id: newBudgetId,
      title: `${original.title} (Cópia)`,
      status: BUDGET_STATUS.INICIADO,
      attendanceId: newAttendanceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    // Create the new attendance context for this duplicate
    await db.attendances.add({
      id: newAttendanceId,
      clientId: original.clientId || '',
      siteId: original.siteId || 'default-site',
      status: 'iniciado',
      companyId: original.companyId || 'default-company',
      workspaceId: original.workspaceId || 'default-workspace',
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await budgetPersistence.saveBudget(newBudget);
    
    await operationalEventService.emitEvent({
      aggregateId: newBudgetId,
      aggregateType: 'budget',
      eventType: 'BUDGET_CREATED',
      metadata: {
        clientId: newBudget.clientId,
        attendanceId: newAttendanceId,
        budgetId: newBudgetId,
        correlationId: budgetId 
      },
      snapshot: { ...newBudget }
    });

    return newBudgetId;
  },

  // --- FINANCE OPERATIONS ---

  registerPayment: async (workOrderId: string, amount: number): Promise<void> => {
    const financeService = new SimpleFinanceService();
    
    const record = await financeService.registerPayment(workOrderId, amount);

    if (record) {
      const woForPayment = await workOrderService.getById(workOrderId);
      await operationalEventService.emitEvent({
        aggregateId: workOrderId,
        aggregateType: 'finance',
        eventType: 'FINANCE_RECORD_REALIZED',
        metadata: {
          adjustment: true,
          paymentAmount: amount,
          clientId: woForPayment?.clientId,
          attendanceId: woForPayment?.attendanceId,
          budgetId: woForPayment?.budgetId,
          workOrderId: workOrderId
        },
        snapshot: { ...record }
      });

      // Trigger WOW Milestone Check (V8)
      await celebrationService.checkAndTrigger(woForPayment?.clientId);
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

    let clientId = '';
    let attendanceId = '';
    if (proposal.budgetId) {
      const b = await db.budgets.get(proposal.budgetId);
      if (b) {
        clientId = b.clientId || '';
        attendanceId = b.attendanceId || '';
      }
    }

    await operationalEventService.emitEvent({
      aggregateId: proposal.id,
      aggregateType: 'proposal',
      eventType: 'PROPOSAL_APPROVED',
      metadata: {
        clientId,
        attendanceId,
        budgetId: proposal.budgetId,
        workOrderId: proposal.workOrderId,
        correlationId: proposal.budgetId || proposal.id
      },
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

    let clientId = '';
    let attendanceId = '';
    if (proposal.budgetId) {
      const b = await db.budgets.get(proposal.budgetId);
      if (b) {
        clientId = b.clientId || '';
        attendanceId = b.attendanceId || '';
      }
    }

    await operationalEventService.emitEvent({
      aggregateId: proposal.id,
      aggregateType: 'proposal',
      eventType: 'PROPOSAL_REJECTED',
      metadata: {
        clientId,
        attendanceId,
        budgetId: proposal.budgetId,
        workOrderId: proposal.workOrderId,
        correlationId: proposal.budgetId || proposal.id
      },
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
          metadata: {
            clientId: budget.clientId,
            attendanceId: budget.attendanceId,
            budgetId: budget.id,
            correlationId: budget.id
          },
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

    let clientId = '';
    let attendanceId = '';
    if (proposal.budgetId) {
      const b = await db.budgets.get(proposal.budgetId);
      if (b) {
        clientId = b.clientId || '';
        attendanceId = b.attendanceId || '';
      }
    }

    if (status === 'sent') {
      await operationalEventService.emitEvent({
        aggregateId: proposal.id,
        aggregateType: 'proposal',
        eventType: 'PROPOSAL_SENT',
        metadata: {
          clientId,
          attendanceId,
          budgetId: proposal.budgetId,
          workOrderId: proposal.workOrderId,
          correlationId: proposal.budgetId || proposal.id
        },
        snapshot: { status: 'sent' }
      });
    }
  },

  // --- WORK ORDER TRANSITIONS ---

  createWorkOrder: async (workOrder: WorkOrder): Promise<void> => {
    await workOrderService.add(workOrder);
    
    let attendanceId = workOrder.attendanceId;
    if (workOrder.budgetId && !attendanceId) {
      try {
        const budget = await db.budgets.get(workOrder.budgetId);
        if (budget && budget.attendanceId) {
          attendanceId = budget.attendanceId;
          workOrder.attendanceId = attendanceId;
          await db.workOrders.update(workOrder.id, { attendanceId });
        }
      } catch (err) {
        console.error("Erro ao resolver attendanceId para a OS:", err);
      }
    }

    await operationalEventService.emitEvent({
      aggregateId: workOrder.id,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CREATED',
      metadata: {
        clientId: workOrder.clientId,
        attendanceId: attendanceId,
        budgetId: workOrder.budgetId,
        workOrderId: workOrder.id,
        correlationId: workOrder.budgetId || workOrder.id
      },
      snapshot: { status: workOrder.status }
    });

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
        metadata: {
          clientId: workOrder.clientId,
          attendanceId: workOrder.attendanceId,
          budgetId: workOrder.budgetId,
          workOrderId: workOrder.id,
          correlationId: workOrder.budgetId || workOrder.id
        },
        snapshot: { status: 'in-progress' }
      });
    }

    if (workOrder.status === 'cancelled') {
      await operationalEventService.emitEvent({
        aggregateId: workOrder.id,
        aggregateType: 'workorder',
        eventType: 'WORKORDER_CANCELLED',
        metadata: {
          clientId: workOrder.clientId,
          attendanceId: workOrder.attendanceId,
          budgetId: workOrder.budgetId,
          workOrderId: workOrder.id,
          correlationId: workOrder.budgetId || workOrder.id
        },
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
    
    // FASE 3.5: Inventory Reintegration - Baixa Automática e Custo Real
    const budgetPersistence = new BudgetPersistenceService();
    const budget = wo.budgetId ? await budgetPersistence.getBudget(wo.budgetId) : undefined;
    let totalMaterialCost = budget?.materialCost || 0;

    if (budget && budget.items) {
      let realMaterialCost = 0;
      let usedInventory = false;
      const invItems = await db.inventoryItems.toArray();

      for (const item of budget.items) {
        if (item.category === 'material') {
          // Busca no estoque por SKU (equivalente ao título/descrição para o SOLO)
          const invItem = invItems.find(i => 
            (item.catalogId && i.sku === item.catalogId) || 
            i.name.toLowerCase() === item.description.toLowerCase() ||
            i.sku.toLowerCase() === item.description.toLowerCase()
          );

          if (invItem && invItem.quantityOnHand > 0) {
            const consumeQty = Math.min(item.quantity, invItem.quantityOnHand);
            try {
              await StockService.updateStock(
                invItem.companyId,
                invItem.workspaceId,
                invItem.id,
                'OUT',
                consumeQty,
                `Baixa automática OS ${wo.id}`,
                wo.id
              );
              realMaterialCost += (consumeQty * invItem.unitCost);
              usedInventory = true;
            } catch (err) {
              console.error("Erro na baixa automática de estoque:", err);
              realMaterialCost += (item.quantity * item.unitPrice); // Fallback: usa o custo orçado
            }
          } else {
            realMaterialCost += (item.quantity * item.unitPrice); // Sem estoque, usa custo do orçamento
          }
        }
      }
      
      if (usedInventory) {
        totalMaterialCost = realMaterialCost;
      }
    }

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
      metadata: {
        clientId: wo.clientId,
        attendanceId: wo.attendanceId,
        budgetId: wo.budgetId,
        workOrderId: wo.id,
        assetIds: wo.assetIds || [],
        correlationId: wo.budgetId || wo.id
      },
      snapshot: { status: 'done', executedValue, receivedValue, materialCost: totalMaterialCost }
    });

    const client = await clientService.getById(wo.clientId);
    const clientName = client?.name || 'CLIENTE_ID_' + (wo.clientId ? wo.clientId.slice(0, 8) : 'DESC');

    const financeService = new SimpleFinanceService();
    const currentRecords = await financeService.listRecords();
    const existingRecord = currentRecords.find((r) => r.workOrderId === wo.id);

    await financeService.saveRecord({
      id: existingRecord?.id,
      title: wo.title,
      clientId: wo.clientId,
      siteId: wo.siteId,
      clientName: clientName,
      workOrderId: wo.id,
      expectedValue: executedValue,
      receivedValue: receivedValue,
      materialCost: totalMaterialCost,
      travelCost: budget?.travelCost || 0,
      cardFee: 0,
      estimatedTax: budget?.fees || 0,
      otherCosts: budget?.otherCosts || 0
    });

    if (wo.attendanceId) {
      await attendanceAggregationService.recalculate(wo.attendanceId);
    }

    // Trigger WOW Milestone Check (V8)
    await celebrationService.checkAndTrigger(wo.clientId);
  },

  // --- ATTENDANCE OPERATIONS ---

  initializeAttendance: async (clientId: string, siteId: string, companyId = 'default-company', workspaceId = 'default-workspace'): Promise<string> => {
    const attendanceId = generateUUID();
    const newAttendance = {
      id: attendanceId,
      clientId,
      siteId,
      status: 'iniciado' as const,
      companyId,
      workspaceId,
      syncStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.attendances.add(newAttendance);
    localStorage.setItem('aferix_active_attendance_id', attendanceId);
    
    if (attendanceId) {
      await attendanceAggregationService.recalculate(attendanceId);
    }
    
    return attendanceId;
  },

  deleteAttendance: async (attendanceId: string): Promise<void> => {
    const att = await db.attendances.get(attendanceId);
    const clientId = att?.clientId || '';

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
        const wo = workOrders.find(w => w.id === id);
        await operationalEventService.emitEvent({
          aggregateId: id,
          aggregateType: 'workorder',
          eventType: 'WORKORDER_CANCELLED',
          metadata: {
            clientId: wo?.clientId || clientId,
            attendanceId,
            budgetId: wo?.budgetId,
            workOrderId: id,
            correlationId: attendanceId
          }
        });
      }
    }

    // 4. Cascade delete Budgets
    if (budgetIds.length > 0) {
      await db.budgets.bulkDelete(budgetIds);
      for (const id of budgetIds) {
        const b = budgets.find(x => x.id === id);
        await operationalEventService.emitEvent({
          aggregateId: id,
          aggregateType: 'budget',
          eventType: 'BUDGET_DELETED',
          metadata: {
            clientId: b?.clientId || clientId,
            attendanceId,
            budgetId: id,
            correlationId: attendanceId
          }
        });
      }
    }

    // 5. Delete Attendance itself
    await db.attendances.delete(attendanceId);
    await operationalEventService.emitEvent({
      aggregateId: attendanceId,
      aggregateType: 'attendance',
      eventType: 'ATTENDANCE_DELETED' as any,
      metadata: {
        clientId,
        attendanceId,
        correlationId: attendanceId
      }
    });
  },

  softDeleteAttendance: async (attendanceId: string, userId = 'user'): Promise<void> => {
    const deletedAt = new Date().toISOString();
    const att = await db.attendances.get(attendanceId);
    const clientId = att?.clientId || '';

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
        const wo = workOrders.find(w => w.id === id);
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
          metadata: {
            isDeleted: true,
            clientId: wo?.clientId || clientId,
            attendanceId,
            budgetId: wo?.budgetId,
            workOrderId: id,
            correlationId: attendanceId
          },
          snapshot: { isDeleted: true, deletedAt },
          correlationId: attendanceId
        });
      }
    }

    // 4. Cascade soft-delete Budgets
    if (budgetIds.length > 0) {
      for (const id of budgetIds) {
        const b = budgets.find(x => x.id === id);
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
          metadata: {
            isDeleted: true,
            clientId: b?.clientId || clientId,
            attendanceId,
            budgetId: id,
            correlationId: attendanceId
          },
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
      metadata: {
        isDeleted: true,
        clientId,
        attendanceId,
        correlationId: attendanceId
      },
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
      metadata: {
        clientId: budget.clientId,
        attendanceId: budget.attendanceId,
        budgetId: budgetId,
        isDeleted: true,
        correlationId: budgetId
      },
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
      metadata: {
        clientId: wo.clientId,
        attendanceId: wo.attendanceId,
        budgetId: wo.budgetId,
        workOrderId: workOrderId,
        isDeleted: true,
        correlationId: workOrderId
      },
      snapshot: { isDeleted: true, deletedAt },
      correlationId: workOrderId
    });

    if (wo.attendanceId) {
      await attendanceAggregationService.recalculate(wo.attendanceId);
    }
  },

  duplicateWorkOrder: async (workOrderId: string): Promise<string> => {
    const original = await db.workOrders.get(workOrderId);
    if (!original) throw new Error(`WorkOrder ${workOrderId} not found`);

    const newId = generateUUID();
    const newAttendanceId = generateUUID();
    
    const newWO: WorkOrder = {
      ...original,
      id: newId,
      title: `${original.title} (Cópia)`,
      status: 'awaiting_schedule',
      paymentStatus: 'pending',
      attendanceId: newAttendanceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    await db.attendances.add({
      id: newAttendanceId,
      clientId: original.clientId,
      siteId: original.siteId,
      status: 'autorizado',
      companyId: original.companyId,
      workspaceId: original.workspaceId,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.workOrders.add(newWO);

    await operationalEventService.emitEvent({
      aggregateId: newId,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CREATED',
      metadata: {
        clientId: original.clientId,
        attendanceId: newAttendanceId,
        workOrderId: newId,
        correlationId: workOrderId
      },
      snapshot: { ...newWO }
    });

    return newId;
  },

  generateRenewalProposal: async (planId: string): Promise<string> => {
    const plan = await db.maintenancePlans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const newBudgetId = generateUUID();
    const newAttendanceId = generateUUID();

    // Create Attendance Context
    await db.attendances.add({
      id: newAttendanceId,
      clientId: plan.clientId,
      siteId: plan.siteId,
      status: 'iniciado',
      companyId: plan.companyId,
      workspaceId: plan.workspaceId,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const newBudget: Budget = {
      id: newBudgetId,
      companyId: plan.companyId,
      workspaceId: plan.workspaceId,
      attendanceId: newAttendanceId,
      clientId: plan.clientId,
      siteId: plan.siteId,
      title: `Renovação PMOC: ${plan.title}`,
      status: BUDGET_STATUS.INICIADO,
      items: [
        { id: generateUUID(), description: `Renovação de Contrato PMOC - ${plan.title}`, quantity: 1, unitPrice: 0, category: 'labor' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    await new BudgetPersistenceService().saveBudget(newBudget);

    await operationalEventService.emitEvent({
      aggregateId: newBudgetId,
      aggregateType: 'budget',
      eventType: 'BUDGET_CREATED',
      metadata: {
        clientId: plan.clientId,
        attendanceId: newAttendanceId,
        budgetId: newBudgetId,
        correlationId: planId
      },
      snapshot: { ...newBudget }
    });

    return newBudgetId;
  },

  createWorkOrderForAsset: async (assetId: string): Promise<string> => {
    const asset = await db.assets.get(assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found`);

    const woId = generateUUID();
    const attendanceId = generateUUID();

    // 1. Iniciar Atendimento
    await db.attendances.add({
      id: attendanceId,
      clientId: asset.clientId,
      siteId: asset.siteId,
      status: 'autorizado',
      companyId: asset.companyId,
      workspaceId: asset.workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    });

    // 2. Criar OS
    const newWO: WorkOrder = {
      id: woId,
      clientId: asset.clientId,
      siteId: asset.siteId,
      attendanceId: attendanceId,
      companyId: asset.companyId,
      workspaceId: asset.workspaceId,
      title: `Intervenção Técnica: ${asset.name} (${asset.tag})`,
      status: 'scheduled',
      paymentStatus: 'pending',
      assetIds: [assetId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    await db.workOrders.add(newWO);

    // 3. Criar Execução Inicial
    await db.assetExecutions.add({
      id: generateUUID(),
      workOrderId: woId,
      assetId: assetId,
      companyId: asset.companyId,
      workspaceId: asset.workspaceId,
      measurements: {},
      checklistResults: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    });

    await operationalEventService.emitEvent({
      aggregateId: woId,
      aggregateType: 'workorder',
      eventType: 'WORKORDER_CREATED',
      metadata: {
        clientId: asset.clientId,
        attendanceId: attendanceId,
        workOrderId: woId,
        assetIds: [assetId],
        correlationId: woId
      },
      snapshot: { ...newWO }
    });

    return woId;
  }
};