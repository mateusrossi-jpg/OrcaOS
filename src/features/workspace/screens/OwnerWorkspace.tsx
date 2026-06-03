import React, { useState } from 'react';
import { DollarSign, ShieldAlert, TrendingUp, AlertTriangle, Users, Wrench, FileText, CheckCircle2, BarChart3, ChevronRight, Zap, Clock, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { BUDGET_STATUS } from '../../../domain/budget';
import { workOrderQueryService } from '../../../services/WorkOrderQueryService';
import { useRole } from '../../../hooks/useRole';
import { formatCurrencyBRL, safeMoneyValue } from '../../../utils/formatters';
import { revenueOpportunityEngine, RevenueOpportunity } from '../../../services/RevenueOpportunityEngine';
import { operationalFacade } from '../../workflow/operationalFacade';
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
  Subtitle,
  Heading
} from "../../../ui/system";
import { cn } from '../../../utils/ui';

interface OwnerWorkspaceProps {
  onNavigate?: (tab: string) => void;
}

/**
 * OwnerWorkspace: Money First Cockpit (V6.8).
 * Transformed from a dashboard to a revenue radar.
 * Authority: RevenueOpportunityEngine.
 */
export const OwnerWorkspace: React.FC<OwnerWorkspaceProps> = ({ onNavigate }) => {
  const { role } = useRole();
  const isSolo = role === 'SOLO';
  const [isReceiving, setIsReceiving] = useState(false);

  const oppData = useLiveQuery(() => revenueOpportunityEngine.getOpportunityProjection(), []);

  if (!oppData) return <div className="flex items-center justify-center h-screen bg-[#050505]"><ERPLoader message="Sincronizando radar de faturamento..." /></div>;

  const handleQuickReceive = async (workOrderId: string, value: number) => {
    setIsReceiving(true);
    try {
      await operationalFacade.registerPayment(workOrderId, value);
      window.dispatchEvent(new CustomEvent('aferix_toast', { 
        detail: { type: 'success', message: 'Pagamento recebido e registrado!' } 
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader title={isSolo ? "Meu Negócio." : "Radar de Receita."} />

      <div className="px-6 py-8 flex flex-col gap-6">
        
        {/* 1. REVENUE HERO (V7 P5: SAÚDE DO NEGÓCIO) */}
        <Section>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#1A1F2B] to-[#0A0C12] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] p-8 animate-scale-pop">
             <div className={cn(
               "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all duration-1000",
               oppData.todayTrend >= 0 ? "bg-[var(--accent-green)]/10" : "bg-status-error/10"
             )} />
             
             <div className="flex flex-col gap-8 relative z-10">
                <div className="flex justify-between items-start">
                   <Stack className="gap-2">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)] animate-pulse" />
                         <span className="text-[10px] font-black font-mono tracking-[0.3em] text-white/40 uppercase">Fluxo de Caixa Hoje</span>
                      </div>
                      <FinancialValue value={oppData.todayRevenue} className="text-[48px] font-black text-white leading-none tracking-tighter" />
                   </Stack>
                   
                   {oppData.todayTrend !== 0 && (
                     <div className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black font-mono border",
                        oppData.todayTrend > 0 ? "bg-[var(--accent-green)]/10 border-[var(--accent-green)]/20 text-[var(--accent-green)]" : "bg-status-error/10 border-status-error/20 text-status-error"
                     )}>
                        {oppData.todayTrend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(oppData.todayTrend)}%
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/[0.05]">
                   <Stack className="gap-1">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">Acumulado Mês</span>
                      <FinancialValue value={oppData.monthlyRevenue} className="text-xl font-black text-white" />
                   </Stack>
                   <Stack className="gap-2 items-end">
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">Meta Mensal</span>
                         <span className="text-[10px] font-bold text-[var(--accent-green)]">{oppData.monthlyGoalPercent}%</span>
                      </div>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]" style={{ width: `${oppData.monthlyGoalPercent}%` }} />
                      </div>
                   </Stack>
                </div>

                {/* HERO ACTION (P5) */}
                <button 
                  onClick={() => onNavigate?.('clients')}
                  className="w-full h-18 bg-[var(--accent-gold)] text-black font-black text-[14px] tracking-[0.25em] shadow-[0_12px_40px_rgba(255,200,0,0.25)] rounded-[20px] active:scale-[0.96] transition-all flex items-center justify-center gap-3 uppercase group"
                >
                  <Zap size={20} className="fill-black group-hover:scale-110 transition-transform" /> GANHAR DINHEIRO
                </button>
             </div>
          </div>
        </Section>

        {/* 2. REVENUE SCORE (P6: EFICIÊNCIA DE FATURAMENTO) */}
        <Section>
           <SurfaceCard padding="lg" className="border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-4">
                 <Stack className="gap-1">
                    <SectionLabel className="!text-[10px] !text-white/60">Revenue Velocity Score</SectionLabel>
                    <Body className="text-[11px] text-white/30 font-medium tracking-tight">Velocidade de entrada de dinheiro no sistema</Body>
                 </Stack>
                 <div className="text-2xl font-black font-mono text-[var(--accent-gold)]">{oppData.revenueVelocityScore}<span className="text-sm opacity-20">/100</span></div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-green)] shadow-[0_0_15px_rgba(212,169,78,0.3)] transition-all duration-1500 ease-out" 
                   style={{ width: `${oppData.revenueVelocityScore}%` }} 
                 />
              </div>
           </SurfaceCard>
        </Section>

        {/* 3. NEXT MONEY (P2) */}
        {oppData.nextReceipt && (
          <Section>
             <SectionLabel>Próximo Recebimento</SectionLabel>
             <SurfaceCard padding="none" className="overflow-hidden border-[var(--accent-green)]/20 bg-[var(--accent-green)]/[0.02]">
                <div className="p-5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 grid place-items-center">
                         <DollarSign size={20} className="text-[var(--accent-green)]" />
                      </div>
                      <Stack className="gap-0.5">
                         <Body className="font-black uppercase text-white tracking-tight">{oppData.nextReceipt.clientName}</Body>
                         <Subtitle className="text-[10px] uppercase font-bold opacity-40">{oppData.nextReceipt.method} · AGUARDANDO</Subtitle>
                      </Stack>
                   </div>
                   <FinancialValue value={oppData.nextReceipt.value} className="text-xl font-black text-white" />
                </div>
                <button 
                  disabled={isReceiving}
                  onClick={() => handleQuickReceive(oppData.nextReceipt!.workOrderId, oppData.nextReceipt!.value)}
                  className="w-full h-14 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] border-t border-white/5 text-[var(--accent-green)] font-black text-[11px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2"
                >
                  {isReceiving ? 'REGISTRANDO...' : 'RECEBER AGORA'} <CheckCircle2 size={14} />
                </button>
             </SurfaceCard>
          </Section>
        )}

        {/* 4. OPPORTUNITY RADAR (P3 & P4) */}
        <Section>
            <div className="flex items-center justify-between px-1">
               <SectionLabel className="!text-[var(--accent-gold)]">Radar de Oportunidades</SectionLabel>
               <OpsChip label="Dinheiro Parado" accent="gold" />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6">
              {oppData.opportunities.map((opp) => (
                <SurfaceCard 
                  key={opp.id} 
                  padding="lg" 
                  className="min-w-[280px] border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex flex-col gap-5 relative overflow-hidden active:border-[var(--accent-gold)]/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <Stack className="gap-1">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{opp.title}</span>
                      <FinancialValue value={opp.monetaryValue} className="text-[28px] font-black text-white leading-none" />
                    </Stack>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 grid place-items-center">
                       {opp.type === 'recoverable' ? <AlertTriangle size={18} className="text-status-error" /> : opp.type === 'sleeping' ? <History size={18} className="text-[var(--accent-gold)]" /> : <FileText size={18} className="text-white/40" />}
                    </div>
                  </div>
                  
                  <Body className="text-[12px] text-white/50 leading-relaxed font-medium">
                    {opp.description} <span className="text-white/80 font-bold">{opp.count} pendências.</span>
                  </Body>

                  <button 
                    onClick={() => {
                      if (opp.actionType === 'COBRAR') onNavigate?.('finance');
                      if (opp.actionType === 'REATIVAR') onNavigate?.('clients');
                      if (opp.actionType === 'NEGOCIAR') onNavigate?.('budgets');
                    }}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.2em] uppercase active:scale-95 transition-all hover:bg-white/10"
                  >
                    {opp.ctaLabel}
                  </button>
                </SurfaceCard>
              ))}

              {/* REVENUE VELOCITY SCORE CARD */}
              <SurfaceCard padding="lg" className="min-w-[280px] border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-center opacity-40">
                 <Target size={32} className="text-white/20" />
                 <Stack className="gap-1">
                    <Body className="text-[11px] font-black uppercase tracking-widest">Score de Receita</Body>
                    <Subtitle className="text-[10px]">Aumente sua velocidade de faturamento para chegar a 100.</Subtitle>
                 </Stack>
              </SurfaceCard>
            </div>
        </Section>

        {/* 5. MONEY FIRST SUMMARY */}
        <Section>
           <SectionLabel>Saúde Financeira</SectionLabel>
           <ExecutiveSummaryGrid>
              <ValueBlock label="A RECEBER" value={formatCurrencyBRL(oppData.recoverableTotal)} variant={oppData.recoverableTotal > 0 ? "danger" : "default"} icon={<DollarSign size={12} />} />
              <ValueBlock label="EM ESPERA" value={formatCurrencyBRL(oppData.waitingTotal)} icon={<Clock size={12} />} variant="warning" />
              <ValueBlock label="DORMENTE" value={formatCurrencyBRL(oppData.sleepingTotal)} icon={<History size={12} />} />
              <ValueBlock label="CLIENTES" value={isSolo ? "MEUS" : "BASE"} icon={<Users size={12} />} />
           </ExecutiveSummaryGrid>
        </Section>

      </div>
    </ScreenContainer>
  );
};
