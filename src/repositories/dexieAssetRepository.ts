import { db } from '../storage/dexieDatabase';
import { Asset } from '../domain/asset';

export class DexieAssetRepository {
  async getAll(): Promise<Asset[]> {
    return await db.assets.toArray();
  }

  async getById(id: string): Promise<Asset | undefined> {
    return await db.assets.get(id);
  }

  async getByClientId(clientId: string): Promise<Asset[]> {
    return await db.assets.where('clientId').equals(clientId).toArray();
  }

  async getBySiteId(siteId: string): Promise<Asset[]> {
    return await db.assets.where('siteId').equals(siteId).toArray();
  }

  async add(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? crypto.randomUUID() 
      : `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    await db.assets.add(newAsset);
    return newAsset;
  }

  async update(asset: Asset): Promise<void> {
    const now = new Date().toISOString();
    await db.assets.update(asset.id, {
      ...asset,
      updatedAt: now,
      syncStatus: 'pending'
    });
  }

  async delete(id: string): Promise<void> {
    await db.assets.delete(id);
  }

  async save(asset: Asset): Promise<void> {
    await db.assets.put(asset);
  }
}

export const dexieAssetRepository = new DexieAssetRepository();
