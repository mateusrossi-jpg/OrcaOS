import { dexieContractRepository } from '../repositories/dexieContractRepository';
import { Contract } from '../domain/contract';
import { operationalEventService } from './operationalEventService';

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
    const createdContract = await this.repository.add(contract);
    
    await operationalEventService.emitEvent({
      aggregateId: createdContract.id,
      aggregateType: 'contract',
      eventType: 'CONTRACT_CREATED',
      metadata: { clientId: createdContract.clientId, correlationId: undefined },
      snapshot: { ...createdContract }
    });

    return createdContract;
  }

  async update(contract: Contract): Promise<void> {
    await this.repository.update(contract);

    await operationalEventService.emitEvent({
      aggregateId: contract.id,
      aggregateType: 'contract',
      eventType: 'CONTRACT_UPDATED',
      metadata: { clientId: contract.clientId, correlationId: undefined },
      snapshot: { ...contract }
    });
  }

  async delete(id: string): Promise<void> {
    const contract = await this.getById(id);
    await this.repository.delete(id);
    
    if (contract) {
      await operationalEventService.emitEvent({
        aggregateId: id,
        aggregateType: 'contract',
        eventType: 'CONTRACT_ARCHIVED',
        metadata: { clientId: contract.clientId, correlationId: undefined },
        snapshot: { ...contract, syncStatus: 'deleted' }
      });
    }
  }
}

export const contractService = new ContractService();
