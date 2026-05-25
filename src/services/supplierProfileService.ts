import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';
import { dexieSupplierProfileRepository } from '../repositories/dexieSupplierProfileRepository';

export class SupplierProfileService {
  constructor(private readonly repository = dexieSupplierProfileRepository) {}

  async getAll(): Promise<SupplierProfile[]> {
    const profiles = await this.repository.getAll();
    return profiles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async save(profile: SupplierProfile): Promise<void> {
    const now = new Date().toISOString();
    await this.repository.save({
      ...profile,
      updatedAt: now,
      createdAt: profile.createdAt || now
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export const supplierProfileService = new SupplierProfileService();
