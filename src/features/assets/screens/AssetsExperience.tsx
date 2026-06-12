import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Wrench, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Filter, 
  Plus, 
  ArrowLeft, 
  Clipboard, 
  Tag, 
  Info,
  Navigation,
  Activity,
  History,
  Boxes,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { cn } from '../../../utils/ui';
import { 
  ScreenContainer, 
  ERPLoader,
  ExecutiveHeader,
  SurfaceCard,
  SectionLabel,
  GlassSearchInput,
  TimelineCard,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Heading,
  Value,
  FinancialValue,
  StatusPill,
  ExecutiveSummaryGrid,
  ValueBlock
} from '../../../ui/system';
import { assetService } from '../../../services/assetService';
import { db } from '../../../storage/dexieDatabase';
import { Asset, AssetStatus } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';
import { Service as WorkOrder } from '../../../core/types/business';
import { operationalFacade } from '../../workflow/operationalFacade';
import { PrimaryButton, SecondaryButton } from '../../../app/components/ui';

// --- CONSTANTS ---
const ASSET_CATEGORIES = ['Todos', 'HVAC', 'Elétrica', 'Hidráulica', 'Incêndio', 'Sistema', 'Infraestrutura'];

// --- ATOM: AssetCategoryPills ---
const AssetCategoryPills = ({ selected, onSelect }: { selected: string, onSelect: (c: string) => void }) => (
  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6">
    {ASSET_CATEGORIES.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={cn(
          "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border",
          selected === cat 
            ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,169,74,0.3)]" 
            : "bg-white/[0.03] text-white/40 border-white/[0.08] hover:border-white/20"
        )}
      >
        {cat}
      </button>
    ))}
  </div>
);

// --- ATOM: AssetCard ---
const AssetCard = ({ asset, onClick }: { asset: Asset, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#15181D]/40 border border-white/[0.08] rounded-[28px] p-6 active:scale-[0.97] transition-all flex flex-col gap-6 shadow-xl group hover:bg-[#15181D]/60"
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] opacity-80">{asset.tag || 'SEM_TAG'}</span>
          <h3 className="text-[19px] font-black text-white uppercase tracking-tight leading-tight truncate max-w-[200px]">{asset.name}</h3>
        </div>
        <StatusPill status={asset.assetStatus === 'ACTIVE' ? 'paid' : asset.assetStatus === 'CRITICAL' ? 'rejected' : 'pending'} />
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-white/40">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <MapPin size={16} className="text-[#D4AF37]" />
          </div>
          <span className="text-[12px] font-bold truncate uppercase tracking-wide">{asset.location || 'LOCAL_NÃO_MAPEADO'}</span>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-white/20">
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Desde {new Date(asset.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#D4AF37] opacity-40 group-hover:opacity-100 transition-all font-black text-[10px] tracking-widest">
             GERENCIAR <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </button>
  );
};

// --- MOLECULE: AssetDetailPage ---
const AssetDetailPage = ({ asset, onBack, onNavigate }: { asset: Asset, onBack: () => void, onNavigate: (t: string) => void }) => {
  const [history, setHistory] = useState<(AssetExecution & { workOrder?: WorkOrder })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const executions = await db.assetExecutions
          .where('assetId')
          .equals(asset.id)
          .reverse()
          .sortBy('createdAt');
        
        const historyWithWos = await Promise.all(executions.map(async ex => {
          const wo = await db.workOrders.get(ex.workOrderId);
          return { ...ex, workOrder: wo };
        }));

        setHistory(historyWithWos);
      } catch (err) {
        console.error("Erro ao carregar histórico do ativo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [asset.id]);

  const handleOpenOS = async () => {
    try {
      const woId = await operationalFacade.createWorkOrderForAsset(asset.id);
      onNavigate('base');
    } catch (err) {
      console.error("Erro ao criar OS para ativo:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-aferix-bg overflow-y-auto animate-in slide-in-from-right-6 duration-700">
      <div className="relative">
         <button 
           onClick={onBack}
           className="absolute top-16 left-6 z-[1100] w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
         >
           <Navigation size={18} className="-rotate-90" />
         </button>
         <ExecutiveHeader userName="Mateus" score={96} />
      </div>

      <div className="px-6 flex flex-col gap-10 pb-40">
        
        {/* HEADER DO ATIVO */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#47C46A] shadow-[0_0_10px_#47C46A]" />
            <SectionLabel className="ml-1 uppercase tracking-[0.4em] text-white/40">Dossiê Técnico do Ativo</SectionLabel>
          </div>
          <h1 className="text-[42px] font-black text-white uppercase leading-[0.95] tracking-tight">{asset.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusPill status={asset.assetStatus === 'ACTIVE' ? 'paid' : 'pending'} />
            <span className="text-[12px] font-mono font-black text-white/30 uppercase tracking-widest">{asset.tag || 'ID_NÃO_MOLDADO'}</span>
          </div>
        </div>

        <ExecutiveSummaryGrid className="!grid-cols-2">
           <ValueBlock label="FABRICANTE" value={asset.manufacturer || '---'} icon={<Boxes size={12} />} />
           <ValueBlock label="MODELO" value={asset.model || '---'} icon={<Settings size={12} />} />
        </ExecutiveSummaryGrid>

        <SurfaceCard padding="lg" className="border-white/[0.08] bg-white/[0.02]">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <MapPin size={24} />
              </div>
              <div className="flex flex-col">
                 <SectionLabel className="mb-0.5">LOCALIZAÇÃO_FÍSICA</SectionLabel>
                 <Body className="text-[17px] font-black text-white leading-none uppercase">{asset.location || 'Não mapeado'}</Body>
              </div>
           </div>
        </SurfaceCard>

        {/* PRONTUÁRIO TÉCNICO (TIMELINE) */}
        <Section className="gap-8">
          <SectionLabel className="ml-1 text-[11px] font-black tracking-widest text-[#D4AF37]">Histórico de Intervenções</SectionLabel>
          {loading ? (
            <div className="py-12 flex justify-center opacity-20">
              <ERPLoader message="Varrendo histórico..." />
            </div>
          ) : history.length > 0 ? (
            <div className="flex flex-col gap-0 relative">
              {history.map((h, idx) => (
                <TimelineCard 
                  key={h.id}
                  time={new Date(h.createdAt).toLocaleDateString('pt-BR')}
                  title={h.workOrder?.title || 'Serviço Técnico'}
                  status={h.recommendation || 'Concluído'}
                  state={idx === 0 ? 'active' : 'done'}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 border border-dashed border-white/[0.08] rounded-[32px] text-center flex flex-col items-center gap-4 opacity-30">
              <History size={32} />
              <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em]">Célula de Memória Vazia</span>
            </div>
          )}
        </Section>
      </div>

      <div className="fixed bottom-10 left-6 right-6 z-[1100]">
        <button 
          onClick={handleOpenOS}
          className="w-full h-18 bg-[#D4AF37] text-black font-black text-[14px] uppercase tracking-[0.3em] rounded-2xl active:scale-[0.96] transition-all shadow-[0_20px_50px_rgba(212,169,74,0.4)] flex items-center justify-center gap-4"
        >
          <Zap size={22} className="fill-black" /> ABRIR ORDEM DE SERVIÇO
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE: AssetsExperience ---
export const AssetsExperience: React.FC<{ onNavigate: (t: string) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const data = await assetService.getAll();
        setAssets(data);
      } catch (err) {
        console.error("Erro ao carregar ativos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchSearch = (a.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (a.tag || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Todos' || a.category === category || (category === 'Sistema' && a.assetType === 'SYSTEM') || (category === 'Infraestrutura' && a.assetType === 'INFRASTRUCTURE');
      return matchSearch && matchCat;
    });
  }, [search, category, assets]);

  if (loading) {
    return (
      <ScreenContainer className="bg-aferix-bg flex items-center justify-center min-h-screen">
        <ERPLoader message="Rastreando malha de ativos..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-aferix-bg pb-40">
      <ExecutiveHeader userName="Mateus" score={90} />

      <div className="px-6 flex flex-col gap-10">
        
        <Section className="gap-8">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                 <SectionLabel className="ml-1 uppercase tracking-[0.3em] opacity-40 leading-none mb-0">Patrimônio Técnico</SectionLabel>
              </div>
              <h1 className="text-[42px] font-black text-white uppercase tracking-tight leading-none">Equipamentos</h1>
           </div>

           <div className="flex flex-col gap-8">
             <GlassSearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar por TAG ou Ativo..." />
             <AssetCategoryPills selected={category} onSelect={setCategory} />
           </div>
        </Section>

        <div className="flex flex-col gap-4 pb-10">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20 border border-dashed border-white/[0.08] rounded-[32px]">
               <Wrench size={48} />
               <span className="text-[12px] font-mono font-black uppercase tracking-[0.2em]">SISTEMA_LIMPO</span>
            </div>
          )}
        </div>
      </div>

      {selectedAsset && (
        <AssetDetailPage asset={selectedAsset} onBack={() => setSelectedAsset(null)} onNavigate={onNavigate} />
      )}
    </ScreenContainer>
  );
};
