import React, { useState } from 'react';
import { DollarSign, FileText, AlertTriangle, ChevronRight, Kanban, FileCheck, ShieldCheck, Inbox } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { BUDGET_STATUS } from '../../../domain/budget';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  OpsChip, 
  Stack, 
  Body,
  FinancialValue,
  ERPLoader,
  Subtitle
} from '../../../ui/system';
import { cn } from '../../../utils/ui';

/**
 * SalesWorkspace: The Commercial Conversion Hub.
 * Connected to Real Data Engine.
 */
export const SalesWorkspace: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'contracts'>('pipeline');

  const stats = useLiveQuery(async () => {
    const [anomalies, budgets, contracts] = await Promise.all([
      db.anomalies.toArray(),
      db.budgets.toArray(),
      db.contracts.toArray()
    ]);

    const leads = anomalies.filter(a => a.status === 'OPEN');
    const openBudgets = budgets.filter(b => [BUDGET_STATUS.INICIADO, BUDGET_STATUS.EM_REVISAO, BUDGET_STATUS.ENVIADO].includes(b.status));
    const wonBudgets = budgets.filter(b => [BUDGET_STATUS.AUTORIZADO, BUDGET_STATUS.EM_EXECUCAO, BUDGET_STATUS.FINALIZADO].includes(b.status));
    
    const potentialRevenue = openBudgets.reduce((acc, b) => acc + (b.chargedValue || 0), 0);
    const closedRevenue = wonBudgets.reduce((acc, b) => acc + (b.chargedValue || 0), 0);
    
    const activeContracts = contracts.filter(c => c.status === 'active');
    const riskyContracts = contracts.filter(c => c.status === 'suspended');

    return {
      potentialRevenue,
      closedRevenue,
      leads,
      pendingProposals: budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO),
      activeContracts,
      riskyContracts,
      totalContractsRevenue: activeContracts.reduce((acc, c) => acc + (c.billingAmount || 0), 0),
      riskyContractsRevenue: riskyContracts.reduce((acc, c) => acc + (c.billingAmount || 0), 0)
    };
  });

  if (!stats) return <div className="flex items-center justify-center h-screen bg-[#050505]"><ERPLoader message="Sincronizando funil comercial..." /></div>;

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
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
            {/* METRICS HEADER */}
            <Section>
              <div className="grid grid-cols-2 gap-4">
                <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/30 bg-gradient-to-br from-surface-900 to-surface-800">
                  <h3 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Potencial</h3>
                  <FinancialValue value={stats.potentialRevenue} className="text-2xl font-black text-white mt-2" />
                </SurfaceCard>
                <SurfaceCard padding="lg" className="border-[var(--accent-green)]/30 bg-gradient-to-br from-surface-900 to-surface-800">
                  <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Fechada</h3>
                  <FinancialValue value={stats.closedRevenue} className="text-2xl font-black text-white mt-2" />
                </SurfaceCard>
              </div>
            </Section>

            {/* REVENUE INBOX (ANOMALIAS NÃO ORÇADAS) */}
            <Section>
              <div className="flex justify-between items-end">
                <SectionLabel className="!mb-0 text-status-error flex items-center gap-2">
                  <AlertTriangle size={16} /> Dinheiro na Mesa
                </SectionLabel>
                <span className="text-[10px] bg-status-error text-[#050505] font-black px-2 py-0.5 rounded tracking-widest uppercase">{stats.leads.length} LEADS</span>
              </div>
              
              {stats.leads.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {stats.leads.slice(0, 3).map(a => (
                    <SurfaceCard key={a.id} padding="lg" className="flex flex-col gap-3 border-status-error/40 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase tracking-widest">{a.title}</span>
                          <span className="text-xs text-text-tertiary mt-1">ID Ativo: {(a.assetId || 'DESC').substring(0, 8)}</span>
                        </div>
                        <button className="bg-status-error text-[#050505] font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-1">
                          ORÇAR <ChevronRight size={14} />
                        </button>
                      </div>
                    </SurfaceCard>
                  ))}
                </div>
              ) : (
                <SurfaceCard padding="xl" className="border-dashed border-white/5 opacity-20 text-center">
                   <Inbox size={32} className="mx-auto mb-4" />
                   <Body className="text-[11px] font-bold uppercase tracking-widest">Sem novas anomalias para orçar</Body>
                </SurfaceCard>
              )}
            </Section>

            {/* PROPOSTAS PENDENTES DE APROVAÇÃO */}
            <Section>
              <div className="flex justify-between items-end">
                <SectionLabel className="!mb-0 text-[var(--accent-blue)] flex items-center gap-2">
                  <FileText size={16} /> Propostas Pendentes
                </SectionLabel>
              </div>

              {stats.pendingProposals.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {stats.pendingProposals.map(p => (
                    <SurfaceCard key={p.id} padding="lg" className="flex justify-between items-center border-white/10">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-widest">{p.title}</span>
                        <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">{p.clientName || 'Cliente N/D'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <FinancialValue value={p.chargedValue} className="text-sm font-black text-[var(--accent-blue)]" />
                        <OpsChip label="Aguardando" tone="orange" className="mt-2" />
                      </div>
                    </SurfaceCard>
                  ))}
                </div>
              ) : (
                <SurfaceCard padding="lg" className="border-dashed border-white/5 opacity-20 text-center">
                   <Body className="text-[10px] font-bold uppercase tracking-widest">Nenhuma proposta em aberto</Body>
                </SurfaceCard>
              )}
            </Section>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
             {/* CONTRATOS VIEW */}
             <Section>
               <div className="grid grid-cols-2 gap-4">
                  <SurfaceCard className="p-4 bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30">
                    <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1">Protegida</h3>
                    <FinancialValue value={stats.totalContractsRevenue} className="text-2xl font-black text-white" />
                    <span className="text-[9px] text-[var(--accent-green)] font-bold block mt-1 uppercase">{stats.activeContracts.length} Ativos</span>
                  </SurfaceCard>

                  <SurfaceCard className="p-4 bg-status-error/10 border border-status-error/30">
                    <h3 className="text-[10px] font-bold text-status-error uppercase tracking-widest mb-1">Em Risco</h3>
                    <FinancialValue value={stats.riskyContractsRevenue} className="text-2xl font-black text-white" />
                    <span className="text-[9px] text-status-error font-bold block mt-1 uppercase">{stats.riskyContracts.length} Críticos</span>
                  </SurfaceCard>
               </div>
             </Section>

             <Section>
                <SectionLabel>Contratos Ativos ({stats.activeContracts.length})</SectionLabel>
                {stats.activeContracts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.activeContracts.map(c => (
                      <SurfaceCard key={c.id} padding="lg" className="bg-surface-900 border-l-4 border-[var(--accent-green)] flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase tracking-widest">{c.title}</span>
                          <p className="text-[11px] text-text-secondary mt-1 uppercase font-bold tracking-tight">
                            {formatCurrencyBRL(c.billingAmount)}/{c.billingFrequency}
                          </p>
                        </div>
                        <OpsChip label="VIGENTE" tone="green" />
                      </SurfaceCard>
                    ))}
                  </div>
                ) : (
                  <SurfaceCard padding="xl" className="border-dashed border-white/5 opacity-20 text-center">
                     <ShieldCheck size={32} className="mx-auto mb-4" />
                     <Body className="text-[11px] font-bold uppercase tracking-widest">Nenhum contrato ativo</Body>
                  </SurfaceCard>
                )}
             </Section>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};

const formatCurrencyBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
