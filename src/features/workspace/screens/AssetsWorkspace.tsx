import React from 'react';
import { Wrench, Search, Plus, MapPin, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip } from "../../../ui/system";

export const AssetsWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Ativos em Campo" subtitle="Base técnica e QRCode" />

      <div className="px-6 py-6 flex flex-col gap-8">
        
        {/* BUSCA RÁPIDA */}
        <Section className="gap-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar máquina, tag ou local..." 
              className="w-full bg-surface-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 text-white/80 font-bold uppercase tracking-widest text-xs hover:bg-white/10 active:scale-95 transition-all mt-2">
            <QrCode size={16} /> Ler Tag QRCode
          </button>
        </Section>

        {/* ATIVOS DO LOCAL ATUAL (Se estivesse em atendimento) */}
        <Section className="gap-4">
          <SectionLabel>Máquinas no Cliente Atual (Hospital Santa Casa)</SectionLabel>
          
          <div className="flex flex-col gap-3">
            <SurfaceCard padding="lg" className="border-l-4 border-l-[var(--accent-blue)]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-black text-white uppercase tracking-widest">Chiller Carrier 30XW</span>
                <OpsChip label="Ativo" tone="success" />
              </div>
              <div className="text-xs text-white/40 mb-3 flex flex-col gap-1">
                <span>TAG: CH-01</span>
                <span>Local: Casa de Máquinas Térreo</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-surface-800 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded">Histórico</button>
                <button className="flex-1 bg-surface-800 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded">Manual</button>
              </div>
            </SurfaceCard>

            <SurfaceCard padding="lg" className="border-l-4 border-l-[var(--accent-red)]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-black text-white uppercase tracking-widest">Fancoil Trane 10TR</span>
                <OpsChip label="Aviso" tone="orange" />
              </div>
              <div className="text-xs text-white/40 mb-3 flex flex-col gap-1">
                <span>TAG: FC-04</span>
                <span>Local: Centro Cirúrgico Sala 2</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-surface-800 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded">Histórico</button>
                <button className="flex-1 bg-surface-800 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded">Manual</button>
              </div>
            </SurfaceCard>
          </div>
        </Section>
        
        {/* RECENTES */}
        <Section className="gap-4 opacity-50">
          <SectionLabel>Vistos Recentemente</SectionLabel>
          <SurfaceCard padding="md" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
              <Wrench size={16} className="text-white/40" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Split Springer 12k</span>
              <span className="text-[10px] text-white/40">Clínica Cuidar • Visto Ontem</span>
            </div>
          </SurfaceCard>
        </Section>

      </div>
    </ScreenContainer>
  );
};
