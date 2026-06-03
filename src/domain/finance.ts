export type FinanceStatus = 'pending' | 'partial' | 'paid';

import { MultiTenantEntity } from '../core/types/business';

export interface SimpleFinanceRecord extends MultiTenantEntity {
  id: string;
  title: string;
  clientId: string; // Source of Truth para o pagador
  siteId?: string; // Onde o serviço gerador do custo aconteceu
  clientName: string; // [DERIVADO/CACHE] Apenas para leitura rápida na UI
  status: FinanceStatus;
  workOrderId: string;
  expectedValue: number;
  receivedValue: number;
  openBalance: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
  createdAt: string;
  updatedAt: string;
  
  // Soft Delete fields (FASE 2.6)
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted?: boolean;
}

export interface SimpleFinanceRecordInput {
  id?: string | null;
  companyId?: string;
  workspaceId?: string;
  title: string;
  clientId: string;
  siteId?: string;
  clientName: string;
  status?: FinanceStatus;
  workOrderId: string;
  expectedValue: number;
  receivedValue: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
}
