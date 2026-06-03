import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { workOrderQueryService } from '../services/WorkOrderQueryService';

describe('Aferix Solo Route Final Validation Scenario Suite', () => {
  beforeAll(async () => {
    await db.clients.clear();
    await db.assets.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.attendances.clear();
  });

  it('Executes Scenarios 1 to 6 E2E and validates query consistency', async () => {
    // ----------------------------------------------------
    // CENÁRIO 1: Criar Cliente, Criar Orçamento, Autorizar
    // ----------------------------------------------------
    const client = {
      id: 'c-val-1',
      companyId: 'default-co',
      name: 'Cliente Validação Rota',
      email: 'validation@aferix.com.br',
      phone: '11999999999',
      createdAt: new Date().toISOString()
    };
    await db.clients.add(client as any);

    const budgetId = 'b-val-1';
    const budget = {
      id: budgetId,
      companyId: 'default-co',
      clientId: client.id,
      siteId: 'default-site',
      title: 'Orçamento Validação Rota',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1000.00,
      materialCost: 0,
      items: [{ id: 'item-1', description: 'Serviço de Teste', quantity: 1, unitPrice: 1000.00, category: 'labor' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await operationalFacade.saveBudget(budget as any);
    await operationalFacade.finalizeBudget(budgetId);
    await operationalFacade.authorizeBudget(budgetId);

    // Fetch the generated work order
    const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
    expect(wos.length).toBe(1);
    const wo = wos[0];

    console.log('--- RUNTIME VALIDATION RESULTS ---');
    console.log('--- SCENARIO 1 RESULT ---');
    console.log(`Budget ID: ${budgetId}`);
    console.log(`WorkOrder ID: ${wo.id}`);
    console.log(`Status da OS: ${wo.status}`);
    console.log(`scheduledDate: ${wo.scheduledDate}`);

    // ----------------------------------------------------
    // CENÁRIO 2: Abrir Agenda (Eligible work orders)
    // ----------------------------------------------------
    const agendaData = await workOrderQueryService.getEligibleWorkOrders();
    const appearsInAgenda = agendaData.scheduled.some(w => w.id === wo.id);
    console.log('\n--- SCENARIO 2 RESULT ---');
    console.log(`A OS aparece na Agenda? ${appearsInAgenda ? 'SIM' : 'NÃO'}`);
    expect(appearsInAgenda).toBe(true);

    // ----------------------------------------------------
    // CENÁRIO 3: Abrir Rota de Hoje (Today's route)
    // ----------------------------------------------------
    const routeData = await workOrderQueryService.getTodayRoute();
    const appearsInRoute = routeData.scheduled.some(w => w.id === wo.id);
    console.log('\n--- SCENARIO 3 RESULT ---');
    console.log(`A mesma OS aparece na Rota de Hoje? ${appearsInRoute ? 'SIM' : 'NÃO'}`);
    console.log(`ID: ${wo.id}`);
    console.log(`Status: ${wo.status}`);
    console.log(`Data: ${wo.scheduledDate}`);
    expect(appearsInRoute).toBe(true);

    // ----------------------------------------------------
    // CENÁRIO 4: Iniciar Execução
    // ----------------------------------------------------
    await operationalFacade.updateWorkOrder({
      ...wo,
      status: 'in-progress',
      updatedAt: new Date().toISOString()
    });

    const updatedWO = await db.workOrders.get(wo.id);
    expect(updatedWO?.status).toBe('in-progress');

    const agendaDataAfterStart = await workOrderQueryService.getEligibleWorkOrders();
    const appearsInAgendaAfterStart = agendaDataAfterStart.inProgress.some(w => w.id === wo.id);

    const routeDataAfterStart = await workOrderQueryService.getTodayRoute();
    const appearsInRouteAfterStart = routeDataAfterStart.inProgress.some(w => w.id === wo.id);

    console.log('\n--- SCENARIO 4 RESULT ---');
    console.log(`Status mudou para: ${updatedWO?.status}`);
    console.log(`Aparece na Agenda em progresso? ${appearsInAgendaAfterStart ? 'SIM' : 'NÃO'}`);
    console.log(`Aparece na Rota em progresso? ${appearsInRouteAfterStart ? 'SIM' : 'NÃO'}`);
    expect(appearsInAgendaAfterStart).toBe(true);
    expect(appearsInRouteAfterStart).toBe(true);

    // ----------------------------------------------------
    // CENÁRIO 5: Concluir Serviço
    // ----------------------------------------------------
    await operationalFacade.completeWorkOrder(wo.id, 1000.00, 1000.00);

    const completedWO = await db.workOrders.get(wo.id);
    expect(completedWO?.status).toBe('done');

    const financeRecords = await db.simpleFinanceRecords.where('workOrderId').equals(wo.id).toArray();
    const recordCreated = financeRecords.length > 0;
    const inheritedValue = recordCreated ? financeRecords[0].receivedValue : 0;

    console.log('\n--- SCENARIO 5 RESULT ---');
    console.log(`Status final: ${completedWO?.status}`);
    console.log(`FinanceRecord criado? ${recordCreated ? 'SIM' : 'NÃO'}`);
    console.log(`Valor herdado: R$ ${inheritedValue}`);
    expect(recordCreated).toBe(true);
    expect(inheritedValue).toBe(1000.00);

    // ----------------------------------------------------
    // CENÁRIO 6: VALIDAÇÃO DE PARIDADE (Done OS check)
    // ----------------------------------------------------
    const agendaDataFinal = await workOrderQueryService.getEligibleWorkOrders();
    const inAgendaFinal = agendaDataFinal.scheduled.some(w => w.id === wo.id) || agendaDataFinal.inProgress.some(w => w.id === wo.id);
    
    const routeDataFinal = await workOrderQueryService.getTodayRoute();
    const inRouteFinal = routeDataFinal.doneToday.some(w => w.id === wo.id);

    console.log('\n--- SCENARIO 6 PARITY TABLE ---');
    console.log(`OS_ID: ${wo.id}`);
    console.log(`AGENDA (Active): ${inAgendaFinal ? 'SIM' : 'NÃO'}`);
    console.log(`ROTA (Done Today): ${inRouteFinal ? 'SIM' : 'NÃO'}`);
    console.log(`FINANCEIRO: ${recordCreated ? 'SIM' : 'NÃO'}`);
  });
});
