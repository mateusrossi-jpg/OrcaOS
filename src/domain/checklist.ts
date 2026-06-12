import { MultiTenantEntity } from '../core/types/business';

/**
 * ChecklistTemplate
 * Defined by the user to standardize inspections.
 */
export interface ChecklistTemplateItem {
  id: string;
  description: string;
}

export interface MeasurementTemplateItem {
  id: string;
  label: string;
  unit: string;
}

export interface ChecklistTemplate extends MultiTenantEntity {
  id: string;
  name: string;
  category: string; // Maps to Asset.category
  checklist: ChecklistTemplateItem[];
  measurements: MeasurementTemplateItem[];
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
}
