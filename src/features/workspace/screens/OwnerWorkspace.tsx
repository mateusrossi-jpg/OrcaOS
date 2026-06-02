import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, AlertTriangle, Users, Wrench, FileText } from 'lucide-react';
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
  FinancialValue,
  ExecutiveSummaryGrid,
  ValueBlock,
  ERPLoader,
  Stack,
  Body
} from "../../../ui/system";

/**
 * OwnerWorkspace: Strategic Business Cockpit.
 * Connected to Real Data Engine.
 */
export const OwnerWorkspace: React.FC = () => {
  // 1. DATA AGGREGATIONS
  const stats = useLiveQuery(async () => {
    const [budgets, contracts, finance, wos, clients, assets] = await Promise.all([
      db.budgets.toArray(),
      db.contracts.toArray(),
      db.simpleFinanceRecords.toArray(),
      db.workOrders.toArray(),
      db.clients.count(),
      db.assets.toArray()
    ]);

    const approvedBudgets = budgets.filter(b => 
      [BUDGET_STATUS.AUTORIZADO, BUDGET_STATUS.EM_EXECUCAO, BUDGET_STATUS.FINALIZADO].includes(b.status)
    );
    
    const activeContracts = contracts.filter(c => c.status === 'active');
    
    // Receita Prevista = Orçamentos Aprovados + Contratos Ativos (Valor Mensal)
    const budgetRevenue = approvedBudgets.reduce((acc, b) => acc + (b.chargedValue || 0), 0);
    const monthlyContractRevenue = activeContracts.reduce((acc, c) => acc + (c.billingAmount || 0), 0);
    
    // Financeiro Real
    const totalReceived = finance.reduce((acc, f) => acc + (f.receivedValue || 0), 0);
    const totalToReceive = finance.reduce((acc, f) => acc + (f.openBalance || 0), 0);

    // OS Status
    const openOS = wos.filter(wo => ['open', 'scheduled', 'in-progress', 'draft'].includes(wo.status)).length;
    
    // Assets in Warranty (Mock logic for now as flag might not be consistent)
    const inWarranty = assets.length; // Assume total for the release as they are new

    return {
      previsto: budgetRevenue + monthlyContractRevenue,
      recebido: totalReceived,
      aReceber: totalToReceive,
      osAbertas: openOS,
      clientes: clients,
      ativosGarantia: inWarranty,
      contratos: activeContracts.length
    };
  });

  if (!stats) return <div className="flex items-center justify-center h-screen bg-[#050505]"><ERPLoader message="Calculando pulso real..." /></div>;

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title="Visão Executiva" />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* PERGUNTA 1: Quanto vou faturar? */}
        <Section className="gap-4">
          <SurfaceCard padding="lg" className="border-[var(--accent-green)]/30 bg-gradient-to-br from-[#141924]/95 to-[#080b11]/98 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(42,242,139,0.06)] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[var(--accent-green)]/10 blur-[60px] pointer-events-none" />
            <h2 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-2">
              <DollarSign size={14} /> Faturamento Previsto (Base Atual)
            </h2>
            <div className="flex items-end gap-3 mt-4">
              <FinancialValue value={stats.previsto} className="text-[32px] font-black text-white leading-none tracking-tight" />
              <span className="text-sm font-bold text-[var(--accent-green)] flex items-center pb-1"><TrendingUp size={16}/> Real</span>
            </div>
            <div className="flex gap-6 mt-6 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Recebido</span>
                <FinancialValue value={stats.recebido} className="text-sm font-black text-[var(--accent-green)] mt-1" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">A Receber</span>
                <FinancialValue value={stats.aReceber} className="text-sm font-black text-[var(--accent-gold)] mt-1" />
              </div>
            </div>
          </SurfaceCard>
        </Section>

        {/* ESTRUTURA DE BASE */}
        <Section className="gap-4">
           <SectionLabel>Saúde da Base</SectionLabel>
           <ExecutiveSummaryGrid>
              <ValueBlock label="Clientes" value={stats.clientes.toString()} icon={<Users size={12} />} />
              <ValueBlock label="Contratos" value={stats.contratos.toString()} icon={<FileText size={12} />} variant="success" />
              <ValueBlock label="OS Abertas" value={stats.osAbertas.toString()} icon={<Wrench size={12} />} variant={stats.osAbertas > 5 ? "warning" : "default"} />
              <ValueBlock label="Ativos" value={stats.ativosGarantia.toString()} icon={<ShieldAlert size={12} />} />
           </ExecutiveSummaryGrid>
        </Section>

        {/* PERGUNTA 3: Onde preciso agir? */}
        <Section className="gap-4">
          <SectionLabel>Alertas Críticos</SectionLabel>
          
          <div className="flex flex-col gap-4">
            {stats.aReceber > 0 && (
              <SurfaceCard padding="lg" className="border-status-error/40 bg-gradient-to-br from-surface-900 to-status-error/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={14} className="text-status-error" /> Pendência de Recebimento
                    </span>
                    <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">Existem valores em aberto no financeiro</span>
                  </div>
                  <FinancialValue value={stats.aReceber} className="text-lg font-black text-white" />
                </div>
              </SurfaceCard>
            )}

            {stats.osAbertas > 0 && (
              <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/40 flex justify-between items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)]"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    Operação em Andamento
                  </span>
                  <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase mt-1">{stats.osAbertas} ordens de serviço pendentes de fechamento</span>
                </div>
                <OpsChip label="Monitorar" tone="blue" />
              </SurfaceCard>
            )}
          </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};
