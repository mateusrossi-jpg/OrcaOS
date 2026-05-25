import Dexie, { Table } from 'dexie';
import { Budget } from '../domain/budget';
import { Client } from '../domain/client';
import { Service as WorkOrder } from '../core/types/business';
import { CatalogHubItem, CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';
import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';

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
  catalogSuppliers!: Table<CatalogSupplier>;
  supplierProfiles!: Table<SupplierProfile>;
  migrations!: Table<MigrationRecord>;
  settings!: Table<SettingRecord>;

  constructor() {
    super('AferixDatabase');
    // Version 5: Added catalogSuppliers and supplierProfiles tables
    this.version(5).stores({
      budgets: 'id',
      clients: 'id',
      workOrders: 'id',
      catalog: 'id',
      catalogSuppliers: 'id',
      supplierProfiles: 'id',
      migrations: 'key',
      settings: 'key',
    });
  }
}

export const db = new AferixDatabase();
