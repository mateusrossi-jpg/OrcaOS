import { Client } from '../domain/client';

export interface ClientRepository {
  getAll(): Promise<Client[]>;
  getById(id: string): Promise<Client | undefined>;
  add(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client>;
  update(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
  bulkAdd(clients: Client[]): Promise<void>;
}
