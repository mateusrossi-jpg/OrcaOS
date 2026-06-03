import { generateUUID } from '../core/utils/idGenerator';
import { maintenancePlanService } from './maintenancePlanService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { workOrderService } from './workOrderService';
import { operationalEventService } from './operationalEventService';
import { MaintenancePlan } from '../domain/maintenancePlan';

import { db } from '../storage/dexieDatabase';

export class MaintenanceSchedulerService {
  /**
   * Scans all active maintenance plans and generates WorkOrder drafts for upcoming dates.
   * Lead time: 7 days before nextExecutionDate.
   */
  async processActivePlans(): Promise<void> {
    const activePlans = await maintenancePlanService.getAll();
    const activeOnly = activePlans.filter(p => p.isActive);
    
    const now = new Date();
    const leadTimeDays = 7;
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + leadTimeDays);

    const allWorkOrders = await workOrderService.getAll();

    for (const plan of activeOnly) {
      const nextDate = new Date(plan.nextExecutionDate);
      
      // Check if plan is due within lead time
      if (nextDate <= thresholdDate) {
        // Check if an uncompleted OS already exists for this plan/date combination
        // We look for any OS with the same title prefix and assetId that isn't DONE
        const alreadyScheduled = allWorkOrders.some(wo => 
          wo.clientId === plan.clientId &&
          Array.isArray(wo.assetIds) && wo.assetIds.includes(plan.assetId) &&
          wo.title.includes(plan.title) &&
          wo.status !== 'done' &&
          wo.status !== 'cancelled'
        );

        if (!alreadyScheduled) {
          await this.generatePreventiveOS(plan);
        }
      }
    }
  }

  private async generatePreventiveOS(plan: MaintenancePlan): Promise<void> {
    const attendanceId = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? generateUUID() 
      : `att-prev-${Date.now()}`;
    
    const newAttendance = {
      id: attendanceId,
      clientId: plan.clientId,
      siteId: plan.siteId || 'default-site',
      status: 'iniciado' as const,
      companyId: 'default-company',
      workspaceId: 'default-workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      totalWorkOrders: 0,
      completedWorkOrders: 0,
      totalBudgets: 0,
      authorizedBudgets: 0,
      revenueExecuted: 0,
      revenuePlanned: 0
    };

    await db.attendances.add(newAttendance);

    const newOsId = generateUUID();
    
    await operationalFacade.createWorkOrder({
      id: newOsId,
      clientId: plan.clientId,
      siteId: plan.siteId,
      assetIds: [plan.assetId],
      title: `[PREVENTIVA] ${plan.title}`,
      description: `Manutenção programada conforme plano ${plan.frequency}. \nChecklist: \n${plan.checklistTemplate?.map(t => `- [ ] ${t}`).join('\n') || 'Nenhum checklist definido.'}`,
      status: 'draft',
      scheduledDate: plan.nextExecutionDate,
      paymentStatus: 'pending',
      executedValue: 0,
      items: [],
      attendanceId: attendanceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    await operationalEventService.emitEvent({
      aggregateId: plan.id,
      aggregateType: 'maintenance_plan',
      eventType: 'PREVENTIVE_WORKORDER_GENERATED',
      metadata: { clientId: plan.clientId, assetId: plan.assetId, workOrderId: newOsId },
      snapshot: { planId: plan.id, workOrderId: newOsId, scheduledDate: plan.nextExecutionDate }
    });
  }
}

export const maintenancePlanScheduler = new MaintenanceSchedulerService();
