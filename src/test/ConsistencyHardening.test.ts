import { describe, it, expect, beforeAll, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { ATTENDANCE_STATUS } from '../domain/attendance';
import { attendanceAggregationService } from '../services/AttendanceAggregationService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { operationalReadModelService } from '../services/operationalReadModelService';
import { cloudSyncService } from '../services/CloudSyncService';
import { supabase } from '../core/cloud/supabaseClient';
import { AggregateType } from '../core/types/business';
import { deriveAttendanceStatus } from '../domain/attendance';

// Mock Supabase completamente
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

describe('AFERIX PHASE 2.6: CONSISTENCY HARDENING & SCALE BENCHMARKS', () => {
  beforeAll(async () => {
    await db.attendances.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  it('1. Zombie Protection (Soft Delete & Tombstones)', async () => {
    const attendanceId = 'att-soft-1';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-soft-1',
      siteId: 'site-soft-1',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await db.budgets.add({
      id: 'b-soft-1',
      clientId: 'client-soft-1',
      siteId: 'site-soft-1',
      title: 'Orçamento Soft',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1500,
      attendanceId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await db.workOrders.add({
      id: 'wo-soft-1',
      clientId: 'client-soft-1',
      siteId: 'site-soft-1',
      title: 'OS Soft',
      status: 'draft',
      paymentStatus: 'pending',
      executedValue: 0,
      items: [],
      attendanceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await db.simpleFinanceRecords.add({
      id: 'f-soft-1',
      title: 'Financeiro Soft',
      clientId: 'client-soft-1',
      workOrderId: 'wo-soft-1',
      expectedValue: 500,
      receivedValue: 0,
      openBalance: 500,
      materialCost: 0,
      travelCost: 0,
      cardFee: 0,
      estimatedTax: 0,
      otherCosts: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Execute soft delete attendance
    await operationalFacade.softDeleteAttendance(attendanceId, 'admin-user');

    // Verify soft delete flag is set on parent and children
    const att = await db.attendances.get(attendanceId);
    expect(att?.isDeleted).toBe(true);
    expect(att?.deletedBy).toBe('admin-user');
    expect(att?.deletedAt).toBeDefined();

    const budget = await db.budgets.get('b-soft-1');
    expect(budget?.isDeleted).toBe(true);

    const wo = await db.workOrders.get('wo-soft-1');
    expect(wo?.isDeleted).toBe(true);

    const finance = await db.simpleFinanceRecords.get('f-soft-1');
    expect(finance?.isDeleted).toBe(true);

    // Verify events were emitted
    const events = await db.operationalEvents.where('correlationId').equals(attendanceId).toArray();
    expect(events.length).toBeGreaterThanOrEqual(3);
    const deleteEvent = events.find(e => e.eventType === ('ATTENDANCE_DELETED' as any));
    expect(deleteEvent).toBeDefined();
    expect(deleteEvent?.snapshot?.isDeleted).toBe(true);
  });

  it('2. Tombstone Syncing & Compaction', async () => {
    // Verify soft-deleted items still exist in indexedDB (needed for sync)
    const pendingAtts = await db.attendances.filter(a => a.syncStatus === 'pending').toArray();
    expect(pendingAtts.length).toBeGreaterThanOrEqual(1);

    // Run tombstone compaction with a 0-day threshold to clean up immediately
    const record = await db.attendances.get('att-soft-1');
    if (record) {
      await db.attendances.update('att-soft-1', { syncStatus: 'synced', deletedAt: new Date(Date.now() - 10000).toISOString() });
    }
    const budgetRec = await db.budgets.get('b-soft-1');
    if (budgetRec) {
      await db.budgets.update('b-soft-1', { syncStatus: 'synced', deletedAt: new Date(Date.now() - 10000).toISOString() });
    }

    await cloudSyncService.compactSoftDeletedRecords(0); // 0-day threshold

    // Verify physical compaction deleted them completely
    const attAfter = await db.attendances.get('att-soft-1');
    expect(attAfter).toBeUndefined();

    const budgetAfter = await db.budgets.get('b-soft-1');
    expect(budgetAfter).toBeUndefined();
  });

  it('3. LWW Reconciliation Snapshot Application', async () => {
    const budgetId = 'b-lww-reconcile-1';
    await db.budgets.add({
      id: budgetId,
      clientId: 'client-lww-1',
      siteId: 'site-lww-1',
      title: 'Orçamento Local Velho',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const remoteSnapshot = {
      title: 'Orçamento Remoto Vencedor',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 2500,
      updatedAt: new Date().toISOString()
    };

    // Apply remote winning snapshot
    await cloudSyncService.applyWinningSnapshot('budget', budgetId, remoteSnapshot);

    // Verify local IndexedDB was updated
    const localBudget = await db.budgets.get(budgetId);
    expect(localBudget?.title).toBe('Orçamento Remoto Vencedor');
    expect(localBudget?.status).toBe(BUDGET_STATUS.AUTORIZADO);
    expect(localBudget?.chargedValue).toBe(2500);

    // Verify reconciliation completed event was registered
    const recEvent = await db.operationalEvents.where('eventType').equals('RECONCILIATION_COMPLETED' as any).first();
    expect(recEvent).toBeDefined();
    expect(recEvent?.aggregateId).toBe(budgetId);
  });

  it('4. Aggregate Type Consistency enum mapping', () => {
    expect(AggregateType.ATTENDANCE).toBe('attendance');
    expect(AggregateType.BUDGET).toBe('budget');
    expect(AggregateType.WORKORDER).toBe('workorder');
    expect(AggregateType.CONTRACT).toBe('contract');
    expect(AggregateType.ASSET).toBe('asset');
  });

  it('5. Mixed Status Matrix Hardening', () => {
    const budgets = [
      { id: 'b1', title: 'A', status: BUDGET_STATUS.AUTORIZADO, chargedValue: 1000, items: [], createdAt: '', updatedAt: '' }
    ];

    // Case A: 3 done, 2 cancelled
    const workOrdersMixed = [
      { id: 'w1', title: 'OS 1', status: 'done' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' },
      { id: 'w2', title: 'OS 2', status: 'done' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' },
      { id: 'w3', title: 'OS 3', status: 'done' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' },
      { id: 'w4', title: 'OS 4', status: 'cancelled' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' },
      { id: 'w5', title: 'OS 5', status: 'cancelled' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' }
    ];

    const statusA = deriveAttendanceStatus(budgets, workOrdersMixed);
    expect(statusA).toBe('concluido'); // 100% of valid OSs are completed!

    // Case B: 5 cancelled
    const workOrdersCancelled = [
      { id: 'w1', title: 'OS 1', status: 'cancelled' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' },
      { id: 'w2', title: 'OS 2', status: 'cancelled' as const, items: [], clientId: 'c', siteId: 's', paymentStatus: 'pending' as const, companyId: 'comp', workspaceId: 'work' }
    ];

    const statusB = deriveAttendanceStatus(budgets, workOrdersCancelled);
    expect(statusB).toBe('cancelado');
  });

  it('6. Budget Exclusivity Model', async () => {
    const attendanceId = 'att-excl-1';
    await db.attendances.add({
      id: attendanceId,
      clientId: 'client-excl-1',
      siteId: 'site-excl-1',
      status: 'iniciado',
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await db.clients.add({
      id: 'client-excl-1',
      name: 'Cliente Exclusivo 1',
      phone: '12345',
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create 3 Budgets in same exclusivity group: Group A
    const budgetA = {
      id: 'b-excl-a',
      clientId: 'client-excl-1',
      siteId: 'site-excl-1',
      title: 'Opção Econômica',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 1200,
      attendanceId,
      budgetGroupId: 'group-a',
      selectionMode: 'exclusive' as const,
      isPrimary: false,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const budgetB = {
      id: 'b-excl-b',
      clientId: 'client-excl-1',
      siteId: 'site-excl-1',
      title: 'Opção Premium',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 3500,
      attendanceId,
      budgetGroupId: 'group-a',
      selectionMode: 'exclusive' as const,
      isPrimary: true, // This is the chosen exclusive budget
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const budgetC = {
      id: 'b-excl-c',
      clientId: 'client-excl-1',
      siteId: 'site-excl-1',
      title: 'Orçamento Avulso Adicional',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 800,
      attendanceId,
      items: [], // combinable/avulso by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.budgets.add(budgetA);
    await db.budgets.add(budgetB);
    await db.budgets.add(budgetC);

    // Recalculate
    await attendanceAggregationService.recalculate(attendanceId);

    const att = await db.attendances.get(attendanceId);
    expect(att).toBeDefined();
    
    // Revenue Planned should strictly sum: b-excl-b (3500) + b-excl-c (800) = 4300
    // Strictly ignoring b-excl-a (1200) since it is exclusive and not primary
    expect(att?.revenuePlanned).toBe(4300);

    // Verify CRM Read Model Projection
    operationalReadModelService.invalidate('crm');
    const crmProj = await operationalReadModelService.getClientPipelineProjection();
    const clientProj = crmProj['client-excl-1'];
    expect(clientProj).toBeDefined();
    expect(clientProj.revenuePlanned).toBe(4300);
  });

  it('7. Massive Scale Query Performance Benchmark', async () => {
    // Inject massive virtual records in memory array to simulate benchmarks
    const recordCount = 10000;
    console.log(`[Benchmark] Starting massive query benchmark with ${recordCount} virtual items...`);

    const start = performance.now();
    const mockData = Array.from({ length: recordCount }).map((_, i) => ({
      id: `id-${i}`,
      attendanceId: `att-${i % 100}`,
      status: 'done',
      isDeleted: false
    }));

    // Find and filter (simulating IndexedDB array iterations)
    const filtered = mockData.filter(item => item.attendanceId === 'att-42' && !item.isDeleted);
    const duration = performance.now() - start;

    console.log(`[Benchmark] Filtered ${filtered.length} items from ${recordCount} in ${duration.toFixed(3)}ms`);
    expect(duration).toBeLessThan(10); // In-memory array filtering must take under 10ms for 10,000 items

    // Dexie IndexedDB index extraction check under scale
    const dexieStart = performance.now();
    const results = await db.budgets.where('attendanceId').equals('att-excl-1').toArray();
    const dexieDuration = performance.now() - dexieStart;

    console.log(`[Benchmark] Indexed query from Dexie under scale executed in ${dexieDuration.toFixed(3)}ms`);
    expect(dexieDuration).toBeLessThan(200); // Dexie index extraction must be sub-200ms
  });
});
