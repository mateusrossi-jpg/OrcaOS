import { db } from '../database/db';
import type { CatalogItem } from '../database/schema';
import { createId } from '../../app/utils/idHelpers';

export class CatalogRepository {
  async getAll(): Promise<CatalogItem[]> {
    return db.catalog_items.toArray();
  }

  async getById(id: string): Promise<CatalogItem | undefined> {
    return db.catalog_items.get(id);
  }

  async create(item: Omit<CatalogItem, 'id'>): Promise<CatalogItem> {
    const newItem = { ...item, id: createId('catalog') } as CatalogItem;
    await db.catalog_items.add(newItem);
    return newItem;
  }

  async update(id: string, updates: Partial<CatalogItem>): Promise<void> {
    await db.catalog_items.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    await db.catalog_items.delete(id);
  }
}

export const catalogRepository = new CatalogRepository();
