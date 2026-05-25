import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';
import { SupplierProfileRepository } from './supplierProfileRepository';
import { db } from '../storage/dexieDatabase';

export class DexieSupplierProfileRepository implements SupplierProfileRepository {
  async getAll(): Promise<SupplierProfile[]> {
    return await db.supplierProfiles.toArray();
  }

  async save(profile: SupplierProfile): Promise<void> {
    await db.supplierProfiles.put(profile);
  }

  async delete(id: string): Promise<void> {
    await db.supplierProfiles.delete(id);
  }

  async bulkAdd(profiles: SupplierProfile[]): Promise<void> {
    await db.supplierProfiles.bulkAdd(profiles);
  }
}

export const dexieSupplierProfileRepository = new DexieSupplierProfileRepository();
