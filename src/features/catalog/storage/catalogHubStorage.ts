import type { CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';

export type CatalogHubItemKind = 'material' | 'service';

export interface CatalogHubItem {
  id: string;
  kind: CatalogHubItemKind;
  title: string;
  category: string;
  brand?: string;
  supplierId?: string;
  model?: string;
  reference?: string;
  unit: string;
  defaultQuantity: number;
  defaultUnitValue: number;
  destination: CalculationDestination;
  itemType: TechnicalItemType;
  notes?: string;
  sourceUrl?: string;
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

const ITEMS_KEY = 'orcaos:catalog-hub-items:v1';
const SUPPLIERS_KEY = 'orcaos:catalog-suppliers:v1';

const now = () => new Date().toISOString();

const starterSuppliers: CatalogSupplier[] = [
  {
    id: 'supplier-schneider',
    name: 'Schneider Electric',
    segment: 'Materiais elétricos e automação',
    websiteUrl: 'https://www.se.com/br/pt/',
    catalogUrl: 'https://www.se.com/br/pt/product/',
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Ase.com%2Fbr%2Fpt%2F+{query}',
    notes: 'Consulta online por busca pública. Conferir referência, disponibilidade e preço no fornecedor/distribuidor.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-tramontina',
    name: 'Tramontina',
    segment: 'Materiais elétricos, conduletes e acabamento',
    websiteUrl: 'https://www.tramontina.com.br/',
    catalogUrl: 'https://www.tramontina.com.br/produtos',
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Atramontina.com.br+{query}',
    notes: 'Usar para conferir linhas, placas, caixas, canaletas, tomadas e acessórios.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-weg',
    name: 'WEG',
    segment: 'Motores, comandos, proteção e automação',
    websiteUrl: 'https://www.weg.net/',
    catalogUrl: 'https://www.weg.net/catalog/weg/BR/pt',
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Aweg.net+{query}',
    notes: 'Usar para contator, relé térmico, disjuntor motor, motores e automação.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-margirius',
    name: 'Margirius',
    segment: 'Interruptores, tomadas e módulos',
    websiteUrl: 'https://www.margirius.com.br/',
    catalogUrl: 'https://www.margirius.com.br/',
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Amargirius.com.br+{query}',
    notes: 'Usar para módulos, placas, interruptores e tomadas.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-tigre',
    name: 'Tigre',
    segment: 'Hidráulica e infraestrutura',
    websiteUrl: 'https://www.tigre.com.br/',
    catalogUrl: 'https://www.tigre.com.br/produtos',
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Atigre.com.br+{query}',
    notes: 'Usar para tubos, conexões, hidráulica, drenagem e infraestrutura.',
    createdAt: now(),
    updatedAt: now(),
  },
];

const starterItems: CatalogHubItem[] = [
  {
    id: 'hub-service-outlet-install',
    kind: 'service',
    title: 'Instalação de tomada simples',
    category: 'Mão de obra elétrica',
    unit: 'ponto',
    defaultQuantity: 1,
    defaultUnitValue: 45,
    destination: 'budget',
    itemType: 'service',
    notes: 'Serviço base. Ajustar valor conforme dificuldade, distância e acabamento.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'hub-service-double-outlet-install',
    kind: 'service',
    title: 'Instalação de tomada dupla',
    category: 'Mão de obra elétrica',
    unit: 'ponto',
    defaultQuantity: 1,
    defaultUnitValue: 55,
    destination: 'budget',
    itemType: 'service',
    notes: 'Serviço base para tomada dupla modular 4x2.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'hub-material-outlet-module-20a',
    kind: 'material',
    title: 'Módulo tomada 2P+T 20A branco',
    category: 'Tomadas e módulos',
    brand: 'Schneider',
    supplierId: 'supplier-schneider',
    unit: 'un',
    defaultQuantity: 1,
    defaultUnitValue: 18.5,
    destination: 'both',
    itemType: 'material',
    notes: 'Conferir linha/modelo antes da compra.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'hub-material-plate-4x2-double',
    kind: 'material',
    title: 'Placa 4x2 para 2 módulos branca',
    category: 'Acabamento elétrico',
    brand: 'Margirius',
    supplierId: 'supplier-margirius',
    unit: 'un',
    defaultQuantity: 1,
    defaultUnitValue: 8.9,
    destination: 'both',
    itemType: 'material',
    notes: 'Usar com módulos compatíveis da mesma linha.',
    createdAt: now(),
    updatedAt: now(),
  },
];

function safeParseArray<T>(value: string | null, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function loadCatalogHubItems(): CatalogHubItem[] {
  if (typeof window === 'undefined') return starterItems;
  return safeParseArray<CatalogHubItem>(window.localStorage.getItem(ITEMS_KEY), starterItems);
}

export function saveCatalogHubItems(items: CatalogHubItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function loadCatalogSuppliers(): CatalogSupplier[] {
  if (typeof window === 'undefined') return starterSuppliers;
  return safeParseArray<CatalogSupplier>(window.localStorage.getItem(SUPPLIERS_KEY), starterSuppliers);
}

export function saveCatalogSuppliers(suppliers: CatalogSupplier[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

export function createCatalogId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
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
