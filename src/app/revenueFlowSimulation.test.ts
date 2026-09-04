/* eslint-disable no-restricted-imports */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { clientService } from '../services/clientService';
import { clientProposalService } from '../services/clientProposalService';
import { workOrderService } from '../services/workOrderService';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { SimpleFinanceService } from '../services/SimpleFinanceService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { ClientProposal, createClientProposalDraft } from '../features/clientPortal/storage/clientProposalStorage';
import { WorkOrder } from '../core/types/business';
import { calculateBudget } from '../domain/aferixFinanceEngine';

describe('AFERIX COMPLETE REVENUE FLOW INTEGRATION TEST', () => {
  const budgetPersistence = new BudgetPersistenceService();
  const financeService = new SimpleFinanceService();

  beforeAll(async () => {
    // Purge tables before running integrated scenario
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.clientProposals.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  afterAll(async () => {
    // Cleanup after test run
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.clientProposals.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  it('successfully executes the entire commercial to financial lifecycle', async () => {
    // STAGE 1: Create Client
    const client = await clientService.add({
      name: 'Cliente Residencial VIP',
      phone: '11999999999',
      email: 'vip@aferix.com',
      address: 'Av. Paulista, 1000',
      notes: 'Execução prioritária aos sábados',
      contributorType: 'not-informed',
      creditLimit: '5000'
    });
    
    expect(client.id).toBeDefined();
    expect(client.name).toBe('Cliente Residencial VIP');

    // STAGE 2: Create Proposal/Budget
    const budgetId = `b-${Date.now()}`;
    const budgetDraft: Budget = {
      id: budgetId,
      clientId: client.id,
      siteId: 'site-1',
      clientName: client.name,
      title: 'Instalação Elétrica Premium',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1200, // Price to client
      materialCost: 200,
      travelCost: 100,
      helperCost: 150,
      fees: 50,
      discounts: 0,
      otherCosts: 0,
      items: [
        { id: 'item-1', description: 'Instalação de Disjuntores e Quadro Geral', quantity: 1, unitPrice: 800, category: 'labor' },
        { id: 'item-2', description: 'Cabos e Conectores Blindados', quantity: 1, unitPrice: 400, category: 'material' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await operationalFacade.saveBudget(budgetDraft);
    const savedBudget = await budgetPersistence.getBudget(budgetId);
    expect(savedBudget).toBeDefined();
    expect(savedBudget?.status).toBe(BUDGET_STATUS.INICIADO);

    // Create matching client portal proposal
    const proposalId = `p-${Date.now()}`;
    const proposalDraft = createClientProposalDraft({
      id: proposalId,
      budgetId: budgetId,
      clientId: client.id,
      clientName: client.name,
      title: budgetDraft.title,
      total: budgetDraft.chargedValue,
      status: 'draft'
    });
    await clientProposalService.add(proposalDraft);

    // STAGE 3: Send Proposal
    await operationalFacade.changeProposalStatus(proposalId, 'sent');
    await operationalFacade.changeBudgetStatus(budgetId, BUDGET_STATUS.ENVIADO);

    let currentProposal = await clientProposalService.getById(proposalId);
    let currentBudget = await budgetPersistence.getBudget(budgetId);
    expect(currentProposal?.status).toBe('sent');
    expect(currentBudget?.status).toBe(BUDGET_STATUS.ENVIADO);

    // Client views proposal online
    await operationalFacade.changeProposalStatus(proposalId, 'viewed');
    currentProposal = await clientProposalService.getById(proposalId);
    expect(currentProposal?.status).toBe('viewed');

    // STAGE 4: Approve Proposal
    // Approving the proposal must AUTOMATICALLY promote the budget status to 'autorizado'
    await operationalFacade.approveProposal(proposalId);
    
    currentProposal = await clientProposalService.getById(proposalId);
    currentBudget = await budgetPersistence.getBudget(budgetId);
    expect(currentProposal?.status).toBe('approved');
    expect(currentBudget?.status).toBe(BUDGET_STATUS.AUTORIZADO);

    // STAGE 5: Generate Work Order
    // Create the OS bound to the authorized budget
    const workOrderId = `wo-${Date.now()}`;
    const workOrderDraft: WorkOrder = {
      id: workOrderId,
      clientId: client.id,
      siteId: 'site-1',
      budgetId: budgetId,
      title: budgetDraft.title,
      description: 'Executar instalação conforme checklist técnico aprovado',
      priority: 'high',
      status: 'in-progress',
      paymentStatus: 'pending',
      scheduledDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Creating a Work Order must AUTOMATICALLY advance budget status to 'em_execucao' (Decoupled: now we do it explicitly!)
    await operationalFacade.createWorkOrder(workOrderDraft);
    await operationalFacade.executeBudget(budgetId);

    currentBudget = await budgetPersistence.getBudget(budgetId);
    const savedWorkOrder = await workOrderService.getById(workOrderId);
    expect(savedWorkOrder).toBeDefined();
    expect(savedWorkOrder?.status).toBe('in-progress');
    expect(currentBudget?.status).toBe(BUDGET_STATUS.EM_EXECUCAO);

    // STAGE 6: Execute Work Order
    // Simulate updating active technician progress notes
    const activeWorkOrder = { ...savedWorkOrder!, description: 'Executado: cabeamento concluído, iniciando testes' } as WorkOrder;
    await operationalFacade.updateWorkOrder(activeWorkOrder);

    // STAGE 7: Complete Work Order
    // Completing the OS must AUTOMATICALLY finalize the budget and realise the BI figures (Decoupled: now we do it explicitly!)
    await operationalFacade.completeWorkOrder(workOrderId, 1200, 0);
    await operationalFacade.finalizeBudgetCycle(budgetId);

    const completedWorkOrder = await workOrderService.getById(workOrderId);
    currentBudget = await budgetPersistence.getBudget(budgetId);
    expect(completedWorkOrder?.status).toBe('done');
    expect(currentBudget?.status).toBe(BUDGET_STATUS.FINALIZADO);

    // STAGE 8: Register Payment
    // Realize simple finance entry representing client cash transfer
    await operationalFacade.registerPayment(workOrderId, budgetDraft.chargedValue);

    const financeRecords = await financeService.listRecords();
    const currentRecord = financeRecords.find(r => r.workOrderId === workOrderId);
    expect(currentRecord).toBeDefined();
    expect(currentRecord?.status).toBe('paid');
    expect(currentRecord?.receivedValue).toBe(1200);

    // STAGE 9: Close Financial Cycle
    // Compute margins and audit cash pool realized calculations
    const totals = calculateBudget(currentBudget!);
    expect(totals.totalComercial).toBe(1200);
    expect(totals.totalCost).toBe(500); // material(200) + travel(100) + helper(150) + fees(50)
    expect(totals.lucroBruto).toBe(700); // 1200 - 500
    expect(totals.marginPercent).toBeCloseTo(58.33, 1);
  });
});
