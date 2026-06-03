import { generateUUID } from '../../../core/utils/idGenerator';
import type { CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';

export type CatalogHubItemKind = 'material' | 'labor' | 'service' | 'travel' | 'fee' | 'custom';

export interface CatalogHubItem {
  id: string;
  kind: CatalogHubItemKind;
  title: string;
  popularName?: string;
  category: string;
  professionArea?: string;
  technicalDescription?: string;
  brand?: string;
  supplierId?: string;
  model?: string;
  reference?: string;
  unit: string;
  defaultQuantity: number;
  defaultUnitValue: number;
  priceUpdatedAt?: string;
  dataOrigin?: 'manual' | 'local-catalog' | 'online-reference' | 'supplier';
  compatibility?: string;
  acceptedAlternatives?: string;
  forbiddenAlternatives?: string;
  clientNote?: string;
  professionalNote?: string;
  destination: CalculationDestination;
  itemType: TechnicalItemType;
  notes?: string;
  sourceUrl?: string;
  imageUrl?: string;
  purchaseGuidance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogSupplier {
  id: string;
  name: string;
  segment: string;
  websiteUrl?: string;
  catalogUrl?: string;
  searchUrlTemplate?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function createCatalogId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return generateUUID();
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function buildSupplierSearchUrl(supplier: CatalogSupplier, query: string): string {
  const encodedQuery = encodeURIComponent(query.trim());
  if (!encodedQuery) return supplier.catalogUrl || supplier.websiteUrl || '';
  if (supplier.searchUrlTemplate?.includes('{query}')) {
    return supplier.searchUrlTemplate.replace('{query}', encodedQuery);
  }
  if (supplier.websiteUrl) {
    return `https://www.google.com/search?q=site%3A${encodeURIComponent(supplier.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))}+${encodedQuery}`;
  }
  return `https://www.google.com/search?q=${encodedQuery}`;
}
