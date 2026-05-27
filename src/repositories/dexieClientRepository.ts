import { Client } from '../domain/client';
import { ClientRepository } from './clientRepository';
import { db } from '../storage/dexieDatabase';
import { createId } from '../app/utils/idHelpers';
import { validateClientIntegrity } from '../domain/guards';
import { aferixLogger } from '../core/debug/aferixLogger';

export class DexieClientRepository implements ClientRepository {
  async getAll(): Promise<Client[]> {
    const all = await db.clients.filter(c => c.syncStatus !== 'deleted').toArray();
    return all.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getById(id: string): Promise<Client | undefined> {
    const client = await db.clients.get(id);
    if (client && client.syncStatus === 'deleted') return undefined;
    return client;
  }

  async add(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const now = new Date().toISOString();
    const client: Client = {
      ...clientData,
      id: createId('client'),
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      syncUpdatedAt: Date.now(),
    };
    await db.clients.add(client);
    return client;
  }

  async update(client: Client): Promise<void> {
    const updatedClient = {
      ...client,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncUpdatedAt: Date.now(),
    } as Client;
    await db.clients.put(updatedClient);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.clients.get(id);
    if (existing) {
      const toSave = { ...existing, syncStatus: 'deleted', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as Client;
      await db.clients.put(toSave);
    }
  }

  async put(client: Client): Promise<void> {
    const toSave = { ...client, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as Client;
    if (!validateClientIntegrity(toSave)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid client put', toSave);
      throw new Error('Invalid client integrity');
    }
    await db.clients.put(toSave);
  }

  async bulkAdd(clients: Client[]): Promise<void> {
    const toSave = clients.map(c => ({ ...c, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() })) as Client[];
    await db.clients.bulkAdd(toSave);
  }
}

export const dexieClientRepository = new DexieClientRepository();
