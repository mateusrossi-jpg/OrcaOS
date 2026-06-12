import React from 'react';
import { Activity, Plus, FileText, Download, AlertTriangle, CheckCircle2, History, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  OpsChip,
  ERPLoader,
  Body,
  Subtitle,
  Stack
} from "../../../ui/system";

import { trustLayer } from '../../../core/trust/TrustLayer';
import { cn } from '../../../utils/ui';

/**
 * DiagnosticsWorkspace: Technical Intelligence & Evidence Hub.
 * Connected to Real Data Engine. Aligned with AFERIX V5.
 */
export const DiagnosticsWorkspace: React.FC = () => {
  const data = useLiveQuery(async () => {
    const [anomalies, assets, wos] = await Promise.all([
      db.anomalies.toArray(),
      db.assets.toArray(),
      db.workOrders.where('status').equals('done').limit(10).reverse().sortBy('updatedAt')
    ]);

    const openAnomalies = anomalies.filter(a => a.status === 'OPEN');

    return {
      openAnomalies,
      totalAssets: assets.length,
      recentCompletions: wos
    };
  });

  const startNewDiagnostics = () => {
    trustLayer.emit({
      type: 'info',
      title: 'Fluxo em Homologação',
      description: 'O assistente de emissão de laudos está em fase final de testes internos.',
      status: 'local'
    });
  };

  if (!data) return <div className="flex items-center justify-center h-screen bg-aferix-bg"><ERPLoader message="Recuperando laudos reais..." /></div>;

  return (
    <ScreenContainer className="pb-32 bg-aferix-bg animate-in fade-in duration-700 overflow-x-hidden min-h-screen">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/20 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#0A84FF]/5 pointer-events-none blur-[100px] z-0" />

      {/* ── CUSTOM AUTHORITATIVE HEADER (REVENUE STYLE) ── */}
      <div className="relative z-10 w-full px-6 pt-12 flex flex-col gap-10 max-w-md mx-auto">
         <div className="flex flex-col gap-1.5 pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 flex-wrap">
               <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
               </span>
               <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full flex items-center gap-2 text-white/50">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Aferix Intel</span>
                  <span className="text-[10px] font-black text-[#0A84FF] font-mono leading-none">MAPEADO</span>
               </div>
            </div>
            <h1 className="text-[24px] font-black text-white tracking-tight leading-none mt-1">
               Inteligência de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Laudos</span>
            </h1>
         </div>
      </div>

        <div className="px-6 py-8 flex flex-col gap-10 max-w-md mx-auto">
          
          {/* PRIMARY ACTION */}
          <Section className="gap-2">
            <button 
              onClick={() => { if (navigator.vibrate) navigator.vibrate(40); startNewDiagnostics(); }}
              className="w-full relative overflow-hidden bg-[#313842] border border-[var(--accent-gold)]/20 p-8 rounded-[40px] active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-6 shadow-[0_40px_80px_rgba(0,0,0,0.6)] group"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/5 blur-[80px] rounded-full pointer-events-none transition-all group-hover:bg-[var(--accent-gold)]/10" />
               <div className="w-18 h-18 rounded-3xl bg-[var(--accent-gold)] text-black flex items-center justify-center shadow-[0_0_40px_rgba(212,169,74,0.4)] transition-transform group-hover:scale-110">
                  <Plus size={38} strokeWidth={4} />
               </div>
               <div className="flex flex-col items-center gap-2">
                  <span className="text-[20px] font-black tracking-tight text-white uppercase">Novo Laudo</span>
                  <span className="text-[11px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] opacity-60">Registrar Diagnóstico</span>
               </div>
            </button>
          </Section>

          {/* OPEN ANOMALIES */}
          <Section className="gap-6">
            <div className="flex justify-between items-end px-1">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFB340] shadow-[0_0_10px_#FFB340]" />
                  <SectionLabel className="!mb-0 uppercase tracking-widest text-[#FFB340]">Anomalias Críticas</SectionLabel>
               </div>
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{data.openAnomalies.length} EM ABERTO</span>
            </div>

            {data.openAnomalies.length > 0 ? (
              <div className="flex flex-col gap-5">
                {data.openAnomalies.map(a => (
                  <SurfaceCard key={a.id} padding="none" className="bg-[#15181D]/40 border border-[#E85D5D]/20 rounded-[32px] overflow-hidden group active:scale-[0.98] transition-all shadow-2xl">
                     <div className="p-7 flex flex-col gap-5">
                        <div className="flex justify-between items-start">
                           <Stack className="gap-1.5 min-w-0 pr-4">
                              <span className="text-[10px] font-black text-[#E85D5D] uppercase tracking-[0.3em] opacity-80">{a.severity}_SEVERITY</span>
                              <h2 className="text-[18px] font-black text-white uppercase leading-tight tracking-tight truncate">{a.title}</h2>
                           </Stack>
                           <div className="w-9 h-9 rounded-xl bg-[#E85D5D]/10 border border-[#E85D5D]/20 flex items-center justify-center text-[#E85D5D]">
                              <AlertTriangle size={18} className="animate-pulse" />
                           </div>
                        </div>
                        
                        <p className="text-[13px] text-white/50 font-medium leading-relaxed italic line-clamp-2">
                           "{a.description}"
                        </p>

                        <button className="w-full h-14 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-[10px] font-black text-white/60 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white">
                           <FileText size={16} /> REVISAR LAUDO
                        </button>
                     </div>
                  </SurfaceCard>
                ))}
              </div>
            ) : (
              <SurfaceCard padding="xl" className="border-dashed border-white/5 bg-white/[0.01] rounded-[40px] text-center flex flex-col items-center gap-6 opacity-40">
                 <CheckCircle2 size={32} className="text-[#47C46A]" />
                 <Body className="text-[11px] font-black uppercase tracking-widest">Nenhuma anomalia pendente</Body>
              </SurfaceCard>
            )}
          </Section>

          {/* RECENT COMPLETIONS */}
          <Section className="gap-6 pt-6 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 px-1">
               <History size={14} className="text-white/30" />
               <SectionLabel className="!mb-0 uppercase tracking-widest opacity-40">Histórico de Execuções</SectionLabel>
            </div>
            
            <div className="flex flex-col gap-4">
              {data.recentCompletions.length > 0 ? (
                data.recentCompletions.map(os => (
                  <div key={os.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] group active:bg-white/[0.04] transition-all cursor-pointer">
                    <Stack className="gap-1">
                      <span className="text-[13px] font-black text-white uppercase tracking-tight truncate max-w-[200px]">{os.title}</span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{new Date(os.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </Stack>
                    <ChevronRight size={18} className="text-white/10 group-hover:text-white transition-colors" />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center opacity-20">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">MEMÓRIA_VAZIA</span>
                </div>
              )}
            </div>
          </Section>

        </div>
    </ScreenContainer>
  );
};
