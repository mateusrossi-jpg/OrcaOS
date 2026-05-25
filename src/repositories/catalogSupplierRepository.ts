import { CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';

export interface CatalogSupplierRepository {
  getAll(): Promise<CatalogSupplier[]>;
  save(supplier: CatalogSupplier): Promise<void>;
  delete(id: string): Promise<void>;
  bulkAdd(suppliers: CatalogSupplier[]): Promise<void>;
}
