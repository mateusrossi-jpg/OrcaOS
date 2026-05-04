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

const ITEMS_KEY = 'orcaos:catalog-hub-items:v1';
const SUPPLIERS_KEY = 'orcaos:catalog-suppliers:v1';

const now = () => new Date().toISOString();

const starterSuppliers: CatalogSupplier[] = [
  {
    id: 'supplier-electric-reference',
    name: 'Fornecedor elétrico',
    segment: 'Materiais elétricos e automação',
    searchUrlTemplate: 'https://www.google.com/search?q={query}',
    notes: 'Exemplo editável. Cadastre fornecedores reais conforme sua região.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-finishing-reference',
    name: 'Fornecedor de acabamento',
    segment: 'Materiais elétricos, conduletes e acabamento',
    searchUrlTemplate: 'https://www.google.com/search?q={query}',
    notes: 'Exemplo editável para linhas, placas, caixas, canaletas, tomadas e acessórios.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-motor-reference',
    name: 'Fornecedor de motores',
    segment: 'Motores, comandos, proteção e automação',
    searchUrlTemplate: 'https://www.google.com/search?q={query}',
    notes: 'Exemplo editável para contator, relé térmico, disjuntor motor, motores e automação.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-module-reference',
    name: 'Fornecedor de módulos',
    segment: 'Interruptores, tomadas e módulos',
    searchUrlTemplate: 'https://www.google.com/search?q={query}',
    notes: 'Exemplo editável para módulos, placas, interruptores e tomadas.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'supplier-hydraulics-reference',
    name: 'Fornecedor hidráulico',
    segment: 'Hidráulica e infraestrutura',
    searchUrlTemplate: 'https://www.google.com/search?q={query}',
    notes: 'Exemplo editável para tubos, conexões, hidráulica, drenagem e infraestrutura.',
    createdAt: now(),
    updatedAt: now(),
  },
];

const starterItems: CatalogHubItem[] = [
  {
    id: 'hub-service-outlet-install',
    kind: 'labor',
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
    kind: 'labor',
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
    popularName: 'Tomada 20A módulo',
    category: 'Tomadas e módulos',
    professionArea: 'Elétrica',
    technicalDescription: 'Módulo de tomada 2P+T 20 A para placa modular compatível com padrão brasileiro.',
    brand: 'Fabricante genérico',
    supplierId: 'supplier-electric-reference',
    unit: 'un',
    defaultQuantity: 1,
    defaultUnitValue: 18.5,
    priceUpdatedAt: now(),
    dataOrigin: 'local-catalog',
    compatibility: 'Usar com placa e suporte da mesma linha modular.',
    acceptedAlternatives: 'Pode ser equivalente se for módulo 20A 2P+T da mesma linha da placa.',
    forbiddenAlternatives: 'Não substituir por tomada 10A.',
    clientNote: 'Comprar tomada 20A 2P+T padrão brasileiro. Não substituir por 10A.',
    professionalNote: 'Conferir circuito, proteção e seção do cabo antes da execução.',
    destination: 'both',
    itemType: 'material',
    notes: 'Conferir linha/modelo antes da compra.',
    purchaseGuidance: 'Cliente deve comprar módulo 2P+T 20A compatível com a linha escolhida no acabamento.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'hub-material-plate-4x2-double',
    kind: 'material',
    title: 'Placa 4x2 para 2 módulos branca',
    popularName: 'Placa de tomada',
    category: 'Acabamento elétrico',
    professionArea: 'Elétrica',
    technicalDescription: 'Placa 4x2 para dois módulos, acabamento branco, compatível com suporte e módulos da mesma linha.',
    brand: 'Fabricante genérico',
    supplierId: 'supplier-module-reference',
    unit: 'un',
    defaultQuantity: 1,
    defaultUnitValue: 8.9,
    priceUpdatedAt: now(),
    dataOrigin: 'local-catalog',
    compatibility: 'Compatível apenas com módulos/suporte da mesma linha.',
    acceptedAlternatives: 'Pode ser equivalente se encaixar na mesma linha modular.',
    forbiddenAlternatives: 'Evitar misturar placa e módulo de linhas diferentes.',
    clientNote: 'Comprar placa da mesma linha dos módulos indicados.',
    professionalNote: 'Validar padrão e cor com o cliente antes da compra.',
    destination: 'both',
    itemType: 'material',
    notes: 'Usar com módulos compatíveis da mesma linha.',
    purchaseGuidance: 'Comprar placa da mesma linha dos módulos para evitar incompatibilidade de encaixe.',
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

function sortMostRecent<T extends { updatedAt?: string; createdAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? ''));
}

export function loadCatalogHubItems(): CatalogHubItem[] {
  if (typeof window === 'undefined') return starterItems;
  return sortMostRecent(safeParseArray<CatalogHubItem>(window.localStorage.getItem(ITEMS_KEY), starterItems));
}

export function saveCatalogHubItems(items: CatalogHubItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function loadCatalogSuppliers(): CatalogSupplier[] {
  if (typeof window === 'undefined') return starterSuppliers;
  return sortMostRecent(safeParseArray<CatalogSupplier>(window.localStorage.getItem(SUPPLIERS_KEY), starterSuppliers));
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
