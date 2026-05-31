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
import { Site } from '../domain/site';
import { Asset } from '../domain/asset';
import { MaintenancePlan } from '../domain/maintenancePlan';
import { Contract } from '../domain/contract';

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
  sites!: Table<Site>;
  assets!: Table<Asset>;
  maintenancePlans!: Table<MaintenancePlan>;
  contracts!: Table<Contract>;

  constructor() {
    super('AferixDatabase');
    // Version 7: Added clientProposals table
    // Version 8: Added calculationCaptures table
    // Version 9: Added accountPlan table
    // Version 10: Added simpleFinanceRecords table
    // Version 11: Added operationalEvents table
    // Version 12: Added syncStatus index (P97)
    // Version 13: Added syncStatus to operationalEvents (P108 - Cloud Sync)
    // Version 14: Added sites and assets tables (Fase 3B)
    // Version 15: Added maintenancePlans table (Fase 3D)
    // Version 16: Added contracts table (Fase 3E)
    this.version(16).stores({
      budgets: 'id, syncStatus',
      clients: 'id, syncStatus',
      workOrders: 'id, syncStatus',
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
      operationalEvents: 'id, aggregateId, aggregateType, eventType, timestamp, correlationId, syncStatus',
      sites: 'id, clientId, isMain, syncStatus',
      assets: 'id, clientId, siteId, tag, syncStatus',
      maintenancePlans: 'id, assetId, clientId, siteId, nextExecutionDate, isActive, syncStatus',
      contracts: 'id, clientId, status, startDate, billingFrequency, syncStatus'
    });
  }
}

export const db = new AferixDatabase();
