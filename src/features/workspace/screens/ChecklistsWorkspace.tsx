import React from 'react';
import { ClipboardList, Play, CheckCircle2, Clock, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  OpsChip,
  Stack,
  Body,
  Subtitle
} from "../../../ui/system";
import { cn } from '../../../utils/ui';

/**
 * ChecklistsWorkspace: Technical Maintenance Hub (RC15).
 * Aligned with AFERIX HOME & REVENUE visual protocol.
 */
export const ChecklistsWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-aferix-bg animate-in fade-in duration-700 overflow-x-hidden min-h-screen">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/20 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/5 pointer-events-none blur-[100px] z-0" />

      {/* ── CUSTOM AUTHORITATIVE HEADER (REVENUE STYLE) ── */}
      <div className="relative z-10 w-full px-6 pt-12 flex flex-col gap-10 max-w-md mx-auto">
         <div className="flex flex-col gap-1.5 pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 flex-wrap">
               <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
               </span>
               <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full flex items-center gap-2 text-white/50">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Aferix Ops</span>
                  <span className="text-[10px] font-black text-[#D4AF37] font-mono leading-none">PADRONIZADO</span>
               </div>
            </div>
            <h1 className="text-[24px] font-black text-white tracking-tight leading-none mt-1">
               Controle de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Vistorias</span>
            </h1>
         </div>
      </div>

        <div className="px-6 py-8 flex flex-col gap-10 max-w-md mx-auto">
          
          {/* PENDENTES SECTION */}
          <Section className="gap-6">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#FFB340] shadow-[0_0_10px_#FFB340]" />
               <SectionLabel className="!mb-0 uppercase tracking-widest text-[#FFB340]">Vistorias Pendentes</SectionLabel>
            </div>

            <div className="flex flex-col gap-5">
              {/* Card High Fidelity: PMOC */}
              <SurfaceCard padding="none" className="bg-[#15181D]/40 border border-white/[0.08] rounded-[32px] overflow-hidden group active:scale-[0.98] transition-all shadow-2xl">
                 <div className="p-7 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                       <Stack className="gap-2 min-w-0 pr-4">
                          <span className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] opacity-80">PMOC_MENSAL</span>
                          <h2 className="text-[19px] font-black text-white uppercase leading-none tracking-tight truncate">Chiller Edif. Corporate</h2>
                          <Subtitle className="text-[11px] font-bold text-white/40 uppercase tracking-widest mt-1">TAG: CH-01 · Sala Técnica</Subtitle>
                       </Stack>
                       <OpsChip label="ALTA" tone="danger" className="scale-90 origin-right" />
                    </div>

                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 shadow-inner">
                       <Clock size={14} className="text-[#E85D5D]" />
                       <span className="text-[11px] font-black text-white/60 uppercase tracking-[0.1em]">Expira às 17:00 de hoje</span>
                    </div>

                    <button className="w-full h-16 bg-white text-black font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(255,255,255,0.15)] active:scale-[0.95] transition-all cursor-pointer">
                       INICIAR CHECKLIST <ArrowRight size={20} strokeWidth={4} />
                    </button>
                 </div>
              </SurfaceCard>

              {/* Card Low Fidelity: Fancoil */}
              <SurfaceCard padding="none" className="bg-white/[0.01] border border-white/[0.05] rounded-[32px] opacity-40 overflow-hidden">
                 <div className="p-7 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                       <Stack className="gap-1">
                          <h2 className="text-[16px] font-black text-white/60 uppercase tracking-tight">Limpeza Fancoil</h2>
                          <Subtitle className="text-[10px] font-bold text-white/20 uppercase tracking-widest">TAG: FC-04 · Clínica Sul</Subtitle>
                       </Stack>
                       <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Clock size={16} className="text-white/20" />
                       </div>
                    </div>
                 </div>
              </SurfaceCard>
            </div>
          </Section>
          
          {/* RECENTES SECTION */}
          <Section className="gap-6 pt-6 border-t border-white/[0.05]">
            <SectionLabel className="ml-1 uppercase tracking-widest opacity-40">Concluídos Recentemente</SectionLabel>
            
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-sm">
                  <Stack className="gap-1.5">
                    <span className="text-[13px] font-black text-white uppercase tracking-tight leading-none">Inspeção Split AC</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">Finalizado às 10:15</span>
                  </Stack>
                  <div className="w-10 h-10 rounded-full bg-[#47C46A]/10 border border-[#47C46A]/20 flex items-center justify-center text-[#47C46A]">
                     <CheckCircle2 size={20} />
                  </div>
               </div>
            </div>
          </Section>

        </div>
    </ScreenContainer>
  );
};
