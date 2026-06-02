import { describe, it, expect, beforeAll, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { ATTENDANCE_STATUS } from '../domain/attendance';
import { attendanceAggregationService } from '../services/AttendanceAggregationService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { operationalReadModelService } from '../services/operationalReadModelService';
import { maintenancePlanService } from '../services/maintenancePlanService';
import { maintenancePlanScheduler } from '../services/MaintenanceSchedulerService';
import { workOrderService } from '../services/workOrderService';
import { conflictDetectionService } from '../services/ConflictDetectionService';
import { cloudSyncService } from '../services/CloudSyncService';
import { supabase } from '../core/cloud/supabaseClient';

// Mock Supabase completely for offline sync tests
vi.mock('../core/cloud/supabaseClient', () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  }));
  return {
    supabase: {
      from: mockFrom,
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'mock-user-id' }
            }
          },
          error: null
        })
      }
    },
    isCloudEnabled: true
  };
});

describe('AFERIX PHASE 2.5: HARDENING & CORPORATE VALIDATION TESTS', () => {
  beforeAll(async () => {
    await db.attendances.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
    await db.maintenancePlans.clear();
    await db.clients.clear();
  });

  it('TEST 1: MÚLTIPLOS ORÇAMENTOS CONCORRENTES (Extreme Commercial States)', async () => {
    // Setup Client & Attendance
    await db.clients.add({
      id: 'client-hard-1',
      name: 'Cliente Corporativo Hardening 1',
      phone: '1199999999',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const attendanceId = 'att-hard-1';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-hard-1',
      siteId: 'site-hard-1',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create 5 Budgets with mix of approved/executing vs rejected/cancelled statuses
    const budgets = [
      { id: 'b-h1-1', clientId: 'client-hard-1', siteId: 'site-hard-1', title: 'Orçamento A', status: BUDGET_STATUS.AUTORIZADO, chargedValue: 1200, attendanceId, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-h1-2', clientId: 'client-hard-1', siteId: 'site-hard-1', title: 'Orçamento B', status: BUDGET_STATUS.RECUSADO, chargedValue: 3000, attendanceId, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-h1-3', clientId: 'client-hard-1', siteId: 'site-hard-1', title: 'Orçamento C', status: BUDGET_STATUS.RECUSADO, chargedValue: 5000, attendanceId, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-h1-4', clientId: 'client-hard-1', siteId: 'site-hard-1', title: 'Orçamento D', status: BUDGET_STATUS.CANCELADO, chargedValue: 8000, attendanceId, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b-h1-5', clientId: 'client-hard-1', siteId: 'site-hard-1', title: 'Orçamento E', status: BUDGET_STATUS.EM_EXECUCAO, chargedValue: 2800, attendanceId, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    for (const b of budgets) {
      await db.budgets.add(b);
    }

    // Trigger recalculation
    await attendanceAggregationService.recalculate(attendanceId);

    const att = await db.attendances.get(attendanceId);
    expect(att).toBeDefined();
    
    // Status must be 'autorizado' since budgets are authorized/executing but NO OS has been started yet
    expect(att?.status).toBe('autorizado');
    expect(att?.totalBudgets).toBe(5);
    expect(att?.authorizedBudgets).toBe(2); // b-h1-1 & b-h1-5
    
    // Revenue Planned must only sum AUTORIZADO and EM_EXECUCAO (1200 + 2800 = 4000)
    // Must strictly ignore rejected (3000, 5000) and cancelled (8000) budgets
    expect(att?.revenuePlanned).toBe(4000);
    expect(att?.revenueExecuted).toBe(0);

    // Verify CRM Read Model
    operationalReadModelService.invalidate('crm');
    const crmProj = await operationalReadModelService.getClientPipelineProjection();
    const clientProj = crmProj['client-hard-1'];
    expect(clientProj).toBeDefined();
    expect(clientProj.totalRevenue).toBe(4000);
    expect(clientProj.activeBudgets).toBe(2);
    expect(clientProj.totalProposals).toBe(5);
    expect(clientProj.totalProposalsApproved).toBe(2);
  });

  it('TEST 2: MÚLTIPLAS OS COM STATUS MISTOS (Complex Execution Matrix)', async () => {
    const attendanceId = 'att-hard-2';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-hard-2',
      siteId: 'site-hard-2',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Mix of 12 OS: 4 done, 3 in_progress, 2 scheduled, 2 draft, 1 cancelled
    const distribution = [
      ...Array(4).fill('done'),
      ...Array(3).fill('in-progress'),
      ...Array(2).fill('scheduled'),
      ...Array(2).fill('draft'),
      ...Array(1).fill('cancelled'),
    ];

    for (let i = 0; i < distribution.length; i++) {
      await db.workOrders.add({
        id: `wo-h2-${i}`,
        clientId: 'client-hard-2',
        siteId: 'site-hard-2',
        title: `OS Mistos ${i}`,
        status: distribution[i],
        paymentStatus: 'pending',
        executedValue: 100,
        items: [],
        attendanceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await attendanceAggregationService.recalculate(attendanceId);

    const att = await db.attendances.get(attendanceId);
    expect(att).toBeDefined();
    
    // Expected Derived Status: em_execucao (because active in-progress OSs exist)
    expect(att?.status).toBe('em_execucao');
    expect(att?.totalWorkOrders).toBe(12);
    expect(att?.completedWorkOrders).toBe(4);
    
    // Progress calculation: completed / total OSs = 4 / 12 = 33%
    expect(att?.progress).toBe(33);
  });

  it('TEST 3: CANCELAMENTO PARCIAL (Workflow Integrity Isolation)', async () => {
    const attendanceId = 'att-hard-3';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-hard-3',
      siteId: 'site-hard-3',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const budgetId = 'b-hard-3';
    await db.budgets.add({
      id: budgetId,
      clientId: 'client-hard-3',
      siteId: 'site-hard-3',
      title: 'Orçamento Comercial',
      status: BUDGET_STATUS.EM_EXECUCAO,
      chargedValue: 6000,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 10 OS linked to this budget
    for (let i = 1; i <= 10; i++) {
      await db.workOrders.add({
        id: `wo-h3-${i}`,
        clientId: 'client-hard-3',
        siteId: 'site-hard-3',
        title: `OS ${i}`,
        status: 'draft',
        paymentStatus: 'pending',
        executedValue: 600,
        items: [],
        budgetId,
        attendanceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Cancel 5 and Complete 5
    for (let i = 1; i <= 5; i++) {
      const wo = await db.workOrders.get(`wo-h3-${i}`);
      if (wo) {
        wo.status = 'cancelled';
        await operationalFacade.updateWorkOrder(wo);
      }
    }
    for (let i = 6; i <= 10; i++) {
      await operationalFacade.completeWorkOrder(`wo-h3-${i}`, 600, 600, 'OS concluída com sucesso.');
    }

    // Verify budget remains open (EM_EXECUCAO) and has NOT been automatically closed or cancelled
    const budget = await db.budgets.get(budgetId);
    expect(budget?.status).toBe(BUDGET_STATUS.EM_EXECUCAO);
  });

  it('TEST 4: FINALIZAÇÃO FINANCEIRA TARDIA (Decoupled Checkout Control)', async () => {
    const attendanceId = 'att-hard-4';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-hard-4',
      siteId: 'site-hard-4',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const budgetId = 'b-hard-4';
    await db.budgets.add({
      id: budgetId,
      clientId: 'client-hard-4',
      siteId: 'site-hard-4',
      title: 'Orçamento Tardio',
      status: BUDGET_STATUS.EM_EXECUCAO,
      chargedValue: 4000,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create 8 OS
    for (let i = 1; i <= 8; i++) {
      await db.workOrders.add({
        id: `wo-h4-${i}`,
        clientId: 'client-hard-4',
        siteId: 'site-hard-4',
        title: `OS ${i}`,
        status: 'draft',
        paymentStatus: 'pending',
        executedValue: 500,
        items: [],
        budgetId,
        attendanceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Complete all 8 OS
    for (let i = 1; i <= 8; i++) {
      await operationalFacade.completeWorkOrder(`wo-h4-${i}`, 500, 500, 'Serviço executado.');
    }

    // Budget must remain EM_EXECUCAO even though all OSs are done
    let budget = await db.budgets.get(budgetId);
    expect(budget?.status).toBe(BUDGET_STATUS.EM_EXECUCAO);

    // Register late payments / finance records
    await operationalFacade.registerPayment('wo-h4-1', 200);

    // Budget still remains EM_EXECUCAO
    budget = await db.budgets.get(budgetId);
    expect(budget?.status).toBe(BUDGET_STATUS.EM_EXECUCAO);

    // Recalculate aggregates
    await attendanceAggregationService.recalculate(attendanceId);
    const att = await db.attendances.get(attendanceId);
    expect(att?.revenueExecuted).toBe(4200); // 4000 regular checkout payments + 200 late payment

    // Execute explicit checkout
    await operationalFacade.finalizeBudgetCycle(budgetId);

    // Budget is now strictly FINALIZADO and frozen
    budget = await db.budgets.get(budgetId);
    expect(budget?.status).toBe(BUDGET_STATUS.FINALIZADO);
  });

  it('TEST 5: PMOC MASSIVO (Performance & Integrity Scale)', async () => {
    // Setup 100 preventative maintenance plans
    const startTime = performance.now();

    for (let i = 1; i <= 100; i++) {
      await db.maintenancePlans.add({
        id: `plan-mass-${i}`,
        clientId: `client-pmoc-${i}`,
        siteId: `site-pmoc-${i}`,
        assetId: `asset-pmoc-${i}`,
        title: `Plano Preventivo Mensal ${i}`,
        frequency: 'monthly',
        nextExecutionDate: new Date().toISOString(),
        isActive: true,
        checklistTemplate: ['Verificar integridade']
      });
    }

    // Run massive scheduler routine
    await maintenancePlanScheduler.processActivePlans();
    const duration = performance.now() - startTime;

    // Validate execution speed is highly performant
    console.log(`[MassPMOCStress] Scheduled 100 plans in ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(2000); // Must execute under 2 seconds

    // Verify 100 Attendances and 100 linked WorkOrders were created
    const attendances = await db.attendances.toArray();
    const pmocAttendances = attendances.filter(a => a.id.startsWith('att-prev-') || a.id.length === 36);
    expect(pmocAttendances.length).toBeGreaterThanOrEqual(100);

    const workOrders = await db.workOrders.toArray();
    const pmocOSs = workOrders.filter(w => w.title.includes('[PREVENTIVA]'));
    expect(pmocOSs.length).toBeGreaterThanOrEqual(100);

    // Verify all preventive WorkOrders are connected to their parent Attendances
    for (const os of pmocOSs) {
      expect(os.attendanceId).toBeDefined();
      const parentAtt = await db.attendances.get(os.attendanceId!);
      expect(parentAtt).toBeDefined();
    }
  });

  it('TEST 6: DETECT OFFLINE CONFLICTS deterministically (LWW)', async () => {
    const eventId = 'evt-conflict-hardening';
    
    // Clear conflict list
    (conflictDetectionService as any).conflicts = [];

    // Local device event: update budget (older timestamp)
    const localEvent = {
      id: eventId,
      aggregateId: 'b-conflict-1',
      aggregateType: 'budget',
      eventType: 'BUDGET_UPDATED',
      timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      syncStatus: 'pending'
    };
    await db.operationalEvents.add(localEvent as any);

    // Mock Supabase returning a newer remote sequence / timestamp (+10 minutes later)
    const mockFrom = supabase.from as any;
    mockFrom.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: {
              timestamp: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
              sequence: 15
            },
            error: null
          })
        }))
      }))
    });

    // Run synchronization
    await cloudSyncService.syncLocalToCloud();

    // Verify conflict record was registered
    const conflicts = conflictDetectionService.getConflicts();
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    expect(conflicts[0].conflictType).toBe('stale_entity');

    // Verify that the local event was marked 'synced' or compacted/cleaned up from local storage
    const event = await db.operationalEvents.get(eventId);
    if (event) {
      expect((event as any).syncStatus).toBe('synced');
    } else {
      expect(event).toBeUndefined(); // Compacted
    }
  });

  it('TEST 7: DELETE SAFETY (Zero Orphan Cascade Strategy)', async () => {
    const attendanceId = 'att-delete-safety';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-del-1',
      siteId: 'site-del-1',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create 3 Budgets, 4 WorkOrders, 2 FinanceRecords linked to it
    for (let i = 1; i <= 3; i++) {
      await db.budgets.add({
        id: `b-del-${i}`,
        clientId: 'client-del-1',
        siteId: 'site-del-1',
        title: `Orçamento ${i}`,
        status: BUDGET_STATUS.INICIADO,
        chargedValue: 100,
        attendanceId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    for (let i = 1; i <= 4; i++) {
      await db.workOrders.add({
        id: `wo-del-${i}`,
        clientId: 'client-del-1',
        siteId: 'site-del-1',
        title: `OS ${i}`,
        status: 'draft',
        paymentStatus: 'pending',
        executedValue: 50,
        items: [],
        attendanceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await db.simpleFinanceRecords.add({
      id: 'f-del-1',
      title: 'Pagamento 1',
      clientId: 'client-del-1',
      workOrderId: 'wo-del-1',
      expectedValue: 50,
      receivedValue: 50,
      openBalance: 0,
      materialCost: 0,
      travelCost: 0,
      cardFee: 0,
      estimatedTax: 0,
      otherCosts: 0,
      status: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await db.simpleFinanceRecords.add({
      id: 'f-del-2',
      title: 'Pagamento 2',
      clientId: 'client-del-1',
      workOrderId: 'wo-del-2',
      expectedValue: 50,
      receivedValue: 0,
      openBalance: 50,
      materialCost: 0,
      travelCost: 0,
      cardFee: 0,
      estimatedTax: 0,
      otherCosts: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Delete the Attendance using our new Cascade Delete Facade Method
    await operationalFacade.deleteAttendance(attendanceId);

    // Verify all child elements are cascade-deleted completely
    const loadedAttendance = await db.attendances.get(attendanceId);
    expect(loadedAttendance).toBeUndefined();

    const loadedBudgets = await db.budgets.where('attendanceId').equals(attendanceId).toArray();
    expect(loadedBudgets).toHaveLength(0);

    const loadedWorkOrders = await db.workOrders.where('attendanceId').equals(attendanceId).toArray();
    expect(loadedWorkOrders).toHaveLength(0);

    const finances = await db.simpleFinanceRecords.toArray();
    const relatedFinances = finances.filter(f => f.workOrderId === 'wo-del-1' || f.workOrderId === 'wo-del-2');
    expect(relatedFinances).toHaveLength(0); // Zero orphans!
  });

  it('TEST 8: PERFORMANCE STRESS TEST (Materialized Projections scale)', async () => {
    // Populate database with massive record volume:
    // 1000 Attendances, 2000 WorkOrders, 1000 Budgets
    console.log('[StressTest] Populating Dexie database with high data volumes...');
    const startTime = performance.now();

    const attendanceRecords = [];
    const budgetRecords = [];
    const workOrderRecords = [];

    for (let i = 1; i <= 1000; i++) {
      attendanceRecords.push({
        id: `att-stress-${i}`,
        clientId: `client-stress-${i}`,
        siteId: `site-stress-${i}`,
        status: 'em_execucao' as const,
        progress: 50,
        totalWorkOrders: 2,
        completedWorkOrders: 1,
        totalBudgets: 1,
        authorizedBudgets: 1,
        revenuePlanned: 1000,
        revenueExecuted: 500,
        companyId: 'default-company',
        workspaceId: 'default-workspace',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      budgetRecords.push({
        id: `b-stress-${i}`,
        clientId: `client-stress-${i}`,
        siteId: `site-stress-${i}`,
        title: `Orçamento Stress ${i}`,
        status: BUDGET_STATUS.EM_EXECUCAO,
        chargedValue: 1000,
        attendanceId: `att-stress-${i}`,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      workOrderRecords.push({
        id: `wo-stress-${i}-1`,
        clientId: `client-stress-${i}`,
        siteId: `site-stress-${i}`,
        title: `OS ${i} - 1`,
        status: 'done' as const,
        paymentStatus: 'paid' as const,
        executedValue: 500,
        items: [],
        budgetId: `b-stress-${i}`,
        attendanceId: `att-stress-${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      workOrderRecords.push({
        id: `wo-stress-${i}-2`,
        clientId: `client-stress-${i}`,
        siteId: `site-stress-${i}`,
        title: `OS ${i} - 2`,
        status: 'in-progress' as const,
        paymentStatus: 'pending' as const,
        executedValue: 500,
        items: [],
        budgetId: `b-stress-${i}`,
        attendanceId: `att-stress-${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await db.attendances.bulkAdd(attendanceRecords);
    await db.budgets.bulkAdd(budgetRecords);
    await db.workOrders.bulkAdd(workOrderRecords);

    const populateDuration = performance.now() - startTime;
    console.log(`[StressTest] Populated database with 4000 records in ${populateDuration.toFixed(2)}ms`);

    // Verify CRM Read Model Projection under load
    const crmStart = performance.now();
    operationalReadModelService.invalidate('crm');
    const crmProj = await operationalReadModelService.getClientPipelineProjection();
    const crmDuration = performance.now() - crmStart;
    
    console.log(`[StressTest] Calculated Client Pipeline Projection under load in ${crmDuration.toFixed(2)}ms`);
    expect(crmDuration).toBeLessThan(200); // Must be super fast (sub-200ms)

    // Verify Attendance List fetch time is immediate
    const listStart = performance.now();
    const list = await db.attendances.toArray();
    const listDuration = performance.now() - listStart;
    console.log(`[StressTest] Fetched attendance list from Dexie in ${listDuration.toFixed(2)}ms`);
    expect(listDuration).toBeLessThan(50); // Under 50ms (direct index)
  });
});
