import { useEffect, useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
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
import './CatalogHubWorkspace.css';

interface CatalogHubWorkspaceProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

type CatalogTab = 'items' | 'suppliers' | 'online';

interface ItemDraft {
  kind: CatalogHubItemKind;
  title: string;
  category: string;
  brand: string;
  supplierId: string;
  model: string;
  reference: string;
  unit: string;
  defaultQuantity: string;
  defaultUnitValue: string;
  destination: CalculationDestination;
  notes: string;
  sourceUrl: string;
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
  category: '',
  brand: '',
  supplierId: '',
  model: '',
  reference: '',
  unit: 'un',
  defaultQuantity: '1',
  defaultUnitValue: '0',
  destination: 'both',
  notes: '',
  sourceUrl: '',
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

function destinationLabel(destination: CalculationDestination): string {
  if (destination === 'survey') return 'Atendimento';
  if (destination === 'budget') return 'Orçamento';
  return 'Ambos';
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
      `Categoria: ${item.category || 'não informada'}`,
      `Marca: ${item.brand || 'não informada'}`,
      `Modelo: ${item.model || 'não informado'}`,
      `Referência: ${item.reference || 'não informada'}`,
      `Unidade: ${item.unit}`,
      `Quantidade padrão: ${item.defaultQuantity}`,
      `Valor unitário: ${money(item.defaultUnitValue)}`,
      `Subtotal: ${money(subtotal)}`,
      `Destino: ${destinationLabel(item.destination)}`,
      item.sourceUrl ? `Fonte/catálogo: ${item.sourceUrl}` : 'Fonte/catálogo: não informado',
      item.notes ? `Observação: ${item.notes}` : 'Origem: cadastro de catálogo profissional',
    ],
    itemType: item.itemType,
    editableDescription: item.title,
    technicalNote: item.notes || 'Item vindo do catálogo profissional.',
    quantity: String(item.defaultQuantity),
    unitValue: String(item.defaultUnitValue),
    shouldGenerateBudgetItem: item.destination !== 'survey',
    convertedToBudgetItem: false,
    reportReady: item.destination === 'survey' || item.destination === 'both',
  };
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<CatalogTab>('items');
  const [items, setItems] = useState<CatalogHubItem[]>(() => loadCatalogHubItems());
  const [suppliers, setSuppliers] = useState<CatalogSupplier[]>(() => loadCatalogSuppliers());
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItemDraft);
  const [supplierDraft, setSupplierDraft] = useState<SupplierDraft>(emptySupplierDraft);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | CatalogHubItemKind>('all');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineSupplierId, setOnlineSupplierId] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => saveCatalogHubItems(items), [items]);
  useEffect(() => saveCatalogSuppliers(suppliers), [suppliers]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const kindMatches = kindFilter === 'all' || item.kind === kindFilter;
      const supplierMatches = !supplierFilter || item.supplierId === supplierFilter;
      const textMatches = !normalizedQuery || [item.title, item.category, item.brand, item.model, item.reference, item.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
      return kindMatches && supplierMatches && textMatches;
    });
  }, [items, kindFilter, query, supplierFilter]);

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [items]);
  const onlineSupplier = suppliers.find((supplier) => supplier.id === onlineSupplierId) ?? suppliers[0];
  const onlineUrl = onlineSupplier ? buildSupplierSearchUrl(onlineSupplier, onlineQuery) : '';

  function updateItemDraft<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setItemDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSupplierDraft<K extends keyof SupplierDraft>(key: K, value: SupplierDraft[K]) {
    setSupplierDraft((current) => ({ ...current, [key]: value }));
  }

  function addItem() {
    const title = itemDraft.title.trim();
    if (!title) return;
    const now = new Date().toISOString();
    const kind = itemDraft.kind;
    const newItem: CatalogHubItem = {
      id: createCatalogId('catalog-hub-item'),
      kind,
      title,
      category: itemDraft.category.trim() || (kind === 'material' ? 'Materiais' : kind === 'labor' ? 'Mão de obra' : kind === 'service' ? 'Serviços compostos' : kind === 'travel' ? 'Deslocamento' : kind === 'fee' ? 'Taxas' : 'Itens personalizados'),
      brand: itemDraft.brand.trim() || undefined,
      supplierId: itemDraft.supplierId || undefined,
      model: itemDraft.model.trim() || undefined,
      reference: itemDraft.reference.trim() || undefined,
      unit: itemDraft.unit.trim() || 'un',
      defaultQuantity: parseDecimal(itemDraft.defaultQuantity, 1),
      defaultUnitValue: parseDecimal(itemDraft.defaultUnitValue, 0),
      destination: itemDraft.destination,
      itemType: kind === 'material' ? 'material' : kind === 'labor' || kind === 'service' ? 'service' : 'technicalObservation',
      notes: itemDraft.notes.trim() || undefined,
      sourceUrl: itemDraft.sourceUrl.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setItems((current) => [newItem, ...current]);
    setItemDraft(emptyItemDraft);
    setFeedback('Item cadastrado no catálogo profissional.');
  }

  function addSupplier() {
    const name = supplierDraft.name.trim();
    if (!name) return;
    const now = new Date().toISOString();
    const newSupplier: CatalogSupplier = {
      id: createCatalogId('catalog-supplier'),
      name,
      segment: supplierDraft.segment.trim() || 'Fornecedor geral',
      websiteUrl: supplierDraft.websiteUrl.trim() || undefined,
      catalogUrl: supplierDraft.catalogUrl.trim() || undefined,
      searchUrlTemplate: supplierDraft.searchUrlTemplate.trim() || undefined,
      phone: supplierDraft.phone.trim() || undefined,
      notes: supplierDraft.notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setSuppliers((current) => [newSupplier, ...current]);
    setSupplierDraft(emptySupplierDraft);
    setFeedback('Fornecedor cadastrado.');
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function removeSupplier(id: string) {
    setSuppliers((current) => current.filter((supplier) => supplier.id !== id));
  }

  function sendItem(item: CatalogHubItem) {
    onSendToBudget([createCaptureFromCatalogItem(item)]);
    setFeedback(`${item.title} foi enviado para ${destinationLabel(item.destination).toLowerCase()}.`);
  }

  function fillItemFromOnlineSearch() {
    updateItemDraft('title', onlineQuery);
    updateItemDraft('supplierId', onlineSupplier?.id ?? '');
    updateItemDraft('brand', onlineSupplier?.name ?? '');
    updateItemDraft('sourceUrl', onlineUrl);
    setActiveTab('items');
    setFeedback('Busca online enviada para o formulário de item. Confira dados, preço e referência antes de salvar.');
  }

  return (
    <section className="catalog-hub-workspace">
      <div className="catalog-hub-header">
        <div>
          <span className="orca-kicker">Cadastro profissional</span>
          <h2>Catálogo, serviços e fornecedores</h2>
          <p>Cadastre materiais, serviços, fornecedores e use consultas online como apoio para montar orçamentos rápidos.</p>
        </div>
        <strong>{items.length} itens · {suppliers.length} fornecedores</strong>
      </div>

      <div className="section-mode-tabs">
        <button className={activeTab === 'items' ? 'active' : ''} type="button" onClick={() => setActiveTab('items')}>Itens e serviços</button>
        <button className={activeTab === 'suppliers' ? 'active' : ''} type="button" onClick={() => setActiveTab('suppliers')}>Fornecedores</button>
        <button className={activeTab === 'online' ? 'active' : ''} type="button" onClick={() => setActiveTab('online')}>Consulta online</button>
      </div>

      {activeTab === 'items' && (
        <>
          <div className="catalog-hub-card">
            <div><strong>Novo item de catálogo</strong><small>Cadastre peças, materiais ou serviços recorrentes para enviar ao orçamento.</small></div>
            <div className="catalog-hub-grid">
              <label><span>Tipo</span><select value={itemDraft.kind} onChange={(event) => updateItemDraft('kind', event.target.value as CatalogHubItemKind)}><option value="material">Material</option><option value="labor">Mão de obra</option><option value="service">Serviço composto</option><option value="travel">Deslocamento</option><option value="fee">Taxa</option><option value="custom">Item personalizado</option></select></label>
              <label className="wide"><span>Descrição</span><input value={itemDraft.title} placeholder="Ex.: Módulo tomada 2P+T 20A branco" onChange={(event) => updateItemDraft('title', event.target.value)} /></label>
              <label><span>Categoria</span><input list="catalog-categories" value={itemDraft.category} placeholder="Ex.: Tomadas e módulos" onChange={(event) => updateItemDraft('category', event.target.value)} /><datalist id="catalog-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label>
              <label><span>Marca</span><input value={itemDraft.brand} placeholder="Ex.: Fabricante" onChange={(event) => updateItemDraft('brand', event.target.value)} /></label>
              <label><span>Fornecedor</span><select value={itemDraft.supplierId} onChange={(event) => updateItemDraft('supplierId', event.target.value)}><option value="">Sem fornecedor</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
              <label><span>Modelo</span><input value={itemDraft.model} placeholder="Opcional" onChange={(event) => updateItemDraft('model', event.target.value)} /></label>
              <label><span>Referência/SKU</span><input value={itemDraft.reference} placeholder="Opcional" onChange={(event) => updateItemDraft('reference', event.target.value)} /></label>
              <label><span>Unidade</span><input value={itemDraft.unit} placeholder="un, m, cx, ponto..." onChange={(event) => updateItemDraft('unit', event.target.value)} /></label>
              <label><span>Qtd. padrão</span><input inputMode="decimal" value={itemDraft.defaultQuantity} onChange={(event) => updateItemDraft('defaultQuantity', event.target.value)} /></label>
              <label><span>Valor unitário</span><input inputMode="decimal" value={itemDraft.defaultUnitValue} onChange={(event) => updateItemDraft('defaultUnitValue', event.target.value)} /></label>
              <label><span>Destino</span><select value={itemDraft.destination} onChange={(event) => updateItemDraft('destination', event.target.value as CalculationDestination)}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
              <label className="wide"><span>Link fonte/catálogo</span><input value={itemDraft.sourceUrl} placeholder="https://..." onChange={(event) => updateItemDraft('sourceUrl', event.target.value)} /></label>
              <label className="wide"><span>Observação</span><textarea value={itemDraft.notes} placeholder="Ex.: confirmar disponibilidade, linha compatível, preço aproximado..." onChange={(event) => updateItemDraft('notes', event.target.value)} /></label>
            </div>
            <button className="primary-action inline-action" type="button" onClick={addItem}>Cadastrar item</button>
          </div>

          <div className="catalog-hub-card">
            <div><strong>Consultar itens cadastrados</strong><small>Filtre e envie itens diretamente para campo, orçamento ou ambos.</small></div>
            <div className="catalog-hub-grid compact">
              <label className="wide"><span>Buscar</span><input value={query} placeholder="tomada, disjuntor, serviço, marca..." onChange={(event) => setQuery(event.target.value)} /></label>
              <label><span>Tipo</span><select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as 'all' | CatalogHubItemKind)}><option value="all">Todos</option><option value="material">Materiais</option><option value="labor">Mão de obra</option><option value="service">Serviços compostos</option><option value="travel">Deslocamento</option><option value="fee">Taxas</option><option value="custom">Personalizados</option></select></label>
              <label><span>Fornecedor</span><select value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}><option value="">Todos</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
            </div>
            <div className="catalog-hub-list">
              {filteredItems.map((item) => (
                <article className="catalog-hub-item-card" key={item.id}>
                  <div>
                    <span>{itemKindLabel(item.kind)} · {destinationLabel(item.destination)}</span>
                    <strong>{item.title}</strong>
                    <small>{[item.category, item.brand, item.model, item.reference].filter(Boolean).join(' · ') || 'Sem detalhes adicionais'}</small>
                    <small>{item.defaultQuantity} {item.unit} × {money(item.defaultUnitValue)}</small>
                  </div>
                  <div className="catalog-hub-actions">
                    {item.sourceUrl && <a className="secondary-action inline-action" href={item.sourceUrl} target="_blank" rel="noreferrer">Fonte</a>}
                    <button className="primary-action inline-action" type="button" onClick={() => sendItem(item)}>Adicionar ao fluxo</button>
                    <button className="danger-action" type="button" onClick={() => removeItem(item.id)}>Remover</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'suppliers' && (
        <>
          <div className="catalog-hub-card">
            <div><strong>Novo fornecedor/empresa</strong><small>Cadastre fabricantes, lojas, distribuidores ou fornecedores locais.</small></div>
            <div className="catalog-hub-grid">
              <label><span>Nome</span><input value={supplierDraft.name} placeholder="Ex.: Fornecedor principal" onChange={(event) => updateSupplierDraft('name', event.target.value)} /></label>
              <label><span>Segmento</span><input value={supplierDraft.segment} placeholder="Ex.: Materiais elétricos" onChange={(event) => updateSupplierDraft('segment', event.target.value)} /></label>
              <label><span>Site</span><input value={supplierDraft.websiteUrl} placeholder="https://..." onChange={(event) => updateSupplierDraft('websiteUrl', event.target.value)} /></label>
              <label><span>Catálogo</span><input value={supplierDraft.catalogUrl} placeholder="https://..." onChange={(event) => updateSupplierDraft('catalogUrl', event.target.value)} /></label>
              <label className="wide"><span>Busca online com {'{query}'}</span><input value={supplierDraft.searchUrlTemplate} placeholder="https://www.google.com/search?q=site:fornecedor.com {query}" onChange={(event) => updateSupplierDraft('searchUrlTemplate', event.target.value)} /></label>
              <label><span>Telefone/WhatsApp</span><input value={supplierDraft.phone} placeholder="Opcional" onChange={(event) => updateSupplierDraft('phone', event.target.value)} /></label>
              <label className="wide"><span>Observações</span><textarea value={supplierDraft.notes} placeholder="Condições, região, prazo, observações de compra..." onChange={(event) => updateSupplierDraft('notes', event.target.value)} /></label>
            </div>
            <button className="primary-action inline-action" type="button" onClick={addSupplier}>Cadastrar fornecedor</button>
          </div>
          <div className="catalog-hub-list">
            {suppliers.map((supplier) => (
              <article className="catalog-hub-item-card" key={supplier.id}>
                <div><span>{supplier.segment}</span><strong>{supplier.name}</strong><small>{supplier.notes || 'Sem observações'}</small></div>
                <div className="catalog-hub-actions">
                  {supplier.websiteUrl && <a className="secondary-action inline-action" href={supplier.websiteUrl} target="_blank" rel="noreferrer">Site</a>}
                  {supplier.catalogUrl && <a className="secondary-action inline-action" href={supplier.catalogUrl} target="_blank" rel="noreferrer">Catálogo</a>}
                  <button className="danger-action" type="button" onClick={() => removeSupplier(supplier.id)}>Remover</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeTab === 'online' && (
        <div className="catalog-hub-card online-card">
          <div><strong>Consulta online de catálogo</strong><small>Use como apoio para pesquisar referência, modelo e preço. Depois envie a busca para cadastro de item.</small></div>
          <div className="catalog-hub-grid">
            <label className="wide"><span>O que pesquisar?</span><input value={onlineQuery} placeholder="Ex.: tomada 20A branca 2P+T" onChange={(event) => setOnlineQuery(event.target.value)} /></label>
            <label><span>Fornecedor/fabricante</span><select value={onlineSupplierId} onChange={(event) => setOnlineSupplierId(event.target.value)}>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
          </div>
          <div className="online-result-box">
            <span>Link preparado</span>
            <strong>{onlineSupplier?.name ?? 'Fornecedor'}</strong>
            <small>{onlineUrl || 'Cadastre um fornecedor com site/catálogo.'}</small>
          </div>
          <div className="catalog-hub-actions start-actions">
            {onlineUrl && <a className="primary-action inline-action" href={onlineUrl} target="_blank" rel="noreferrer">Abrir consulta online</a>}
            <button className="secondary-action inline-action" type="button" onClick={fillItemFromOnlineSearch}>Usar busca no cadastro</button>
          </div>
        </div>
      )}

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
