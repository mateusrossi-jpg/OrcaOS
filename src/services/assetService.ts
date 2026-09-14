/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { dexieAssetRepository } from '../repositories/dexieAssetRepository';
import { Asset } from '../domain/asset';
import { operationalEventService } from './operationalEventService';

export class AssetService {
  constructor(private readonly repository = dexieAssetRepository) {}

  async getAll(): Promise<Asset[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<Asset | undefined> {
    return await this.repository.getById(id);
  }

  async getByClientId(clientId: string): Promise<Asset[]> {
    return await this.repository.getByClientId(clientId);
  }

  async getBySiteId(siteId: string): Promise<Asset[]> {
    return await this.repository.getBySiteId(siteId);
  }

  async getByIds(ids: string[]): Promise<Asset[]> {
    const all = await this.repository.getAll();
    const idSet = new Set(ids);
    return all.filter(a => idSet.has(a.id));
  }

  async add(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const created = await this.repository.add(asset);
    await operationalEventService.emitEvent({
      aggregateId: created.id,
      aggregateType: 'asset',
      eventType: 'ASSET_REGISTERED',
      metadata: { assetId: created.id },
      snapshot: { ...created },
    });
    return created;
  }

  async update(asset: Asset): Promise<void> {
    await this.repository.update(asset);
    await operationalEventService.emitEvent({
      aggregateId: asset.id,
      aggregateType: 'asset',
      eventType: 'ASSET_UPDATED',
      metadata: { assetId: asset.id },
      snapshot: { ...asset },
    });
  }

  async delete(id: string): Promise<void> {
    return await this.repository.delete(id);
  }

  async duplicate(id: string): Promise<Asset | undefined> {
    const original = await this.repository.getById(id);
    if (!original) return undefined;
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = original;
    return await this.repository.add(rest);
  }
}

export const assetService = new AssetService();
