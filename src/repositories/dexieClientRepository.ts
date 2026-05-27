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
    const now = Date.now();
    const client: Client = {
      ...clientData,
      id: createId('client'),
      createdAt: new Date(now).toISOString(),
      updatedAt: now,
      syncStatus: 'pending',
    } as any;
    await db.clients.add(client);
    return client;
  }

  async update(client: Client): Promise<void> {
    const updatedClient = {
      ...client,
      updatedAt: Date.now(),
      syncStatus: 'pending',
    } as any;
    await db.clients.put(updatedClient);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.clients.get(id);
    if (existing) {
      const toSave = { ...existing, syncStatus: 'deleted', updatedAt: Date.now() } as any;
      await db.clients.put(toSave);
    }
  }

  async bulkAdd(clients: Client[]): Promise<void> {
    const toSave = clients.map(c => ({ ...c, syncStatus: 'pending', updatedAt: Date.now() })) as any;
    await db.clients.bulkAdd(toSave);
  }
}

export const dexieClientRepository = new DexieClientRepository();
