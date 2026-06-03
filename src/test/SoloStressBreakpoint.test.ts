import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { workOrderQueryService } from '../services/WorkOrderQueryService';
import { SimpleFinanceService } from '../services/SimpleFinanceService';

describe('Aferix Solo Stress & Breakpoint Scenario Suite', () => {
  beforeAll(async () => {
    await db.clients.clear();
    await db.assets.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.attendances.clear();
  });

  it('Executes Block 1: Multi-Budgets stress test', async () => {
    console.log('=== STARTING BLOCK 1 ===');
    // Create client
    const client = {
      id: 'c-stress-1',
      companyId: 'default-co',
      name: 'Cliente Stress 1',
      createdAt: new Date().toISOString()
    };
    await db.clients.add(client as any);

    // Create 3 Budgets
    const budgets = [
      { id: 'b-a', companyId: 'default-co', clientId: client.id, title: 'Budget A', status: BUDGET_STATUS.INICIADO, chargedValue: 1000.00, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-b', companyId: 'default-co', clientId: client.id, title: 'Budget B', status: BUDGET_STATUS.INICIADO, chargedValue: 2000.00, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-c', companyId: 'default-co', clientId: client.id, title: 'Budget C', status: BUDGET_STATUS.INICIADO, chargedValue: 3000.00, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    for (const b of budgets) {
      await operationalFacade.saveBudget(b as any);
    }

    // Perform transitions
    await operationalFacade.finalizeBudget('b-a');
    await operationalFacade.authorizeBudget('b-a'); // Approve A

    await operationalFacade.changeBudgetStatus('b-b', BUDGET_STATUS.RECUSADO); // Reject B

    // Cancel C (changeStatus to CANCELADO)
    await operationalFacade.changeBudgetStatus('b-c', BUDGET_STATUS.CANCELADO); // Cancel C

    // Read metrics and assert values
    // In OwnerWorkspace, contracted revenue sum budgets with approved status (autorizado, em_execucao, finalizado)
    const allBudgets = await db.budgets.toArray();
    const approvedBudgets = allBudgets.filter(b => 
      (['autorizado', 'em_execucao', 'finalizado'] as string[]).includes(b.status)
    );
    const contractedTotal = approvedBudgets.reduce((acc, b) => acc + (b.chargedValue || 0), 0);

    const wos = await db.workOrders.toArray();

    console.log(`Contracted Total: R$ ${contractedTotal}`);
    console.log(`Total WorkOrders created: ${wos.length}`);
    console.log(`Budgets statuses: A=${allBudgets.find(b=>b.id==='b-a')?.status}, B=${allBudgets.find(b=>b.id==='b-b')?.status}, C=${allBudgets.find(b=>b.id==='b-c')?.status}`);
    
    // Budget A is approved/authorized, so it must contribute R$ 1000. B and C should not contribute.
    expect(contractedTotal).toBe(1000.00);
    expect(wos.length).toBe(1); // Only Budget A generates a WorkOrder
  });

  it('Executes Block 2: Multi-OS (Separate values check)', async () => {
    console.log('\n=== STARTING BLOCK 2 ===');
    const client = await db.clients.get('c-stress-1');
    
    // Create 2 separate budgets to generate 2 WorkOrders
    const budgets = [
      { id: 'b-osa', companyId: 'default-co', clientId: client?.id, title: 'OS A Budget', status: BUDGET_STATUS.INICIADO, chargedValue: 500.00, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-osb', companyId: 'default-co', clientId: client?.id, title: 'OS B Budget', status: BUDGET_STATUS.INICIADO, chargedValue: 1500.00, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    for (const b of budgets) {
      await operationalFacade.saveBudget(b as any);
      await operationalFacade.finalizeBudget(b.id);
      await operationalFacade.authorizeBudget(b.id);
    }

    const wos = await db.workOrders.toArray();
    const woA = wos.find(w => w.budgetId === 'b-osa')!;
    const woB = wos.find(w => w.budgetId === 'b-osb')!;

    // Start only OS A
    await operationalFacade.updateWorkOrder({
      ...woA,
      status: 'in-progress',
      updatedAt: new Date().toISOString()
    });

    const routeData = await workOrderQueryService.getTodayRoute();
    const inProgressInRoute = routeData.inProgress;
    const scheduledInRoute = routeData.scheduled;

    console.log(`OS A status: ${woA.status}, OS B status: ${woB.status}`);
    console.log(`OS A in progress in route? ${inProgressInRoute.some(w => w.id === woA.id)}`);
    console.log(`OS B scheduled in route? ${scheduledInRoute.some(w => w.id === woB.id)}`);
    
    expect(inProgressInRoute.some(w => w.id === woA.id)).toBe(true);
    expect(scheduledInRoute.some(w => w.id === woB.id)).toBe(true);
  });

  it('Executes Block 3: Partial Payment precision', async () => {
    console.log('\n=== STARTING BLOCK 3 ===');
    const client = await db.clients.get('c-stress-1');
    const budgetId = 'b-partial';
    const budget = {
      id: budgetId,
      companyId: 'default-co',
      clientId: client?.id,
      title: 'Partial Payment Budget',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1000.00,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budget as any);
    await operationalFacade.finalizeBudget(budgetId);
    await operationalFacade.authorizeBudget(budgetId);

    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    const wo = wos[0];

    // Conclude first
    await operationalFacade.completeWorkOrder(wo.id, 1000.00, 0); // Concluded with 0 received value

    const financeService = new SimpleFinanceService();
    
    // Receive 300
    await operationalFacade.registerPayment(wo.id, 300.00);
    let record = (await financeService.listRecords()).find(r => r.workOrderId === wo.id)!;
    console.log(`Pay 1 (300): Received=${record.receivedValue}, Open Balance=${record.openBalance}, Status=${record.status}`);
    expect(record.receivedValue).toBe(300.00);
    expect(record.openBalance).toBe(700.00);
    expect(record.status).toBe('partial');

    // Receive 250
    await operationalFacade.registerPayment(wo.id, 250.00);
    record = (await financeService.listRecords()).find(r => r.workOrderId === wo.id)!;
    console.log(`Pay 2 (250): Received=${record.receivedValue}, Open Balance=${record.openBalance}, Status=${record.status}`);
    expect(record.receivedValue).toBe(550.00);
    expect(record.openBalance).toBe(450.00);
    expect(record.status).toBe('partial');

    // Receive 450
    await operationalFacade.registerPayment(wo.id, 450.00);
    record = (await financeService.listRecords()).find(r => r.workOrderId === wo.id)!;
    console.log(`Pay 3 (450): Received=${record.receivedValue}, Open Balance=${record.openBalance}, Status=${record.status}`);
    expect(record.receivedValue).toBe(1000.00);
    expect(record.openBalance).toBe(0);
    expect(record.status).toBe('paid');
  });

  it('Executes Block 4: Cancelation indicators check', async () => {
    console.log('\n=== STARTING BLOCK 4 ===');
    const client = await db.clients.get('c-stress-1');
    const budgetId = 'b-cancel-wo';
    const budget = {
      id: budgetId,
      companyId: 'default-co',
      clientId: client?.id,
      title: 'Cancel WO Budget',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1500.00,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budget as any);
    await operationalFacade.finalizeBudget(budgetId);
    await operationalFacade.authorizeBudget(budgetId);

    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    const wo = wos[0];

    // Cancel OS before execution
    await operationalFacade.updateWorkOrder({
      ...wo,
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    const routeData = await workOrderQueryService.getTodayRoute();
    const inRoute = routeData.scheduled.some(w => w.id === wo.id) || routeData.inProgress.some(w => w.id === wo.id);
    const activeCount = await workOrderQueryService.getActiveCount();

    console.log(`Cancelled OS in Route? ${inRoute}`);
    console.log(`Active Count: ${activeCount}`);
    
    expect(inRoute).toBe(false);
  });

  it('Executes Block 5: Value modification priority', async () => {
    console.log('\n=== STARTING BLOCK 5 ===');
    const client = await db.clients.get('c-stress-1');
    const budgetId = 'b-val-mod';
    const budget = {
      id: budgetId,
      companyId: 'default-co',
      clientId: client?.id,
      title: 'Value Mod Budget',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1000.00,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budget as any);
    await operationalFacade.finalizeBudget(budgetId);
    await operationalFacade.authorizeBudget(budgetId);

    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    const wo = wos[0];

    // Conclude with altered execution value (R$ 1350)
    await operationalFacade.completeWorkOrder(wo.id, 1350.00, 1350.00);

    const updatedBudget = await db.budgets.get(budgetId);
    const updatedWO = await db.workOrders.get(wo.id);
    const financeService = new SimpleFinanceService();
    const financeRecord = (await financeService.listRecords()).find(r => r.workOrderId === wo.id);

    console.log(`Original Budget chargedValue: R$ ${updatedBudget?.chargedValue}`);
    console.log(`WorkOrder executedValue: R$ ${updatedWO?.executedValue}`);
    console.log(`FinanceRecord expectedValue: R$ ${financeRecord?.expectedValue}`);

    expect(updatedWO?.executedValue).toBe(1350.00);
    expect(financeRecord?.expectedValue).toBe(1350.00);
  });

  it('Executes Block 6: Out-of-order completion and payment registration (Check duplications)', async () => {
    console.log('\n=== STARTING BLOCK 6 ===');
    const client = await db.clients.get('c-stress-1');
    const budgetId = 'b-ooo';
    const budget = {
      id: budgetId,
      companyId: 'default-co',
      clientId: client?.id,
      title: 'Out of Order Budget',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 2000.00,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budget as any);
    await operationalFacade.finalizeBudget(budgetId);
    await operationalFacade.authorizeBudget(budgetId);

    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    const wo = wos[0];

    // Try to register payment BEFORE concluding OS
    await operationalFacade.registerPayment(wo.id, 500.00);

    // Conclude OS subsequently
    await operationalFacade.completeWorkOrder(wo.id, 2000.00, 500.00);

    const financeRecords = await db.simpleFinanceRecords.where('workOrderId').equals(wo.id).toArray();
    console.log(`Number of finance records created for OS: ${financeRecords.length}`);
    for (const r of financeRecords) {
      console.log(`Record id: ${r.id}, expected: ${r.expectedValue}, received: ${r.receivedValue}`);
    }
  });

  it('Executes Block 8: Rapid Double actions (Double Click simulation)', async () => {
    console.log('\n=== STARTING BLOCK 8 ===');
    const client = await db.clients.get('c-stress-1');
    const budgetId = 'b-double';
    const budget = {
      id: budgetId,
      companyId: 'default-co',
      clientId: client?.id,
      title: 'Double action Budget',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1000.00,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budget as any);
    await operationalFacade.finalizeBudget(budgetId);

    // Click authorize budget twice rapidly
    const results = await Promise.allSettled([
      operationalFacade.authorizeBudget(budgetId),
      operationalFacade.authorizeBudget(budgetId)
    ]);
    console.log(`Authorize attempts results: A=${results[0].status}, B=${results[1].status}`);

    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    console.log(`Number of work orders created: ${wos.length}`);
    expect(wos.length).toBe(1);
    
    // Complete twice rapidly
    if (wos.length > 0) {
      const wo = wos[0];
      const compResults = await Promise.allSettled([
        operationalFacade.completeWorkOrder(wo.id, 1000.00, 1000.00),
        operationalFacade.completeWorkOrder(wo.id, 1000.00, 1000.00)
      ]);
      console.log(`Complete attempts results: A=${compResults[0].status}, B=${compResults[1].status}`);

      const financeRecords = await db.simpleFinanceRecords.where('workOrderId').equals(wo.id).toArray();
      console.log(`Number of finance records: ${financeRecords.length}`);
      expect(financeRecords.length).toBe(1);
    }
  });
});
