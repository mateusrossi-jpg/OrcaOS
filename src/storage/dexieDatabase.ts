import Dexie, { Table } from 'dexie';
import { OperationalEvent } from '../domain/operationalEvent';
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import type { CalculationCapture } from '../core/types/workflow';
import { Budget } from '../domain/budget';
import { Client } from '../domain/client';
import { Service as WorkOrder } from '../core/types/business';
import { Attendance } from '../domain/attendance';
import { CatalogHubItem, CatalogSupplier } from '../features/catalog/storage/catalogHubStorage';
import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';
import { ProfessionalProfile } from '../features/settings/models/professionalProfile';
import type { AferixAccountState } from '../core/access/accountPlanStorage';
// Removed stockStorage import

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
import { AssetExecution } from '../domain/assetExecution';
import { Anomaly, Proposal } from '../domain/revenue';
import { WarrantyRecord } from '../domain/memory';
import { DispatchJob, TechnicianShift, RouteAssignment, DispatchAlert } from '../domain/dispatch';
import { ContractHealth, ContractRenewal, ContractAlert as DomainContractAlert, ContractRevenueProjection } from '../domain/contracts';
import { WarrantyCoverage, WarrantyClaim, WarrantyAlert, WarrantyIncident } from '../domain/warranty';
import { KnowledgeCase, KnowledgeSolution, KnowledgeRating, KnowledgeRecommendation } from '../domain/knowledge';
import { CustomerHealth, CustomerRisk, CustomerAction, CustomerEngagement } from '../domain/customerSuccess';
import { InventoryItem, StockMovement, PurchaseRequest, PurchaseOrder, Supplier, InventoryReservation } from '../domain/inventory';

export interface TeamMember {
  id: string;
  companyId: string;
  workspaceId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'SALES' | 'FIELD' | 'CUSTOMER' | 'SOLO';
  status: 'active' | 'inactive';
  createdAt: string;
}

export class AferixDatabase extends Dexie {
  budgets!: Table<Budget>;
  clients!: Table<Client>;
  workOrders!: Table<WorkOrder>;
  catalog!: Table<CatalogHubItem>;
  attendances!: Table<Attendance>;
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
  assetExecutions!: Table<AssetExecution>;
  anomalies!: Table<Anomaly>;
  proposals!: Table<Proposal>;
  warranties!: Table<WarrantyRecord>;
  dispatchJobs!: Table<DispatchJob>;
  technicianShifts!: Table<TechnicianShift>;
  routeAssignments!: Table<RouteAssignment>;
  dispatchAlerts!: Table<DispatchAlert>;
  contractHealth!: Table<ContractHealth>;
  contractRenewals!: Table<ContractRenewal>;
  contractAlerts!: Table<DomainContractAlert>;
  contractRevenueProjections!: Table<ContractRevenueProjection>;
  warrantyCoverage!: Table<WarrantyCoverage>;
  warrantyClaims!: Table<WarrantyClaim>;
  warrantyAlerts!: Table<WarrantyAlert>;
  warrantyIncidents!: Table<WarrantyIncident>;
  
  // Knowledge Engine
  knowledgeCases!: Table<KnowledgeCase>;
  knowledgeSolutions!: Table<KnowledgeSolution>;
  knowledgeRatings!: Table<KnowledgeRating>;
  knowledgeRecommendations!: Table<KnowledgeRecommendation>;

  // Customer Success & Retention Engine
  customerHealth!: Table<CustomerHealth>;
  customerRisks!: Table<CustomerRisk>;
  customerActions!: Table<CustomerAction>;
  customerEngagement!: Table<CustomerEngagement>;

  // Inventory & Procurement Engine
  inventoryItems!: Table<InventoryItem>;
  stockMovements!: Table<StockMovement>;
  purchaseRequests!: Table<PurchaseRequest>;
  purchaseOrders!: Table<PurchaseOrder>;
  suppliers!: Table<Supplier>;
  inventoryReservations!: Table<InventoryReservation>;

  // Team & RBAC
  teamMembers!: Table<TeamMember>;

  // Pilot Program Telemetry (FASE 4: Real Operator Validation)
  pilotEvents!: Table<import('../services/pilotTelemetryService').PilotEvent>;

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
    // Version 17: Architectural refactor for 1:N relations (Budget.attendanceId & WorkOrder.attendanceId)
    this.version(17).stores({
      budgets: 'id, attendanceId, clientId, syncStatus',
      attendances: 'id, syncStatus',
      clients: 'id, syncStatus',
      workOrders: 'id, attendanceId, clientId, syncStatus',
      catalog: 'id',
      catalogSuppliers: 'id',
      supplierProfiles: 'id',
      professionalProfiles: 'id',
      migrations: 'key',
      settings: 'key',
      clientProposals: 'id',
      calculationCaptures: 'id, workOrderId, clientId',
      accountPlan: 'id',
      simpleFinanceRecords: 'id, sourceBudgetId, workOrderId',
      operationalEvents: 'id, aggregateId, aggregateType, eventType, timestamp, correlationId, syncStatus',
      sites: 'id, clientId, isMain, syncStatus',
      assets: 'id, clientId, siteId, tag, syncStatus',
      maintenancePlans: 'id, assetId, clientId, siteId, nextExecutionDate, isActive, syncStatus',
      contracts: 'id, clientId, status, startDate, billingFrequency, syncStatus'
    }).upgrade(async tx => {
      try {
        const attendances = await tx.table('attendances').toArray();
        for (const att of attendances) {
          if (att.budgetId) {
            await tx.table('budgets').update(att.budgetId, { attendanceId: att.id });
          }
          if (att.workOrderId) {
            await tx.table('workOrders').update(att.workOrderId, { attendanceId: att.id });
          }
        }
      } catch (err) {
        console.error('Erro na migração de dados Dexie v17:', err);
      }
    });

    this.version(18).stores({
      budgets: 'id, companyId, workspaceId, attendanceId, clientId, syncStatus',
      attendances: 'id, companyId, workspaceId, syncStatus',
      clients: 'id, companyId, workspaceId, syncStatus',
      workOrders: 'id, companyId, workspaceId, attendanceId, clientId, syncStatus',
      sites: 'id, companyId, clientId, isMain, syncStatus',
      assets: 'id, companyId, clientId, siteId, tag, syncStatus',
      maintenancePlans: 'id, companyId, workspaceId, assetId, clientId, siteId, nextExecutionDate, syncStatus',
      contracts: 'id, companyId, workspaceId, clientId, status, syncStatus',
      simpleFinanceRecords: 'id, companyId, sourceBudgetId, workOrderId',
      assetExecutions: 'id, companyId, workspaceId, workOrderId, assetId, syncStatus',
      
      // Tabelas não multi-tenant inalteradas
      catalog: 'id',
      catalogSuppliers: 'id',
      supplierProfiles: 'id',
      professionalProfiles: 'id',
      migrations: 'key',
      settings: 'key',
      clientProposals: 'id',
      calculationCaptures: 'id, workOrderId, clientId',
      accountPlan: 'id',
      operationalEvents: 'id, aggregateId, aggregateType, eventType, timestamp, correlationId, syncStatus',
    }).upgrade(async tx => {
      let fallbackCompanyId = 'default-company';
      let fallbackWorkspaceId = 'default-workspace';
      
      try {
        const authData = typeof window !== 'undefined' ? localStorage.getItem('sb-auth-token') : null;
        if (authData) {
          const parsed = JSON.parse(authData);
          fallbackCompanyId = parsed?.user?.user_metadata?.company_id || 'default-company';
          fallbackWorkspaceId = parsed?.user?.user_metadata?.workspace_id || 'default-workspace';
        }
      } catch (e) {
        console.error('Falha ao recuperar metadados de autenticação para migração Dexie:', e);
      }

      const tablesToMigrate = [
        { name: 'budgets', hasWorkspace: true },
        { name: 'attendances', hasWorkspace: true },
        { name: 'clients', hasWorkspace: true },
        { name: 'workOrders', hasWorkspace: true },
        { name: 'sites', hasWorkspace: false },
        { name: 'assets', hasWorkspace: false },
        { name: 'maintenancePlans', hasWorkspace: true },
        { name: 'contracts', hasWorkspace: true },
        { name: 'simpleFinanceRecords', hasWorkspace: false },
        { name: 'assetExecutions', hasWorkspace: true }
      ];

      for (const tableConfig of tablesToMigrate) {
        try {
          const records = await tx.table(tableConfig.name).toArray();
          for (const record of records) {
            const updates: Record<string, any> = {};
            if (!record.companyId) {
              updates.companyId = fallbackCompanyId;
            }
            if (tableConfig.hasWorkspace && !record.workspaceId) {
              updates.workspaceId = fallbackWorkspaceId;
            }
            if (Object.keys(updates).length > 0) {
              await tx.table(tableConfig.name).update(record.id, updates);
            }
          }
        } catch (err) {
          console.error(`Erro ao migrar tabela ${tableConfig.name} no v18:`, err);
        }
      }
    });

    this.version(19).stores({
      anomalies: 'id, companyId, workspaceId, clientId, siteId, assetId, workOrderId, assetExecutionId, status, [companyId+status]',
      proposals: 'id, companyId, workspaceId, anomalyId, clientId, status'
    });

    this.version(20).stores({
      warranties: 'id, companyId, workspaceId, assetId, clientId, status, expiresAt'
    });

    this.version(21).stores({
      dispatchJobs: 'id, companyId, workspaceId, workOrderId, clientId, siteId, status, priority, scheduledDate, assignedTechnicianId, [companyId+status]',
      technicianShifts: 'id, companyId, workspaceId, technicianId, date, [technicianId+date]',
      routeAssignments: 'id, companyId, workspaceId, technicianId, date',
      dispatchAlerts: 'id, companyId, workspaceId, jobId, type, resolved, [companyId+resolved]'
    });

    this.version(22).stores({
      contractHealth: 'id, companyId, workspaceId, contractId, clientId, healthScore, [companyId+healthScore]',
      contractRenewals: 'id, companyId, workspaceId, contractId, clientId, status, dueDate',
      contractAlerts: 'id, companyId, workspaceId, contractId, type, resolved',
      contractRevenueProjections: 'id, companyId, workspaceId, contractId, month'
    });

    this.version(23).stores({
      warrantyCoverage: 'id, companyId, workspaceId, assetId, status, expirationDate, [companyId+status], [assetId+status]',
      warrantyClaims: 'id, companyId, workspaceId, coverageId, assetId, status',
      warrantyAlerts: 'id, companyId, workspaceId, coverageId, assetId, type, resolved',
      warrantyIncidents: 'id, companyId, workspaceId, assetId, isRecurrence, recurrenceLevel'
    });

    this.version(24).stores({
      knowledgeCases: 'id, companyId, workspaceId, assetType, manufacturer, failureCode, severity, status',
      knowledgeSolutions: 'id, companyId, workspaceId, caseId, isVerified',
      knowledgeRatings: 'id, companyId, workspaceId, solutionId, technicianId',
      knowledgeRecommendations: 'id, companyId, workspaceId, workOrderId, anomalyId'
    });

    this.version(25).stores({
      customerHealth: 'id, companyId, workspaceId, clientId, healthScore, riskLevel, [companyId+riskLevel], [clientId+healthScore]',
      customerRisks: 'id, companyId, workspaceId, clientId',
      customerActions: 'id, companyId, workspaceId, clientId, type, status, dueDate, [companyId+status]',
      customerEngagement: 'id, companyId, workspaceId, clientId, engagementScore'
    });

    this.version(26).stores({
      inventoryItems: 'id, companyId, workspaceId, sku, [companyId+sku], status, [companyId+status], supplierId',
      stockMovements: 'id, companyId, workspaceId, itemId, type',
      purchaseRequests: 'id, companyId, workspaceId, itemId, status',
      purchaseOrders: 'id, companyId, workspaceId, supplierId, status',
      suppliers: 'id, companyId, workspaceId',
      inventoryReservations: 'id, companyId, workspaceId, itemId, proposalId, workOrderId, status'
    });

    this.version(27).stores({
      teamMembers: 'id, companyId, workspaceId, email, role, status'
    });

    this.version(28).stores({
      budgets: 'id, companyId, workspaceId, attendanceId, clientId, status, syncStatus',
      workOrders: 'id, companyId, workspaceId, attendanceId, clientId, budgetId, status, syncStatus',
      simpleFinanceRecords: 'id, companyId, aggregateId, workOrderId'
    });

    // Version 29: Pilot Program Telemetry (FASE 4: Real Operator Validation)
    this.version(29).stores({
      pilotEvents: 'id, sessionId, type, flow, screen, [flow+type], dayOfWeek, hourOfDay, timestamp'
    });
  }
}

export const db = new AferixDatabase();


