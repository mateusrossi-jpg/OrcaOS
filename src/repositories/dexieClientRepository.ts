/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '../domain/client';
import { ClientRepository } from './clientRepository';
import { db } from '../storage/dexieDatabase';
import { createId } from '../app/utils/idHelpers';
import { validateClientIntegrity } from '../domain/guards';
import { aferixLogger } from '../core/debug/aferixLogger';

import { safeTransaction } from '../core/database/safeTransaction';
import { writeLock } from '../core/database/writeLock';
import { idempotency } from '../core/database/idempotency';
import { operationAudit } from '../core/audit/operationAudit';

const CLIENT_LAST_HASH = new Map<string, string>();

export class DexieClientRepository implements ClientRepository {
  async getAll(): Promise<Client[]> {
    const all = await db.clients.where('syncStatus').notEqual('deleted').toArray();
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
    
    if (!validateClientIntegrity(client)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid client add', client);
      throw new Error('Invalid client integrity');
    }

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(client.id, async () => {
        await safeTransaction('addClient', 'rw', [db.clients], async () => {
          await db.clients.add(client);
        });
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'Client', entityId: client.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'Client', entityId: client.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
    return client;
  }

  async update(client: Client): Promise<void> {
    const updatedClient = {
      ...client,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncUpdatedAt: Date.now(),
    } as Client;
    
    if (!validateClientIntegrity(updatedClient)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid client update', updatedClient);
      throw new Error('Invalid client integrity');
    }

    const currentHash = idempotency.generateWriteFingerprint(updatedClient);
    if (CLIENT_LAST_HASH.get(updatedClient.id) === currentHash) return;

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(updatedClient.id, async () => {
        await safeTransaction('updateClient', 'rw', [db.clients], async () => {
          await db.clients.put(updatedClient);
        });
        CLIENT_LAST_HASH.set(updatedClient.id, currentHash);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'Client', entityId: updatedClient.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'Client', entityId: updatedClient.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(id, async () => {
        await safeTransaction('deleteClient', 'rw', [db.clients], async () => {
          const existing = await db.clients.get(id);
          if (existing) {
            const toSave = { ...existing, syncStatus: 'deleted', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as Client;
            await db.clients.put(toSave);
          }
        });
        CLIENT_LAST_HASH.delete(id);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'delete', entity: 'Client', entityId: id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'delete', entity: 'Client', entityId: id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async put(client: Client): Promise<void> {
    const toSave = { ...client, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() } as Client;
    if (!validateClientIntegrity(toSave)) {
      aferixLogger.warn('Aferix Integrity', 'Blocked invalid client put', toSave);
      throw new Error('Invalid client integrity');
    }

    const currentHash = idempotency.generateWriteFingerprint(toSave);
    if (CLIENT_LAST_HASH.get(toSave.id) === currentHash) return;

    const start = Date.now();
    try {
      await writeLock.withDatabaseLock(toSave.id, async () => {
        await safeTransaction('putClient', 'rw', [db.clients], async () => {
          await db.clients.put(toSave);
        });
        CLIENT_LAST_HASH.set(toSave.id, currentHash);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'Client', entityId: toSave.id, success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'update', entity: 'Client', entityId: toSave.id, success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }

  async bulkAdd(clients: Client[]): Promise<void> {
    const toSave = clients.map(c => ({ ...c, syncStatus: 'pending', syncUpdatedAt: Date.now(), updatedAt: new Date().toISOString() })) as Client[];
    const start = Date.now();
    try {
      await safeTransaction('bulkAddClients', 'rw', [db.clients], async () => {
        await db.clients.bulkAdd(toSave);
      });
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'Client', entityId: 'bulk', success: true, durationMs: Date.now() - start });
    } catch (e: any) {
      operationAudit.log({ timestamp: new Date().toISOString(), operation: 'create', entity: 'Client', entityId: 'bulk', success: false, durationMs: Date.now() - start, warnings: [e.message] });
      throw e;
    }
  }
}

export const dexieClientRepository = new DexieClientRepository();
