import { useMemo, useState, useEffect } from 'react';
import {
  Button,
  Select,
  QueueEmptyState,
  TextArea,
  MonetaryInput,
  Modal,
  ListItem,
  SearchInput,
  FilterChips,
  ActionMenu,
  Input,
  MoneyValue,
  PrimaryButton,
  SecondaryButton,
  Card,
  SectionLabel
} from '../../../app/components/ui';
import { catalogService } from '../../../services/catalogService';
import { type CatalogHubItem, type CatalogHubItemKind, createCatalogId } from '../types/catalogTypes';
import { ChevronLeft } from 'lucide-react';
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

interface PremiumCatalogWorkspaceProps {
  onSendToBudget?: (items: CatalogHubItem[]) => void;
}

/**
 * PremiumCatalogWorkspace: Executive item library.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function PremiumCatalogWorkspace({ onSendToBudget }: PremiumCatalogWorkspaceProps) {
  const [items, setItems] = useState<CatalogHubItem[]>([]);
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<CatalogHubItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<CatalogHubItem | null>(null);
  const [itemPendingSelection, setItemPendingSelection] = useState<CatalogHubItem | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
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
      <div className="flex flex-col gap-lg pb-32">
        <button 
          onClick={() => setView('list')} 
          className="flex items-center gap-sm text-ui-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" /> BIBLIOTECA
        </button>

        <Card className="p-card">
          <SectionLabel className="mt-0 mb-8">
            {editingItem.id ? 'Editar Item' : 'Novo Item do Catálogo'}
          </SectionLabel>

          <div className="flex flex-col gap-lg">
            <Input
              label="Título do Item"
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              placeholder="Ex: Disjuntor Din 20A"
            />

            <div className="grid grid-cols-2 gap-md">
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
            </div>

            <div className="grid grid-cols-2 gap-md">
              <MonetaryInput
                label="Preço Base"
                value={editingItem.defaultUnitValue}
                onChange={(val) => setEditingItem({ ...editingItem, defaultUnitValue: val })}
              />

              <Input
                label="Unidade"
                value={editingItem.unit}
                onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                placeholder="un, m, kg..."
              />
            </div>

            <TextArea
              label="Notas Internas"
              value={editingItem.notes || ''}
              onChange={(val) => setEditingItem({ ...editingItem, notes: val })}
              placeholder="Observações técnicas de uso..."
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-sm mt-12 pt-10 border-t var(--border-subtle)">
            <PrimaryButton className="h-16" onClick={handleSave}>
              Salvar Alterações
            </PrimaryButton>
            <div className="grid grid-cols-2 gap-sm">
              <SecondaryButton onClick={() => setView('list')}>
                Cancelar
              </SecondaryButton>
              {editingItem.id && (
                <Button variant="danger" onClick={() => requestDelete(editingItem)}>
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Modal
          isOpen={Boolean(itemPendingDelete)}
          title="Excluir item?"
          confirmLabel="Excluir Definitivamente"
          tone="danger"
          onClose={() => setItemPendingDelete(null)}
          onConfirm={confirmDelete}
        >
          <p className="text-ui-base font-medium text-[var(--text-secondary)] leading-relaxed">
            {itemPendingDelete ? `O item "${itemPendingDelete.title}" será removido da sua biblioteca operacional de forma permanente.` : 'Este item será removido do catálogo.'}
          </p>
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg pb-32">
      <PrimaryButton className="w-full h-16" onClick={handleNew}>+ Novo Item do Catálogo</PrimaryButton>

      <div className="p-card rounded-[var(--radius-card)] bg-[var(--bg-surface-glass)] border var(--border-soft) shadow-[var(--shadow-soft)] flex flex-col gap-lg">
        <SearchInput
          placeholder="Buscar no catálogo..."
          value={query}
          onChange={(value) => { setQuery(value); setShowAllItems(false); }}
        />
        <FilterChips
          items={CATEGORY_CHIPS}
          active={[activeChip]}
          onChange={(active) => { setActiveChip(active[0] || 'all'); setShowAllItems(false); }}
          ariaLabel="Filtrar catálogo"
        />
      </div>

      <div className="flex flex-col gap-lg">
        <SectionLabel className="mt-0">Biblioteca de Itens</SectionLabel>
        
        <div className="flex flex-col gap-sm">
          {filteredItems.length === 0 ? (
            <QueueEmptyState
              title="Nenhum item encontrado"
              meta="Ajuste os filtros ou inicie um novo cadastro."
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
                    label="…"
                    items={[
                      { 
                        id: 'select', 
                        label: 'Adicionar ao Orçamento', 
                        onSelect: () => {
                          setItemPendingSelection(item);
                          setPendingQuantity(item.defaultQuantity || 1);
                        },
                      },
                      { id: 'edit', label: 'Editar', onSelect: () => handleEdit(item) },
                      { id: 'duplicate', label: 'Duplicar', onSelect: () => handleDuplicate(item) },
                      { id: 'delete', label: 'Excluir', tone: 'danger' as const, onSelect: () => requestDelete(item) },
                    ].filter(it => it.id !== 'select' || !!onSendToBudget)}
                  />
                }
              />
            ))
          )}

          {filteredItems.length > CATALOG_VISIBLE_LIMIT && (
            <button 
              onClick={() => setShowAllItems((current) => !current)}
              className="mt-4 w-full h-14 rounded-[var(--radius-button)] border var(--border-soft) bg-white/[0.02] text-ui-xs font-bold text-[var(--text-muted)] transition-all hover:bg-white/[0.04] active:scale-[0.98]"
            >
              {showAllItems ? 'VER MENOS' : `VER MAIS (${hiddenItemsCount})`}
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(itemPendingSelection)}
        title="Adicionar ao Projeto"
        confirmLabel="Confirmar Inclusão"
        onClose={() => setItemPendingSelection(null)}
        onConfirm={() => {
          if (itemPendingSelection && onSendToBudget) {
            onSendToBudget([{ ...itemPendingSelection, defaultQuantity: pendingQuantity }]);
            setItemPendingSelection(null);
          }
        }}
      >
        <div className="flex flex-col gap-lg py-4">
          <p className="text-ui-base font-medium text-[var(--text-secondary)] leading-relaxed">Defina a quantidade de <strong>{itemPendingSelection?.title}</strong>:</p>
          <Input
            label="Quantidade"
            type="number"
            value={pendingQuantity}
            onChange={(e) => setPendingQuantity(Number(e.target.value))}
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(itemPendingDelete)}
        title="Excluir item?"
        confirmLabel="Excluir Definitivamente"
        tone="danger"
        onClose={() => setItemPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <p className="text-ui-base font-medium text-[var(--text-secondary)] leading-relaxed">
          {itemPendingDelete ? `O item "${itemPendingDelete.title}" será removido da biblioteca operacional de forma permanente.` : 'Este item será removido do catálogo.'}
        </p>
      </Modal>
    </div>
  );
}
