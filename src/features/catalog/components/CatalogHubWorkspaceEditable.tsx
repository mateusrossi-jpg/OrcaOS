import { useEffect, useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import {
  buildSupplierSearchUrl,
  createCatalogId,
  loadCatalogHubItems,
  loadCatalogSuppliers,
  saveCatalogHubItems,
  saveCatalogSuppliers,
  type CatalogHubItem,
  type CatalogHubItemKind,
  type CatalogSupplier,
} from '../storage/catalogHubStorage';
import {
  buildProductSearchResults,
  productSearchDisclaimer,
  type ProductSearchResult,
} from '../storage/productSearchProviders';
import './CatalogHubWorkspace.css';

interface CatalogHubWorkspaceProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  initialTab?: CatalogTab;
  enabledTabs?: CatalogTab[];
}

type CatalogTab = 'items' | 'suppliers' | 'online';
type CatalogItemsView = 'list' | 'form';

interface ItemDraft {
  kind: CatalogHubItemKind;
  title: string;
  popularName: string;
  category: string;
  professionArea: string;
  technicalDescription: string;
  brand: string;
  supplierId: string;
  model: string;
  reference: string;
  unit: string;
  defaultQuantity: string;
  defaultUnitValue: string;
  priceUpdatedAt: string;
  dataOrigin: NonNullable<CatalogHubItem['dataOrigin']>;
  compatibility: string;
  acceptedAlternatives: string;
  forbiddenAlternatives: string;
  clientNote: string;
  professionalNote: string;
  destination: CalculationDestination;
  notes: string;
  sourceUrl: string;
  imageUrl: string;
  purchaseGuidance: string;
}

interface SupplierDraft {
  name: string;
  segment: string;
  websiteUrl: string;
  catalogUrl: string;
  searchUrlTemplate: string;
  phone: string;
  notes: string;
}

const emptyItemDraft: ItemDraft = {
  kind: 'material',
  title: '',
  popularName: '',
  category: '',
  professionArea: '',
  technicalDescription: '',
  brand: '',
  supplierId: '',
  model: '',
  reference: '',
  unit: 'un',
  defaultQuantity: '1',
  defaultUnitValue: '0',
  priceUpdatedAt: '',
  dataOrigin: 'manual',
  compatibility: '',
  acceptedAlternatives: '',
  forbiddenAlternatives: '',
  clientNote: '',
  professionalNote: '',
  destination: 'both',
  notes: '',
  sourceUrl: '',
  imageUrl: '',
  purchaseGuidance: '',
};

const emptySupplierDraft: SupplierDraft = {
  name: '',
  segment: '',
  websiteUrl: '',
  catalogUrl: '',
  searchUrlTemplate: '',
  phone: '',
  notes: '',
};

const CATALOG_VISIBLE_LIMIT = 5;

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function parseDecimal(value: string, fallback = 0): number {
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function itemKindLabel(kind: CatalogHubItemKind): string {
  if (kind === 'material') return 'Material';
  if (kind === 'labor') return 'Mão de obra';
  if (kind === 'service') return 'Serviço composto';
  if (kind === 'travel') return 'Deslocamento';
  if (kind === 'fee') return 'Taxa';
  return 'Item personalizado';
}

function itemTypeForKind(kind: CatalogHubItemKind): TechnicalItemType {
  if (kind === 'material') return 'material';
  if (kind === 'labor' || kind === 'service') return 'service';
  return 'technicalObservation';
}

function defaultCategoryForKind(kind: CatalogHubItemKind): string {
  if (kind === 'material') return 'Materiais';
  if (kind === 'labor') return 'Mão de obra';
  if (kind === 'service') return 'Serviços compostos';
  if (kind === 'travel') return 'Deslocamento';
  if (kind === 'fee') return 'Taxas';
  return 'Itens personalizados';
}

function destinationLabel(destination: CalculationDestination): string {
  if (destination === 'survey') return 'Atendimento';
  if (destination === 'budget') return 'Orçamento';
  return 'Ambos';
}

function addActionLabel(destination: CalculationDestination): string {
  if (destination === 'survey') return 'Enviar ao atendimento';
  if (destination === 'budget') return 'Enviar ao orçamento';
  return 'Enviar aos dois';
}

function searchResultSourceLabel(result: ProductSearchResult): string {
  if (result.providerId === 'local-catalog') return 'Catálogo local';
  if (result.providerId === 'supplier-search') return `Fornecedor · ${sanitizeCatalogDisplayText(result.sourceName)}`;
  return 'Referência revisada';
}

function sanitizeCatalogDisplayText(value: string): string {
  return value
    .replace(/Schneider Electric/gi, 'Fornecedor elétrico')
    .replace(/Schneider/gi, 'Fabricante A')
    .replace(/Margirius/gi, 'Fabricante B')
    .replace(/Tramontina/gi, 'Fabricante C')
    .replace(/\bWEG\b/gi, 'Fabricante D')
    .replace(/Steck/gi, 'Fabricante E')
    .replace(/Intelbras/gi, 'Fabricante F')
    .replace(/Tigre/gi, 'Fabricante G');
}

function sanitizeSupplier(supplier: CatalogSupplier): CatalogSupplier {
  return {
    ...supplier,
    name: sanitizeCatalogDisplayText(supplier.name),
    segment: sanitizeCatalogDisplayText(supplier.segment),
    websiteUrl: undefined,
    catalogUrl: undefined,
    searchUrlTemplate: supplier.searchUrlTemplate?.includes('site%3A') ? 'https://www.google.com/search?q={query}' : sanitizeCatalogDisplayText(supplier.searchUrlTemplate ?? ''),
    notes: sanitizeCatalogDisplayText(supplier.notes ?? ''),
  };
}

function sanitizeItem(item: CatalogHubItem): CatalogHubItem {
  return {
    ...item,
    brand: item.brand ? sanitizeCatalogDisplayText(item.brand) : item.brand,
    supplierId: item.supplierId,
    sourceUrl: item.sourceUrl?.includes('se.com') ? undefined : item.sourceUrl,
    notes: item.notes ? sanitizeCatalogDisplayText(item.notes) : item.notes,
  };
}

function itemToDraft(item: CatalogHubItem): ItemDraft {
  return {
    kind: item.kind,
    title: item.title,
    popularName: item.popularName ?? '',
    category: item.category,
    professionArea: item.professionArea ?? '',
    technicalDescription: item.technicalDescription ?? '',
    brand: item.brand ?? '',
    supplierId: item.supplierId ?? '',
    model: item.model ?? '',
    reference: item.reference ?? '',
    unit: item.unit,
    defaultQuantity: String(item.defaultQuantity),
    defaultUnitValue: String(item.defaultUnitValue),
    priceUpdatedAt: item.priceUpdatedAt ?? '',
    dataOrigin: item.dataOrigin ?? 'manual',
    compatibility: item.compatibility ?? '',
    acceptedAlternatives: item.acceptedAlternatives ?? '',
    forbiddenAlternatives: item.forbiddenAlternatives ?? '',
    clientNote: item.clientNote ?? '',
    professionalNote: item.professionalNote ?? '',
    destination: item.destination,
    notes: item.notes ?? '',
    sourceUrl: item.sourceUrl ?? '',
    imageUrl: item.imageUrl ?? '',
    purchaseGuidance: item.purchaseGuidance ?? '',
  };
}

function supplierToDraft(supplier: CatalogSupplier): SupplierDraft {
  return {
    name: supplier.name,
    segment: supplier.segment,
    websiteUrl: supplier.websiteUrl ?? '',
    catalogUrl: supplier.catalogUrl ?? '',
    searchUrlTemplate: supplier.searchUrlTemplate ?? '',
    phone: supplier.phone ?? '',
    notes: supplier.notes ?? '',
  };
}

function buildCatalogItemFromDraft(draft: ItemDraft, existingItem?: CatalogHubItem): CatalogHubItem | null {
  const title = draft.title.trim();
  if (!title) return null;

  const timestamp = new Date().toISOString();
  const kind = draft.kind;

  return {
    id: existingItem?.id ?? createCatalogId('catalog-hub-item'),
    kind,
    title,
    popularName: draft.popularName.trim() || undefined,
    category: draft.category.trim() || defaultCategoryForKind(kind),
    professionArea: draft.professionArea.trim() || undefined,
    technicalDescription: draft.technicalDescription.trim() || undefined,
    brand: draft.brand.trim() || undefined,
    supplierId: draft.supplierId || undefined,
    model: draft.model.trim() || undefined,
    reference: draft.reference.trim() || undefined,
    unit: draft.unit.trim() || 'un',
    defaultQuantity: parseDecimal(draft.defaultQuantity, 1),
    defaultUnitValue: parseDecimal(draft.defaultUnitValue, 0),
    priceUpdatedAt: draft.priceUpdatedAt || timestamp,
    dataOrigin: draft.dataOrigin,
    compatibility: draft.compatibility.trim() || undefined,
    acceptedAlternatives: draft.acceptedAlternatives.trim() || undefined,
    forbiddenAlternatives: draft.forbiddenAlternatives.trim() || undefined,
    clientNote: draft.clientNote.trim() || undefined,
    professionalNote: draft.professionalNote.trim() || undefined,
    destination: draft.destination,
    itemType: itemTypeForKind(kind),
    notes: draft.notes.trim() || undefined,
    sourceUrl: draft.sourceUrl.trim() || undefined,
    imageUrl: draft.imageUrl.trim() || undefined,
    purchaseGuidance: draft.purchaseGuidance.trim() || undefined,
    createdAt: existingItem?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function createCaptureFromCatalogItem(item: CatalogHubItem): CalculationCapture {
  const subtotal = item.defaultQuantity * item.defaultUnitValue;
  return {
    id: createCatalogId('catalog-hub-capture'),
    module: 'orcamentoTecnico',
    moduleLabel: 'Catálogo profissional',
    calculatorLabel: itemKindLabel(item.kind),
    destination: item.destination,
    createdAt: new Date().toISOString(),
    summary: `${item.title} · ${item.defaultQuantity} ${item.unit} × ${money(item.defaultUnitValue)}`,
    details: [
      `Tipo: ${itemKindLabel(item.kind)}`,
      `Nome popular: ${item.popularName || 'não informado'}`,
      `Categoria: ${item.category || 'não informada'}`,
      `Área/profissão: ${item.professionArea || 'não informada'}`,
      `Descrição técnica: ${item.technicalDescription || 'não informada'}`,
      `Marca: ${item.brand || 'não informada'}`,
      `Modelo: ${item.model || 'não informado'}`,
      `Referência: ${item.reference || 'não informada'}`,
      `Unidade: ${item.unit}`,
      `Quantidade padrão: ${item.defaultQuantity}`,
      `Valor unitário: ${money(item.defaultUnitValue)}`,
      `Origem do dado: ${item.dataOrigin || 'manual'}`,
      `Preço atualizado em: ${item.priceUpdatedAt ? new Intl.DateTimeFormat('pt-BR').format(new Date(item.priceUpdatedAt)) : 'não informado'}`,
      `Subtotal: ${money(subtotal)}`,
      `Destino: ${destinationLabel(item.destination)}`,
      item.compatibility ? `Compatibilidade: ${item.compatibility}` : 'Compatibilidade: conferir antes de comprar.',
      item.acceptedAlternatives ? `Alternativas aceitas: ${item.acceptedAlternatives}` : 'Alternativas aceitas: definir com o profissional.',
      item.forbiddenAlternatives ? `Alternativas proibidas: ${item.forbiddenAlternatives}` : 'Alternativas proibidas: não informadas.',
      item.clientNote ? `Observação para o cliente: ${item.clientNote}` : 'Observação para o cliente: seguir orientação de compra.',
      item.professionalNote ? `Observação técnica profissional: ${item.professionalNote}` : 'Observação técnica profissional: validar em campo.',
      item.sourceUrl ? `Fonte/catálogo: ${item.sourceUrl}` : 'Fonte/catálogo: não informado',
      item.imageUrl ? `Imagem de referência: ${item.imageUrl}` : 'Imagem de referência: não informada',
      item.purchaseGuidance ? `Orientação de compra: ${item.purchaseGuidance}` : 'Orientação de compra: conferir marca, modelo e compatibilidade antes de comprar.',
      item.notes ? `Observação: ${item.notes}` : 'Origem: cadastro de catálogo profissional',
    ],
    itemType: item.itemType,
    editableDescription: item.title,
    technicalNote: [item.purchaseGuidance, item.clientNote, item.compatibility, item.forbiddenAlternatives ? `Não substituir por: ${item.forbiddenAlternatives}` : null, item.notes || 'Item vindo do catálogo profissional.'].filter(Boolean).join(' '),
    quantity: String(item.defaultQuantity),
    unitValue: String(item.defaultUnitValue),
    materialSupplyMode: item.kind === 'material' ? 'client' : undefined,
    materialSupplyLabel: item.kind === 'material' ? 'Referência para compra do cliente' : undefined,
    clientPurchaseRequired: item.kind === 'material' ? true : undefined,
    imageDataUrl: item.imageUrl,
    shouldGenerateBudgetItem: item.destination !== 'survey',
    convertedToBudgetItem: false,
    reportReady: item.destination === 'survey' || item.destination === 'both',
  };
}

export function CatalogHubWorkspace({ onSendToBudget, initialTab = 'items', enabledTabs }: CatalogHubWorkspaceProps) {
  const availableTabs = enabledTabs ?? ['items', 'suppliers', 'online'];
  const [activeTab, setActiveTab] = useState<CatalogTab>(availableTabs.includes(initialTab) ? initialTab : availableTabs[0] ?? 'items');
  const [itemsView, setItemsView] = useState<CatalogItemsView>('list');
  const [items, setItems] = useState<CatalogHubItem[]>(() => loadCatalogHubItems().map(sanitizeItem));
  const [suppliers, setSuppliers] = useState<CatalogSupplier[]>(() => loadCatalogSuppliers().map(sanitizeSupplier));
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItemDraft);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [supplierDraft, setSupplierDraft] = useState<SupplierDraft>(emptySupplierDraft);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | CatalogHubItemKind>('all');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [originFilter, setOriginFilter] = useState<'all' | NonNullable<CatalogHubItem['dataOrigin']>>('all');
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineSupplierId, setOnlineSupplierId] = useState('');
  const [onlineObservedPrice, setOnlineObservedPrice] = useState('');
  const [onlineReference, setOnlineReference] = useState('');
  const [onlineProductUrl, setOnlineProductUrl] = useState('');
  const [onlineImageUrl, setOnlineImageUrl] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => saveCatalogHubItems(items), [items]);
  useEffect(() => saveCatalogSuppliers(suppliers), [suppliers]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const kindMatches = kindFilter === 'all' || item.kind === kindFilter;
      const supplierMatches = !supplierFilter || item.supplierId === supplierFilter;
      const categoryMatches = !categoryFilter || item.category === categoryFilter;
      const brandMatches = !brandFilter || item.brand === brandFilter;
      const originMatches = originFilter === 'all' || item.dataOrigin === originFilter;
      const supplierName = suppliers.find((supplier) => supplier.id === item.supplierId)?.name;
      const textMatches = !normalizedQuery || [item.title, item.popularName, item.category, item.professionArea, item.technicalDescription, item.brand, supplierName, item.model, item.reference, item.compatibility, item.acceptedAlternatives, item.forbiddenAlternatives, item.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
      return kindMatches && supplierMatches && categoryMatches && brandMatches && originMatches && textMatches;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [brandFilter, categoryFilter, items, kindFilter, originFilter, query, supplierFilter, suppliers]);

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [items]);
  const brands = useMemo(() => Array.from(new Set(items.map((item) => item.brand).filter((brand): brand is string => Boolean(brand)))).sort((a, b) => a.localeCompare(b)), [items]);
  const itemKindStats = useMemo(() => ([
    { kind: 'material' as const, label: 'Materiais', count: items.filter((item) => item.kind === 'material').length },
    { kind: 'labor' as const, label: 'Mão de obra', count: items.filter((item) => item.kind === 'labor').length },
    { kind: 'service' as const, label: 'Serviços compostos', count: items.filter((item) => item.kind === 'service').length },
    { kind: 'travel' as const, label: 'Deslocamento', count: items.filter((item) => item.kind === 'travel').length },
    { kind: 'fee' as const, label: 'Taxas', count: items.filter((item) => item.kind === 'fee').length },
    { kind: 'custom' as const, label: 'Personalizados', count: items.filter((item) => item.kind === 'custom').length },
  ]), [items]);
  const onlineSupplier = suppliers.find((supplier) => supplier.id === onlineSupplierId) ?? suppliers[0];
  const onlineUrl = onlineSupplier ? buildSupplierSearchUrl(onlineSupplier, onlineQuery) : '';
  const isEditingItem = Boolean(editingItemId);
  const onlineResults = useMemo(() => buildProductSearchResults({
    query: onlineQuery,
    catalogItems: items,
    suppliers: onlineSupplier ? [onlineSupplier] : suppliers,
    observedPrice: onlineObservedPrice,
    productUrl: onlineProductUrl,
    imageUrl: onlineImageUrl,
  }), [items, onlineImageUrl, onlineObservedPrice, onlineProductUrl, onlineQuery, onlineSupplier, suppliers]);
  const hasItemLookup = Boolean(query.trim()) || kindFilter !== 'all' || Boolean(supplierFilter) || Boolean(categoryFilter) || Boolean(brandFilter) || originFilter !== 'all';
  const visibleFilteredItems = hasItemLookup ? filteredItems.slice(0, CATALOG_VISIBLE_LIMIT) : [];
  const hiddenFilteredItemCount = hasItemLookup ? Math.max(filteredItems.length - visibleFilteredItems.length, 0) : 0;
  const filteredSuppliers = suppliers.filter((supplier) => {
    const normalizedSearch = supplierSearch.trim().toLowerCase();
    if (!normalizedSearch) return false;
    return [supplier.name, supplier.segment, supplier.websiteUrl, supplier.catalogUrl, supplier.phone, supplier.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch);
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const visibleSuppliers = filteredSuppliers.slice(0, CATALOG_VISIBLE_LIMIT);
  const hiddenSupplierCount = Math.max(filteredSuppliers.length - visibleSuppliers.length, 0);
  const visibleOnlineResults = onlineResults.slice(0, CATALOG_VISIBLE_LIMIT);
  const hiddenOnlineResultCount = Math.max(onlineResults.length - visibleOnlineResults.length, 0);

  function updateItemDraft<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setItemDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSupplierDraft<K extends keyof SupplierDraft>(key: K, value: SupplierDraft[K]) {
    setSupplierDraft((current) => ({ ...current, [key]: value }));
  }

  function resetItemForm() {
    setItemDraft(emptyItemDraft);
    setEditingItemId(null);
  }

  function resetSupplierForm() {
    setSupplierDraft(emptySupplierDraft);
    setEditingSupplierId(null);
  }

  function saveItem() {
    const existingItem = editingItemId ? items.find((item) => item.id === editingItemId) : undefined;
    const nextItem = buildCatalogItemFromDraft(itemDraft, existingItem);
    if (!nextItem) return;

    if (editingItemId) {
      setItems((current) => current.map((item) => (item.id === editingItemId ? nextItem : item)));
      setFeedback('Item atualizado no catálogo profissional.');
    } else {
      setItems((current) => [nextItem, ...current]);
      setFeedback('Item cadastrado no catálogo profissional.');
    }

    resetItemForm();
    setItemsView('list');
  }

  function editItem(item: CatalogHubItem) {
    setItemDraft(itemToDraft(item));
    setEditingItemId(item.id);
    setActiveTab('items');
    setItemsView('form');
    setFeedback(`Editando: ${item.title}.`);
  }

  function duplicateItem(item: CatalogHubItem) {
    const timestamp = new Date().toISOString();
    const copy: CatalogHubItem = {
      ...item,
      id: createCatalogId('catalog-hub-item-copy'),
      title: `${item.title} cópia`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setItems((current) => [copy, ...current]);
    setFeedback(`${copy.title} foi duplicado.`);
  }

  function saveSupplier() {
    const name = supplierDraft.name.trim();
    if (!name) return;
    const now = new Date().toISOString();
    const existingSupplier = editingSupplierId ? suppliers.find((supplier) => supplier.id === editingSupplierId) : undefined;
    const nextSupplier: CatalogSupplier = {
      id: existingSupplier?.id ?? createCatalogId('catalog-supplier'),
      name,
      segment: supplierDraft.segment.trim() || 'Fornecedor geral',
      websiteUrl: supplierDraft.websiteUrl.trim() || undefined,
      catalogUrl: supplierDraft.catalogUrl.trim() || undefined,
      searchUrlTemplate: supplierDraft.searchUrlTemplate.trim() || undefined,
      phone: supplierDraft.phone.trim() || undefined,
      notes: supplierDraft.notes.trim() || undefined,
      createdAt: existingSupplier?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingSupplier) {
      setSuppliers((current) => current.map((supplier) => (supplier.id === existingSupplier.id ? nextSupplier : supplier)));
      setFeedback('Fornecedor atualizado.');
    } else {
      setSuppliers((current) => [nextSupplier, ...current]);
      setFeedback('Fornecedor cadastrado.');
    }

    resetSupplierForm();
  }

  function editSupplier(supplier: CatalogSupplier) {
    setSupplierDraft(supplierToDraft(supplier));
    setEditingSupplierId(supplier.id);
    setActiveTab('suppliers');
    setFeedback(`Editando fornecedor: ${supplier.name}.`);
  }

  function removeItem(id: string) {
    const item = items.find((currentItem) => currentItem.id === id);
    const confirmed = window.confirm(`Remover ${item?.title ?? 'este item'} do catálogo local? Essa ação não remove orçamentos já salvos.`);
    if (!confirmed) return;
    if (editingItemId === id) resetItemForm();
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function removeSupplier(id: string) {
    const supplier = suppliers.find((currentSupplier) => currentSupplier.id === id);
    const confirmed = window.confirm(`Remover ${supplier?.name ?? 'este fornecedor'}? Os itens já cadastrados ficam no catálogo, mas perdem esse vínculo.`);
    if (!confirmed) return;
    if (editingSupplierId === id) resetSupplierForm();
    setSuppliers((current) => current.filter((supplier) => supplier.id !== id));
  }

  function sendItem(item: CatalogHubItem) {
    onSendToBudget([createCaptureFromCatalogItem(item)]);
    setFeedback(`${item.title} foi enviado para ${destinationLabel(item.destination).toLowerCase()}.`);
  }

  function fillItemFromOnlineSearch(result?: ProductSearchResult) {
    const observedPrice = result?.priceReference !== undefined ? String(result.priceReference) : onlineObservedPrice.trim();
    const reference = onlineReference.trim() || result?.title || '';
    const sourceUrl = result?.link || onlineProductUrl.trim() || onlineUrl;
    const imageUrl = result?.imageUrl || onlineImageUrl.trim();
    const today = new Intl.DateTimeFormat('pt-BR').format(new Date());
    const onlineNote = [
      observedPrice ? `Preço observado: ${money(parseDecimal(observedPrice))} em ${today}.` : null,
      `${result?.providerName ?? 'Referência online'} escolhida pelo profissional. Confirmar disponibilidade antes de enviar proposta.`,
      result?.note,
    ].filter(Boolean).join(' ');
    const purchaseGuidance = [
      'Comprar este produto ou equivalente validado pelo profissional.',
      reference ? `Conferir referência/modelo: ${reference}.` : null,
      sourceUrl ? `Link de referência: ${sourceUrl}.` : null,
    ].filter(Boolean).join(' ');

    if (result?.title) setOnlineReference(result.title);
    if (result?.link) setOnlineProductUrl(result.link);
    if (result?.imageUrl) setOnlineImageUrl(result.imageUrl);
    if (observedPrice) setOnlineObservedPrice(observedPrice);
    setEditingItemId(null);
    updateItemDraft('title', result?.title || onlineQuery);
    updateItemDraft('popularName', onlineQuery);
    updateItemDraft('supplierId', result?.providerId === 'supplier-search' ? onlineSupplier?.id ?? '' : '');
    updateItemDraft('brand', sanitizeCatalogDisplayText(result?.sourceName || onlineSupplier?.name || ''));
    updateItemDraft('reference', reference);
    if (observedPrice) updateItemDraft('defaultUnitValue', observedPrice);
    updateItemDraft('priceUpdatedAt', new Date().toISOString());
    updateItemDraft('dataOrigin', result?.providerId === 'manual-reference' ? 'online-reference' : result?.providerId === 'supplier-search' ? 'supplier' : 'local-catalog');
    updateItemDraft('sourceUrl', sourceUrl);
    updateItemDraft('imageUrl', imageUrl);
    updateItemDraft('purchaseGuidance', purchaseGuidance);
    updateItemDraft('notes', itemDraft.notes.trim() ? `${itemDraft.notes.trim()}\n${onlineNote}` : onlineNote);
    setActiveTab('items');
    setItemsView('form');
    setFeedback('Referência online enviada para o formulário. Confira preço, modelo e disponibilidade antes de salvar.');
  }

  function handleItemImageFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') updateItemDraft('imageUrl', reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleOnlineImageFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setOnlineImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="catalog-hub-workspace">
      <div className="orca-panel-card">
        <header>
          <div>
            <h2>{activeTab === 'online' ? 'Consulta Online' : 'Catálogo Profissional'}</h2>
          </div>
        </header>
      </div>

      {availableTabs.length > 1 && (
        <div className="home-action-toolbar">
          {availableTabs.includes('items') && <button className={`ghost-action ${activeTab === 'items' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('items')}>Itens</button>}
          {availableTabs.includes('suppliers') && <button className={`ghost-action ${activeTab === 'suppliers' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('suppliers')}>Fornecedores</button>}
          {availableTabs.includes('online') && <button className={`ghost-action ${activeTab === 'online' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('online')}>Online</button>}
        </div>
      )}

      {activeTab === 'items' && (
        <>
          <div className="dashboard-finance-tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            {itemKindStats.map((stat) => (
              <button className={`finance-tile ${kindFilter === stat.kind ? 'active' : ''}`} key={stat.kind} type="button" onClick={() => setKindFilter(stat.kind)} style={{ cursor: 'pointer', textAlign: 'left', border: kindFilter === stat.kind ? '1px solid #f59e0b' : '1px solid #222' }}>
                <span style={{ fontSize: '0.65rem' }}>{stat.label}</span>
                <strong style={{ fontSize: '1.2rem' }}>{stat.count}</strong>
              </button>
            ))}
          </div>

          <div className="home-action-toolbar">
            <button className={`ghost-action ${itemsView === 'list' ? 'active' : ''}`} type="button" onClick={() => setItemsView('list')}>Lista</button>
            <button className={`ghost-action ${itemsView === 'form' ? 'active' : ''}`} type="button" onClick={() => { resetItemForm(); setItemsView('form'); }}>Novo Item</button>
          </div>

          {itemsView === 'form' && <div className="orca-panel-card catalog-form-card">
            <header>
              <div>
                <h2>{isEditingItem ? 'Editar Item' : 'Novo Item'}</h2>
              </div>
            </header>
            <div className="catalog-hub-grid">
              <label><span>Tipo</span><select value={itemDraft.kind} onChange={(event) => updateItemDraft('kind', event.target.value as CatalogHubItemKind)}><option value="material">Material</option><option value="labor">Mão de obra</option><option value="service">Serviço composto</option><option value="travel">Deslocamento</option><option value="fee">Taxa</option><option value="custom">Item personalizado</option></select></label>
              <label className="wide"><span>Descrição</span><input value={itemDraft.title} placeholder="Ex.: Módulo tomada 2P+T 20A branco" onChange={(event) => updateItemDraft('title', event.target.value)} /></label>
              <label><span>Nome popular</span><input value={itemDraft.popularName} placeholder="Ex.: tomada 20A" onChange={(event) => updateItemDraft('popularName', event.target.value)} /></label>
              <label><span>Categoria</span><input list="catalog-categories" value={itemDraft.category} placeholder="Ex.: Tomadas e módulos" onChange={(event) => updateItemDraft('category', event.target.value)} /><datalist id="catalog-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label>
              <label><span>Área/profissão</span><input value={itemDraft.professionArea} placeholder="Ex.: Elétrica" onChange={(event) => updateItemDraft('professionArea', event.target.value)} /></label>
              <label className="wide"><span>Descrição técnica</span><input value={itemDraft.technicalDescription} placeholder="Ex.: módulo 20A 2P+T para placa modular compatível" onChange={(event) => updateItemDraft('technicalDescription', event.target.value)} /></label>
              <label><span>Marca</span><input value={itemDraft.brand} placeholder="Ex.: Fabricante" onChange={(event) => updateItemDraft('brand', event.target.value)} /></label>
              <label><span>Fornecedor</span><select value={itemDraft.supplierId} onChange={(event) => updateItemDraft('supplierId', event.target.value)}><option value="">Sem fornecedor</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
              <label><span>Modelo</span><input value={itemDraft.model} placeholder="Opcional" onChange={(event) => updateItemDraft('model', event.target.value)} /></label>
              <label><span>Referência/SKU</span><input value={itemDraft.reference} placeholder="Opcional" onChange={(event) => updateItemDraft('reference', event.target.value)} /></label>
              <label><span>Unidade</span><input value={itemDraft.unit} placeholder="un, m, cx, ponto..." onChange={(event) => updateItemDraft('unit', event.target.value)} /></label>
              <label><span>Qtd. padrão</span><input inputMode="decimal" value={itemDraft.defaultQuantity} onChange={(event) => updateItemDraft('defaultQuantity', event.target.value)} /></label>
              <label><span>Valor unitário</span><input inputMode="decimal" value={itemDraft.defaultUnitValue} onChange={(event) => updateItemDraft('defaultUnitValue', event.target.value)} /></label>
              <label><span>Origem do dado</span><select value={itemDraft.dataOrigin} onChange={(event) => updateItemDraft('dataOrigin', event.target.value as NonNullable<CatalogHubItem['dataOrigin']>)}><option value="manual">Manual</option><option value="local-catalog">Catálogo local</option><option value="online-reference">Referência online</option><option value="supplier">Fornecedor</option></select></label>
              <label><span>Preço atualizado em</span><input type="date" value={itemDraft.priceUpdatedAt ? itemDraft.priceUpdatedAt.slice(0, 10) : ''} onChange={(event) => updateItemDraft('priceUpdatedAt', event.target.value ? new Date(`${event.target.value}T12:00:00`).toISOString() : '')} /></label>
              <label><span>Destino</span><select value={itemDraft.destination} onChange={(event) => updateItemDraft('destination', event.target.value as CalculationDestination)}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
              <label className="wide"><span>Link fonte/catálogo</span><input value={itemDraft.sourceUrl} placeholder="https://..." onChange={(event) => updateItemDraft('sourceUrl', event.target.value)} /></label>
              <label className="wide"><span>Foto ou URL da imagem</span><input value={itemDraft.imageUrl} placeholder="Cole uma URL de imagem ou envie uma foto abaixo" onChange={(event) => updateItemDraft('imageUrl', event.target.value)} /></label>
              <label className="wide file-reference-field"><span>Enviar foto de referência</span><input accept="image/*" type="file" onChange={(event) => handleItemImageFile(event.target.files?.[0])} /></label>
              <label className="wide"><span>Compatibilidades</span><textarea value={itemDraft.compatibility} placeholder="Ex.: compatível com placa e suporte da mesma linha modular." onChange={(event) => updateItemDraft('compatibility', event.target.value)} /></label>
              <label className="wide"><span>Alternativas aceitas</span><textarea value={itemDraft.acceptedAlternatives} placeholder="Ex.: pode ser equivalente se for módulo 20A 2P+T da mesma linha." onChange={(event) => updateItemDraft('acceptedAlternatives', event.target.value)} /></label>
              <label className="wide"><span>Alternativas proibidas</span><textarea value={itemDraft.forbiddenAlternatives} placeholder="Ex.: não substituir por tomada 10A." onChange={(event) => updateItemDraft('forbiddenAlternatives', event.target.value)} /></label>
              <label className="wide"><span>Observação para o cliente</span><textarea value={itemDraft.clientNote} placeholder="Ex.: comprar tomada 20A 2P+T padrão brasileiro. Não substituir por 10A." onChange={(event) => updateItemDraft('clientNote', event.target.value)} /></label>
              <label className="wide"><span>Observação técnica profissional</span><textarea value={itemDraft.professionalNote} placeholder="Ex.: conferir circuito, proteção e seção do cabo antes da execução." onChange={(event) => updateItemDraft('professionalNote', event.target.value)} /></label>
              <label className="wide"><span>Orientação para compra</span><textarea value={itemDraft.purchaseGuidance} placeholder="Ex.: comprar exatamente este modelo ou equivalente validado; conferir tensão, cor, linha e encaixe..." onChange={(event) => updateItemDraft('purchaseGuidance', event.target.value)} /></label>
              <label className="wide"><span>Observação</span><textarea value={itemDraft.notes} placeholder="Ex.: confirmar disponibilidade, linha compatível, preço aproximado..." onChange={(event) => updateItemDraft('notes', event.target.value)} /></label>
            </div>
            {itemDraft.imageUrl && (
              <div className="catalog-reference-preview">
                <img src={itemDraft.imageUrl} alt={`Referência de ${itemDraft.title || 'produto'}`} />
                <span><strong>Foto de referência salva</strong><small>Essa imagem acompanha o item quando ele for enviado para relatório/lista de compra.</small></span>
              </div>
            )}
            <div className="catalog-hub-actions start-actions">
              <button className="primary-action inline-action" type="button" onClick={saveItem}>{isEditingItem ? 'Salvar alterações' : 'Cadastrar item'}</button>
              {isEditingItem && <button className="secondary-action inline-action" type="button" onClick={() => { resetItemForm(); setItemsView('list'); }}>Cancelar edição</button>}
              {!isEditingItem && <button className="secondary-action inline-action" type="button" onClick={() => setItemsView('list')}>Voltar para lista</button>}
            </div>
          </div>}

          {itemsView === 'list' && <div className="orca-panel-card catalog-list-card">
            <header>
              <div>
                <h2>Itens do Catálogo</h2>
              </div>
            </header>
            <div className="catalog-hub-grid compact catalog-filter-grid">
              <label className="wide"><span>Buscar</span><input value={query} placeholder="tomada, disjuntor, serviço, marca..." onChange={(event) => setQuery(event.target.value)} /></label>
              <label><span>Tipo</span><select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as 'all' | CatalogHubItemKind)}><option value="all">Todos</option><option value="material">Materiais</option><option value="labor">Mão de obra</option><option value="service">Serviços compostos</option><option value="travel">Deslocamento</option><option value="fee">Taxas</option><option value="custom">Personalizados</option></select></label>
              <label><span>Fornecedor</span><select value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}><option value="">Todos</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
              <label><span>Fabricante</span><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Todos</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
              <label><span>Categoria</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">Todas</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
              <label><span>Origem</span><select value={originFilter} onChange={(event) => setOriginFilter(event.target.value as 'all' | NonNullable<CatalogHubItem['dataOrigin']>)}><option value="all">Todas</option><option value="manual">Manual</option><option value="local-catalog">Catálogo local</option><option value="online-reference">Referência online</option><option value="supplier">Fornecedor</option></select></label>
            </div>
            <div className="catalog-list-meta"><span>{hasItemLookup ? `${filteredItems.length} de ${items.length} item(ns) · mostrando ${visibleFilteredItems.length}${hiddenFilteredItemCount > 0 ? ` · ${hiddenFilteredItemCount} oculto(s)` : ''}` : `${items.length} item(ns) cadastrados. Pesquise ou filtre para exibir.`}</span><button type="button" onClick={() => { setQuery(''); setKindFilter('all'); setSupplierFilter(''); setCategoryFilter(''); setBrandFilter(''); setOriginFilter('all'); }}>Limpar filtros</button></div>
            <div className="continuous-list">
              {!hasItemLookup && <div className="continuous-list-empty">Pesquise para listar os itens.</div>}
              {hasItemLookup && filteredItems.length === 0 && <div className="continuous-list-empty">Nenhum item encontrado.</div>}
              {visibleFilteredItems.map((item) => {
                const supplierName = suppliers.find((supplier) => supplier.id === item.supplierId)?.name;
                return (
                  <article className="continuous-list-item" key={item.id}>
                    <div className="client-col">
                      <strong>{item.title}</strong>
                      <small>{[itemKindLabel(item.kind), item.brand, supplierName].filter(Boolean).join(' · ')}</small>
                    </div>
                    <div className="value-col">{money(item.defaultUnitValue)}</div>
                    <div className="catalog-row-actions">
                      <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => editItem(item)}>Editar</button>
                      <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => sendItem(item)}>Enviar</button>
                    </div>
                  </article>
                );
              })}
              {hiddenFilteredItemCount > 0 && <div className="continuous-list-empty">+{hiddenFilteredItemCount} itens.</div>}
            </div>
          </div>}
        </>
      )}

      {activeTab === 'suppliers' && (
        <>
          <div className="orca-panel-card">
            <header>
              <div>
                <h2>{editingSupplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              </div>
            </header>
            <div className="catalog-hub-grid">
              <label><span>Nome</span><input value={supplierDraft.name} placeholder="Ex.: Fornecedor principal" onChange={(event) => updateSupplierDraft('name', event.target.value)} /></label>
              <label><span>Segmento</span><input value={supplierDraft.segment} placeholder="Ex.: Materiais elétricos" onChange={(event) => updateSupplierDraft('segment', event.target.value)} /></label>
              <label><span>Site</span><input value={supplierDraft.websiteUrl} placeholder="https://..." onChange={(event) => updateSupplierDraft('websiteUrl', event.target.value)} /></label>
              <label><span>Catálogo</span><input value={supplierDraft.catalogUrl} placeholder="https://..." onChange={(event) => updateSupplierDraft('catalogUrl', event.target.value)} /></label>
              <label className="wide"><span>Busca online com {'{query}'}</span><input value={supplierDraft.searchUrlTemplate} placeholder="https://www.google.com/search?q=site:fornecedor.com {query}" onChange={(event) => updateSupplierDraft('searchUrlTemplate', event.target.value)} /></label>
              <label><span>Telefone/WhatsApp</span><input value={supplierDraft.phone} placeholder="Opcional" onChange={(event) => updateSupplierDraft('phone', event.target.value)} /></label>
              <label className="wide"><span>Observações</span><textarea value={supplierDraft.notes} placeholder="Condições, região, prazo, observações de compra..." onChange={(event) => updateSupplierDraft('notes', event.target.value)} /></label>
            </div>
            <div className="catalog-hub-actions start-actions">
              <button className="primary-action inline-action" type="button" onClick={saveSupplier}>{editingSupplierId ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
              {editingSupplierId && <button className="secondary-action inline-action" type="button" onClick={resetSupplierForm}>Cancelar edição</button>}
            </div>
          </div>
            <div className="continuous-list">
              {!supplierSearch.trim() ? <div className="continuous-list-empty">Pesquise para listar fornecedores.</div> : filteredSuppliers.length === 0 && <div className="continuous-list-empty">Nenhum fornecedor encontrado.</div>}
            {visibleSuppliers.map((supplier) => (
              <article className="continuous-list-item" key={supplier.id}>
                <div className="client-col">
                  <strong>{supplier.name}</strong>
                  <small>{supplier.segment} · {supplier.phone || 'Sem contato'}</small>
                </div>
                <div className="catalog-hub-actions">
                  <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => editSupplier(supplier)}>Editar</button>
                  <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem', color: '#ef4444' }} type="button" onClick={() => removeSupplier(supplier.id)}>Remover</button>
                </div>
              </article>
            ))}
            {hiddenSupplierCount > 0 && <div className="continuous-list-empty">+{hiddenSupplierCount} fornecedores.</div>}
          </div>
        </>
      )}

      {activeTab === 'online' && (
        <div className="orca-panel-card online-card">
          <header>
            <div>
              <h2>Assistente de Busca</h2>
            </div>
          </header>
          <div className="catalog-hub-grid">
            <label className="wide"><span>O que pesquisar?</span><input value={onlineQuery} placeholder="Ex.: tomada 20A branca 2P+T" onChange={(event) => setOnlineQuery(event.target.value)} /></label>
            <label><span>Fornecedor/fabricante</span><select value={onlineSupplierId} onChange={(event) => setOnlineSupplierId(event.target.value)}>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
            <label><span>Preço observado</span><input inputMode="decimal" value={onlineObservedPrice} placeholder="Ex.: 18,90" onChange={(event) => setOnlineObservedPrice(event.target.value)} /></label>
            <label className="wide"><span>Referência escolhida</span><input value={onlineReference} placeholder="Ex.: SKU, modelo, código do fabricante ou link do produto" onChange={(event) => setOnlineReference(event.target.value)} /></label>
            <label className="wide"><span>Link do produto escolhido</span><input value={onlineProductUrl} placeholder="Cole aqui o link real do produto após abrir a consulta" onChange={(event) => setOnlineProductUrl(event.target.value)} /></label>
            <label className="wide"><span>Imagem do produto</span><input value={onlineImageUrl} placeholder="Cole uma URL de imagem ou envie uma foto abaixo" onChange={(event) => setOnlineImageUrl(event.target.value)} /></label>
            <label className="wide file-reference-field"><span>Enviar foto de referência</span><input accept="image/*" type="file" onChange={(event) => handleOnlineImageFile(event.target.files?.[0])} /></label>
          </div>
          <div className="online-result-box">
            <span>Consulta preparada</span>
            <strong>{sanitizeCatalogDisplayText(onlineSupplier?.name ?? 'Fornecedor')}</strong>
            <small>{onlineUrl || 'Cadastre um fornecedor com site/catálogo.'}</small>
            <small>Abra a busca, escolha o item real e registre link, foto, modelo e preço como referência comercial.</small>
            <small>{productSearchDisclaimer()}</small>
          </div>
          <div className="online-provider-grid">
            <article><span>1</span><strong>Catálogo local</strong><small>Mostra primeiro o que já foi salvo.</small></article>
            <article><span>2</span><strong>Fornecedor</strong><small>Abre busca oficial ou template cadastrado.</small></article>
            <article><span>3</span><strong>Revisão manual</strong><small>Nada entra sem conferir dados.</small></article>
          </div>
          <div className="online-results-list">
            {visibleOnlineResults.map((result) => (
              <article className="online-result-card" key={result.id}>
                {result.imageUrl && <img src={result.imageUrl} alt={`Referência de ${result.title}`} />}
                <div>
                  <span>{searchResultSourceLabel(result)}</span>
                  <strong>{sanitizeCatalogDisplayText(result.title)}</strong>
                  <small>{result.note}</small>
                  {result.priceReference !== undefined && <small>Preço referência: {money(result.priceReference)}</small>}
                  <small>Consulta: {new Intl.DateTimeFormat('pt-BR').format(new Date(result.checkedAt))}</small>
                </div>
                <div className="catalog-hub-actions">
                  {result.link && <a className="secondary-action inline-action" href={result.link} target="_blank" rel="noreferrer">Abrir</a>}
                  <button className="primary-action inline-action" type="button" onClick={() => fillItemFromOnlineSearch(result)}>Revisar e adicionar</button>
                </div>
              </article>
            ))}
            {hiddenOnlineResultCount > 0 && <div className="catalog-hidden-row">Mais {hiddenOnlineResultCount} resultado(s) oculto(s). Refine a busca para encontrar o produto certo.</div>}
          </div>
          {onlineImageUrl && (
            <div className="catalog-reference-preview">
              <img src={onlineImageUrl} alt={`Referência de ${onlineQuery}`} />
              <span><strong>Imagem pronta para referência</strong><small>Ao usar como referência, esta imagem será enviada para o cadastro do item.</small></span>
            </div>
          )}
          <div className="catalog-hub-actions start-actions">
            {onlineUrl && <a className="primary-action inline-action" href={onlineUrl} target="_blank" rel="noreferrer">Abrir consulta online</a>}
            <button className="secondary-action inline-action" type="button" onClick={() => fillItemFromOnlineSearch()}>Usar como referência</button>
          </div>
        </div>
      )}

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
