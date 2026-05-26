import { useMemo, useState, useEffect } from 'react';
import {
  Button,
  Select,
  QueueEmptyState,
  BackButton,
  TextArea,
  MonetaryInput,
  Modal,
  ListCard,
  ListItem,
  SearchInput,
  FilterChips,
  ActionMenu,
  Input,
  MoneyValue,
  PrimaryButton,
  SecondaryButton,
  PanelCard
} from '../../../app/components/ui';
import { catalogService } from '../../../services/catalogService';
import { type CatalogHubItem, type CatalogHubItemKind, createCatalogId } from '../types/catalogTypes';
import './PremiumCatalogWorkspace.css';

const CATEGORY_CHIPS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'material', label: 'Materiais' },
  { id: 'labor', label: 'Mão de obra' },
  { id: 'service', label: 'Serviços compostos' },
  { id: 'travel', label: 'Deslocamento' },
  { id: 'fee', label: 'Taxas' },
  { id: 'custom', label: 'Personalizados' },
];

function itemKindLabel(kind: CatalogHubItemKind): string {
  if (kind === 'material') return 'Material';
  if (kind === 'labor') return 'Mão de obra';
  if (kind === 'service') return 'Serviço';
  if (kind === 'travel') return 'Deslocamento';
  if (kind === 'fee') return 'Taxa';
  return 'Item';
}

const CATALOG_VISIBLE_LIMIT = 5;

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
  const [items, setItems] = useState<CatalogHubItem[]>([]);
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<CatalogHubItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<CatalogHubItem | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);

  async function loadData() {
    try {
      const data = await catalogService.getAll();
      setItems(data);
    } catch (err) {
      console.error('Failed to load catalog items:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const chipMatch = activeChip === 'all' || item.kind === activeChip;
      const textMatch = !normalizedQuery ||
        [item.title, item.category, item.brand, item.model, item.reference].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
      return chipMatch && textMatch;
    });
  }, [items, activeChip, query]);

  const visibleItems = showAllItems ? filteredItems : filteredItems.slice(0, CATALOG_VISIBLE_LIMIT);
  const hiddenItemsCount = Math.max(filteredItems.length - visibleItems.length, 0);

  function handleEdit(item: CatalogHubItem) {
    setEditingItem({ ...item });
    setView('form');
  }

  async function handleDuplicate(item: CatalogHubItem) {
    const now = new Date().toISOString();
    const duplicatedItem: CatalogHubItem = {
      ...item,
      id: createCatalogId('item'),
      title: `${item.title} (cópia)`,
      createdAt: now,
      updatedAt: now,
    };
    await catalogService.save(duplicatedItem);
    await loadData();
  }

  function handleNew() {
    setEditingItem(emptyItem(activeChip !== 'all' ? activeChip as CatalogHubItemKind : 'material'));
    setView('form');
  }

  function requestDelete(item: CatalogHubItem) {
    setItemPendingDelete(item);
  }

  async function confirmDelete() {
    if (!itemPendingDelete) return;
    const deletingId = itemPendingDelete.id;
    await catalogService.delete(deletingId);
    await loadData();
    if (editingItem?.id === deletingId) {
      setEditingItem(null);
      setView('list');
    }
    setItemPendingDelete(null);
  }

  async function handleSave() {
    if (!editingItem || !editingItem.title.trim()) return;

    const now = new Date().toISOString();
    const itemToSave = { ...editingItem, updatedAt: now };

    if (!itemToSave.id) {
      itemToSave.id = createCatalogId('item');
      itemToSave.createdAt = now;
    }
    await catalogService.save(itemToSave);
    await loadData();
    setView('list');
    setEditingItem(null);
    setQuery('');
    setActiveChip('all');
  }

  if (view === 'form' && editingItem) {
    return (
      <div className="premium-catalog-workspace form-view">
        <BackButton onClick={() => setView('list')} label="Voltar para a Biblioteca" />

        <PanelCard className="catalog-edit-card">
          <header className="panel-list-header">
            <h2>{editingItem.id ? 'Editar Item' : 'Novo Item'}</h2>
            <p>Configure os detalhes técnicos e comerciais.</p>
          </header>

          <div className="catalog-form-grid">
            <Input
              label="Título do Item"
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              placeholder="Ex: Disjuntor Din 20A"
            />

            <Select
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

            <Input
              label="Marca / Fabricante"
              value={editingItem.brand || ''}
              onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
              placeholder="Opcional"
            />

            <MonetaryInput
              label="Preço"
              value={editingItem.defaultUnitValue}
              onChange={(val) => setEditingItem({ ...editingItem, defaultUnitValue: val })}
            />

            <Input
              label="Unidade"
              value={editingItem.unit}
              onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
              placeholder="un, m, kg..."
            />

            <div className="catalog-field-wide">
              <label className="aferix-input-field">
                <span>Notas Internas</span>
                <TextArea
                  value={editingItem.notes || ''}
                  onChange={(val) => setEditingItem({ ...editingItem, notes: val })}
                  placeholder="Observações de uso..."
                />
              </label>
            </div>
          </div>

          <div className="catalog-actions-row-standardized premium-catalog-actions-spacing">
            <PrimaryButton onClick={handleSave}>
              Salvar Alterações
            </PrimaryButton>
            {editingItem.id && (
              <Button variant="danger" onClick={() => requestDelete(editingItem)}>
                Excluir Item
              </Button>
            )}
            <SecondaryButton onClick={() => setView('list')}>
              Cancelar
            </SecondaryButton>
          </div>
        </PanelCard>

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
    <div className="premium-catalog-workspace aferix-d-flex aferix-flex-column aferix-gap-md">
      <PrimaryButton className="new-item-cta" onClick={handleNew}>+ Novo Item</PrimaryButton>

      <PanelCard className="catalog-search-area aferix-d-flex aferix-flex-column aferix-gap-sm">
        <SearchInput
          placeholder="Buscar no catálogo..."
          value={query}
          onChange={(value) => { setQuery(value); setShowAllItems(false); }}
        />
        <div className="aferix-filter-chips-wrapper">
          <FilterChips
            items={CATEGORY_CHIPS}
            active={[activeChip]}
            onChange={(active) => { setActiveChip(active[0] || 'all'); setShowAllItems(false); }}
            ariaLabel="Filtrar catálogo"
          />
        </div>
      </PanelCard>

      <ListCard>
        {filteredItems.length === 0 ? (
          <QueueEmptyState
            title="Nenhum item encontrado"
          />
        ) : (
          visibleItems.map((item) => (
            <ListItem
              key={item.id}
              title={item.title}
              context={`${itemKindLabel(item.kind)} ${item.brand ? `• ${item.brand}` : ''}`}
              value={<MoneyValue value={item.defaultUnitValue} compact />}
              action={
                <ActionMenu
                  label="Ações"
                  items={[
                    { id: 'edit', label: 'Editar', onSelect: () => handleEdit(item) },
                    { id: 'duplicate', label: 'Duplicar', onSelect: () => handleDuplicate(item) },
                    { id: 'delete', label: 'Excluir', tone: 'danger', onSelect: () => requestDelete(item) },
                  ]}
                />
              }
            />
          ))
        )}

        {filteredItems.length > CATALOG_VISIBLE_LIMIT && (
          <div className="premium-catalog-top-spacing-sm">
            <Button variant="ghost" className="density-toggle-cta" onClick={() => setShowAllItems((current) => !current)}>
              {showAllItems ? 'Ver menos' : `Ver mais (${hiddenItemsCount})`}
            </Button>
          </div>
        )}
      </ListCard>

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
