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

export type ServiceStatus = 'draft' | 'scheduled' | 'in-progress' | 'done' | 'cancelled';

export interface Service {
  id: string;
  clientId: string; // Mandatory for all Work Orders
  siteId?: string; // Optional (Fase 3B)
  assetIds?: string[]; // Optional (Fase 3B)
  budgetId?: string; // Optional for OS Avulsa
  title: string;
  description?: string;
  address?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status: ServiceStatus;
  scheduledDate?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  
  // Execution Core
  items?: BudgetItem[];
  executedValue?: number;
  
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}

export type WorkOrder = Service;
