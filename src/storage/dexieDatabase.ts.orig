import Dexie, { Table } from 'dexie';
import { OperationalEvent } from '../domain/operationalEvent';
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import type { CalculationCapture } from '../core/types/workflow';
import { Budget } from '../domain/budget';
import { Client } from '../domain/client';
import { Service as WorkOrder } from '../core/types/business';
import { CatalogHubItem, CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';
import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';
import { ProfessionalProfile } from '../features/settings/models/professionalProfile';
import type { AferixAccountState } from '../core/access/accountPlanStorage';

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

import { SimpleFinanceRecord } from '../domain/finance';

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
  calculationCaptures!: Table<CalculationCapture>;
  accountPlan!: Table<AferixAccountState & { id: string }>;
  simpleFinanceRecords!: Table<SimpleFinanceRecord>;
  operationalEvents!: Table<OperationalEvent>;

  constructor() {
    super('AferixDatabase');
    // Version 7: Added clientProposals table
    // Version 8: Added calculationCaptures table
    // Version 9: Added accountPlan table
    // Version 10: Added simpleFinanceRecords table
    // Version 11: Added operationalEvents table
    this.version(11).stores({
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
      calculationCaptures: 'id, workOrderId, clientId',
      accountPlan: 'id',
      simpleFinanceRecords: 'id, sourceBudgetId',
      operationalEvents: 'id, aggregateId, aggregateType, eventType, timestamp, correlationId',
    });
  }
}

export const db = new AferixDatabase();
