import React, { useState } from 'react';
import { DollarSign, FileText, AlertTriangle, ChevronRight, Kanban, FileCheck, ShieldCheck } from 'lucide-react';
import { ScreenContainer, AppHeader, Section, SectionLabel, SurfaceCard, OpsChip, Stack, Body } from '../../../ui/system';
import { cn } from '../../../utils/ui';

/**
 * SalesWorkspace: The Commercial Conversion Hub.
 * Refactored for Commercial Flow Unification (Phase 2).
 */
export const SalesWorkspace: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'contracts'>('pipeline');

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Fluxo Comercial." />

      <div className="px-6 py-4">
        {/* FLOW SWITCHER */}
        <div className="flex gap-8 border-b border-white/[0.05] mb-8">
           <button 
            onClick={() => setActiveSubTab('pipeline')}
            className={cn(
              "pb-4 text-[10px] font-black tracking-[0.2em] transition-all relative",
              activeSubTab === 'pipeline' ? "text-white" : "text-white/20"
            )}
           >
            PIPELINE
            {activeSubTab === 'pipeline' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-blue)]" />}
           </button>
           <button 
            onClick={() => setActiveSubTab('contracts')}
            className={cn(
              "pb-4 text-[10px] font-black tracking-[0.2em] transition-all relative",
              activeSubTab === 'contracts' ? "text-white" : "text-white/20"
            )}
           >
            CONTRATOS
            {activeSubTab === 'contracts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-green)]" />}
           </button>
        </div>

        {activeSubTab === 'pipeline' ? (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2">
            {/* METRICS HEADER */}
            <Section className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/30 bg-gradient-to-br from-surface-900 to-surface-800">
                  <h3 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Potencial</h3>
                  <div className="text-2xl font-black text-white mt-2">R$ 142k</div>
                </SurfaceCard>
                <SurfaceCard padding="lg" className="border-[var(--accent-green)]/30 bg-gradient-to-br from-surface-900 to-surface-800">
                  <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Fechada</h3>
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
              </SurfaceCard>
            </Section>

            {/* PROPOSTAS PENDENTES DE APROVAÇÃO */}
            <Section className="gap-4">
              <div className="flex justify-between items-end">
                <SectionLabel className="!mb-0 text-[var(--accent-blue)] flex items-center gap-2">
                  <FileText size={16} /> Propostas Pendentes
                </SectionLabel>
              </div>

              <div className="flex flex-col gap-4">
                <SurfaceCard padding="lg" className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white uppercase tracking-widest">PRP-0145</span>
                    <span className="text-xs text-text-tertiary mt-1">Clínica Cuidar</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-[var(--accent-blue)]">R$ 12.500</span>
                    <OpsChip label="Cobrar" tone="orange" className="mt-2" />
                  </div>
                </SurfaceCard>
              </div>
            </Section>
          </div>
        ) : (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2">
             {/* CONTRATOS VIEW */}
             <Section className="gap-4">
               <div className="grid grid-cols-2 gap-4">
                  <SurfaceCard className="p-4 bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30">
                    <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1">Protegida</h3>
                    <span className="text-3xl font-black text-white">R$ 142k</span>
                    <span className="text-[9px] text-[var(--accent-green)] font-bold block mt-1 uppercase">112 Ativos</span>
                  </SurfaceCard>

                  <SurfaceCard className="p-4 bg-status-error/10 border border-status-error/30">
                    <h3 className="text-[10px] font-bold text-status-error uppercase tracking-widest mb-1">Em Risco</h3>
                    <span className="text-3xl font-black text-white">R$ 28k</span>
                    <span className="text-[9px] text-status-error font-bold block mt-1 uppercase">4 Críticos</span>
                  </SurfaceCard>
               </div>
             </Section>

             <Section className="gap-4">
                <SectionLabel>Renovações Próximas (90 dias)</SectionLabel>
                <div className="space-y-4">
                  <SurfaceCard padding="lg" className="bg-surface-900 border-l-4 border-[var(--accent-yellow)] flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white uppercase tracking-widest">Hospital São Lucas</span>
                      <p className="text-[11px] text-text-secondary mt-1 uppercase font-bold tracking-tight">R$ 14.500/mês • 45 dias</p>
                    </div>
                    <button className="px-4 py-3 bg-[var(--accent-yellow)] text-black font-black text-[10px] rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)] uppercase tracking-widest active:scale-95 transition-all">
                      RENOVAR
                    </button>
                  </SurfaceCard>
                </div>
             </Section>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
