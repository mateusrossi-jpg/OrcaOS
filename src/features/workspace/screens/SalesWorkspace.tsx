import React, { useState } from 'react';
import { DollarSign, FileText, AlertTriangle, ChevronRight, Kanban, FileCheck, ShieldCheck, Inbox, BarChart } from 'lucide-react';
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
  Subtitle,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  StatusPill
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

  if (!stats) return <div className="flex items-center justify-center h-screen bg-aferix-bg"><ERPLoader message="Sincronizando funil comercial..." /></div>;

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)] animate-in fade-in duration-500">
      <AppHeader 
        title="Fluxo Comercial." 
        subtitle={activeSubTab === 'pipeline' ? "Gestão de Conversão" : "Gestão de Recorrência"}
        chips={
           <>
            <OpsChip icon={<BarChart size={11} />} label={`${stats.leads.length} Oportunidades`} accent="orange" />
            <OpsChip icon={<FileCheck size={11} />} label={`${stats.activeContracts.length} Contratos`} accent="green" />
           </>
        }
      />

      <div className="px-6 py-4 flex flex-col gap-6">
        {/* VIEW TOGGLE - EXACT FINANCE STYLE */}
        <div className="flex bg-white/[0.02] border border-white/5 rounded-none p-1 gap-1">
             <button 
               onClick={() => setActiveSubTab('pipeline')}
               className={cn(
                 "flex-1 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                 activeSubTab === 'pipeline' ? "bg-[var(--accent-gold)] text-black shadow-lg" : "text-white/40 hover:text-white/60"
               )}
             >
               Pipeline
             </button>
             <button 
               onClick={() => setActiveSubTab('contracts')}
               className={cn(
                 "flex-1 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                 activeSubTab === 'contracts' ? "bg-[var(--accent-gold)] text-black shadow-lg" : "text-white/40 hover:text-white/60"
               )}
             >
               Contratos
             </button>
          </div>

        {activeSubTab === 'pipeline' ? (
          <div className="flex flex-col gap-6 animate-scale-pop">
            {/* 1. PIPELINE HERO */}
            <Section>
               <div className="relative overflow-hidden rounded-none bg-gradient-to-b from-aferix-surface to-aferix-bg border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
                  <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase">Receita em Negociação</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-[32px] font-black text-white leading-none tracking-tight">{formatCurrencyBRL(stats.potentialRevenue)}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] opacity-40 uppercase tracking-widest font-mono">Leads Ativos</span>
                        <span className="text-sm font-mono opacity-80">{stats.leads.length}</span>
                      </div>
                    </div>
                  </div>
               </div>
            </Section>

            {/* 2. REVENUE ALERT HUB */}
            <ExecutiveSummaryGrid>
               <ValueBlock label="Dinheiro na Mesa" value={stats.leads.length} icon={<AlertTriangle size={12} />} variant="danger" />
               <ValueBlock label="Enviadas" value={stats.pendingProposals.length} icon={<FileText size={12} />} variant="warning" />
            </ExecutiveSummaryGrid>

            {/* 3. REVENUE INBOX */}
            <Section>
               <SurfaceCard padding="none">
                  <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px]">
                    <SectionLabel>Revenue Inbox</SectionLabel>
                    <Inbox size={12} className="text-[#3A3A3A]" />
                  </div>

                  <Stack className="gap-0">
                    {stats.leads.length === 0 ? (
                      <div className="py-20 text-center opacity-30">
                        <Body className="font-mono text-[10px] font-black tracking-widest uppercase">PIPELINE_LIMPO</Body>
                      </div>
                    ) : (
                      stats.leads.map(lead => (
                        <InteractiveRow
                          key={lead.id}
                          leftSlot={
                            <div className="w-9 h-9 rounded-none bg-white/[0.03] border border-white/[0.07] grid place-items-center text-status-error">
                               <AlertTriangle size={16} />
                            </div>
                          }
                        >
                           <div className="flex items-center gap-4 w-full">
                            <div className="flex-1 min-w-0">
                               <Body className="truncate leading-tight uppercase font-black tracking-tight text-white">
                                  {lead.title}
                               </Body>
                               <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">
                                  Equipamento: {lead.assetId?.substring(0, 8) || 'Geral'}
                               </Subtitle>
                            </div>
                             <button className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-4 py-2.5 rounded-none uppercase tracking-tight transition-all cursor-pointer">
                                ORÇAR
                             </button>
                           </div>
                        </InteractiveRow>
                      ))
                    )}
                  </Stack>
                  <div className="h-2" />
               </SurfaceCard>
            </Section>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-scale-pop">
             {/* CONTRATOS HERO */}
             <Section>
                <div className="relative overflow-hidden rounded-none bg-gradient-to-b from-[#1a1c1e]/95 to-[#0c0d0e]/98 border border-[var(--accent-green)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(34,197,94,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
                  <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-green)]/10 blur-[80px] pointer-events-none" />
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-green)] uppercase">Receita Recorrente Protegida</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-[32px] font-black text-[var(--accent-green)] leading-none tracking-tight">{formatCurrencyBRL(stats.totalContractsRevenue)}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] opacity-40 uppercase tracking-widest font-mono">Contratos Ativos</span>
                        <span className="text-sm font-mono opacity-80">{stats.activeContracts.length}</span>
                      </div>
                    </div>
                  </div>
               </div>
             </Section>

             <ExecutiveSummaryGrid>
               <ValueBlock label="Vigentes" value={stats.activeContracts.length} icon={<ShieldCheck size={12} />} variant="success" />
               <ValueBlock label="Em Risco" value={stats.riskyContracts.length} icon={<AlertTriangle size={12} />} variant="danger" />
            </ExecutiveSummaryGrid>

             <Section>
                <SurfaceCard padding="none">
                   <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-white/[0.04]">
                      <SectionLabel className="!mb-0">Gestão de Carteira</SectionLabel>
                      <ShieldCheck size={14} className="text-white/20" />
                   </div>

                   <Stack className="gap-0">
                      {stats.activeContracts.length === 0 ? (
                        <div className="py-16 text-center opacity-30">
                           <Body className="text-[10px] font-black uppercase tracking-widest">NENHUM_CONTRATO_ATIVO</Body>
                        </div>
                      ) : (
                        stats.activeContracts.map(c => (
                          <InteractiveRow
                            key={c.id}
                            leftSlot={
                              <div className="w-9 h-9 rounded-none bg-white/[0.03] border border-white/[0.07] grid place-items-center text-[var(--accent-green)]">
                                 <ShieldCheck size={16} />
                              </div>
                            }
                          >
                             <div className="flex items-center gap-4 w-full">
                                <div className="flex-1 min-w-0">
                                   <Body className="truncate leading-tight uppercase font-black tracking-tight text-white">
                                      {c.title}
                                   </Body>
                                   <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">
                                      Ciclo: {c.billingFrequency}
                                   </Subtitle>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                   <span className="text-[14px] font-mono font-bold text-white">{formatCurrencyBRL(c.billingAmount || 0)}</span>
                                   <StatusPill status="paid" label="VIGENTE" className="scale-75 origin-right" />
                                </div>
                             </div>
                          </InteractiveRow>
                        ))
                      )}
                   </Stack>
                   <div className="h-2" />
                </SurfaceCard>
             </Section>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};

const formatCurrencyBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
