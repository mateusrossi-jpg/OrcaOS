import Dexie, { Table } from 'dexie';
import { Budget } from '../domain/budget';
import { Client } from '../domain/client';
import { Service as WorkOrder } from '../core/types/business';
import { CatalogHubItem } from '../features/catalog/storage/catalogHubStorage';

export interface MigrationRecord {
  key: string;
  done: boolean;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export class AferixDatabase extends Dexie {
  budgets!: Table<Budget>;
  clients!: Table<Client>;
  workOrders!: Table<WorkOrder>;
  catalog!: Table<CatalogHubItem>;
  migrations!: Table<MigrationRecord>;
  settings!: Table<SettingRecord>;

  constructor() {
    super('AferixDatabase');
    // Version 4: Added settings table
    this.version(4).stores({
      budgets: 'id',
      clients: 'id',
      workOrders: 'id',
      catalog: 'id',
      migrations: 'key',
      settings: 'key',
    });
  }
}

export const db = new AferixDatabase();
