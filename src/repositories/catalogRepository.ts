import { CatalogHubItem } from '../features/catalog/storage/catalogHubStorage';

export interface CatalogRepository {
  getAll(): Promise<CatalogHubItem[]>;
  save(item: CatalogHubItem): Promise<void>;
  delete(id: string): Promise<void>;
  bulkAdd(items: CatalogHubItem[]): Promise<void>;
}
