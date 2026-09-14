/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { dexieContractRepository } from '../repositories/dexieContractRepository';
import { Contract } from '../domain/contract';

export class ContractService {
  constructor(private readonly repository = dexieContractRepository) {}

  async getAll(): Promise<Contract[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<Contract | undefined> {
    return await this.repository.getById(id);
  }

  async getByClientId(clientId: string): Promise<Contract[]> {
    return await this.repository.getByClientId(clientId);
  }

  async add(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    return await this.repository.add(contract);
  }

  async update(contract: Contract): Promise<void> {
    return await this.repository.update(contract);
  }

  async delete(id: string): Promise<void> {
    return await this.repository.delete(id);
  }
}

export const contractService = new ContractService();
