import React, { useState } from 'react';
import { Package, AlertOctagon, TrendingDown, ShoppingCart, Plus, Save } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { generateUUID } from '../../../core/utils/idGenerator';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  ExecutiveSummaryGrid, 
  ValueBlock,
  InteractiveRow,
  Body,
  Subtitle
} from '../../../ui/system';
import { Input, PrimaryButton, MonetaryInput, Modal } from '../../../app/components/ui';
import { trustLayer } from '../../../core/trust/TrustLayer';

export const InventoryDashboard: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', qty: 1, cost: 0, min: 1 });

  const items = useLiveQuery(() => db.inventoryItems.toArray()) || [];

  const stats = {
    totalValue: items.reduce((acc, item) => acc + (item.quantityOnHand * item.unitCost), 0),
    criticalCount: items.filter(i => i.status === 'OUT_OF_STOCK').length,
    lowCount: items.filter(i => i.status === 'LOW_STOCK').length,
  };

  const criticalItems = items.filter(i => i.status === 'OUT_OF_STOCK' || i.status === 'LOW_STOCK');
  const normalItems = items.filter(i => i.status === 'IN_STOCK');

  const handleSaveItem = async () => {
    if (!newItem.name || newItem.qty < 0 || newItem.cost < 0) {
      trustLayer.emit({ type: 'error', title: 'Validação', description: 'Preencha nome, quantidade e custo válidos.', status: 'local' });
      return;
    }

    try {
      const id = generateUUID();
      const status = newItem.qty === 0 ? 'OUT_OF_STOCK' : (newItem.qty <= newItem.min ? 'LOW_STOCK' : 'IN_STOCK');
      
      await db.inventoryItems.put({
        id,
        companyId: 'default-company',
        workspaceId: 'default-workspace',
        sku: newItem.name.toUpperCase().replace(/\s+/g, '_'),
        name: newItem.name,
        category: 'material',
        quantityOnHand: newItem.qty,
        minimumStock: newItem.min,
        unitCost: newItem.cost,
        status,
        lastUpdated: new Date().toISOString()
      });

      trustLayer.emit({ type: 'success', title: 'Item adicionado ao estoque', status: 'synced' });
      setIsAdding(false);
      setNewItem({ name: '', qty: 1, cost: 0, min: 1 });
    } catch (error) {
      trustLayer.emit({ type: 'error', title: 'Erro ao salvar', description: 'Não foi possível salvar o item.', status: 'local' });
    }
  };

  const handleRestock = async (id: string) => {
    // In a real flow, this would open a modal to add more stock, we'll just add 5 for now
    try {
      const item = await db.inventoryItems.get(id);
      if (item) {
        const newQty = item.quantityOnHand + 5;
        const status = newQty === 0 ? 'OUT_OF_STOCK' : (newQty <= item.minimumStock ? 'LOW_STOCK' : 'IN_STOCK');
        await db.inventoryItems.update(id, { quantityOnHand: newQty, status, lastUpdated: new Date().toISOString() });
        trustLayer.emit({ type: 'success', title: 'Estoque atualizado', description: '+5 unidades adicionadas.', status: 'synced' });
      }
    } catch (error) {
       console.error(error);
    }
  };

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Estoque." subtitle="Materiais e Custos" />

      <div className="px-6 py-8 flex flex-col gap-6">
        
        {/* METRICS */}
        <Section>
          <ExecutiveSummaryGrid>
            <ValueBlock label="Capital Imobilizado" value={formatCurrencyBRL(stats.totalValue)} icon={<Package size={12} />} />
            <ValueBlock label="Em Falta" value={stats.criticalCount} variant={stats.criticalCount > 0 ? 'danger' : 'default'} icon={<AlertOctagon size={12} />} />
            <ValueBlock label="Baixo Estoque" value={stats.lowCount} variant={stats.lowCount > 0 ? 'warning' : 'default'} icon={<TrendingDown size={12} />} />
          </ExecutiveSummaryGrid>
          
          <PrimaryButton onClick={() => setIsAdding(true)} className="mt-2 h-14 !rounded-2xl" tone="default">
            <Plus size={18} className="mr-2" /> NOVO MATERIAL
          </PrimaryButton>
        </Section>

        {/* ALERTS */}
        {criticalItems.length > 0 && (
          <Section>
            <SectionLabel className="!text-status-error flex items-center gap-2">
              <AlertOctagon size={16} /> Atenção Imediata (Ruptura)
            </SectionLabel>
            <div className="flex flex-col gap-3">
              {criticalItems.map(item => (
                <SurfaceCard key={item.id} padding="lg" className={item.status === 'OUT_OF_STOCK' ? "border-status-error/30 bg-status-error/5" : "border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5"}>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-widest">{item.sku}</span>
                      <span className="text-sm font-bold text-white">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-tertiary uppercase tracking-widest">Estoque</span>
                        <span className={`text-lg font-black font-mono ${item.status === 'OUT_OF_STOCK' ? 'text-status-error' : 'text-[var(--accent-gold)]'}`}>{item.quantityOnHand}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-tertiary uppercase tracking-widest">Mínimo</span>
                        <span className="text-lg font-bold text-text-secondary font-mono">{item.minimumStock}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRestock(item.id)} className="bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg font-bold transition-all active:scale-95">
                      + REPOR
                    </button>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </Section>
        )}

        {/* INVENTORY LIST */}
        <Section>
          <SectionLabel>Meus Materiais ({normalItems.length})</SectionLabel>
          <SurfaceCard padding="none" className="overflow-hidden">
             {normalItems.length === 0 ? (
               <div className="py-12 text-center opacity-30">
                  <Body className="font-mono text-[10px] font-black tracking-widest uppercase">ESTOQUE_VAZIO</Body>
               </div>
             ) : (
               <div className="flex flex-col">
                 {normalItems.map(item => (
                   <InteractiveRow key={item.id}>
                     <div className="flex items-center justify-between w-full">
                       <div className="flex flex-col">
                         <Body className="font-bold uppercase text-[12px]">{item.name}</Body>
                         <Subtitle className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{formatCurrencyBRL(item.unitCost)} / un</Subtitle>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-sm font-black font-mono text-[var(--accent-green)]">{item.quantityOnHand} un</span>
                       </div>
                     </div>
                   </InteractiveRow>
                 ))}
               </div>
             )}
          </SurfaceCard>
        </Section>
      </div>

      <Modal isOpen={isAdding} title="Novo Material" onClose={() => setIsAdding(false)}>
        <div className="flex flex-col gap-4 py-4 pb-12">
          <Input 
            label="Nome do Material" 
            placeholder="Ex: Disjuntor 20A" 
            value={newItem.name} 
            onChange={e => setNewItem(prev => ({...prev, name: e.target.value}))} 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Qtd Inicial" 
              type="number" 
              value={newItem.qty} 
              onChange={e => setNewItem(prev => ({...prev, qty: Number(e.target.value)}))} 
            />
            <Input 
              label="Estoque Mínimo" 
              type="number" 
              value={newItem.min} 
              onChange={e => setNewItem(prev => ({...prev, min: Number(e.target.value)}))} 
            />
          </div>
          <MonetaryInput 
            label="Custo Unitário Médio" 
            value={newItem.cost} 
            onChange={val => setNewItem(prev => ({...prev, cost: val}))} 
          />
          <PrimaryButton onClick={handleSaveItem} className="mt-4 h-14 !rounded-xl" tone="green">
            <Save size={18} className="mr-2" /> SALVAR MATERIAL
          </PrimaryButton>
        </div>
      </Modal>

    </ScreenContainer>
  );
};
