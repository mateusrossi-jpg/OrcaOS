import { catalogRepository } from '../repositories/CatalogRepository';
import { enqueueMutation } from '../database/syncEngine';
import type { CatalogItem } from '../database/schema';

export class CatalogService {
  async getCatalogItems() {
    return catalogRepository.getAll();
  }

  async saveItem(editingId: string | null, data: Omit<CatalogItem, 'id'>) {
    if (editingId) {
      await catalogRepository.update(editingId, data);
      await enqueueMutation('catalog_items', 'UPDATE', { id: editingId, ...data });
    } else {
      const created = await catalogRepository.create(data);
      await enqueueMutation('catalog_items', 'INSERT', created);
    }
  }

  async deleteItem(id: string) {
    await catalogRepository.delete(id);
    await enqueueMutation('catalog_items', 'DELETE', { id });
  }
}

export const catalogService = new CatalogService();
