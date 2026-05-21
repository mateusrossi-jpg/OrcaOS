import { useMemo, useState, useEffect } from 'react';
import { Button, Select, EmptyState, BackButton, TextArea, MonetaryInput, Modal } from '../../../app/components/ui';
import { loadCatalogHubItems, saveCatalogHubItems, type CatalogHubItem, type CatalogHubItemKind, createCatalogId } from '../storage/catalogHubStorage';
import './PremiumCatalogWorkspace.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
function money(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

const CATEGORY_CHIPS: Array<{ id: string; label: string; kind?: CatalogHubItemKind }> = [
  { id: 'all', label: 'Todos' },
  { id: 'material', label: 'Materiais', kind: 'material' },
  { id: 'labor', label: 'Mão de obra', kind: 'labor' },
  { id: 'service', label: 'Serviços compostos', kind: 'service' },
  { id: 'travel', label: 'Deslocamento', kind: 'travel' },
  { id: 'fee', label: 'Taxas', kind: 'fee' },
  { id: 'custom', label: 'Personalizados', kind: 'custom' },
];

function itemKindLabel(kind: CatalogHubItemKind): string {
  if (kind === 'material') return 'Material';
  if (kind === 'labor') return 'Mão de obra';
  if (kind === 'service') return 'Serviço';
  if (kind === 'travel') return 'Deslocamento';
  if (kind === 'fee') return 'Taxa';
  return 'Item';
}

const emptyItem = (kind: CatalogHubItemKind = 'material'): CatalogHubItem => ({
  id: '',
  kind,
  title: '',
  category: '',
  unit: 'un',
  defaultQuantity: 1,
  defaultUnitValue: 0,
  destination: 'both',
  itemType: kind === 'labor' ? 'service' : 'material',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function PremiumCatalogWorkspace() {
  const [items, setItems] = useState<CatalogHubItem[]>(() => loadCatalogHubItems());
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<CatalogHubItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<CatalogHubItem | null>(null);

  useEffect(() => {
    saveCatalogHubItems(items);
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const chipMatch = activeChip === 'all' || item.kind === activeChip;
      const textMatch = !normalizedQuery ||
        [item.title, item.category, item.brand, item.model, item.reference].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
      return chipMatch && textMatch;
    });
  }, [items, activeChip, query]);

  function handleEdit(item: CatalogHubItem) {
    setEditingItem({ ...item });
    setView('form');
  }

  function handleNew() {
    setEditingItem(emptyItem(activeChip !== 'all' ? activeChip as CatalogHubItemKind : 'material'));
    setView('form');
  }

  function requestDelete(item: CatalogHubItem) {
    setItemPendingDelete(item);
  }

  function confirmDelete() {
    if (!itemPendingDelete) return;
    const deletingId = itemPendingDelete.id;
    setItems((prev) => prev.filter((item) => item.id !== deletingId));
    if (editingItem?.id === deletingId) {
      setEditingItem(null);
      setView('list');
    }
    setItemPendingDelete(null);
  }

  function handleSave() {
    if (!editingItem || !editingItem.title.trim()) return;

    const now = new Date().toISOString();
    const itemToSave = { ...editingItem, updatedAt: now };

    if (!itemToSave.id) {
      itemToSave.id = createCatalogId('item');
      itemToSave.createdAt = now;
      setItems((prev) => [itemToSave, ...prev]);
    } else {
      setItems((prev) => prev.map((it) => it.id === itemToSave.id ? itemToSave : it));
    }
    setView('list');
    setEditingItem(null);
    setQuery('');
    setActiveChip('all');
  }

  if (view === 'form' && editingItem) {
    return (
      <div className="premium-catalog-workspace form-view">
        <BackButton onClick={() => setView('list')} label="Voltar para a Biblioteca" />

        <div className="aferix-panel-card catalog-edit-card">
          <header>
            <h2>{editingItem.id ? 'Editar Item' : 'Novo Item'}</h2>
            <p>Configure os detalhes técnicos e comerciais.</p>
          </header>

          <div className="catalog-form-grid">
            <label className="catalog-field">
              <span>Título do Item</span>
              <input
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="Ex: Disjuntor Din 20A"
              />
            </label>

            <Select
              className="catalog-field"
              label="Tipo"
              value={editingItem.kind}
              onChange={(val) => setEditingItem({ ...editingItem, kind: val as CatalogHubItemKind, itemType: val === 'labor' ? 'service' : 'material' })}
            >
              <option value="material">Material</option>
              <option value="labor">Mão de obra</option>
              <option value="service">Serviço / Composto</option>
              <option value="travel">Deslocamento</option>
              <option value="fee">Taxa / Encargo</option>
              <option value="custom">Item personalizado</option>
            </Select>

            <label className="catalog-field">
              <span>Marca / Fabricante</span>
              <input
                value={editingItem.brand || ''}
                onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                placeholder="Opcional"
              />
            </label>

            <MonetaryInput
              className="catalog-field"
              label="Preço"
              value={editingItem.defaultUnitValue}
              onChange={(val) => setEditingItem({ ...editingItem, defaultUnitValue: val })}
            />

            <label className="catalog-field">
              <span>Unidade</span>
              <input
                value={editingItem.unit}
                onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                placeholder="un, m, kg..."
              />
            </label>

            <label className="catalog-field">
              <span>Notas Internas</span>
              <TextArea
                value={editingItem.notes || ''}
                onChange={(val) => setEditingItem({ ...editingItem, notes: val })}
                placeholder="Observações de uso..."
              />
            </label>
          </div>

          <div className="catalog-actions-row" style={{ marginTop: '24px', display: 'grid', gap: '10px' }}>
            <Button variant="primary" onClick={handleSave} style={{ width: '100%' }}>
              Salvar Alterações
            </Button>
            {editingItem.id && (
              <Button variant="danger" onClick={() => requestDelete(editingItem)} style={{ width: '100%' }}>
                Excluir Item
              </Button>
            )}
            <Button variant="ghost" onClick={() => setView('list')} style={{ width: '100%' }}>
              Cancelar
            </Button>
          </div>
        </div>

        <Modal
          isOpen={Boolean(itemPendingDelete)}
          title="Excluir item do catálogo?"
          confirmLabel="Excluir"
          tone="danger"
          onClose={() => setItemPendingDelete(null)}
          onConfirm={confirmDelete}
        >
          <p>
            {itemPendingDelete ? `O item "${itemPendingDelete.title}" será removido do catálogo.` : 'Este item será removido do catálogo.'}
          </p>
        </Modal>
      </div>
    );
  }

  return (
    <div className="premium-catalog-workspace">
      <Button variant="primary" className="new-item-cta full-page-cta" onClick={handleNew}>+ Novo Item</Button>

      <div className="catalog-search-area">
        <input
          className="catalog-main-search"
          placeholder="Buscar no catálogo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="catalog-category-chips">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip.id}
            className={`category-chip ${activeChip === chip.id ? 'active' : ''}`}
            onClick={() => setActiveChip(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="premium-catalog-list">
        {filteredItems.length === 0 ? (
          <EmptyState
            title="Nenhum item encontrado"
            description={query ? 'Tente buscar por outro termo ou categoria.' : 'Sua biblioteca está vazia. Adicione seu primeiro item.'}
          />
        ) : (
          filteredItems.map((item) => (
            <article key={item.id} className="premium-catalog-item">
              <div className="item-info">
                <span className="item-kind">{itemKindLabel(item.kind)}</span>
                <strong className="item-title">{item.title}</strong>
                <small className="item-meta">{item.category} {item.brand && `· ${item.brand}`}</small>
              </div>
              <div className="item-price-action">
                <span className="item-price">{money(item.defaultUnitValue)}</span>
                <button
                  className="item-action-btn edit"
                  onClick={() => handleEdit(item)}
                  aria-label="Editar item"
                  title="Editar item"
                >
                  <span className="item-action-icon" aria-hidden="true">✎</span>
                </button>
                <button
                  className="item-action-btn danger"
                  onClick={() => requestDelete(item)}
                  aria-label="Excluir item"
                  title="Excluir item"
                >
                  <span className="item-action-icon" aria-hidden="true">✕</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        isOpen={Boolean(itemPendingDelete)}
        title="Excluir item do catálogo?"
        confirmLabel="Excluir"
        tone="danger"
        onClose={() => setItemPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <p>
          {itemPendingDelete ? `O item "${itemPendingDelete.title}" será removido do catálogo.` : 'Este item será removido do catálogo.'}
        </p>
      </Modal>
    </div>
  );
}
