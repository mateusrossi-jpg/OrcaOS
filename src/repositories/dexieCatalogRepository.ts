import { CatalogHubItem } from '../features/catalog/storage/catalogHubStorage';
import { CatalogRepository } from './catalogRepository';
import { db } from '../storage/dexieDatabase';

export class DexieCatalogRepository implements CatalogRepository {
  async getAll(): Promise<CatalogHubItem[]> {
    return await db.catalog.toArray();
  }

  async save(item: CatalogHubItem): Promise<void> {
    await db.catalog.put(item);
  }

  async delete(id: string): Promise<void> {
    await db.catalog.delete(id);
  }

  async bulkAdd(items: CatalogHubItem[]): Promise<void> {
    await db.catalog.bulkAdd(items);
  }
}

export const dexieCatalogRepository = new DexieCatalogRepository();
