import { dexieMaintenancePlanRepository } from '../repositories/dexieMaintenancePlanRepository';
import { MaintenancePlan } from '../domain/maintenancePlan';
import { operationalEventService } from './operationalEventService';

export class MaintenancePlanService {
  constructor(private readonly repository = dexieMaintenancePlanRepository) {}

  async getAll(): Promise<MaintenancePlan[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<MaintenancePlan | undefined> {
    return await this.repository.getById(id);
  }

  async getByAssetId(assetId: string): Promise<MaintenancePlan[]> {
    return await this.repository.getByAssetId(assetId);
  }

  async add(plan: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenancePlan> {
    const createdPlan = await this.repository.add(plan);
    
    await operationalEventService.emitEvent({
      aggregateId: createdPlan.id,
      aggregateType: 'maintenance_plan',
      eventType: 'MAINTENANCE_PLAN_CREATED',
      metadata: { clientId: createdPlan.clientId, assetId: createdPlan.assetId, correlationId: undefined },
      snapshot: { ...createdPlan }
    });

    return createdPlan;
  }

  async update(plan: MaintenancePlan): Promise<void> {
    await this.repository.update(plan);

    await operationalEventService.emitEvent({
      aggregateId: plan.id,
      aggregateType: 'maintenance_plan',
      eventType: 'MAINTENANCE_PLAN_UPDATED',
      metadata: { clientId: plan.clientId, assetId: plan.assetId, correlationId: undefined },
      snapshot: { ...plan }
    });
  }

  async delete(id: string): Promise<void> {
    const plan = await this.getById(id);
    await this.repository.delete(id);
    
    if (plan) {
      await operationalEventService.emitEvent({
        aggregateId: id,
        aggregateType: 'maintenance_plan',
        eventType: 'MAINTENANCE_PLAN_ARCHIVED',
        metadata: { clientId: plan.clientId, assetId: plan.assetId, correlationId: undefined },
        snapshot: { ...plan, syncStatus: 'deleted' }
      });
    }
  }
}

export const maintenancePlanService = new MaintenancePlanService();
