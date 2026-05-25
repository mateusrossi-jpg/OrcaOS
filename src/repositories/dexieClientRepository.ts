import { Client } from '../domain/client';
import { ClientRepository } from './clientRepository';
import { db } from '../storage/dexieDatabase';
import { createId } from '../app/utils/idHelpers';

export class DexieClientRepository implements ClientRepository {
  async getAll(): Promise<Client[]> {
    return await db.clients.toArray();
  }

  async getById(id: string): Promise<Client | undefined> {
    return await db.clients.get(id);
  }

  async add(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const now = new Date().toISOString();
    const client: Client = {
      ...clientData,
      id: createId('client'),
      createdAt: now,
      updatedAt: now,
    };
    await db.clients.add(client);
    return client;
  }

  async update(client: Client): Promise<void> {
    const updatedClient = {
      ...client,
      updatedAt: new Date().toISOString(),
    };
    await db.clients.put(updatedClient);
  }

  async delete(id: string): Promise<void> {
    await db.clients.delete(id);
  }

  async bulkAdd(clients: Client[]): Promise<void> {
    await db.clients.bulkAdd(clients);
  }
}

export const dexieClientRepository = new DexieClientRepository();
