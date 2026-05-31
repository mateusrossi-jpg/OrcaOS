import { db } from '../storage/dexieDatabase';
import { Contract } from '../domain/contract';

export class DexieContractRepository {
  async getAll(): Promise<Contract[]> {
    return await db.contracts.toArray();
  }

  async getById(id: string): Promise<Contract | undefined> {
    return await db.contracts.get(id);
  }

  async getByClientId(clientId: string): Promise<Contract[]> {
    return await db.contracts.where('clientId').equals(clientId).toArray();
  }

  async add(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? crypto.randomUUID() 
      : `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
    const now = new Date().toISOString();
    const newContract: Contract = {
      ...contract,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    await db.contracts.add(newContract);
    return newContract;
  }

  async update(contract: Contract): Promise<void> {
    const now = new Date().toISOString();
    await db.contracts.update(contract.id, {
      ...contract,
      updatedAt: now,
      syncStatus: 'pending'
    });
  }

  async delete(id: string): Promise<void> {
    await db.contracts.delete(id);
  }

  async save(contract: Contract): Promise<void> {
    await db.contracts.put(contract);
  }
}

export const dexieContractRepository = new DexieContractRepository();
