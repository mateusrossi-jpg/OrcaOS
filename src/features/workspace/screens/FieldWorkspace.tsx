import React from 'react';
import { Play, Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip } from "../../../ui/system";

export const FieldWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Rota de Hoje" subtitle="3 Serviços Agendados" />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* BOTÃO GIGANTE - THUMB ZONE */}
        <Section className="gap-4">
          <button className="w-full bg-gradient-to-b from-[var(--accent-blue)] to-[#1A6EC1] text-[#050505] rounded-[28px] p-8 shadow-[0_0_30px_rgba(42,139,242,0.3),inset_0_2px_10px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform hover:brightness-110">
            <Play size={40} className="fill-[#050505]" />
            <div className="flex flex-col items-center mt-2">
              <span className="text-xl font-black tracking-[0.1em] uppercase">INICIAR SERVIÇO</span>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Hospital Santa Casa • 09:00</span>
            </div>
          </button>
        </Section>

        {/* AGENDA SCROLL-FIRST */}
        <Section className="gap-4">
          <SectionLabel>Próximos Atendimentos</SectionLabel>
          
          <div className="flex flex-col gap-4">
            <SurfaceCard padding="lg" className="flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-yellow)]"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-black text-white uppercase tracking-widest">Edifício JK</span>
                <span className="text-xs font-bold text-[var(--accent-yellow)] uppercase tracking-widest">14:00</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                <MapPin size={12} /> Vila Olímpia, São Paulo
              </div>
              <div className="mt-2">
                <OpsChip label="PMOC Mensal" tone="muted" />
              </div>
            </SurfaceCard>
            
            <SurfaceCard padding="lg" className="flex flex-col gap-2 relative overflow-hidden opacity-60">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-red)]"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-black text-white uppercase tracking-widest">Clínica Cuidar</span>
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">16:30</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                <MapPin size={12} /> Pinheiros, São Paulo
              </div>
              <div className="mt-2">
                <OpsChip label="Corretiva" tone="orange" />
              </div>
            </SurfaceCard>
          </div>
        </Section>

        {/* SERVIÇOS FINALIZADOS */}
        <Section className="gap-4">
          <SectionLabel>Serviços Finalizados (Hoje)</SectionLabel>
          <div className="bg-[var(--accent-green)]/5 border border-[var(--accent-green)]/20 rounded-[24px] p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-black text-[var(--accent-green)] uppercase tracking-widest">Padaria Pão de Ouro</span>
              <span className="text-[10px] text-[var(--accent-green)]/60 font-bold uppercase tracking-widest mt-1">Concluído às 08:15</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-[var(--accent-green)]" />
            </div>
          </div>
        </Section>
      </div>
    </ScreenContainer>
  );
};
