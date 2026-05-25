import { CatalogHubItem } from '../features/catalog/storage/catalogHubStorage';
import { dexieCatalogRepository } from '../repositories/dexieCatalogRepository';

export class CatalogService {
  constructor(private readonly repository = dexieCatalogRepository) {}

  async getAll(): Promise<CatalogHubItem[]> {
    const items = await this.repository.getAll();
    return items.sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
  }

  async save(item: CatalogHubItem): Promise<void> {
    const now = new Date().toISOString();
    await this.repository.save({
      ...item,
      updatedAt: now,
      createdAt: item.createdAt || now
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export const catalogService = new CatalogService();
