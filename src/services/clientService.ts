import { dexieClientRepository } from '../repositories/dexieClientRepository';
import { Client } from '../domain/client';
import { operationalEventService } from './operationalEventService';

export class ClientService {
  constructor(private readonly repository = dexieClientRepository) {}

  async getAll(): Promise<Client[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<Client | undefined> {
    return await this.repository.getById(id);
  }

  async add(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const createdClient = await this.repository.add(client);
    
    await operationalEventService.emitEvent({
      aggregateId: createdClient.id,
      aggregateType: 'client',
      eventType: 'CLIENT_CREATED',
      metadata: { clientId: createdClient.id, correlationId: undefined },
      snapshot: { ...createdClient }
    });

    return createdClient;
  }

  async update(client: Client): Promise<void> {
    await this.repository.update(client);

    await operationalEventService.emitEvent({
      aggregateId: client.id,
      aggregateType: 'client',
      eventType: 'CLIENT_UPDATED',
      metadata: { clientId: client.id, correlationId: undefined },
      snapshot: { ...client }
    });
  }

  async delete(id: string): Promise<void> {
    const client = await this.getById(id);
    await this.repository.delete(id);
    
    if (client) {
      await operationalEventService.emitEvent({
        aggregateId: id,
        aggregateType: 'client',
        eventType: 'CLIENT_ARCHIVED',
        metadata: { clientId: id, correlationId: undefined },
        snapshot: { ...client, syncStatus: 'deleted' }
      });
    }
  }
}

export const clientService = new ClientService();
