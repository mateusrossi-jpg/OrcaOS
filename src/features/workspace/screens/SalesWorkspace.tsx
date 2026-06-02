import React from 'react';
import { DollarSign, FileText, AlertTriangle, ChevronRight, Inbox } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip, FinancialValue } from '../../../ui/system';

export const SalesWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Pipeline de Receita" />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* METRICS HEADER */}
        <Section className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/30 bg-gradient-to-br from-surface-900 to-surface-800">
              <h3 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Potencial</h3>
              <div className="text-2xl font-black text-white mt-2">R$ 142k</div>
            </SurfaceCard>
            <SurfaceCard padding="lg" className="border-[var(--accent-green)]/30 bg-gradient-to-br from-surface-900 to-surface-800">
              <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Fechada (Mês)</h3>
              <div className="text-2xl font-black text-white mt-2">R$ 84k</div>
            </SurfaceCard>
          </div>
        </Section>

        {/* REVENUE INBOX (ANOMALIAS NÃO ORÇADAS) */}
        <Section className="gap-4">
          <div className="flex justify-between items-end">
            <SectionLabel className="!mb-0 text-status-error flex items-center gap-2">
              <AlertTriangle size={16} /> Dinheiro na Mesa
            </SectionLabel>
            <span className="text-[10px] bg-status-error text-[#050505] font-black px-2 py-0.5 rounded tracking-widest uppercase">4 LEADS</span>
          </div>
          
          <SurfaceCard padding="lg" className="flex flex-col gap-3 border-status-error/40 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
            <div className="flex justify-between items-center pb-3 border-b border-surface-800">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">Vazamento Chiller</span>
                <span className="text-xs text-text-tertiary mt-1">Hospital Santa Casa</span>
              </div>
              <button className="bg-status-error text-[#050505] font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-1">
                ORÇAR <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex justify-between items-center pt-1">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">Placa Queimada</span>
                <span className="text-xs text-text-tertiary mt-1">Edifício JK</span>
              </div>
              <button className="bg-status-error text-[#050505] font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-1">
                ORÇAR <ChevronRight size={14} />
              </button>
            </div>
          </SurfaceCard>
        </Section>

        {/* PROPOSTAS PENDENTES DE APROVAÇÃO */}
        <Section className="gap-4">
          <div className="flex justify-between items-end">
            <SectionLabel className="!mb-0 text-[var(--accent-blue)] flex items-center gap-2">
              <FileText size={16} /> Propostas Pendentes
            </SectionLabel>
            <span className="text-[10px] text-[var(--accent-blue)] font-bold tracking-widest uppercase">R$ 45.200 Aguardando</span>
          </div>

          <div className="flex flex-col gap-4">
            <SurfaceCard padding="lg" className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">PRP-0145</span>
                <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">Clínica Cuidar</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[var(--accent-blue)]">R$ 12.500</span>
                <OpsChip label="Cobrar" tone="orange" className="mt-2" />
              </div>
            </SurfaceCard>
            
            <SurfaceCard padding="lg" className="flex justify-between items-center opacity-70">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">PRP-0144</span>
                <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">Shopping Central</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[var(--accent-blue)]">R$ 32.700</span>
                <OpsChip label="Enviado Hoje" tone="muted" className="mt-2" />
              </div>
            </SurfaceCard>
          </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};
