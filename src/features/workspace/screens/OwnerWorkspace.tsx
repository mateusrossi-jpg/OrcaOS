import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, AlertTriangle, Users, Wrench, FileText, CheckCircle2, BarChart3 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { BUDGET_STATUS } from '../../../domain/budget';
import { useRole } from '../../../hooks/useRole';
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
  Body,
  Subtitle
} from "../../../ui/system";

interface OwnerWorkspaceProps {
  onNavigate?: (tab: string) => void;
}

/**
 * OwnerWorkspace: Strategic Business Cockpit.
 * Connected to Real Data Engine.
 * Fulfills Revenue Visibility Fix (Phase 1).
 */
export const OwnerWorkspace: React.FC<OwnerWorkspaceProps> = ({ onNavigate }) => {
  const { role } = useRole();
  const isSolo = role === 'SOLO';

  // 1. DATA ENGINE INTEGRATION
  const revenueStats = useLiveQuery(async () => {
    const [budgets, contracts, finance, wos, clients] = await Promise.all([
      db.budgets.toArray(),
      db.contracts.where('status').equals('active').toArray(),
      db.simpleFinanceRecords.toArray(),
      db.workOrders.toArray(),
      db.clients.count()
    ]);

    // KPI 1: RECEITA CONTRATADA (Tudo aprovado + contratos)
    const approvedBudgets = budgets.filter(b => 
      [BUDGET_STATUS.AUTORIZADO, BUDGET_STATUS.EM_EXECUCAO, BUDGET_STATUS.FINALIZADO].includes(b.status)
    );
    const budgetRevenue = approvedBudgets.reduce((acc, b) => acc + (b.chargedValue || 0), 0);
    const contractRevenue = contracts.reduce((acc, c) => acc + (c.billingAmount || 0), 0);
    const contractedTotal = budgetRevenue + contractRevenue;

    // KPI 2: RECEITA EM EXECUÇÃO (OS abertas/em progresso)
    const inProgressWOs = wos.filter(wo => ['open', 'scheduled', 'in-progress'].includes(wo.status));
    const executionRevenue = inProgressWOs.reduce((acc, wo) => acc + (wo.executedValue || 0), 0);

    // KPI 3: RECEITA FATURADA (Registros financeiros gerados)
    const invoicedRevenue = finance.reduce((acc, f) => acc + (f.expectedValue || 0), 0);

    // KPI 4: RECEITA RECEBIDA (Status = paid)
    const receivedRevenue = finance.reduce((acc, f) => acc + (f.receivedValue || 0), 0);

    // KPI 5: CONTAS A RECEBER (Status != paid)
    const accountsReceivable = finance.reduce((acc, f) => acc + (f.openBalance || 0), 0);

    return {
      contractedTotal,
      executionRevenue,
      invoicedRevenue,
      receivedRevenue,
      accountsReceivable,
      clientsCount: clients,
      openOS: inProgressWOs.length,
      activeContracts: contracts.length
    };
  }, [role]);

  if (!revenueStats) return <div className="flex items-center justify-center h-screen bg-[#050505]"><ERPLoader message="Sincronizando radar de receita..." /></div>;

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title={isSolo ? "Meu Negócio." : "Visão Executiva."} />

      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* RADAR DE RECEITA (NOVO MODELO EXECUTIVO) */}
        <Section className="gap-4">
          <SectionLabel>Radar de Receita</SectionLabel>
          
          <SurfaceCard padding="none" className="overflow-hidden border-white/5 bg-gradient-to-br from-[#141924]/80 to-transparent">
             <div className="p-6 border-b border-white/5">
                <div className="flex justify-between items-start">
                   <Stack className="gap-1">
                      <SectionLabel className="!text-[var(--accent-gold)]">Receita Contratada (Vendido)</SectionLabel>
                      <FinancialValue value={revenueStats.contractedTotal} className="text-[32px] font-black text-white leading-none tracking-tight" />
                   </Stack>
                   <div className="p-2 bg-[var(--accent-gold)]/10 rounded-xl border border-[var(--accent-gold)]/20">
                      <TrendingUp size={20} className="text-[var(--accent-gold)]" />
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2">
                <div className="p-5 border-r border-white/5">
                   <SectionLabel className="!text-[10px]">Em Execução</SectionLabel>
                   <FinancialValue value={revenueStats.executionRevenue} className="text-lg font-black text-white mt-1" />
                </div>
                <div className="p-5">
                   <SectionLabel className="!text-[10px]">Faturado</SectionLabel>
                   <FinancialValue value={revenueStats.invoicedRevenue} className="text-lg font-black text-white mt-1" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 bg-white/[0.02]">
                <div className="p-5 border-r border-white/5">
                   <SectionLabel className="!text-[10px] !text-[var(--accent-green)]">Recebido</SectionLabel>
                   <FinancialValue value={revenueStats.receivedRevenue} className="text-lg font-black text-[var(--accent-green)] mt-1" />
                </div>
                <div className="p-5">
                   <SectionLabel className="!text-[10px] !text-status-error">A Receber</SectionLabel>
                   <FinancialValue value={revenueStats.accountsReceivable} className="text-lg font-black text-status-error mt-1" />
                </div>
             </div>
          </SurfaceCard>
        </Section>

        {/* ESTRUTURA E SAÚDE */}
        <Section className="gap-4">
           <SectionLabel>{isSolo ? "Minha Produtividade" : "Saúde da Empresa"}</SectionLabel>
           <ExecutiveSummaryGrid>
              <ValueBlock label={isSolo ? "Meus Clientes" : "Clientes"} value={revenueStats.clientsCount.toString()} icon={<Users size={12} />} />
              <ValueBlock label="Contratos" value={revenueStats.activeContracts.toString()} icon={<FileText size={12} />} variant="success" />
              <ValueBlock label="OS Ativas" value={revenueStats.openOS.toString()} icon={<Wrench size={12} />} variant={revenueStats.openOS > 0 ? "warning" : "default"} />
              <ValueBlock label={isSolo ? "Receita/OS" : "Produtividade"} value={revenueStats.openOS > 0 ? formatCurrencyBRL(revenueStats.executionRevenue / revenueStats.openOS) : "R$ 0"} icon={<BarChart3 size={12} />} />
           </ExecutiveSummaryGrid>
        </Section>

        {/* ALERTAS DE AÇÃO */}
        <Section className="gap-4">
          <SectionLabel>Foco de Atenção</SectionLabel>
          
          <div className="flex flex-col gap-4">
            {revenueStats.accountsReceivable > 0 && (
              <SurfaceCard padding="lg" className="border-status-error/30 bg-status-error/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
                <div className="flex justify-between items-center">
                  <Stack className="gap-1">
                    <span className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <AlertTriangle size={14} className="text-status-error" /> Cobrança Pendente
                    </span>
                    <Subtitle className="text-[10px] uppercase font-bold tracking-widest opacity-60">Existem valores faturados em atraso</Subtitle>
                  </Stack>
                  <FinancialValue value={revenueStats.accountsReceivable} className="text-xl font-black text-white" />
                </div>
              </SurfaceCard>
            )}

            {revenueStats.openOS > 5 && !isSolo && (
              <SurfaceCard padding="lg" className="border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)]"></div>
                <div className="flex justify-between items-center">
                   <Stack className="gap-1">
                      <span className="text-sm font-black text-white uppercase tracking-tight">Sobrecarga Técnica</span>
                      <Subtitle className="text-[10px] uppercase font-bold tracking-widest opacity-60">{revenueStats.openOS} ordens de serviço em aberto</Subtitle>
                   </Stack>
                   <OpsChip label="Ação" tone="blue" />
                </div>
              </SurfaceCard>
            )}
            
            {revenueStats.contractedTotal === 0 && (
              <SurfaceCard padding="xl" className="border-dashed border-white/5 opacity-30 text-center">
                 <CheckCircle2 size={32} className="mx-auto mb-4" />
                 <Body className="text-[11px] font-bold uppercase tracking-widest">Nenhuma venda detectada</Body>
              </SurfaceCard>
            )}
          </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};

const formatCurrencyBRL = (val: number) => new Intl.NumberFormat('pt-BR', { 
  style: 'currency', 
  currency: 'BRL',
  maximumFractionDigits: 0
}).format(val);
