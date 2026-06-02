import React from 'react';
import { Activity, Plus, FileText, Download } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip } from "../../../ui/system";

export const DiagnosticsWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Laudos & Evidências" subtitle="Relatórios técnicos em campo" />

      <div className="px-6 py-6 flex flex-col gap-8">
        
        {/* AÇÃO PRINCIPAL */}
        <Section className="gap-2">
          <button className="w-full bg-gradient-to-r from-surface-800 to-surface-900 border border-[var(--accent-gold)]/30 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-surface-800">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
              <Plus size={24} className="text-[var(--accent-gold)]" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black tracking-widest uppercase">Novo Laudo Técnico</span>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Registrar Anomalia ou Serviço</span>
            </div>
          </button>
        </Section>

        {/* LAUDOS RECENTES */}
        <Section className="gap-4">
          <SectionLabel>Últimos Registros</SectionLabel>
          
          <div className="flex flex-col gap-3">
            <SurfaceCard padding="lg" className="border-l-4 border-l-[var(--accent-gold)]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase tracking-widest leading-tight">Vazamento Compressor</span>
                  <span className="text-xs text-[var(--accent-gold)] font-bold">TAG: CH-01</span>
                </div>
                <OpsChip label="Em Análise" tone="orange" />
              </div>
              <div className="text-xs text-white/40 mb-3 line-clamp-2">
                Compressor 1 apresentando ruído anormal e vazamento de óleo no cárter. Equipamento desligado por segurança.
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-surface-800 border border-white/5 text-white flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest py-3 rounded active:scale-95">
                  <FileText size={12} /> Editar
                </button>
                <button className="flex-1 bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest py-3 rounded active:scale-95">
                  <Download size={12} /> PDF
                </button>
              </div>
            </SurfaceCard>

            <SurfaceCard padding="lg" className="border border-white/5 opacity-80">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase tracking-widest leading-tight">Troca de Filtros</span>
                  <span className="text-xs text-white/40 font-bold">Edifício JK</span>
                </div>
                <OpsChip label="Aprovado" tone="success" />
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-surface-800 border border-white/5 text-white flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest py-2 rounded">
                  <FileText size={12} /> Visualizar
                </button>
              </div>
            </SurfaceCard>
          </div>
        </Section>
      </div>
    </ScreenContainer>
  );
};
