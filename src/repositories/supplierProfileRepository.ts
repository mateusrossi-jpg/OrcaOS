import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';

export interface SupplierProfileRepository {
  getAll(): Promise<SupplierProfile[]>;
  save(profile: SupplierProfile): Promise<void>;
  delete(id: string): Promise<void>;
  bulkAdd(profiles: SupplierProfile[]): Promise<void>;
}
