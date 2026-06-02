import { useMemo, useState, useEffect, memo } from 'react';
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
  DangerButton
} from '../../../app/components/ui';
import { catalogService } from '../../../services/catalogService';
import { type CatalogHubItem, type CatalogHubItemKind, createCatalogId } from '../types/catalogTypes';
import { ChevronLeft, Plus, BookOpen, Package, Wrench, Info, Activity, History, Briefcase, Boxes, ChevronRight, BarChart } from 'lucide-react';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../../ui/runtime';
import { OperationalFlowLayout } from '../../../ui/layouts';
import { 
  SurfaceCard,
  ScreenContainer,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  SemanticBadge,
  InteractiveRow,
  AppHeader,
  OpsChip,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Heading,
  Value,
  FinancialValue,
  ERPLoader
} from '../../../ui/system';

const CATEGORY_CHIPS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'TODOS' },
  { id: 'material', label: 'MATERIAIS' },
  { id: 'labor', label: 'MÃO_DE_OBRA' },
  { id: 'service', label: 'SERVIÇOS' },
  { id: 'travel', label: 'LOGÍSTICA' },
];

const CATALOG_VISIBLE_LIMIT = 10;

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
  onBack?: () => void;
}

/**
 * PremiumCatalogWorkspace: Executive item library.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export function PremiumCatalogWorkspace({ onSendToBudget, onBack }: PremiumCatalogWorkspaceProps) {
  const [items, setItems] = useState<CatalogHubItem[]>([]);
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<CatalogHubItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<CatalogHubItem | null>(null);
  const [itemPendingSelection, setItemPendingSelection] = useState<CatalogHubItem | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [showAllItems, setShowAllItems] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await catalogService.getAll();
      setItems(data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const chipMatch = activeChip === 'all' || item.kind === activeChip;
      const textMatch = !normalizedQuery || [item.title, item.category, item.brand, item.model].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
      return chipMatch && textMatch;
    });
  }, [items, activeChip, query]);

  const visibleItems = showAllItems ? filteredItems : filteredItems.slice(0, CATALOG_VISIBLE_LIMIT);
  const hiddenItemsCount = Math.max(filteredItems.length - visibleItems.length, 0);

  function handleEdit(item: CatalogHubItem) {
    setEditingItem({ ...item });
    setView('form');
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
  }

  async function confirmDelete() {
    if (!itemPendingDelete) return;
    await catalogService.delete(itemPendingDelete.id);
    await loadData();
    setView('list');
    setItemPendingDelete(null);
  }

  const materialsCount = useMemo(() => items.filter(i => i.kind === 'material').length, [items]);
  const laborsCount = useMemo(() => items.filter(i => i.kind === 'labor').length, [items]);

  if (view === 'form' && editingItem) {
    return (
      <ScreenContainer className="pb-32">
         <AppHeader title={editingItem.id ? 'Editar Item.' : 'Novo Item.'} onBack={() => setView('list')} />

         <div className="px-6 py-4 flex flex-col gap-6">
            <SurfaceCard padding="lg">
               <SectionLabel className="mb-4">Dados do Catálogo</SectionLabel>
               <div className="flex flex-col gap-6">
                  <Input label="Título do Item" value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} placeholder="Ex: Disjuntor Din 20A" />
                  <Select label="Tipo de Recurso" value={editingItem.kind} onChange={(val) => setEditingItem({ ...editingItem, kind: val as CatalogHubItemKind, itemType: val === 'labor' ? 'service' : 'material' })}>
                    <option value="material">Material</option>
                    <option value="labor">Mão de obra</option>
                    <option value="service">Serviço / Composto</option>
                    <option value="travel">Deslocamento</option>
                  </Select>
                  <div className="grid grid-cols-2 gap-4">
                     <Input label="Marca / Fabricante" value={editingItem.brand || ''} onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })} placeholder="Opcional" />
                     <Input label="Unidade" value={editingItem.unit} onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })} placeholder="un, m, kg..." />
                  </div>
                  <MonetaryInput label="Preço Base (Referência)" value={editingItem.defaultUnitValue} onChange={(val) => setEditingItem({ ...editingItem, defaultUnitValue: val })} />
                  <TextArea label="Notas Técnicas" value={editingItem.notes || ''} onChange={(val) => setEditingItem({ ...editingItem, notes: val })} placeholder="Observações para o orçamento..." rows={4} />
               </div>
            </SurfaceCard>

            <div className="flex flex-col gap-3 mt-4">
               <PrimaryButton 
                 onClick={handleSave} 
                 className="h-16 w-full !rounded-2xl !text-[13px] font-black"
               >
                 SALVAR ALTERAÇÕES
               </PrimaryButton>
               <div className="grid grid-cols-2 gap-3">
                  <SecondaryButton 
                    onClick={() => setView('list')} 
                    className="h-14 !rounded-2xl !text-[11px]"
                  >
                    CANCELAR
                  </SecondaryButton>
                  {editingItem.id && (
                    <DangerButton 
                      onClick={() => setItemPendingDelete(editingItem)} 
                      className="h-14 !rounded-2xl !text-[11px]"
                    >
                      EXCLUIR
                    </DangerButton>
                  )}
               </div>
            </div>
         </div>
      </ScreenContainer>
    );
  }

  const chips = (
    <>
      <OpsChip icon={<BarChart size={11} />} label={`${items.length} itens`} accent={false} />
      <OpsChip icon={<Package size={11} />} label={`${materialsCount} materiais`} accent={false} />
      <OpsChip icon={<Wrench size={11} />} label={`${laborsCount} serviços`} accent="green" />
    </>
  );

  return (
    <ScreenContainer className="pb-32">
      <AppHeader 
        title="Catálogo." 
        onBack={onBack}
        chips={chips}
        action={
          <button 
            onClick={() => { setEditingItem(emptyItem('material')); setView('form'); }} 
            className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-white/[0.04] border border-white/[0.08] text-[var(--accent-gold)] hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
            title="Novo Item de Catálogo"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        }
      />

      <div className="px-6 py-8 flex flex-col gap-12">
        
        {/* 1. LIBRARY HERO */}
        <Section className="gap-4">
          <SectionLabel className="ml-2">Biblioteca Estratégica</SectionLabel>
          <SurfaceCard variant="cinematic" padding="lg">
             <div className="flex items-center justify-between mb-3">
                <SectionLabel className="text-[var(--accent-gold)]">Patrimônio Técnico</SectionLabel>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                   <Activity size={11} className="text-[var(--accent-green)]" />
                   <Value className="text-11px">Sincronizado</Value>
                </div>
             </div>
             <Heading className="text-[32px] mb-3">
                {items.length} Itens
             </Heading>
             <Body className="text-[var(--accent-gold)] font-bold tracking-tight">
                Base de Insumos e Mão de Obra
             </Body>
          </SurfaceCard>
        </Section>

        <Section className="gap-2">
          <SearchInput placeholder="Localizar item..." value={query} onChange={(value) => { setQuery(value); setShowAllItems(false); }} />
          <FilterChips items={CATEGORY_CHIPS} active={[activeChip]} onChange={(active) => { setActiveChip(active[0] || 'all'); setShowAllItems(false); }} />
        </Section>

        <Section className="gap-3 pb-12">
            <SectionLabel className="ml-2">Inventário Operacional</SectionLabel>
            {isLoading ? (
              <div className="py-20"><ERPLoader message="Recuperando biblioteca..." /></div>
            ) : filteredItems.length === 0 ? (
              <SurfaceCard padding="lg" className="text-center border-dashed opacity-50"><Body className="font-mono text-[10px] font-bold opacity-20">NENHUM_ITEM_MAPEADO</Body></SurfaceCard>
            ) : (
              <SurfaceCard padding="none">
                <Stack className="gap-0">
                  {visibleItems.map((item, idx) => (
                    <InteractiveRow 
                      key={item.id} 
                      onClick={() => handleEdit(item)}
                      leftSlot={
                        <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center">
                          {item.kind === 'labor' ? <Wrench size={14} className="text-[var(--accent-green)]" /> : <Package size={14} className="text-[var(--accent-gold)]" />}
                        </div>
                      }
                    >
                        <div className="flex items-center gap-4 w-full">
                           <div className="flex-1 min-w-0">
                              <Body className="truncate leading-tight uppercase font-black tracking-tight text-white text-[13.5px]">{item.title}</Body>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <SectionLabel className="!text-[9px] !text-[var(--text-muted)] font-mono">{item.kind.toUpperCase()}</SectionLabel>
                                 <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                                 <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">{item.brand || 'PADRÃO'}</Subtitle>
                              </div>
                           </div>
                           <Stack className="items-end gap-0.5 shrink-0">
                              <FinancialValue value={item.defaultUnitValue} compact className="text-[13.5px] font-mono text-[var(--accent-gold)] font-bold" />
                              <SectionLabel className="!text-[8px] !text-[var(--text-tertiary)] uppercase font-mono tracking-widest">{item.unit}</SectionLabel>
                           </Stack>
                        </div>
                    </InteractiveRow>
                  ))}
                </Stack>
              </SurfaceCard>
            )}

            {filteredItems.length > CATALOG_VISIBLE_LIMIT && (
              <button 
                onClick={() => setShowAllItems((current) => !current)}
                className="w-full h-14 rounded-2xl border border-white/5 bg-white/[0.02] text-[10px] font-bold text-white/20 tracking-[0.3em] font-mono transition-all hover:bg-white/[0.04] active:scale-[0.98]"
              >
                {showAllItems ? 'OCULTAR_ITENS' : `VER_MAIS_ITENS (${hiddenItemsCount})`}
              </button>
            )}
        </Section>
      </div>

      <Modal isOpen={Boolean(itemPendingDelete)} title="Excluir item?" confirmLabel="Excluir" tone="danger" onClose={() => setItemPendingDelete(null)} onConfirm={confirmDelete}>
        <Subtitle className="leading-relaxed">Esta ação removerá o item "{itemPendingDelete?.title}" permanentemente da biblioteca.</Subtitle>
      </Modal>

      <Modal isOpen={Boolean(itemPendingSelection)} title="Adicionar" confirmLabel="Confirmar" onClose={() => setItemPendingSelection(null)} onConfirm={() => { if (itemPendingSelection && onSendToBudget) { onSendToBudget([{ ...itemPendingSelection, defaultQuantity: pendingQuantity }]); setItemPendingSelection(null); } }}>
        <div className="flex flex-col gap-6 py-4">
          <Input label="Quantidade" type="number" value={pendingQuantity} onChange={(e) => setPendingQuantity(Number(e.target.value))} autoFocus />
        </div>
      </Modal>
    </ScreenContainer>
  );
}
