// src/domain/assetExecution.ts
import { MultiTenantEntity } from '../core/types/business';

export interface ChecklistItemResult {
  itemKey: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'na' | 'pending';
  notes?: string;
}

export interface AssetExecution extends MultiTenantEntity {
  id: string;
  workOrderId: string;
  assetId: string;
  measurements: Record<string, any>; // Telemetria fisica
  checklistResults: ChecklistItemResult[]; // Respostas do checklist
  recommendation?: string;
  photoUuids?: string[];
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  syncUpdatedAt?: number;
}
