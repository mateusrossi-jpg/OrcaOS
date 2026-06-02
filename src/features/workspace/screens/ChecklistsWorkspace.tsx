import React from 'react';
import { ClipboardList, Play, CheckCircle2, Clock } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip } from "../../../ui/system";

export const ChecklistsWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Checklists & PMOC" subtitle="Rotinas de manutenção" />

      <div className="px-6 py-6 flex flex-col gap-8">
        
        {/* PENDENTES */}
        <Section className="gap-4">
          <SectionLabel>Checklists Pendentes Hoje</SectionLabel>
          
          <div className="flex flex-col gap-3">
            <SurfaceCard padding="lg" className="border border-white/5 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)]"></div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase tracking-widest leading-tight">PMOC Mensal Chiller</span>
                  <span className="text-xs text-white/40">TAG: CH-01 • Hospital Santa Casa</span>
                </div>
                <OpsChip label="Alta Pri." tone="orange" />
              </div>
              
              <div className="flex items-center gap-2 text-xs text-white/50 mb-4 font-bold">
                <Clock size={12} /> Prazo: Hoje 17:00
              </div>

              <button className="w-full bg-[var(--accent-blue)] text-[#050505] font-black tracking-widest uppercase text-[10px] py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Play size={12} className="fill-current" /> Iniciar Checklist (12 Itens)
              </button>
            </SurfaceCard>
            
            <SurfaceCard padding="lg" className="border border-white/5 relative overflow-hidden opacity-60">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-yellow)]"></div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase tracking-widest leading-tight">Limpeza Fancoil</span>
                  <span className="text-xs text-white/40">TAG: FC-04 • Clínica Cuidar</span>
                </div>
              </div>
              <button className="w-full bg-white/10 text-white font-black tracking-widest uppercase text-[10px] py-3 rounded-lg flex items-center justify-center gap-2">
                Pendente Deslocamento
              </button>
            </SurfaceCard>
          </div>
        </Section>
        
        {/* RECENTES */}
        <Section className="gap-4">
          <SectionLabel>Concluídos Recentemente</SectionLabel>
          <SurfaceCard padding="md" className="flex items-center justify-between border-l-2 border-status-success/30 bg-status-success/5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Inspeção Visual Split</span>
              <span className="text-[10px] text-white/40">Edifício JK • Finalizado às 10:15</span>
            </div>
            <CheckCircle2 size={16} className="text-status-success" />
          </SurfaceCard>
        </Section>

      </div>
    </ScreenContainer>
  );
};
