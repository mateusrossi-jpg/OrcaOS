import { db } from './storage/dexieDatabase';
import { clientService } from './services/clientService';
import { siteService } from './services/siteService';
import { operationalFacade } from './features/workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from './domain/budget';
import { SimpleFinanceService } from './services/SimpleFinanceService';

async function run() {
  try {
    console.log("--- SIMULATING BUDGET -> OS -> FINANCE ---");
    
    // 1. Create a client
    const newClient = await clientService.add({
      name: "Cliente Simulação",
      phone: "11999999999",
      notes: "Simulação de teste",
    });
    console.log("1. Created Client:", newClient.id);

    // 2. Create an attendance
    const attendanceId = `att-sim-${Date.now()}`;
    await db.attendances.add({
      id: attendanceId,
      clientId: newClient.id,
      siteId: 'default-site',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("2. Created Attendance:", attendanceId);

    // 3. Create and finalize a budget
    const budgetId = `bdg-sim-${Date.now()}`;
    const budgetValue = 1250.75;
    const budget: Budget = {
      id: budgetId,
      title: 'Projeto de Simulação',
      clientId: newClient.id,
      siteId: 'default-site',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: budgetValue,
      materialCost: 200,
      travelCost: 50,
      helperCost: 0,
      fees: 0,
      discounts: 0,
      otherCosts: 0,
      items: [
        {
          id: `item-1`,
          description: 'Mão de Obra Especializada',
          quantity: 1,
          unitPrice: budgetValue,
          category: 'labor',
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attendanceId: attendanceId,
    };

    await operationalFacade.saveBudget(budget);
    console.log("3a. Saved Budget:", budgetId);
    
    await operationalFacade.finalizeBudget(budgetId);
    console.log("3b. Finalized Budget (Now it should be 'em_revisao' or 'enviado')");
    
    // Wait, finalizeBudget makes it 'em_revisao'. It only generates OS if it's authorized.
    // Let's authorize it.
    await operationalFacade.authorizeBudget(budgetId);
    console.log("3c. Authorized Budget (This creates OS)");

    // 4. Verify Work Orders
    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    console.log("4. Work Orders created:", wos.length);
    let osId = "";
    if (wos.length > 0) {
      osId = wos[0].id;
      console.log("   OS ID:", osId, "| OS Status:", wos[0].status, "| OS Value:", wos[0].executedValue);
    } else {
      console.log("   FAILED TO CREATE OS. Creating manually just in case...");
      const { workOrderService } = await import('./services/workOrderService');
      osId = `os-sim-${Date.now()}`;
      await workOrderService.add({
        id: osId,
        budgetId: budgetId,
        clientId: newClient.id,
        siteId: 'default-site',
        title: budget.title,
        status: 'scheduled',
        scheduledDate: new Date().toISOString().split('T')[0],
        originalValue: budgetValue,
        executedValue: budgetValue,
        attendanceId: attendanceId,
      } as any);
      console.log("   Manually created OS:", osId);
    }

    // 5. Check Finance
    const financeService = new SimpleFinanceService();
    let records = await financeService.listRecords();
    let simRecord = records.find(r => r.id === osId);
    console.log("5a. Finance Record BEFORE payment:");
    console.log("   Found:", !!simRecord, "| Expected:", simRecord?.expectedValue, "| Received:", simRecord?.receivedValue, "| Open:", simRecord?.openBalance);

    // 6. Execute payment
    await operationalFacade.registerPayment(osId, 1000);
    console.log("6. Registered partial payment of R$ 1000");

    // 7. Check Finance Again
    records = await financeService.listRecords();
    simRecord = records.find(r => r.id === osId);
    console.log("7. Finance Record AFTER partial payment:");
    console.log("   Found:", !!simRecord, "| Expected:", simRecord?.expectedValue, "| Received:", simRecord?.receivedValue, "| Open:", simRecord?.openBalance);
    
    await operationalFacade.registerPayment(osId, 250.75);
    console.log("8. Registered rest of payment (R$ 250.75)");

    records = await financeService.listRecords();
    simRecord = records.find(r => r.id === osId);
    console.log("9. Finance Record AFTER full payment:");
    console.log("   Found:", !!simRecord, "| Status:", simRecord?.status, "| Received:", simRecord?.receivedValue, "| Open:", simRecord?.openBalance);


    console.log("--- SIMULATION FINISHED ---");
  } catch (err) {
    console.error("Simulation error:", err);
  }
  process.exit(0);
}

run();
