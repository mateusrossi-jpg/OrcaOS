import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  loadCatalogItems,
  saveCatalogItems,
  starterCatalogItems,
} from './catalogStorage';

describe('budget catalog storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('returns starter catalog items when no custom catalog exists', () => {
    expect(loadCatalogItems()).toEqual(starterCatalogItems);
  });

  it('saves and loads custom catalog items', () => {
    const items = [
      {
        id: 'custom-service',
        description: 'Instalação técnica',
        category: 'labor' as const,
        unitPrice: 150,
        defaultQuantity: 1,
        notes: 'Valor base.',
      },
    ];

    saveCatalogItems(items);

    expect(loadCatalogItems()).toEqual(items);
  });

  it('filters invalid stored catalog records', () => {
    window.localStorage.setItem('orcaos:catalog-items:v1', JSON.stringify([
      {
        id: 'valid',
        description: 'Item válido',
        category: 'material',
        unitPrice: 12,
        defaultQuantity: 2,
      },
      { id: 'invalid-category', description: 'Inválido', category: 'wrong', unitPrice: 1, defaultQuantity: 1 },
      { id: 'invalid-price', description: 'Inválido', category: 'material', unitPrice: '12', defaultQuantity: 1 },
    ]));

    expect(loadCatalogItems()).toEqual([
      {
        id: 'valid',
        description: 'Item válido',
        category: 'material',
        unitPrice: 12,
        defaultQuantity: 2,
      },
    ]);
  });

  it('falls back to starter catalog for invalid JSON or unavailable storage', () => {
    window.localStorage.setItem('orcaos:catalog-items:v1', '{invalid-json');
    expect(loadCatalogItems()).toEqual(starterCatalogItems);

    vi.unstubAllGlobals();
    expect(loadCatalogItems()).toEqual(starterCatalogItems);
  });
});
