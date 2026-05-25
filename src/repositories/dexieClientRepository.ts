import { Client } from '../domain/client';
import { ClientRepository } from './clientRepository';
import { db } from '../storage/dexieDatabase';
import { createId } from '../app/utils/idHelpers';

export const dexieClientRepository: ClientRepository = {
  async getAll() {
    return await db.clients.toArray();
  },
  async getById(id: string) {
    return await db.clients.get(id);
  },
  async add({ name, phone, notes }) {
    const now = new Date();
    const client: Client = {
      id: createId('client'),
      name,
      phone,
      notes,
      createdAt: now,
      updatedAt: now,
    };
    await db.clients.add(client);
    return client;
  },
  async update(client: Client) {
    client.updatedAt = new Date();
    await db.clients.put(client);
  },
  async delete(id: string) {
    await db.clients.delete(id);
  },
};
