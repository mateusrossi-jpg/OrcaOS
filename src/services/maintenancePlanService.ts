/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { dexieMaintenancePlanRepository } from '../repositories/dexieMaintenancePlanRepository';
import { MaintenancePlan } from '../domain/maintenancePlan';

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

  async getActivePlans(): Promise<MaintenancePlan[]> {
    return await this.repository.getActivePlans();
  }

  async add(plan: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenancePlan> {
    return await this.repository.add(plan);
  }

  async update(plan: MaintenancePlan): Promise<void> {
    return await this.repository.update(plan);
  }

  async delete(id: string): Promise<void> {
    return await this.repository.delete(id);
  }
}

export const maintenancePlanService = new MaintenancePlanService();
