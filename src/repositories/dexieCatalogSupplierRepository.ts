import { CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';
import { CatalogSupplierRepository } from './catalogSupplierRepository';
import { db } from '../storage/dexieDatabase';

export class DexieCatalogSupplierRepository implements CatalogSupplierRepository {
  async getAll(): Promise<CatalogSupplier[]> {
    return await db.catalogSuppliers.toArray();
  }

  async save(supplier: CatalogSupplier): Promise<void> {
    await db.catalogSuppliers.put(supplier);
  }

  async delete(id: string): Promise<void> {
    await db.catalogSuppliers.delete(id);
  }

  async bulkAdd(suppliers: CatalogSupplier[]): Promise<void> {
    await db.catalogSuppliers.bulkAdd(suppliers);
  }
}

export const dexieCatalogSupplierRepository = new DexieCatalogSupplierRepository();
