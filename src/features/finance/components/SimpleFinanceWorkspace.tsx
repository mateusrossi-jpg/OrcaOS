import { useMemo, useState, memo } from 'react';
import { TrendingUp, ChevronDown, Receipt, DollarSign, Activity, FileText, BarChart, AlertTriangle, ShieldCheck, Clock, CheckCircle2, PieChart, Info, ArrowUpRight, TrendingDown, Download } from "lucide-react";
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { 
  MoneyValue, 
  MonetaryInput,
  SearchInput,
  Modal,
  ContextBanner
} from '../../../app/components/ui';

import { SimpleFinanceService } from '../../../services/SimpleFinanceService';
import { SimpleFinanceRecord } from '../../../domain/finance';
import { formatCurrencyBRL, safeMoneyValue } from '../../../utils/formatters';
import { cn } from '../../../utils/ui';
import { operationalFacade } from '../../workflow/operationalFacade';
import { BusinessHealthService } from '../../../services/BusinessHealthService';
import { calculateServiceProfit } from '../../../core/finance/serviceProfit';
import { downloadCSV, generateFinanceCSV } from '../../../utils/exportUtils';

// Unified UI Architecture Layers
import { 
  SurfaceCard,
  ScreenContainer,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  StatusPill,
  AppHeader,
  OpsChip,
  Stack,
  Section,
  Subtitle,
  Body,
  Heading,
  Value,
  FinancialValue,
  ERPLoader,
  GlassSearchInput,
  GlassCurrencyInput
} from '../../../ui/system';
import { HeroCard } from '../../../components/HeroCard';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { openWhatsApp } from '../../../utils/mobility';

interface AdjustmentDraft {
  workOrderId: string;
  receivedAmount: string;
}

/**
 * SimpleFinanceWorkspace: Executive Ledger.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 * Feature: Real Profitability vs Cash Flow.
 */
export function SimpleFinanceWorkspace() {
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);
  const [wowCelebration, setWowCelebration] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'cashflow' | 'profit'>('cashflow');

  const handleExportCSV = () => {
    const csv = generateFinanceCSV(records);
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    downloadCSV(`financeiro_${timestamp}.csv`, csv);
  };

  const triggerCelebration = async (type: 'os_completed' | 'payment_received', value: number) => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      const health = await BusinessHealthService.getBusinessHealth();
      
      const prevRecord = Number(localStorage.getItem('aferix_record_monthly_revenue')) || 2000;
      const isRecordBroken = health.revenueThisMonth > prevRecord;
      if (isRecordBroken) {
        localStorage.setItem('aferix_record_monthly_revenue', String(health.revenueThisMonth));
      }
      
      const isGoalAchieved = health.metaAtingidaPercent >= 100;

      setWowCelebration({
        type,
        value,
        monthlyRevenue: health.revenueThisMonth,
        monthlyGoalProgress: health.metaAtingidaPercent,
        dailyRevenue: health.totalReceivedToday,
        isRecordBroken,
        isGoalAchieved
      });
    } catch (e) {
      console.error(e);
    }
  };

  const records = useLiveQuery(() => db.simpleFinanceRecords.toArray()) || [];

  const rows = useMemo(() => {
    const base = [...records].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return base.map(r => {
      const profitData = calculateServiceProfit({
        receivedAmount: r.receivedValue,
        materialCost: r.materialCost || 0,
        travelCost: r.travelCost || 0,
        otherCosts: r.otherCosts || 0,
        cardFee: r.cardFee || 0,
        estimatedTax: r.estimatedTax || 0
      });
      return { ...r, profitData };
    });
  }, [records]);

  const stats = useMemo(() => {
    const revenue = rows.reduce((acc, r) => acc + safeMoneyValue(r.receivedValue), 0);
    const expected = rows.reduce((acc, r) => acc + safeMoneyValue(r.expectedValue), 0);
    const pending = rows.reduce((acc, r) => acc + (r.status !== 'paid' ? safeMoneyValue(r.openBalance) : 0), 0);
    
    // Profit Metrics
    const totalNetProfit = rows.reduce((acc, r) => acc + r.profitData.netProfit, 0);
    const totalCosts = rows.reduce((acc, r) => acc + r.profitData.directCosts + r.profitData.financialCosts, 0);
    const avgMargin = revenue > 0 ? (totalNetProfit / revenue) * 100 : 0;

    const countPending = rows.filter(r => r.status !== 'paid').length;
    const realizedPercent = expected > 0 ? (revenue / expected) * 100 : 0;
    
    return { revenue, expected, pending, countPending, realizedPercent, totalNetProfit, totalCosts, avgMargin };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = recordSearch.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(r => r.title.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q));
  }, [rows, recordSearch]);

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  async function saveAdjustment() {
    if (!editingDraft) return;
    const amount = Number(editingDraft.receivedAmount) || 0;
    try {
      await operationalFacade.registerPayment(editingDraft.workOrderId, amount);
      if (amount > 0) {
        await triggerCelebration('payment_received', amount);
      }
    } catch (e) { console.error(e); } finally { setEditingDraft(null); }
  }

  const chips = (
    <>
      <OpsChip icon={<BarChart size={11} />} label={`${rows.length} lançamentos`} accent={false} />
      <OpsChip 
        icon={viewMode === 'cashflow' ? <TrendingUp size={11} /> : <PieChart size={11} />} 
        label={viewMode === 'cashflow' ? `${stats.realizedPercent.toFixed(0)}% realizado` : `${stats.avgMargin.toFixed(0)}% margem média`} 
        accent={viewMode === 'cashflow' ? 'green' : 'orange'} 
      />
    </>
  );

  return (
    <ScreenContainer className="pb-32 bg-background-primary pt-0 px-0 relative overflow-x-hidden min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col">
        
        {/* ── CUSTOM AUTHORITATIVE HEADER (REVENUE STYLE) ── */}
        <div className="relative z-10 w-full px-6 pt-12 flex flex-col gap-10">
           <div className="flex flex-col gap-1.5 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">
                         {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                      </span>
                      <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full flex items-center gap-2 text-white/50">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Aferix Finance</span>
                         <span className="text-[10px] font-black text-[#47C46A] font-mono leading-none">EQUILIBRADO</span>
                      </div>
                   </div>
                   <h1 className="text-[24px] font-black text-white tracking-tight leading-none mt-1">
                      Controle <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Financeiro</span>
                   </h1>
                </div>
                <button 
                  className="flex items-center h-[42px] gap-2 rounded-[14px] bg-white/[0.04] border border-white/[0.08] px-4 text-[10px] text-[var(--text-secondary)] font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
                >
                  {capitalizedMonth.toUpperCase()} <ChevronDown className="h-3 w-3 text-[var(--accent-gold)]" strokeWidth={3} />
                </button>
              </div>
           </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-6">
          
          {/* VIEW TOGGLE */}
          <div className="flex bg-white/[0.02] border border-white/5 rounded-2xl p-1 gap-1">
             <button 
               onClick={() => setViewMode('cashflow')}
               className={cn(
                 "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 viewMode === 'cashflow' ? "bg-[var(--accent-gold)] text-black shadow-lg" : "text-white/40 hover:text-white/60"
               )}
             >
               Fluxo de Caixa
             </button>
             <button 
               onClick={() => setViewMode('profit')}
               className={cn(
                 "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 viewMode === 'profit' ? "bg-[var(--accent-gold)] text-black shadow-lg" : "text-white/40 hover:text-white/60"
               )}
             >
               Lucro Real
             </button>
          </div>

          {/* 1. FINANCIAL HERO */}
          <Section>
            {viewMode === 'cashflow' ? (
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-aferix-surface to-aferix-bg border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)]">CAIXA REALIZADO (RECEBIMENTOS)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-[32px] font-black text-white leading-none tracking-tight">{formatCurrencyBRL(stats.revenue)}</h3>
                    <div className="flex items-baseline gap-4">
                      <Stack className="gap-0.5 items-end">
                         <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">Esperado</SectionLabel>
                         <Value className="text-sm font-mono opacity-80">{formatCurrencyBRL(stats.expected)}</Value>
                      </Stack>
                      <div className="h-6 w-px bg-white/10" />
                      <Stack className="gap-0.5 items-end">
                         <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">Pendente</SectionLabel>
                         <Value className="text-sm font-mono text-[var(--accent-red)]">{formatCurrencyBRL(stats.pending)}</Value>
                      </Stack>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1a1c1e]/95 to-[#0c0d0e]/98 border border-[var(--accent-green)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(34,197,94,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-green)]/10 blur-[80px] pointer-events-none" />
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-green)] uppercase">Lucro Líquido Real</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-[32px] font-black text-[var(--accent-green)] leading-none tracking-tight">{formatCurrencyBRL(stats.totalNetProfit)}</h3>
                    <div className="flex items-baseline gap-4">
                      <Stack className="gap-0.5 items-end">
                         <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">Despesas</SectionLabel>
                         <Value className="text-sm font-mono opacity-80">{formatCurrencyBRL(stats.totalCosts)}</Value>
                      </Stack>
                      <div className="h-6 w-px bg-white/10" />
                      <Stack className="gap-0.5 items-end">
                         <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">Margem Média</SectionLabel>
                         <Value className="text-sm font-mono text-[var(--accent-gold)]">{stats.avgMargin.toFixed(1)}%</Value>
                      </Stack>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* 2. REVENUE ALERT HUB */}
          <ExecutiveSummaryGrid>
             <ValueBlock label="A Receber" value={formatCurrencyBRL(stats.pending)} icon={<AlertTriangle size={12} />} variant="danger" />
             <ValueBlock label="Pendências" value={stats.countPending} icon={<Clock size={12} />} variant="warning" />
          </ExecutiveSummaryGrid>

          {/* 3. CONTINUOUS LEDGER */}
          <Section>
            <GlassSearchInput value={recordSearch} onChange={(e) => setRecordSearch(e.target.value)} placeholder="Pesquisar lançamento..." />
            
            <SurfaceCard padding="none">
               <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px]">
                  <SectionLabel>{viewMode === 'cashflow' ? 'Resultados de Orçamentos Finalizados' : 'Performance por Serviço'}</SectionLabel>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleExportCSV}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 active:scale-95 transition-all"
                      title="Exportar Planilha"
                    >
                      <Download size={14} />
                    </button>
                    {viewMode === 'cashflow' ? <Receipt size={12} className="text-[#3A3A3A]" /> : <Activity size={12} className="text-[#3A3A3A]" />}
                  </div>
               </div>

               {filteredRows.length === 0 ? (
                 <div className="py-24 text-center flex flex-col items-center gap-6 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/10">
                       <DollarSign size={40} />
                    </div>
                    <div className="flex flex-col gap-2 max-w-[280px]">
                       <Body className="text-[17px] font-black text-white uppercase tracking-tight">Nenhum faturamento registrado.</Body>
                       <Subtitle className="text-[13px] opacity-40">Seu fluxo de caixa aparecerá aqui assim que você concluir serviços.</Subtitle>
                    </div>
                    <button 
                      onClick={() => onNavigate('base')}
                      className="h-14 px-8 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_12px_24px_rgba(255,255,255,0.1)]"
                    >
                       IR PARA EXECUÇÃO
                    </button>
                 </div>
               ) : (
                 <Stack className="gap-0">
                  {filteredRows.map((row, idx) => {
                    const isPositive = row.profitData.netMarginPercent > 30;
                    const isOverdue = row.status !== 'paid' && new Date(row.updatedAt).getTime() < Date.now() - (30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div key={row.id} className="border-b border-white/[0.03] last:border-b-0 group relative">
                        <InteractiveRow
                          onClick={() => row.status !== 'paid' && setEditingDraft({ workOrderId: row.id, receivedAmount: String(row.openBalance) })}
                          leftSlot={
                            <div className={cn(
                              "w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] grid place-items-center transition-all group-active:scale-95",
                              row.status === 'paid' ? "text-[#47C46A] border-[#47C46A]/20 bg-[#47C46A]/5" : 
                              isOverdue ? "text-[#E85D5D] border-[#E85D5D]/20 bg-[#E85D5D]/5" : "text-[#FFB340] border-[#FFB340]/20 bg-[#FFB340]/5"
                            )}>
                               {viewMode === 'profit' ? (
                                 isPositive ? <ArrowUpRight size={18} /> : <TrendingDown size={18} />
                               ) : (
                                 row.status === 'paid' ? <CheckCircle2 size={18} /> : isOverdue ? <AlertTriangle size={18} /> : <Clock size={18} />
                               )}
                            </div>
                          }
                        >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex-1 min-w-0 pr-4">
                                 <Body className="truncate leading-tight uppercase font-black tracking-tight text-white">
                                    {row.clientName || 'CLIENTE_AVULSO'}
                                 </Body>
                                 <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">
                                    {viewMode === 'cashflow' 
                                      ? `${row.title.replace('[RECORRENTE]', '').trim()} · ${new Date(row.updatedAt).toLocaleDateString('pt-BR')}`
                                      : `${row.profitData.netMarginPercent.toFixed(0)}% margem · Custo ${formatCurrencyBRL(row.profitData.directCosts)}`
                                    }
                                 </Subtitle>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                 {row.status !== 'paid' && (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); openWhatsApp(row.phone || '', `Olá! Notamos uma pendência de ${formatCurrencyBRL(row.openBalance)} ref. ao serviço ${row.title}. Podemos ajudar?`); }}
                                     className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                                   >
                                     <Send size={16} />
                                   </button>
                                 )}

                                 <Stack className="items-end gap-0.5 shrink-0">
                                    <FinancialValue 
                                      value={viewMode === 'cashflow' ? (row.status === 'paid' ? row.receivedValue : row.openBalance) : row.profitData.netProfit} 
                                      compact 
                                      className={cn(
                                        "text-[14px] font-mono font-black", 
                                        row.status === 'paid' ? "text-[#47C46A]" : isOverdue ? "text-[#E85D5D]" : "text-[#FFB340]"
                                      )} 
                                    />
                                    <span className={cn(
                                      "text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                                      row.status === 'paid' ? "text-[#47C46A] border-[#47C46A]/20 bg-[#47C46A]/5" : 
                                      isOverdue ? "text-[#E85D5D] border-[#E85D5D]/20 bg-[#E85D5D]/5" : "text-[#FFB340] border-[#FFB340]/20 bg-[#FFB340]/5"
                                    )}>
                                      {row.status === 'paid' ? 'RECEBIDO' : isOverdue ? 'ATRASADO' : 'PENDENTE'}
                                    </span>
                                 </Stack>
                               </div>
                             </div>
                        </InteractiveRow>
                      </div>
                    );
                  })}
                 </Stack>
               )}
               <div className="h-1" />
            </SurfaceCard>
          </Section>

          <ContextBanner title="Inteligência de Lucro" meta="Custos de materiais e deslocamento deduzidos automaticamente." icon={<Info size={14} />} />
        </div>
      </div>

      <Modal isOpen={!!editingDraft} title="Registrar Pagamento" confirmLabel="Confirmar Recebimento" onClose={() => setEditingDraft(null)} onConfirm={saveAdjustment}>
        {editingDraft && (
          <div className="flex flex-col gap-10 py-6 pb-40">
            <GlassCurrencyInput label="VALOR EFETIVAMENTE RECEBIDO" value={Number(editingDraft.receivedAmount) || 0} onChange={(e) => setEditingDraft(d => d ? {...d, receivedAmount: e.target.value} : null)} />
            <ContextBanner title="Integridade Financeira" meta="Esta ação irá liquidar o saldo devedor e atualizar o fluxo de caixa." icon={<ShieldCheck size={14} />} />
          </div>
        )}
      </Modal>

      {/* WOW CELEBRATION MODAL */}
      {wowCelebration && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-aferix-bg/95 backdrop-blur-md p-6 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center mb-8 shadow-[var(--glow-green)] animate-bounce">
            <CheckCircle2 size={48} className="text-[var(--accent-green)]" strokeWidth={3} />
          </div>
          
          <h1 className="text-[28px] font-black text-white tracking-widest text-center uppercase mb-2">
            PAGAMENTO RECEBIDO!
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-widest text-center mb-8">Conquista Registrada com Sucesso</p>
          
          <SurfaceCard padding="lg" className="w-full max-w-sm border border-white/[0.08] mb-10 flex flex-col gap-4">
            {wowCelebration.isGoalAchieved && (
              <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-[var(--accent-gold)]/40 rounded-[14px] p-3.5 text-center shadow-[0_0_15px_rgba(212,169,78,0.15)]">
                <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-gold)] uppercase block">
                  🏆 META MENSAL ATINGIDA! 🏆
                </span>
                <span className="text-[11px] text-white/90 font-semibold mt-1 block">
                  Você completou 100% da sua meta de faturamento!
                </span>
              </div>
            )}

            {wowCelebration.isRecordBroken && (
              <div className="w-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-[var(--accent-green)]/40 rounded-[14px] p-3.5 text-center shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-green)] uppercase block">
                  🚀 NOVO RECORDE DE FATURAMENTO! 🚀
                </span>
                <span className="text-[11px] text-white/90 font-semibold mt-1 block">
                  Este mês é o maior faturamento da história do seu negócio!
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">
                Valor Recebido
              </span>
              <span className="text-[18px] font-mono font-black text-[var(--accent-green)]">
                {formatCurrencyBRL(wowCelebration.value)}
              </span>
            </div>
            
            {wowCelebration.dailyRevenue !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Recebido Hoje</span>
                <span className="text-[15px] font-mono font-bold text-white/90">
                  {formatCurrencyBRL(wowCelebration.dailyRevenue)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Receita do Mês</span>
              <span className="text-[15px] font-mono font-bold text-white/90">
                {formatCurrencyBRL(wowCelebration.monthlyRevenue)}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Meta Atingida</span>
                <span className="text-xs font-mono font-black text-[var(--accent-gold)]">
                  {wowCelebration.monthlyGoalProgress}%
                </span>
              </div>
              <div className="w-full bg-surface-700 h-2 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-[var(--accent-gold)] transition-all duration-700"
                  style={{ width: `${wowCelebration.monthlyGoalProgress}%` }}
                />
              </div>
            </div>
          </SurfaceCard>
          
          <button 
            onClick={() => setWowCelebration(null)}
            className="w-full max-w-sm py-4 rounded-xl bg-[var(--accent-gold)] text-black font-black tracking-widest text-[13px] shadow-[var(--glow-gold)] transition-colors active:scale-95 uppercase"
          >
            CONTINUAR
          </button>
        </div>
      )}

    </ScreenContainer>
  );
}
