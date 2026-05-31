import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { maintenancePlanService } from '../services/maintenancePlanService';
import { maintenancePlanScheduler } from '../services/MaintenanceSchedulerService';
import { workOrderService } from '../services/workOrderService';

describe('PHASE 3D: MAINTENANCE SCHEDULER INTEGRATION TEST', () => {
  beforeAll(async () => {
    await db.maintenancePlans.clear();
    await db.workOrders.clear();
    await db.operationalEvents.clear();
  });

  it('generates a WorkOrder draft when a plan is due within 7 days', async () => {
    const today = new Date();
    const in3Days = new Date();
    in3Days.setDate(today.getDate() + 3);

    // 1. Create an active maintenance plan due in 3 days
    const plan = await maintenancePlanService.add({
      clientId: 'client-1',
      siteId: 'site-1',
      assetId: 'asset-1',
      title: 'Limpeza de Filtros',
      frequency: 'monthly',
      nextExecutionDate: in3Days.toISOString(),
      isActive: true,
      checklistTemplate: ['Verificar dreno', 'Limpar serpentina']
    });

    // 2. Run the scheduler
    await maintenancePlanScheduler.processActivePlans();

    // 3. Verify that a WorkOrder was created
    const workOrders = await workOrderService.getAll();
    const preventiveOS = workOrders.find(wo => wo.clientId === 'client-1' && wo.assetIds?.includes('asset-1'));
    
    expect(preventiveOS).toBeDefined();
    expect(preventiveOS?.status).toBe('draft');
    expect(preventiveOS?.title).toContain('Limpeza de Filtros');
    expect(preventiveOS?.description).toContain('Verificar dreno');

    // 4. Verify that a PREVENTIVE_WORKORDER_GENERATED event was emitted
    const events = await db.operationalEvents.toArray();
    const event = events.find(e => e.eventType === 'PREVENTIVE_WORKORDER_GENERATED');
    expect(event).toBeDefined();
    expect(event?.aggregateId).toBe(plan.id);

    // 5. Run scheduler again - should NOT duplicate the OS
    await maintenancePlanScheduler.processActivePlans();
    const workOrdersAfter = await workOrderService.getAll();
    expect(workOrdersAfter.length).toBe(1);
  });

  it('does NOT generate a WorkOrder if the plan is due in 10 days (out of lead time)', async () => {
    await db.maintenancePlans.clear();
    await db.workOrders.clear();

    const in10Days = new Date();
    in10Days.setDate(new Date().getDate() + 10);

    await maintenancePlanService.add({
      clientId: 'client-2',
      siteId: 'site-2',
      assetId: 'asset-2',
      title: 'Revisão Anual',
      frequency: 'annual',
      nextExecutionDate: in10Days.toISOString(),
      isActive: true
    });

    await maintenancePlanScheduler.processActivePlans();

    const workOrders = await workOrderService.getAll();
    expect(workOrders.length).toBe(0);
  });
});
