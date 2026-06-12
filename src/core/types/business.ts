import type { Budget, BudgetItem, BudgetStatus } from '../../domain/budget';
import type { Client } from '../../domain/client';

export type { Client };

export type BudgetTemplateId = 'professional' | 'technical' | 'simple' | 'premiumModern' | 'premiumDetailed';
export type ReportTemplateId = 'technicalSimple' | 'technicalDetailed' | 'managerial';

export interface BusinessProfile {
  businessName: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  logoDataUrl: string;
  responsibleName: string;
  defaultPaymentTerms: string;
  defaultValidity: string;
  defaultGuarantee: string;
  defaultExecutionDeadline: string;
  defaultNotes: string;
  defaultBudgetTemplateId: BudgetTemplateId;
  defaultReportTemplateId: ReportTemplateId;
}

export interface CatalogItem {
  id: string;
  description: string;
  category: 'labor' | 'material' | 'other';
  unitPrice: number;
  defaultQuantity: number;
  notes?: string;
}

// Re-export core budget types for convenience
export type { Budget, BudgetItem, BudgetStatus };

export interface OperationalSnapshot {
  snapshotId: string;
  timestamp: string;
  workflowStatus: BudgetStatus;
  operator: string;
  context: string;
  clientSnapshot?: {
    id?: string;
    name: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
  };
  items: BudgetItem[];
  totals: {
    chargedValue: number;
    materialCost: number;
    operationalCost: number;
    discounts: number;
    subtotal: number;
    finalTotal: number;
    taxRate: number;
    grossProfit: number;
  };
  notes?: {
    commercial?: string;
    technical?: string;
    general?: string;
  };
  paymentTerms?: string;
  timelineEventId?: string;
  fingerprint: string;
}

export type ServiceStatus = 'draft' | 'awaiting_schedule' | 'scheduled' | 'en_route' | 'in-progress' | 'done' | 'cancelled';

export interface MultiTenantEntity {
  /** Tenant / Company identifier */
  companyId?: string;
  /** Workspace (e.g., Service, Commercial, Finance, Management) */
  workspaceId?: string;
  /** Optional profile (role / permission set) */
  profileId?: string;
  /** Owner user – useful for audit trails */
  userId?: string;
}

/**
 * Sync status casing hardening enum.
 */
export enum AggregateType {
  ATTENDANCE = 'attendance',
  BUDGET = 'budget',
  WORKORDER = 'workorder',
  CONTRACT = 'contract',
  ASSET = 'asset'
}

/**
 * Service (Work Order) now carries tenancy information.
 * Existing fields are kept unchanged.
 */
export interface Service extends MultiTenantEntity {
  id: string;
  /** [DERIVADO/CACHE] O cliente real é definido pelo Site. Este campo existe apenas para cache rápido de leitura no CRM. */
  clientId?: string;
  siteId?: string;
  assetIds?: string[]; // Optional (Fase 3B)
  budgetId?: string; // Optional for OS Avulsa
  attendanceId?: string; // Reference to Attendance (1:N)
  title: string;
  description?: string;
  /** @deprecated O endereço está migrando integralmente para o Site (Site-First Architecture) */
  address?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status: ServiceStatus;
  scheduledDate?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  
  // Execution Core
  items?: BudgetItem[];
  executedValue?: number;
  
  /** Indica visualmente e logicamente que esta OS sofreu um acionamento de garantia/retorno */
  hasTechnicalReturn?: boolean;
  /** Link rápido para os retornos associados a esta OS original */
  technicalReturnIds?: string[];
  
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;

  // Soft Delete fields (FASE 2.6)
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted?: boolean;
}

export type WorkOrder = Service;
