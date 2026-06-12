import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  Truck, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  ChevronRight,
  Search,
  CheckCircle2,
  X,
  Star,
  FileText,
  History,
  LayoutGrid,
  ShoppingBag
} from 'lucide-react';
import { cn } from '../../../utils/ui';
import { CatalogHubItem } from '../../../features/catalog/storage/catalogHubStorage';
import { 
  SurfaceCard, 
  SectionLabel, 
  Body, 
  OpsChip,
  GlassSearchInput,
  GlassCurrencyInput,
  Subtitle,
  Section
} from '../../../ui/system';
import { db } from '../../../storage/dexieDatabase';

interface ProposalCartWorkspaceProps {
  catalogItems: CatalogHubItem[];
  materials: any[];
  setMaterials: any;
  labor: any[];
  setLabor: any;
  extras: any[];
  setExtras: any;
  onUseTemplate?: (template: any) => void;
}

export const ProposalCartWorkspace: React.FC<ProposalCartWorkspaceProps> = ({
  catalogItems,
  materials,
  setMaterials,
  labor,
  setLabor,
  extras,
  setExtras,
  onUseTemplate
}) => {
  const [activeTab, setActiveTab] = useState<'reuse' | 'catalog' | 'kits' | 'cart' | 'shopping'>('reuse');
  const [activeCategory, setActiveCategory] = useState<'material' | 'labor' | 'other'>('material');
  const [search, setSearch] = useState('');
  const [recentBudgets, setRecentBudgets] = useState<any[]>([]);

  useEffect(() => {
    async function loadRecents() {
      try {
        const budgets = await db.budgets.orderBy('updatedAt').reverse().limit(5).toArray().catch(err => {
          console.error("Erro ao carregar orçamentos recentes no carrinho:", err);
          return [];
        });
        setRecentBudgets(budgets || []);
      } catch (err) {
        console.error("Erro no loadRecents:", err);
      }
    }
    loadRecents();
  }, []);

  const MOCK_TEMPLATES = [
    {
      id: 'tmpl-cftv-res',
      name: 'Instalação CFTV Residencial',
      items: [
        { name: 'DVR 4 Canais', category: 'material', qty: 1, unitPrice: 450 },
        { name: 'Câmera Bullet', category: 'material', qty: 4, unitPrice: 120 },
        { name: 'Mão de Obra Instalação', category: 'labor', qty: 1, unitPrice: 800 },
      ]
    },
    {
      id: 'tmpl-split-clean',
      name: 'Manutenção de Ar Split',
      items: [
        { name: 'Limpeza e Higienização', category: 'labor', qty: 1, unitPrice: 180 },
        { name: 'Carga de Fluido (Opcional)', category: 'material', qty: 0, unitPrice: 150 },
      ]
    }
  ];

  const cartTotalItems = materials.length + labor.length + extras.length;
  const cartTotalValue = useMemo(() => {
    const sum = (items: any[]) => items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    return sum(materials) + sum(labor) + sum(extras);
  }, [materials, labor, extras]);

  const filteredCatalog = useMemo(() => {
    return catalogItems.filter(item => {
      const isCategoryMatch = 
        activeCategory === 'material' 
          ? (item.kind === 'material' || item.category === 'material')
          : activeCategory === 'labor'
          ? (item.kind === 'labor' || item.kind === 'service' || item.category === 'labor')
          : (!['material', 'labor', 'service'].includes(item.kind) || item.category === 'other');

      const itemTitle = item.title || '';
      return isCategoryMatch && itemTitle.toLowerCase().includes(search.toLowerCase());
    });
  }, [catalogItems, activeCategory, search]);

  const addToCart = (item: CatalogHubItem) => {
    if (navigator.vibrate) navigator.vibrate(20);
    const newItem = {
      id: Math.random().toString(36).substring(2),
      name: item.title,
      qty: 1,
      unitPrice: item.defaultUnitValue || 0
    };

    const targetCategory = (item.kind === 'material' || item.category === 'material')
      ? 'material'
      : (item.kind === 'labor' || item.kind === 'service' || item.category === 'labor')
      ? 'labor'
      : 'other';

    if (targetCategory === 'material') setMaterials((p: any) => [...p, newItem]);
    else if (targetCategory === 'labor') setLabor((p: any) => [...p, newItem]);
    else setExtras((p: any) => [...p, newItem]);
  };

  const useTemplate = (items: any[]) => {
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    items.forEach(i => {
      const newItem = { id: Math.random().toString(36).substring(2), name: i.name, qty: i.qty, unitPrice: i.unitPrice };
      if (i.category === 'material') setMaterials((p: any) => [...p, newItem]);
      else if (i.category === 'labor') setLabor((p: any) => [...p, newItem]);
      else setExtras((p: any) => [...p, newItem]);
    });
    window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'success', message: 'Itens carregados do modelo.' } }));
    setActiveTab('cart');
  };

  const updateCartItem = (setter: any, id: string, field: string, value: any) => {
    setter((prev: any[]) => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeCartItem = (setter: any, id: string) => {
    setter((prev: any[]) => prev.filter(item => item.id !== id));
  };

  const renderCartList = (title: string, icon: any, color: string, items: any[], setter: any) => {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white/5", color)}>{icon}</div>
           <Body className="font-black uppercase tracking-widest text-[13px] text-white/80">{title}</Body>
        </div>
        {items.map(item => (
          <div key={item.id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-4">
             <div className="flex justify-between items-start gap-4">
                <span className="text-[14px] font-bold text-white uppercase">{item.name}</span>
                <button onClick={() => removeCartItem(setter, item.id)} className="text-[#E85D5D]/60 hover:text-[#E85D5D] p-2 -m-2"><X size={16} /></button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <GlassCurrencyInput label="QUANTIDADE" value={item.qty} onChange={(e) => updateCartItem(setter, item.id, 'qty', parseFloat(e.target.value) || 0)} />
                <GlassCurrencyInput label="UNITÁRIO" value={item.unitPrice} onChange={(e) => updateCartItem(setter, item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
             </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* TABS - REUSE FIRST */}
      <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => setActiveTab('reuse')} 
          className={cn("flex-1 min-w-[100px] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === 'reuse' ? "bg-white/10 text-white shadow-sm" : "text-white/40")}
        >
          <History size={14} /> Reutilizar
        </button>
        <button 
          onClick={() => setActiveTab('catalog')} 
          className={cn("flex-1 min-w-[100px] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === 'catalog' ? "bg-white/10 text-white shadow-sm" : "text-white/40")}
        >
          <LayoutGrid size={14} /> Catálogo
        </button>
        <button 
          onClick={() => setActiveTab('cart')} 
          className={cn("flex-[1.5] min-w-[140px] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === 'cart' ? "bg-[#D4AF37] text-black shadow-[0_4px_16px_rgba(212,169,74,0.3)]" : "text-white/40")}
        >
          <ShoppingCart size={16} /> Carrinho ({cartTotalItems})
        </button>
        {materials.length > 0 && (
          <button 
            onClick={() => setActiveTab('shopping')} 
            className={cn("flex-1 min-w-[120px] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === 'shopping' ? "bg-white/10 text-white shadow-sm" : "text-white/40")}
          >
            <ShoppingBag size={14} /> Compra
          </button>
        )}
      </div>

      {activeTab === 'shopping' && (
        <SurfaceCard padding="lg" className="border border-[#0A84FF]/20 shadow-2xl animate-in fade-in duration-500">
           <div className="flex justify-between items-center px-1 mb-6">
             <SectionLabel className="!mb-0 uppercase tracking-widest text-[#0A84FF]">Lista de Compras Técnica</SectionLabel>
             <OpsChip label="JIT" tone="warning" />
           </div>
           <div className="flex flex-col gap-4">
             {materials.map((m, i) => (
               <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-lg bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center">
                        <Package size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-white uppercase">{m.name}</span>
                        <span className="text-[10px] text-white/30 uppercase font-mono">Qtd Necessária: {m.qty}</span>
                     </div>
                  </div>
                  <CheckCircle2 size={18} className="text-white/10" />
               </div>
             ))}
             <div className="mt-4 p-4 rounded-xl bg-[#0A84FF]/5 border border-[#0A84FF]/20">
                <Body className="text-[11px] text-[#0A84FF] font-bold uppercase tracking-widest mb-1">Sugestão de Fornecedor</Body>
                <Subtitle className="text-[13px] opacity-70">Distribuidora Local - Padrão JIT</Subtitle>
             </div>
           </div>
        </SurfaceCard>
      )}

      {activeTab === 'reuse' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* RECENTES */}
           <Section className="gap-4">
              <SectionLabel className="ml-1">🕒 Soluções Recentes</SectionLabel>
              {recentBudgets.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recentBudgets.map(b => (
                    <button 
                      key={b.id}
                      onClick={() => useTemplate(b.items)}
                      className="w-full text-left bg-white/[0.03] border border-white/10 p-5 rounded-[22px] flex items-center justify-between active:scale-95 transition-all group"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-bold text-white uppercase truncate">{b.title}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">{b.clientName} · {new Date(b.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <Plus size={18} className="text-[#D4AF37] opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-[22px]">
                   <Body className="text-[11px] opacity-20 uppercase font-black tracking-widest">Nenhuma solução recente</Body>
                </div>
              )}
           </Section>

           {/* MODELOS (TEMPLATES) */}
           <Section className="gap-4">
              <SectionLabel className="ml-1">📄 Modelos Profissionais</SectionLabel>
              <div className="grid grid-cols-1 gap-3">
                {MOCK_TEMPLATES.map(tmpl => (
                  <button 
                    key={tmpl.id}
                    onClick={() => useTemplate(tmpl.items)}
                    className="w-full text-left bg-white/[0.03] border border-[#0A84FF]/20 p-5 rounded-[22px] flex items-center justify-between active:scale-95 transition-all group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-black text-[#0A84FF] uppercase">{tmpl.name}</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">{tmpl.items.length} itens sugeridos</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center">
                       <Plus size={18} />
                    </div>
                  </button>
                ))}
              </div>
           </Section>

           {/* FAVORITOS */}
           <Section className="gap-4">
              <SectionLabel className="ml-1">⭐ Meus Favoritos</SectionLabel>
              <div className="py-12 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-[22px] flex flex-col items-center gap-3">
                 <Star size={24} className="text-white/10" />
                 <Body className="text-[11px] opacity-20 uppercase font-black tracking-widest">Marque soluções para aparecerem aqui</Body>
              </div>
           </Section>
        </div>
      )}

      {activeTab === 'catalog' && (
        <SurfaceCard padding="lg" className="border border-white/10 shadow-2xl flex flex-col gap-6 animate-in fade-in duration-500">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
             {[
               { id: 'material', label: 'Materiais', icon: <Package size={14} /> },
               { id: 'labor', label: 'Serviços', icon: <Clock size={14} /> },
               { id: 'other', label: 'Extras', icon: <Truck size={14} /> }
             ].map(cat => (
               <button 
                 key={cat.id} 
                 onClick={() => setActiveCategory(cat.id as any)}
                 className={cn("px-4 h-10 rounded-full flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border", activeCategory === cat.id ? "bg-white text-black border-transparent" : "bg-white/5 border-white/10 text-white/40")}
               >
                 {cat.icon} {cat.label}
               </button>
             ))}
           </div>

           <GlassSearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar item no catálogo..." />

           <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredCatalog.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="w-full text-left bg-white/[0.02] border border-white/[0.05] p-4 rounded-[20px] flex items-center justify-between active:scale-95 transition-all group"
                >
                  <div className="flex flex-col">
                     <span className="text-[14px] font-bold text-white uppercase">{item.title}</span>
                     <span className="text-[11px] font-mono text-[var(--accent-gold)] mt-1 tracking-widest">R$ {(item.defaultUnitValue || 0).toFixed(2)}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#47C46A]/10 text-[#47C46A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                     <Plus size={20} />
                  </div>
                </button>
              ))}
           </div>
        </SurfaceCard>
      )}

      {activeTab === 'cart' && (
        <SurfaceCard padding="lg" className="border border-[var(--accent-gold)]/20 shadow-[0_20px_60px_rgba(212,169,74,0.1)] animate-in fade-in duration-500">
           <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
              <SectionLabel className="!mb-0">Carrinho Comercial</SectionLabel>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Subtotal</span>
                 <span className="text-[20px] font-mono font-black text-[var(--accent-gold)]">R$ {cartTotalValue.toFixed(2)}</span>
              </div>
           </div>

           {cartTotalItems === 0 ? (
             <div className="py-20 text-center flex flex-col items-center opacity-30">
                <ShoppingCart size={40} className="mb-4" />
                <span className="text-[12px] font-black uppercase tracking-widest font-mono">CARRINHO VAZIO</span>
             </div>
           ) : (
             <div className="flex flex-col">
                {renderCartList('Peças e Materiais', <Package size={16} />, 'text-[#0A84FF]', materials, setMaterials)}
                {renderCartList('Serviços e Mão de Obra', <Clock size={16} />, 'text-[#D4AF37]', labor, setLabor)}
                {renderCartList('Custos Extras', <Truck size={16} />, 'text-white/40', extras, setExtras)}
             </div>
           )}
        </SurfaceCard>
      )}
    </div>
  );
};
