import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { attendanceAggregationService } from '../services/AttendanceAggregationService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { operationalReadModelService } from '../services/operationalReadModelService';
import { maintenancePlanService } from '../services/maintenancePlanService';
import { maintenancePlanScheduler } from '../services/MaintenanceSchedulerService';
import { workOrderService } from '../services/workOrderService';

describe('AFERIX PHASE 2: MATERIALIZED AGGREGATES & COCKPIT HUB INTEGRATION TESTS', () => {
  beforeAll(async () => {
    await db.attendances.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
    await db.maintenancePlans.clear();
  });

  it('Scenario A: 1 Attendance -> 3 Budgets. Verifies CRM Read Model and aggregate materialization', async () => {
    // 0. Create client record
    await db.clients.add({
      id: 'client-scenario-a',
      name: 'Client Scenario A',
      phone: '123456789',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 1. Create client and attendance
    const attendanceId = 'att-scenario-a';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-scenario-a',
      siteId: 'site-scenario-a',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Create 3 budgets
    const budget1 = {
      id: 'b-scenario-a-1',
      clientId: 'client-scenario-a',
      siteId: 'site-scenario-a',
      title: 'Orçamento 1',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 1000,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const budget2 = {
      id: 'b-scenario-a-2',
      clientId: 'client-scenario-a',
      siteId: 'site-scenario-a',
      title: 'Orçamento 2',
      status: BUDGET_STATUS.EM_EXECUCAO,
      chargedValue: 1500,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const budget3 = {
      id: 'b-scenario-a-3',
      clientId: 'client-scenario-a',
      siteId: 'site-scenario-a',
      title: 'Orçamento 3',
      status: BUDGET_STATUS.RECUSADO,
      chargedValue: 2000,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await operationalFacade.saveBudget(budget1);
    await operationalFacade.saveBudget(budget2);
    await operationalFacade.saveBudget(budget3);

    // 3. Recalculate
    await attendanceAggregationService.recalculate(attendanceId);

    // 4. Verify attendance materialized aggregates
    const att = await db.attendances.get(attendanceId);
    expect(att).toBeDefined();
    expect(att?.totalBudgets).toBe(3);
    expect(att?.authorizedBudgets).toBe(2); // budget1 and budget2 are authorized/executing
    expect(att?.revenuePlanned).toBe(2500); // 1000 + 1500

    // 5. Verify CRM Read Model
    operationalReadModelService.invalidate('crm'); // clear cache to force compute
    const crmProj = await operationalReadModelService.getClientPipelineProjection();
    const clientProj = crmProj['client-scenario-a'];
    expect(clientProj).toBeDefined();
    expect(clientProj.totalRevenue).toBe(2500);
    expect(clientProj.revenuePlanned).toBe(2500);
    expect(clientProj.activeBudgets).toBe(2);
    expect(clientProj.totalProposals).toBe(3);
    expect(clientProj.totalProposalsApproved).toBe(2);
  });

  it('Scenario B: 1 Attendance -> 12 WorkOrders. Verifies progress percentages and derived status', async () => {
    await db.clients.add({
      id: 'client-scenario-b',
      name: 'Client Scenario B',
      phone: '987654321',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const attendanceId = 'att-scenario-b';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-scenario-b',
      siteId: 'site-scenario-b',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create 12 WorkOrders
    for (let i = 1; i <= 12; i++) {
      await db.workOrders.add({
        id: `wo-scenario-b-${i}`,
        clientId: 'client-scenario-b',
        siteId: 'site-scenario-b',
        title: `OS ${i}`,
        status: i <= 6 ? 'done' : i <= 10 ? 'draft' : 'cancelled',
        paymentStatus: 'pending',
        executedValue: 0,
        items: [],
        attendanceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Recalculate aggregates
    await attendanceAggregationService.recalculate(attendanceId);

    const att = await db.attendances.get(attendanceId);
    expect(att).toBeDefined();
    expect(att?.totalWorkOrders).toBe(12);
    expect(att?.completedWorkOrders).toBe(6);
    expect(att?.progress).toBe(50); // 6 / 12 * 100
    expect(att?.status).toBe('iniciado'); // No OS is in-progress and no budgets exist

    // Now promote one OS to in-progress
    const wo = await db.workOrders.get('wo-scenario-b-7');
    if (wo) {
      wo.status = 'in-progress';
      await operationalFacade.updateWorkOrder(wo);
    }

    const attUpdated = await db.attendances.get(attendanceId);
    expect(attUpdated?.status).toBe('em_execucao');
  });

  it('Scenario C: 1 Budget -> 12 OSs. Verifies explicit checkout flow and faturamento independence', async () => {
    await db.clients.add({
      id: 'client-scenario-c',
      name: 'Client Scenario C',
      phone: '11223344',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const attendanceId = 'att-scenario-c';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-scenario-c',
      siteId: 'site-scenario-c',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const budgetId = 'b-scenario-c';
    const budget = {
      id: budgetId,
      clientId: 'client-scenario-c',
      siteId: 'site-scenario-c',
      title: 'Orçamento Principal',
      status: BUDGET_STATUS.EM_EXECUCAO,
      chargedValue: 5000,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await operationalFacade.saveBudget(budget);

    // Create 12 workorders linked to the budget
    for (let i = 1; i <= 12; i++) {
      await db.workOrders.add({
        id: `wo-scenario-c-${i}`,
        clientId: 'client-scenario-c',
        siteId: 'site-scenario-c',
        title: `OS Preventiva ${i}`,
        status: 'draft',
        paymentStatus: 'pending',
        executedValue: 300,
        items: [],
        budgetId,
        attendanceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Complete the first OS using operationalFacade
    await operationalFacade.completeWorkOrder('wo-scenario-c-1', 300, 300, 'OS concluída com sucesso.');

    // Verify work order status is done
    const completedWO = await db.workOrders.get('wo-scenario-c-1');
    expect(completedWO?.status).toBe('done');

    // VERIFY THAT BUDGET STILL REMAINS 'em_execucao' (NO CASCADE!)
    const loadedBudget = await db.budgets.get(budgetId);
    expect(loadedBudget?.status).toBe(BUDGET_STATUS.EM_EXECUCAO); // Must be em_execucao, not finalizado!

    // Verify cash register / payment record was registered
    const finances = await db.simpleFinanceRecords.toArray();
    const relatedFinance = finances.find(f => f.workOrderId === 'wo-scenario-c-1');
    expect(relatedFinance).toBeDefined();
    expect(relatedFinance?.receivedValue).toBe(300);

    // Verify Attendance aggregate was recalculated
    const att = await db.attendances.get(attendanceId);
    expect(att?.completedWorkOrders).toBe(1);
    expect(att?.revenueExecuted).toBe(300); // 300 executed from this payment!

    // NOW EXECUTE EXPLICIT CHECKOUT
    await operationalFacade.finalizeBudgetCycle(budgetId);

    // Verify budget is finally FINALIZADO
    const finalizedBudget = await db.budgets.get(budgetId);
    expect(finalizedBudget?.status).toBe(BUDGET_STATUS.FINALIZADO);
  });

  it('Scenario D: PMOC Preventive Container. Verifies Maintenance Scheduler generates Attendance + OS', async () => {
    await db.clients.add({
      id: 'client-pmoc',
      name: 'Client PMOC Corp',
      phone: '55667788',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const today = new Date();
    const in2Days = new Date();
    in2Days.setDate(today.getDate() + 2);

    // Add active maintenance plan
    const plan = await maintenancePlanService.add({
      clientId: 'client-pmoc',
      siteId: 'site-pmoc',
      assetId: 'asset-pmoc',
      title: 'Plano de Manutenção Preventiva PMOC',
      frequency: 'monthly',
      nextExecutionDate: in2Days.toISOString(),
      isActive: true,
      checklistTemplate: ['Verificar ruído compressor', 'Substituir filtros de ar']
    });

    // Run scheduler
    await maintenancePlanScheduler.processActivePlans();

    // Verify that a WorkOrder was generated
    const workOrders = await workOrderService.getAll();
    const pmocOS = workOrders.find(wo => wo.clientId === 'client-pmoc');
    expect(pmocOS).toBeDefined();
    expect(pmocOS?.status).toBe('draft');
    
    // VERIFY THAT AN ATTENDANCE CONTAINER WAS CREATED AND LINKED
    expect(pmocOS?.attendanceId).toBeDefined();
    const att = await db.attendances.get(pmocOS!.attendanceId!);
    expect(att).toBeDefined();
    expect(att?.clientId).toBe('client-pmoc');
    expect(att?.siteId).toBe('site-pmoc');
  });
});
