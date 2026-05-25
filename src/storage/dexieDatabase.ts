import Dexie, { Table } from 'dexie';
import { Budget } from '../domain/budget';
import { Client } from '../domain/client';
import { Service as WorkOrder } from '../core/types/business';
import { CatalogHubItem } from '../features/catalog/storage/catalogHubStorage';

export interface MigrationRecord {
  key: string;
  done: boolean;
}

export class AferixDatabase extends Dexie {
  budgets!: Table<Budget>;
  clients!: Table<Client>;
  workOrders!: Table<WorkOrder>;
  catalog!: Table<CatalogHubItem>;
  migrations!: Table<MigrationRecord>;

  constructor() {
    super('AferixDatabase');
    // Version 3: Unified schema for all major entities
    this.version(3).stores({
      budgets: 'id',
      clients: 'id',
      workOrders: 'id',
      catalog: 'id',
      migrations: 'key',
    });
  }
}

export const db = new AferixDatabase();
