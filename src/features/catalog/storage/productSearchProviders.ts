import { buildSupplierSearchUrl, type CatalogHubItem, type CatalogSupplier } from './catalogHubStorage';

export type ProductSearchProviderId = 'local-catalog' | 'supplier-search' | 'manual-reference';

export interface ProductSearchResult {
  id: string;
  providerId: ProductSearchProviderId;
  providerName: string;
  title: string;
  sourceName: string;
  priceReference?: number;
  link?: string;
  imageUrl?: string;
  note: string;
  checkedAt: string;
}

interface BuildProductSearchResultsInput {
  query: string;
  catalogItems: CatalogHubItem[];
  suppliers: CatalogSupplier[];
  observedPrice?: string;
  productUrl?: string;
  imageUrl?: string;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseOptionalPrice(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function catalogItemMatchesQuery(item: CatalogHubItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;
  return [item.title, item.popularName, item.category, item.professionArea, item.technicalDescription, item.brand, item.model, item.reference, item.compatibility, item.acceptedAlternatives, item.forbiddenAlternatives, item.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery);
}

export function buildProductSearchResults({
  query,
  catalogItems,
  suppliers,
  observedPrice,
  productUrl,
  imageUrl,
}: BuildProductSearchResultsInput): ProductSearchResult[] {
  const checkedAt = new Date().toISOString();
  const priceReference = parseOptionalPrice(observedPrice);
  const trimmedQuery = query.trim();
  const results: ProductSearchResult[] = [];

  if (productUrl?.trim()) {
    results.push({
      id: `manual-${productUrl.trim()}`,
      providerId: 'manual-reference',
      providerName: 'Referência manual',
      title: trimmedQuery || 'Produto informado manualmente',
      sourceName: 'Link revisado pelo profissional',
      priceReference,
      link: productUrl.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      note: 'Link informado manualmente. Revise nome, quantidade, unidade e compatibilidade antes de salvar.',
      checkedAt,
    });
  }

  catalogItems
    .filter((item) => item.kind === 'material' && catalogItemMatchesQuery(item, trimmedQuery))
    .slice(0, 4)
    .forEach((item) => {
      results.push({
        id: `catalog-${item.id}`,
        providerId: 'local-catalog',
        providerName: 'Catálogo local',
        title: item.title,
        sourceName: item.brand || item.professionArea || item.category || 'Biblioteca OrçaOS',
        priceReference: item.defaultUnitValue,
        link: item.sourceUrl,
        imageUrl: item.imageUrl,
        note: [item.purchaseGuidance, item.compatibility, item.forbiddenAlternatives ? `Não substituir por: ${item.forbiddenAlternatives}` : null, item.notes || 'Item salvo localmente. Confirme preço e disponibilidade antes da compra.'].filter(Boolean).join(' '),
        checkedAt,
      });
    });

  suppliers.slice(0, 6).forEach((supplier) => {
    const link = buildSupplierSearchUrl(supplier, trimmedQuery);
    if (!link) return;
    results.push({
      id: `supplier-${supplier.id}-${trimmedQuery}`,
      providerId: 'supplier-search',
      providerName: 'Fornecedor cadastrado',
      title: trimmedQuery || `Consulta em ${supplier.name}`,
      sourceName: supplier.name,
      priceReference,
      link,
      imageUrl: imageUrl?.trim() || undefined,
      note: 'Consulta auxiliar por fornecedor. O app não coleta preço automaticamente nem depende de scraping.',
      checkedAt,
    });
  });

  return results;
}

export function productSearchDisclaimer(): string {
  return 'Preço e disponibilidade podem mudar. Confirme na loja antes da compra.';
}
