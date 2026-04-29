import type { CatalogItem } from '../../../core/types/business';

const CATALOG_STORAGE_KEY = 'orcaos:catalog-items:v1';

export const starterCatalogItems: CatalogItem[] = [
  {
    id: 'catalog-labor-outlet',
    description: 'Instalação de ponto de tomada',
    category: 'labor',
    unitPrice: 80,
    defaultQuantity: 1,
    notes: 'Valor base para mão de obra, ajustar conforme dificuldade e acabamento.',
  },
  {
    id: 'catalog-labor-lighting',
    description: 'Instalação de luminária / spot',
    category: 'labor',
    unitPrice: 45,
    defaultQuantity: 1,
    notes: 'Valor base para troca ou instalação simples.',
  },
  {
    id: 'catalog-material-cable',
    description: 'Cabo elétrico por metro',
    category: 'material',
    unitPrice: 4.5,
    defaultQuantity: 1,
    notes: 'Ajustar seção, cor e tipo do cabo antes de enviar ao cliente.',
  },
];

function isCatalogItem(value: unknown): value is CatalogItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CatalogItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.description === 'string' &&
    (item.category === 'labor' || item.category === 'material' || item.category === 'other') &&
    typeof item.unitPrice === 'number' &&
    typeof item.defaultQuantity === 'number'
  );
}

export function loadCatalogItems(): CatalogItem[] {
  if (typeof window === 'undefined') {
    return starterCatalogItems;
  }

  try {
    const storedValue = window.localStorage.getItem(CATALOG_STORAGE_KEY);

    if (!storedValue) {
      return starterCatalogItems;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return starterCatalogItems;
    }

    return parsedValue.filter(isCatalogItem);
  } catch {
    return starterCatalogItems;
  }
}

export function saveCatalogItems(items: CatalogItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(items));
}
