import { useEffect, useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { catalogService } from '../../../services/catalogService';
import { catalogSupplierService } from '../../../services/catalogSupplierService';
import {
  buildSupplierSearchUrl,
  createCatalogId,
  type CatalogHubItem,
  type CatalogHubItemKind,
  type CatalogSupplier,
} from '../types/catalogTypes';
import { Input, Select, TextArea, Button } from '../../../app/components/ui';
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
  const [items, setItems] = useState<CatalogHubItem[]>([]);
  const [suppliers, setSuppliers] = useState<CatalogSupplier[]>([]);
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItemDraft);
  const [supplierDraft, setSupplierDraft] = useState<SupplierDraft>(emptySupplierDraft);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | CatalogHubItemKind>('all');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineSupplierId, setOnlineSupplierId] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadData() {
    try {
      const [i, s] = await Promise.all([
        catalogService.getAll(),
        catalogSupplierService.getAll(),
      ]);
      setItems(i);
      setSuppliers(s);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
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

  async function addItem() {
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
    await catalogService.save(newItem);
    await loadData();
    setItemDraft(emptyItemDraft);
    setFeedback('Item cadastrado no catálogo profissional.');
  }

  async function addSupplier() {
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
    await catalogSupplierService.save(newSupplier);
    await loadData();
    setSupplierDraft(emptySupplierDraft);
    setFeedback('Fornecedor cadastrado.');
  }

  async function removeItem(id: string) {
    await catalogService.delete(id);
    await loadData();
  }

  async function duplicateItem(item: CatalogHubItem) {
    const now = new Date().toISOString();
    const copy: CatalogHubItem = {
      ...item,
      id: createCatalogId('catalog-hub-item-copy'),
      title: `${item.title} cópia`,
      createdAt: now,
      updatedAt: now,
    };
    await catalogService.save(copy);
    await loadData();
    setFeedback(`${copy.title} foi duplicado.`);
  }

  async function removeSupplier(id: string) {
    await catalogSupplierService.delete(id);
    await loadData();
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
          <span className="aferix-kicker">Cadastro profissional</span>
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
          <div className="catalog-hub-card aferix-card-surface">
            <div><strong>Novo item de catálogo</strong><small>Cadastre peças, materiais ou serviços recorrentes para enviar ao orçamento.</small></div>
            <div className="catalog-hub-grid">
              <Select label="Tipo" value={itemDraft.kind} onChange={(val) => updateItemDraft('kind', val as CatalogHubItemKind)}>
                <option value="material">Material</option>
                <option value="labor">Mão de obra</option>
                <option value="service">Serviço composto</option>
                <option value="travel">Deslocamento</option>
                <option value="fee">Taxa</option>
                <option value="custom">Item personalizado</option>
              </Select>
              <Input className="wide" label="Descrição" value={itemDraft.title} placeholder="Ex.: Módulo tomada 2P+T 20A branco" onChange={(event) => updateItemDraft('title', event.target.value)} />
              <Input label="Categoria" list="catalog-categories" value={itemDraft.category} placeholder="Ex.: Tomadas e módulos" onChange={(event) => updateItemDraft('category', event.target.value)} />
              <datalist id="catalog-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
              <Input label="Marca" value={itemDraft.brand} placeholder="Ex.: Fabricante" onChange={(event) => updateItemDraft('brand', event.target.value)} />
              <Select label="Fornecedor" value={itemDraft.supplierId} onChange={(val) => updateItemDraft('supplierId', val)}>
                <option value="">Sem fornecedor</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </Select>
              <Input label="Modelo" value={itemDraft.model} placeholder="Opcional" onChange={(event) => updateItemDraft('model', event.target.value)} />
              <Input label="Referência/SKU" value={itemDraft.reference} placeholder="Opcional" onChange={(event) => updateItemDraft('reference', event.target.value)} />
              <Input label="Unidade" value={itemDraft.unit} placeholder="un, m, cx, ponto..." onChange={(event) => updateItemDraft('unit', event.target.value)} />
              <Input label="Qtd. padrão" inputMode="decimal" value={itemDraft.defaultQuantity} onChange={(event) => updateItemDraft('defaultQuantity', event.target.value)} />
              <Input label="Valor unitário" inputMode="decimal" value={itemDraft.defaultUnitValue} onChange={(event) => updateItemDraft('defaultUnitValue', event.target.value)} />
              <Select label="Destino" value={itemDraft.destination} onChange={(val) => updateItemDraft('destination', val as CalculationDestination)}>
                <option value="survey">Atendimento</option>
                <option value="budget">Orçamento</option>
                <option value="both">Ambos</option>
              </Select>
              <Input className="wide" label="Link fonte/catálogo" value={itemDraft.sourceUrl} placeholder="https://..." onChange={(event) => updateItemDraft('sourceUrl', event.target.value)} />
              <TextArea className="wide" label="Observação" value={itemDraft.notes} placeholder="Ex.: confirmar disponibilidade, linha compatível, preço aproximado..." onChange={(val) => updateItemDraft('notes', val)} />
            </div>
            <Button variant="primary" className="inline-action" onClick={addItem}>Cadastrar item</Button>
          </div>

          <div className="catalog-hub-card aferix-card-surface">
            <div><strong>Consultar itens cadastrados</strong><small>Filtre e envie itens diretamente para campo, orçamento ou ambos.</small></div>
            <div className="catalog-hub-grid compact">
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
            </div>
            <div className="catalog-hub-list">
              {filteredItems.map((item) => (
                <article className="catalog-hub-item-card aferix-card-compact-list" key={item.id}>
                  <div>
                    <span>{itemKindLabel(item.kind)} · {destinationLabel(item.destination)}</span>
                    <strong>{item.title}</strong>
                    <small>{[item.category, item.brand, item.model, item.reference].filter(Boolean).join(' · ') || 'Sem detalhes adicionais'}</small>
                    <small>{item.defaultQuantity} {item.unit} × {money(item.defaultUnitValue)}</small>
                  </div>
                  <div className="catalog-hub-actions">
                    {item.sourceUrl && <a className="secondary-action inline-action ui-button" href={item.sourceUrl} target="_blank" rel="noreferrer">Fonte</a>}
                    <Button variant="primary" className="inline-action" onClick={() => sendItem(item)}>Adicionar ao fluxo</Button>
                    <Button variant="secondary" className="inline-action" onClick={() => duplicateItem(item)}>Duplicar</Button>
                    <Button variant="danger" onClick={() => removeItem(item.id)}>Remover</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'suppliers' && (
        <>
          <div className="catalog-hub-card aferix-card-surface">
            <div><strong>Novo fornecedor/empresa</strong><small>Cadastre fabricantes, lojas, distribuidores ou fornecedores locais.</small></div>
            <div className="catalog-hub-grid">
              <Input label="Nome" value={supplierDraft.name} placeholder="Ex.: Fornecedor principal" onChange={(event) => updateSupplierDraft('name', event.target.value)} />
              <Input label="Segmento" value={supplierDraft.segment} placeholder="Ex.: Materiais elétricos" onChange={(event) => updateSupplierDraft('segment', event.target.value)} />
              <Input label="Site" value={supplierDraft.websiteUrl} placeholder="https://..." onChange={(event) => updateSupplierDraft('websiteUrl', event.target.value)} />
              <Input label="Catálogo" value={supplierDraft.catalogUrl} placeholder="https://..." onChange={(event) => updateSupplierDraft('catalogUrl', event.target.value)} />
              <Input className="wide" label="Busca online com {query}" value={supplierDraft.searchUrlTemplate} placeholder="https://www.google.com/search?q=site:fornecedor.com {query}" onChange={(event) => updateSupplierDraft('searchUrlTemplate', event.target.value)} />
              <Input label="Telefone/WhatsApp" value={supplierDraft.phone} placeholder="Opcional" onChange={(event) => updateSupplierDraft('phone', event.target.value)} />
              <TextArea className="wide" label="Observações" value={supplierDraft.notes} placeholder="Condições, região, prazo, observações de compra..." onChange={(val) => updateSupplierDraft('notes', val)} />
            </div>
            <Button variant="primary" className="inline-action" onClick={addSupplier}>Cadastrar fornecedor</Button>
          </div>
          <div className="catalog-hub-list">
            {suppliers.map((supplier) => (
              <article className="catalog-hub-item-card aferix-card-compact-list" key={supplier.id}>
                <div><span>{supplier.segment}</span><strong>{supplier.name}</strong><small>{supplier.notes || 'Sem observações'}</small></div>
                <div className="catalog-hub-actions">
                  {supplier.websiteUrl && <a className="secondary-action inline-action ui-button" href={supplier.websiteUrl} target="_blank" rel="noreferrer">Site</a>}
                  {supplier.catalogUrl && <a className="secondary-action inline-action ui-button" href={supplier.catalogUrl} target="_blank" rel="noreferrer">Catálogo</a>}
                  <Button variant="danger" onClick={() => removeSupplier(supplier.id)}>Remover</Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeTab === 'online' && (
        <div className="catalog-hub-card online-card aferix-card-surface">
          <div><strong>Consulta online de catálogo</strong><small>Use como apoio para pesquisar referência, modelo e preço. Depois envie a busca para cadastro de item.</small></div>
          <div className="catalog-hub-grid">
            <Input className="wide" label="O que pesquisar?" value={onlineQuery} placeholder="Ex.: tomada 20A branca 2P+T" onChange={(event) => setOnlineQuery(event.target.value)} />
            <Select label="Fornecedor/fabricante" value={onlineSupplierId} onChange={(val) => setOnlineSupplierId(val)}>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </Select>
          </div>
          <div className="online-result-box">
            <span>Link preparado</span>
            <strong>{onlineSupplier?.name ?? 'Fornecedor'}</strong>
            <small>{onlineUrl || 'Cadastre um fornecedor com site/catálogo.'}</small>
          </div>
          <div className="catalog-hub-actions start-actions">
            {onlineUrl && <a className="primary-action inline-action ui-button" href={onlineUrl} target="_blank" rel="noreferrer">Abrir consulta online</a>}
            <Button variant="secondary" className="inline-action" onClick={fillItemFromOnlineSearch}>Usar busca no cadastro</Button>
          </div>
        </div>
      )}

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
