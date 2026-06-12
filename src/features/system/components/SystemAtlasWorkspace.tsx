import React, { useEffect, useState } from 'react';
import { 
  Map, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Clock, 
  MousePointer2,
  Trash2,
  Search,
  LayoutGrid,
  Eye
} from 'lucide-react';
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Section, 
  Body, 
  Subtitle,
  OpsChip,
  ERPLoader
} from '../../../ui/system';
import { systemAtlasService, AtlasItem } from '../../../services/systemAtlasService';
import { cn } from '../../../utils/ui';

/**
 * SystemAtlasWorkspace: Complete visual map of the Aferix platform.
 * RC13 Implementation for auditing scope and value.
 */
export const SystemAtlasWorkspace: React.FC = () => {
  const [atlas, setAtlas] = useState<Record<string, AtlasItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AtlasItem | null>(null);

  useEffect(() => {
    async function load() {
      const data = await systemAtlasService.getAtlas();
      setAtlas(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Mapeando sistema..." /></ScreenContainer>;

  return (
    <ScreenContainer className="pb-40">
      <AppHeader title="Atlas do Sistema." />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* SUMMARY STATS */}
        <ExecutiveSummaryGrid>
           <ValueBlock label="Módulos" value={Object.keys(atlas).length} icon={<LayoutGrid size={12} />} />
           <ValueBlock label="Telas" value={Object.values(atlas).flat().length} icon={<Eye size={12} />} />
           <ValueBlock label="Auditados" value="100%" icon={<ShieldCheck size={12} />} variant="success" />
        </ExecutiveSummaryGrid>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {Object.entries(atlas).map(([moduleName, items]) => (
             <Section key={moduleName} className="gap-4">
                <SectionLabel className="ml-1 uppercase tracking-[0.2em] opacity-40">{moduleName}</SectionLabel>
                <div className="flex flex-col gap-3">
                   {items.map(item => {
                     const score = systemAtlasService.calculateValueScore(item);
                     const tier = systemAtlasService.getTier(score);
                     
                     return (
                       <button 
                         key={item.id}
                         onClick={() => setSelectedItem(item)}
                         className={cn(
                           "w-full text-left bg-white/[0.02] border p-5 rounded-[22px] flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white/[0.04]",
                           tier === 'S' ? "border-[#D4AF37]/30 bg-[#D4AF37]/[0.02]" : "border-white/10"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs",
                               tier === 'S' ? "bg-[#D4AF37] text-black" : 
                               tier === 'A' ? "bg-[#47C46A]/20 text-[#47C46A]" : "bg-white/5 text-white/40"
                             )}>
                                {tier}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-white uppercase">{item.name}</span>
                                <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">/{item.route}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                             <span className="text-[10px] font-black text-white/40">{item.usageCount} ACESSOS</span>
                             {item.revenueImpact !== 'none' && <OpsChip label={item.revenueImpact.replace('_', ' ')} tone={item.revenueImpact === 'generation' ? 'success' : 'default'} className="scale-75 origin-right" />}
                          </div>
                       </button>
                     );
                   })}
                </div>
             </Section>
           ))}
        </div>

        {/* FEATURE AUDIT OVERLAY */}
        {selectedItem && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full max-w-lg bg-[#15181D] border border-white/10 rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl relative">
                <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                   <X size={24} />
                </button>

                <div className="flex flex-col gap-2">
                   <SectionLabel className="text-[var(--accent-gold)] uppercase tracking-[0.3em]">Auditoria de Recurso</SectionLabel>
                   <h2 className="text-3xl font-black text-white uppercase leading-none">{selectedItem.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <AuditField label="Status" value={selectedItem.status.toUpperCase()} />
                   <AuditField label="Módulo" value={selectedItem.module.toUpperCase()} />
                   <AuditField label="Complexidade UI" value={selectedItem.cognitiveLoad.toUpperCase()} />
                   <AuditField label="Profundidade Cliques" value={selectedItem.navDepth} />
                </div>

                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex flex-col gap-4">
                   <SectionLabel>Avaliação de Valor (ROI)</SectionLabel>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] flex items-center justify-center text-black font-black text-2xl">
                         {systemAtlasService.getTier(systemAtlasService.calculateValueScore(selectedItem))}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-lg font-black text-white">{systemAtlasService.calculateValueScore(selectedItem).toFixed(1)} SCORE</span>
                         <span className="text-[12px] text-white/40">Este recurso é considerado {systemAtlasService.calculateValueScore(selectedItem) > 50 ? 'Estratégico' : 'Utilitário'}.</span>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedItem(null)}
                  className="h-16 w-full bg-white text-black font-black text-[13px] uppercase tracking-widest rounded-2xl"
                >
                   FECHAR AUDITORIA
                </button>
             </div>
          </div>
        )}

      </div>
    </ScreenContainer>
  );
};

const ExecutiveSummaryGrid = ({ children }: any) => <div className="grid grid-cols-3 gap-4">{children}</div>;
const ValueBlock = ({ label, value, icon, variant }: any) => (
  <SurfaceCard padding="md" className={cn("flex flex-col gap-1 items-center text-center", variant === 'success' && "border-[#47C46A]/30 bg-[#47C46A]/[0.02]")}>
     <div className="text-white/20 mb-1">{icon}</div>
     <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label}</span>
     <span className={cn("text-xl font-black text-white", variant === 'success' && "text-[#47C46A]")}>{value}</span>
  </SurfaceCard>
);

const AuditField = ({ label, value }: any) => (
  <div className="flex flex-col gap-1">
     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</span>
     <span className="text-[14px] font-bold text-white uppercase">{value}</span>
  </div>
);

const X = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
