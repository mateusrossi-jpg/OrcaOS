import { CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';
import { dexieCatalogSupplierRepository } from '../repositories/dexieCatalogSupplierRepository';

export class CatalogSupplierService {
  constructor(private readonly repository = dexieCatalogSupplierRepository) {}

  async getAll(): Promise<CatalogSupplier[]> {
    const suppliers = await this.repository.getAll();
    return suppliers.sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
  }

  async save(supplier: CatalogSupplier): Promise<void> {
    const now = new Date().toISOString();
    await this.repository.save({
      ...supplier,
      updatedAt: now,
      createdAt: supplier.createdAt || now
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export const catalogSupplierService = new CatalogSupplierService();
