import { generateUUID } from '../core/utils/idGenerator';
import { db } from '../storage/dexieDatabase';
import { Site } from '../domain/site';

export class DexieSiteRepository {
  async getAll(): Promise<Site[]> {
    return await db.sites.toArray();
  }

  async getById(id: string): Promise<Site | undefined> {
    return await db.sites.get(id);
  }

  async getByClientId(clientId: string): Promise<Site[]> {
    return await db.sites.where('clientId').equals(clientId).toArray();
  }

  async add(site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? generateUUID() 
      : `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
    const now = new Date().toISOString();
    const newSite: Site = {
      ...site,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    await db.sites.add(newSite);
    return newSite;
  }

  async update(site: Site): Promise<void> {
    const now = new Date().toISOString();
    await db.sites.update(site.id, {
      ...site,
      updatedAt: now,
      syncStatus: 'pending'
    });
  }

  async delete(id: string): Promise<void> {
    await db.sites.delete(id);
  }

  async save(site: Site): Promise<void> {
    await db.sites.put(site);
  }
}

export const dexieSiteRepository = new DexieSiteRepository();
