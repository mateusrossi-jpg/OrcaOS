import Dexie, { Table } from 'dexie';
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import { Budget } from '../domain/budget';
import { Client } from '../domain/client';
import { Service as WorkOrder } from '../core/types/business';
import { CatalogHubItem, CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';
import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';
import { ProfessionalProfile } from '../features/settings/models/professionalProfile';

export interface MigrationRecord {
  key: string;
  done: boolean;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export interface ProfessionalProfileRecord extends ProfessionalProfile {
  id: string;
}

export class AferixDatabase extends Dexie {
  budgets!: Table<Budget>;
  clients!: Table<Client>;
  workOrders!: Table<WorkOrder>;
  catalog!: Table<CatalogHubItem>;
  catalogSuppliers!: Table<CatalogSupplier>;
  supplierProfiles!: Table<SupplierProfile>;
  professionalProfiles!: Table<ProfessionalProfileRecord>;
  migrations!: Table<MigrationRecord>;
  settings!: Table<SettingRecord>;
  clientProposals!: Table<ClientProposal>;

  constructor() {
    super('AferixDatabase');
    // Version 7: Added clientProposals table
    this.version(7).stores({
      budgets: 'id',
      clients: 'id',
      workOrders: 'id',
      catalog: 'id',
      catalogSuppliers: 'id',
      supplierProfiles: 'id',
      professionalProfiles: 'id',
      migrations: 'key',
      settings: 'key',
      clientProposals: 'id',
    });
  }
}

export const db = new AferixDatabase();
