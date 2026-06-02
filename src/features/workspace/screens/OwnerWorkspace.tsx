import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip, FinancialValue } from "../../../ui/system";

export const OwnerWorkspace: React.FC = () => {
  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Visão Executiva" />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* PERGUNTA 1: Quanto vou faturar? */}
        <Section className="gap-4">
          <SurfaceCard padding="lg" className="border-[var(--accent-green)]/30 bg-gradient-to-br from-[#141924]/95 to-[#080b11]/98 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(42,242,139,0.06)] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[var(--accent-green)]/10 blur-[60px] pointer-events-none" />
            <h2 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-2">
              <DollarSign size={14} /> Faturamento Previsto (Mês)
            </h2>
            <div className="flex items-end gap-3 mt-4">
              <div className="text-[32px] font-black text-white leading-none tracking-tight">R$ 284.500</div>
              <span className="text-sm font-bold text-[var(--accent-green)] flex items-center pb-1"><TrendingUp size={16}/> +12%</span>
            </div>
            <div className="flex gap-6 mt-6 pt-4 border-t border-[var(--accent-green)]/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--accent-green)]/60 uppercase font-bold tracking-widest">Contratos</span>
                <span className="text-sm font-black text-white mt-1">R$ 180k</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--accent-green)]/60 uppercase font-bold tracking-widest">Corretivas</span>
                <span className="text-sm font-black text-white mt-1">R$ 104.5k</span>
              </div>
            </div>
          </SurfaceCard>
        </Section>

        {/* PERGUNTA 2: Quanto está em risco? */}
        <Section className="gap-4">
          <SurfaceCard padding="lg" className="border-status-error/40 bg-gradient-to-br from-surface-900 to-status-error/5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
            <h2 className="text-[10px] font-bold text-status-error uppercase tracking-widest flex items-center gap-2 mb-2">
              <ShieldAlert size={14} /> MRR em Risco (Churn Alert)
            </h2>
            <div className="text-2xl font-black text-white mt-2">R$ 22.400</div>
            <p className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-2">2 Clientes críticos (Hospital Santa Casa, Clínica Viver)</p>
          </SurfaceCard>
        </Section>

        {/* PERGUNTA 3: Onde preciso agir? */}
        <Section className="gap-4">
          <SectionLabel>Onde agir hoje?</SectionLabel>
          
          <div className="flex flex-col gap-4">
            {/* Aprovação Alta Diretoria */}
            <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/40 flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)]"></div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  Proposta VIP Pendente
                </span>
                <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">Aprovar desconto comercial de 15%</span>
              </div>
              <button className="bg-[var(--accent-blue)] text-[#050505] font-black text-[10px] px-4 py-3 rounded uppercase tracking-widest active:scale-95 transition-transform">
                Analisar
              </button>
            </SurfaceCard>

            {/* Alerta de Estoque */}
            <SurfaceCard padding="lg" className="border-status-warning/40 flex justify-between items-center relative overflow-hidden opacity-80">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-warning"></div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} className="text-status-warning" /> Capital Imobilizado Alto
                </span>
                <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">R$ 85k parados no estoque há 90 dias</span>
              </div>
              <button className="bg-surface-800 border border-surface-700 text-white font-black text-[10px] px-4 py-3 rounded uppercase tracking-widest hover:bg-surface-700 active:scale-95 transition-all">
                Ver
              </button>
            </SurfaceCard>
          </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};
