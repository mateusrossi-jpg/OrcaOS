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

  async add(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const createdAsset = await this.repository.add(asset);
    
    await operationalEventService.emitEvent({
      aggregateId: createdAsset.id,
      aggregateType: 'asset',
      eventType: 'ASSET_REGISTERED',
      metadata: { clientId: createdAsset.clientId, correlationId: undefined },
      snapshot: { ...createdAsset }
    });

    return createdAsset;
  }

  async update(asset: Asset): Promise<void> {
    await this.repository.update(asset);

    await operationalEventService.emitEvent({
      aggregateId: asset.id,
      aggregateType: 'asset',
      eventType: 'ASSET_UPDATED',
      metadata: { clientId: asset.clientId, correlationId: undefined },
      snapshot: { ...asset }
    });
  }

  async delete(id: string): Promise<void> {
    const asset = await this.getById(id);
    await this.repository.delete(id);
    
    if (asset) {
      await operationalEventService.emitEvent({
        aggregateId: id,
        aggregateType: 'asset',
        eventType: 'ASSET_ARCHIVED',
        metadata: { clientId: asset.clientId, correlationId: undefined },
        snapshot: { ...asset, syncStatus: 'deleted' }
      });
    }
  }

  async duplicate(id: string): Promise<Asset> {
    const original = await this.getById(id);
    if (!original) throw new Error(`Asset ${id} not found`);

    const { id: _, createdAt, updatedAt, ...clonedData } = original;
    return await this.add({
      ...clonedData,
      name: `${original.name} (Cópia)`,
      tag: original.tag ? `${original.tag}-C` : undefined
    });
  }
}

export const assetService = new AssetService();
