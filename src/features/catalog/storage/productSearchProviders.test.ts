import { describe, expect, it } from 'vitest';
import type { CatalogHubItem, CatalogSupplier } from './catalogHubStorage';
import { buildProductSearchResults, productSearchDisclaimer } from './productSearchProviders';

const now = '2026-05-03T12:00:00.000Z';

const supplier: CatalogSupplier = {
  id: 'supplier-test',
  name: 'Loja Teste',
  segment: 'Materiais elétricos',
  websiteUrl: 'https://example.com',
  searchUrlTemplate: 'https://example.com/busca?q={query}',
  createdAt: now,
  updatedAt: now,
};

const catalogItem: CatalogHubItem = {
  id: 'item-20a',
  kind: 'material',
  title: 'Tomada 20A 2P+T modulo branco',
  category: 'Tomadas',
  unit: 'un',
  defaultQuantity: 1,
  defaultUnitValue: 18.9,
  destination: 'both',
  itemType: 'material',
  purchaseGuidance: 'Nao substituir por tomada 10A.',
  createdAt: now,
  updatedAt: now,
};

describe('productSearchProviders', () => {
  it('builds local, supplier and manual reference results without fetching the network', () => {
    const results = buildProductSearchResults({
      query: 'tomada 20A',
      catalogItems: [catalogItem],
      suppliers: [supplier],
      observedPrice: '22,50',
      productUrl: 'https://loja.example/produto',
    });

    expect(results.map((result) => result.providerId)).toEqual(['manual-reference', 'local-catalog', 'supplier-search']);
    expect(results[0]).toMatchObject({ title: 'tomada 20A', priceReference: 22.5, link: 'https://loja.example/produto' });
    expect(results[1]).toMatchObject({ title: catalogItem.title, priceReference: 18.9 });
    expect(results[2].link).toBe('https://example.com/busca?q=tomada%2020A');
  });

  it('keeps the online warning explicit', () => {
    expect(productSearchDisclaimer()).toContain('Preço e disponibilidade podem mudar');
  });
});
