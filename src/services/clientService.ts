import { dexieClientRepository } from '../repositories/dexieClientRepository';
import { Client } from '../domain/client';

export class ClientService {
  constructor(private readonly repository = dexieClientRepository) {}

  async getAll(): Promise<Client[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<Client | undefined> {
    return await this.repository.getById(id);
  }

  async add(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    return await this.repository.add(client);
  }

  async update(client: Client): Promise<void> {
    return await this.repository.update(client);
  }

  async delete(id: string): Promise<void> {
    return await this.repository.delete(id);
  }
}

export const clientService = new ClientService();
