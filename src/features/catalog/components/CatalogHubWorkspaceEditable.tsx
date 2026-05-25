import { useEffect, useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import {
  buildSupplierSearchUrl,
  createCatalogId,
  type CatalogHubItem,
  type CatalogHubItemKind,
  type CatalogSupplier,
} from '../storage/catalogHubStorage';
import { catalogService } from '../../../services/catalogService';
import { catalogSupplierService } from '../../../services/catalogSupplierService';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import {
  buildProductSearchResults,
  productSearchDisclaimer,
  type ProductSearchResult,
} from '../storage/productSearchProviders';
import { Input, Select, TextArea, Button } from '../../../app/components/ui';
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

function itemTypeForKind(kind: CatalogHubItemKind) {
  if (kind === 'material') return 'material' as const;
  if (kind === 'labor' || kind === 'service') return 'service' as const;
  return 'technicalObservation' as const;
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

function sanitizeItem(item: CatalogHubItem): CatalogHubItem {
  return {
    ...item,
    brand: item.brand ? sanitizeCatalogDisplayText(item.brand) : item.brand,
    supplierId: item.supplierId,
    sourceUrl: item.sourceUrl?.includes('se.com') ? undefined : item.sourceUrl,
    notes: item.notes ? sanitizeCatalogDisplayText(item.notes) : item.notes,
  };
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

export function createCaptureFromCatalogItem(item: CatalogHubItem): CalculationCapture {
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
  const [items, setItems] = useState<CatalogHubItem[]>([]);
  const [suppliers, setSuppliers] = useState<CatalogSupplier[]>([]);
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItemDraft);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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

  async function loadData() {
    try {
      const [loadedItems, loadedSuppliers] = await Promise.all([
        catalogService.getAll(),
        catalogSupplierService.getAll(),
      ]);
      setItems(loadedItems.map(sanitizeItem));
      setSuppliers(loadedSuppliers.map(sanitizeSupplier));
    } catch (err) {
      console.error('Failed to load catalog workspace data:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
  
  const visibleOnlineResults = onlineResults.slice(0, CATALOG_VISIBLE_LIMIT);
  const hiddenOnlineResultCount = Math.max(onlineResults.length - visibleOnlineResults.length, 0);

  function updateItemDraft<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setItemDraft((current) => ({ ...current, [key]: value }));
  }

  function resetItemForm() {
    setItemDraft(emptyItemDraft);
    setEditingItemId(null);
  }

  async function saveItem() {
    const existingItem = editingItemId ? items.find((item) => item.id === editingItemId) : undefined;
    const nextItem = buildCatalogItemFromDraft(itemDraft, existingItem);
    if (!nextItem) return;

    await catalogService.save(nextItem);
    await loadData();

    if (editingItemId) {
      setFeedback('Item atualizado no catálogo profissional.');
    } else {
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

  async function duplicateItem(item: CatalogHubItem) {
    const timestamp = new Date().toISOString();
    const copy: CatalogHubItem = {
      ...item,
      id: createCatalogId('catalog-hub-item-copy'),
      title: `${item.title} cópia`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await catalogService.save(copy);
    await loadData();
    setFeedback(`${copy.title} foi duplicado.`);
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
      `${result?.providerName ?? 'Referência online'} escolhida pelo profissional. Confirmar disponibilidade antes de enviar orçamento.`,
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

  if (activeTab === 'items') {
    return (
      <section className="catalog-tab-panel">
        <div className="catalog-tab-hero">
          <div>
            <span className="catalog-eyebrow">Catálogo</span>
            <h3>Catálogo Profissional</h3>
            <p>Itens e serviços já validados para reutilizar no campo e no orçamento.</p>
          </div>
          <strong>{items.length} item(ns)</strong>
        </div>

        <div className="catalog-tab-content">
          <div className="catalog-stats-grid">
            {itemKindStats.map((stat) => (
              <button className={`catalog-stat-card ${kindFilter === stat.kind ? 'active' : ''}`} key={stat.kind} type="button" onClick={() => setKindFilter(stat.kind)}>
                <span>{stat.label}</span>
                <strong>{stat.count}</strong>
              </button>
            ))}
          </div>

          <div className="catalog-view-actions">
            <button className={`ghost-action ${itemsView === 'list' ? 'active' : ''}`} type="button" onClick={() => setItemsView('list')}>Lista</button>
            <button className={`primary-action premium-cta ${itemsView === 'form' ? 'active' : ''}`} type="button" onClick={() => { resetItemForm(); setItemsView('form'); }}>Novo Item</button>
          </div>

          {itemsView === 'form' && (
            <div className="catalog-form-card aferix-card-surface">
              <header>
                <div>
                  <h4>{isEditingItem ? 'Editar Item' : 'Novo Item'}</h4>
                  <p>Preencha os campos abaixo para cadastrar ou atualizar o item.</p>
                </div>
              </header>
              <div className="catalog-form-grid">
                <Select className="col-4" label="Tipo" value={itemDraft.kind} onChange={(val) => updateItemDraft('kind', val as CatalogHubItemKind)}>
                  <option value="material">Material</option>
                  <option value="labor">Mão de obra</option>
                  <option value="service">Serviço composto</option>
                  <option value="travel">Deslocamento</option>
                  <option value="fee">Taxa</option>
                  <option value="custom">Item personalizado</option>
                </Select>
                <Input className="col-8" label="Descrição" value={itemDraft.title} placeholder="Ex.: Módulo tomada 2P+T 20A branco" onChange={(event) => updateItemDraft('title', event.target.value)} />
                <Input className="col-4" label="Nome popular" value={itemDraft.popularName} placeholder="Ex.: tomada 20A" onChange={(event) => updateItemDraft('popularName', event.target.value)} />
                <Input className="col-4" label="Categoria" list="catalog-categories" value={itemDraft.category} placeholder="Ex.: Tomadas e módulos" onChange={(event) => updateItemDraft('category', event.target.value)} />
                <datalist id="catalog-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
                <Input className="col-4" label="Área/profissão" value={itemDraft.professionArea} placeholder="Ex.: Elétrica" onChange={(event) => updateItemDraft('professionArea', event.target.value)} />
                <Input className="col-12" label="Descrição técnica" value={itemDraft.technicalDescription} placeholder="Ex.: módulo 20A 2P+T para placa modular compatível" onChange={(event) => updateItemDraft('technicalDescription', event.target.value)} />
                <Input className="col-3" label="Marca" value={itemDraft.brand} placeholder="Ex.: Fabricante" onChange={(event) => updateItemDraft('brand', event.target.value)} />
                <Select className="col-3" label="Fornecedor" value={itemDraft.supplierId} onChange={(val) => updateItemDraft('supplierId', val)}>
                  <option value="">Sem fornecedor</option>
                  {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                </Select>
                <Input className="col-3" label="Modelo" value={itemDraft.model} placeholder="Opcional" onChange={(event) => updateItemDraft('model', event.target.value)} />
                <Input className="col-3" label="Referência/SKU" value={itemDraft.reference} placeholder="Opcional" onChange={(event) => updateItemDraft('reference', event.target.value)} />
                <Input className="col-4" label="Unidade" value={itemDraft.unit} placeholder="un, m, cx, ponto..." onChange={(event) => updateItemDraft('unit', event.target.value)} />
                <Input className="col-4" label="Qtd. padrão" inputMode="decimal" value={itemDraft.defaultQuantity} onChange={(event) => updateItemDraft('defaultQuantity', event.target.value)} />
                <Input className="col-4" label="Valor unitário" inputMode="decimal" value={itemDraft.defaultUnitValue} onChange={(event) => updateItemDraft('defaultUnitValue', event.target.value)} />
                <Select className="col-4" label="Origem do dado" value={itemDraft.dataOrigin} onChange={(val) => updateItemDraft('dataOrigin', val as NonNullable<CatalogHubItem['dataOrigin']>)}>
                  <option value="manual">Manual</option>
                  <option value="local-catalog">Catálogo local</option>
                  <option value="online-reference">Referência online</option>
                  <option value="supplier">Fornecedor</option>
                </Select>
                <Input className="col-4" label="Preço atualizado em" type="date" value={itemDraft.priceUpdatedAt ? itemDraft.priceUpdatedAt.slice(0, 10) : ''} onChange={(event) => updateItemDraft('priceUpdatedAt', event.target.value ? new Date(`${event.target.value}T12:00:00`).toISOString() : '')} />
                <Select className="col-4" label="Destino" value={itemDraft.destination} onChange={(val) => updateItemDraft('destination', val as CalculationDestination)}>
                  <option value="survey">Atendimento</option>
                  <option value="budget">Orçamento</option>
                  <option value="both">Ambos</option>
                </Select>
                <Input className="col-12" label="Link fonte/catálogo" value={itemDraft.sourceUrl} placeholder="https://..." onChange={(event) => updateItemDraft('sourceUrl', event.target.value)} />
                <Input className="col-12" label="Foto ou URL da imagem" value={itemDraft.imageUrl} placeholder="Cole uma URL de imagem ou envie uma foto abaixo" onChange={(event) => updateItemDraft('imageUrl', event.target.value)} />
                <div className="catalog-field col-12 file-reference-field"><span>Enviar foto de referência</span><input accept="image/*" type="file" onChange={(event) => handleItemImageFile(event.target.files?.[0])} /></div>
                <TextArea className="col-12" label="Compatibilidades" value={itemDraft.compatibility} placeholder="Ex.: compatível com placa e suporte da mesma linha modular." onChange={(val) => updateItemDraft('compatibility', val)} />
                <TextArea className="col-12" label="Alternativas aceitas" value={itemDraft.acceptedAlternatives} placeholder="Ex.: pode ser equivalente se for módulo 20A 2P+T da mesma linha." onChange={(val) => updateItemDraft('acceptedAlternatives', val)} />
                <TextArea className="col-12" label="Alternativas proibidas" value={itemDraft.forbiddenAlternatives} placeholder="Ex.: não substituir por tomada 10A." onChange={(val) => updateItemDraft('forbiddenAlternatives', val)} />
                <TextArea className="col-12" label="Observação para o cliente" value={itemDraft.clientNote} placeholder="Ex.: comprar tomada 20A 2P+T padrão brasileiro. Não substituir por 10A." onChange={(val) => updateItemDraft('clientNote', val)} />
                <TextArea className="col-12" label="Observação técnica profissional" value={itemDraft.professionalNote} placeholder="Ex.: conferir circuito, proteção e seção do cabo antes da execução." onChange={(val) => updateItemDraft('professionalNote', val)} />
                <TextArea className="col-12" label="Orientação para compra" value={itemDraft.purchaseGuidance} placeholder="Ex.: comprar exatamente este modelo ou equivalente validado; conferir tensão, cor, linha e encaixe..." onChange={(val) => updateItemDraft('purchaseGuidance', val)} />
                <TextArea className="col-12" label="Observação" value={itemDraft.notes} placeholder="Ex.: confirmar disponibilidade, linha compatível, preço aproximado..." onChange={(val) => updateItemDraft('notes', val)} />
              </div>
              {itemDraft.imageUrl && (
                <div className="catalog-reference-preview">
                  <img src={itemDraft.imageUrl} alt={`Referência de ${itemDraft.title || 'produto'}`} />
                  <span><strong>Foto de referência salva</strong><small>Essa imagem acompanha o item quando ele for enviado para relatório/lista de compra.</small></span>
                </div>
              )}
              <div className="catalog-hub-actions start-actions">
                <Button variant="primary" className="inline-action" onClick={saveItem}>{isEditingItem ? 'Salvar alterações' : 'Cadastrar item'}</Button>
                {isEditingItem && <Button variant="secondary" className="inline-action" onClick={() => { resetItemForm(); setItemsView('list'); }}>Cancelar edição</Button>}
                {!isEditingItem && <Button variant="secondary" className="inline-action" onClick={() => setItemsView('list')}>Voltar para lista</Button>}
              </div>
            </div>
          )}

          {itemsView === 'list' && (
            <div className="aferix-panel-card catalog-list-card">
              <header>
                <div>
                  <h2>Itens do Catálogo</h2>
                </div>
              </header>
              <div className="catalog-hub-grid compact catalog-filter-grid">
                <Input className="wide" label="Buscar" value={query} placeholder="tomada, disjuntor, serviço, marca..." onChange={(event) => setQuery(event.target.value)} />
                <Select label="Tipo" value={kindFilter} onChange={(val) => setKindFilter(val as 'all' | CatalogHubItemKind)}>
                  <option value="all">Todos</option>
                  <option value="material">Materiais</option>
                  <option value="labor">Mão de obra</option>
                  <option value="service">Serviços compostos</option>
                  <option value="travel">Deslocamento</option>
                  <option value="fee">Taxas</option>
                  <option value="custom">Personalizados</option>
                </Select>
                <Select label="Fornecedor" value={supplierFilter} onChange={(val) => setSupplierFilter(val)}>
                  <option value="">Todos</option>
                  {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                </Select>
                <Select label="Fabricante" value={brandFilter} onChange={(val) => setBrandFilter(val)}>
                  <option value="">Todos</option>
                  {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </Select>
                <Select label="Categoria" value={categoryFilter} onChange={(val) => setCategoryFilter(val)}>
                  <option value="">Todas</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </Select>
                <Select label="Origem" value={originFilter} onChange={(val) => setOriginFilter(val as 'all' | NonNullable<CatalogHubItem['dataOrigin']>)}>
                  <option value="all">Todas</option>
                  <option value="manual">Manual</option>
                  <option value="local-catalog">Catálogo local</option>
                  <option value="online-reference">Referência online</option>
                  <option value="supplier">Fornecedor</option>
                </Select>
              </div>
              <div className="catalog-list-meta"><span>{hasItemLookup ? `${filteredItems.length} de ${items.length} item(ns) · mostrando ${visibleFilteredItems.length}${hiddenFilteredItemCount > 0 ? ` · ${hiddenFilteredItemCount} oculto(s)` : ''}` : `${items.length} item(ns) cadastrados. Pesquise ou filtre para exibir.`}</span><Button variant="secondary" onClick={() => { setQuery(''); setKindFilter('all'); setSupplierFilter(''); setCategoryFilter(''); setBrandFilter(''); setOriginFilter('all'); }}>Limpar filtros</Button></div>
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
                        <Button variant="ghost" className="catalog-row-compact-action" onClick={() => editItem(item)}>Editar</Button>
                        <Button variant="ghost" className="catalog-row-compact-action" onClick={() => duplicateItem(item)}>Duplicar</Button>
                        <Button variant="ghost" className="catalog-row-compact-action" onClick={() => sendItem(item)}>Enviar</Button>
                      </div>
                    </article>
                  );
                })}
                {hiddenFilteredItemCount > 0 && <div className="continuous-list-empty">+{hiddenFilteredItemCount} itens.</div>}
              </div>
            </div>
          )}
        </div>
        {feedback && <div className="guided-cart-feedback">{feedback}</div>}
      </section>
    );
  }

  if (activeTab === 'online') {
    return (
      <section className="catalog-tab-panel">
        <div className="catalog-tab-hero">
          <div>
            <span className="catalog-eyebrow">Busca online</span>
            <h3>Consulta Online</h3>
            <p>Pesquise produto real no fornecedor e traga modelo, preço e referência para o catálogo.</p>
          </div>
        </div>

        <div className="catalog-tab-content">
          <div className="catalog-form-card online-card aferix-card-surface">
            <header>
              <div>
                <h4>Assistente de Busca</h4>
                <p>Use os campos abaixo para planejar e registrar sua busca online.</p>
              </div>
            </header>
            <div className="catalog-form-grid">
              <Input className="col-12" label="O que pesquisar?" value={onlineQuery} placeholder="Ex.: tomada 20A branca 2P+T" onChange={(event) => setOnlineQuery(event.target.value)} />
              <Select className="col-6" label="Fornecedor/fabricante" value={onlineSupplierId} onChange={(val) => setOnlineSupplierId(val)}>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </Select>
              <Input className="col-6" label="Preço observado" inputMode="decimal" value={onlineObservedPrice} placeholder="Ex.: 18,90" onChange={(event) => setOnlineObservedPrice(event.target.value)} />
              <Input className="col-12" label="Referência escolhida" value={onlineReference} placeholder="Ex.: SKU, modelo, código do fabricante ou link do produto" onChange={(event) => setOnlineReference(event.target.value)} />
              <Input className="col-12" label="Link do produto escolhido" value={onlineProductUrl} placeholder="Cole aqui o link real do produto após abrir a consulta" onChange={(event) => setOnlineProductUrl(event.target.value)} />
              <Input className="col-12" label="Imagem do produto" value={onlineImageUrl} placeholder="Cole uma URL de imagem ou envie uma foto abaixo" onChange={(event) => setOnlineImageUrl(event.target.value)} />
              <div className="catalog-field col-12 file-reference-field"><span>Enviar foto de referência</span><input accept="image/*" type="file" onChange={(event) => handleOnlineImageFile(event.target.files?.[0])} /></div>
            </div>
            
            <div className="online-result-box catalog-online-spacing">
              <span>Consulta preparada</span>
              <strong>{sanitizeCatalogDisplayText(onlineSupplier?.name ?? 'Fornecedor')}</strong>
              <small>{onlineUrl || 'Cadastre um fornecedor com site/catálogo.'}</small>
              <small>Abra a busca, escolha o item real e registre link, foto, modelo e preço como referência comercial.</small>
              <small>{productSearchDisclaimer()}</small>
            </div>

            <div className="catalog-online-steps">
              <article className="catalog-step-card"><span className="catalog-step-number">1</span><div><strong>Catálogo local</strong><p>Mostra primeiro o que já foi salvo.</p></div></article>
              <article className="catalog-step-card"><span className="catalog-step-number">2</span><div><strong>Fornecedor</strong><p>Abre busca oficial ou template cadastrado.</p></div></article>
              <article className="catalog-step-card"><span className="catalog-step-number">3</span><div><strong>Revisão manual</strong><p>Nada entra sem conferir dados.</p></div></article>
            </div>

            <div className="online-results-list catalog-online-spacing">
              {visibleOnlineResults.map((result) => (
                <article className="online-result-card aferix-card-compact-list" key={result.id}>
                  {result.imageUrl && <img src={result.imageUrl} alt={`Referência de ${result.title}`} />}
                  <div>
                    <span>{searchResultSourceLabel(result)}</span>
                    <strong>{sanitizeCatalogDisplayText(result.title)}</strong>
                    <small>{result.note}</small>
                    {result.priceReference !== undefined && <small>Preço referência: {money(result.priceReference)}</small>}
                    <small>Consulta: {new Intl.DateTimeFormat('pt-BR').format(new Date(result.checkedAt))}</small>
                  </div>
                  <div className="catalog-hub-actions">
                    {result.link && <a className="secondary-action inline-action ui-button" href={result.link} target="_blank" rel="noreferrer">Abrir</a>}
                    <Button variant="primary" className="inline-action" onClick={() => fillItemFromOnlineSearch(result)}>Revisar e adicionar</Button>
                  </div>
                </article>
              ))}
              {hiddenOnlineResultCount > 0 && <div className="catalog-hidden-row">Mais {hiddenOnlineResultCount} resultado(s) oculto(s). Refine a busca para encontrar o produto certo.</div>}
            </div>

            {onlineImageUrl && (
              <div className="catalog-reference-preview catalog-online-spacing">
                <img src={onlineImageUrl} alt={`Referência de ${onlineQuery}`} />
                <span><strong>Imagem pronta para referência</strong><small>Ao usar como referência, esta imagem será enviada para o cadastro do item.</small></span>
              </div>
            )}

            <div className="catalog-hub-actions start-actions catalog-online-spacing">
              {onlineUrl && <a className="primary-action inline-action ui-button" href={onlineUrl} target="_blank" rel="noreferrer">Abrir consulta online</a>}
              <Button variant="secondary" className="inline-action" onClick={() => fillItemFromOnlineSearch()}>Usar como referência</Button>
            </div>
          </div>
        </div>
        {feedback && <div className="guided-cart-feedback">{feedback}</div>}
      </section>
    );
  }

  return null;
}
