import React from 'react';
import { Users, AlertOctagon, Clock, ShieldAlert, Activity } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip } from "../../../ui/system";

export const ManagerWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Central de Operações" />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* METRICAS RAPIDAS */}
        <Section className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/30 bg-gradient-to-br from-surface-900 to-surface-800 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Técnicos em Campo</span>
                <span className="text-2xl font-black text-white mt-1">12/15</span>
              </div>
              <Users size={24} className="text-[var(--accent-blue)] opacity-50" />
            </SurfaceCard>
            
            <SurfaceCard padding="lg" className="border-status-error/30 bg-gradient-to-br from-surface-900 to-status-error/5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-status-error uppercase tracking-widest">SLAs em Risco</span>
                <span className="text-2xl font-black text-white mt-1">3</span>
              </div>
              <Clock size={24} className="text-status-error opacity-50" />
            </SurfaceCard>
          </div>
        </Section>

        {/* URGÊNCIAS E ATRASOS */}
        <Section className="gap-4">
          <div className="flex justify-between items-end">
            <SectionLabel className="!mb-0 text-status-error flex items-center gap-2">
              <AlertOctagon size={16} /> Fogo na Rua
            </SectionLabel>
            <span className="text-[10px] text-status-error font-bold tracking-widest uppercase">Ação Imediata</span>
          </div>
          
          <SurfaceCard padding="lg" className="flex flex-col gap-3 relative overflow-hidden border-status-error/40">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">Equipe Alpha • João</span>
                <span className="text-xs text-text-secondary mt-1">OS #4055 - Parada Total de Chiller</span>
              </div>
              <span className="bg-status-error text-[#050505] font-black text-[10px] px-2 py-1 rounded uppercase tracking-widest">Estourou SLA</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-surface-800 border border-surface-700 text-white font-bold text-[10px] py-3 rounded uppercase tracking-widest hover:bg-surface-700 active:scale-95 transition-all">
                Ligar p/ Técnico
              </button>
              <button className="flex-1 bg-surface-800 border border-surface-700 text-white font-bold text-[10px] py-3 rounded uppercase tracking-widest hover:bg-surface-700 active:scale-95 transition-all">
                Redirecionar Ajuda
              </button>
            </div>
          </SurfaceCard>
        </Section>

        {/* CLIENTES CRÍTICOS */}
        <Section className="gap-4">
          <div className="flex justify-between items-end">
            <SectionLabel className="!mb-0 text-[var(--accent-orange)] flex items-center gap-2">
              <ShieldAlert size={16} /> Clientes Críticos
            </SectionLabel>
          </div>

          <SurfaceCard padding="lg" className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-widest">Hospital São Judas</span>
              <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">3 falhas na mesma máquina</span>
            </div>
            <div className="flex items-center gap-2 bg-status-error/10 px-3 py-1.5 rounded-lg border border-status-error/20">
              <Activity size={14} className="text-status-error" />
              <span className="text-sm font-black text-status-error">32/100</span>
            </div>
          </SurfaceCard>
        </Section>

        {/* DISPATCH BOARD MINI */}
        <Section className="gap-4">
          <SectionLabel>Próximos Despachos</SectionLabel>
          <SurfaceCard padding="lg" className="flex justify-between items-center opacity-70">
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-widest">Shopping Central</span>
              <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">Instalação • 14:00</span>
            </div>
            <OpsChip label="Equipe Beta" tone="blue" />
          </SurfaceCard>
        </Section>

      </div>
    </ScreenContainer>
  );
};
