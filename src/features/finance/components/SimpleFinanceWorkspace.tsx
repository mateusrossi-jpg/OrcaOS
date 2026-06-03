import { useMemo, useState, memo } from 'react';
import { TrendingUp, ChevronDown, Receipt, DollarSign, Activity, FileText, BarChart, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
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
  Value,
  FinancialValue,
  ERPLoader
} from '../../../ui/system';
import { HeroCard } from '../../../components/HeroCard';

interface AdjustmentDraft {
  workOrderId: string;
  receivedAmount: string;
}

/**
 * SimpleFinanceWorkspace: Executive Ledger.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export function SimpleFinanceWorkspace() {
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);
  const [wowCelebration, setWowCelebration] = useState<any | null>(null);

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
    return [...records].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [records]);

  const stats = useMemo(() => {
    const revenue = rows.reduce((acc, r) => acc + safeMoneyValue(r.receivedValue), 0);
    const expected = rows.reduce((acc, r) => acc + safeMoneyValue(r.expectedValue), 0);
    const pending = rows.reduce((acc, r) => acc + (r.status !== 'paid' ? safeMoneyValue(r.openBalance) : 0), 0);
    const countPending = rows.filter(r => r.status !== 'paid').length;
    const margin = expected > 0 ? (revenue / expected) * 100 : 0;
    return { revenue, expected, pending, countPending, margin };
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

  if (records.length === 0 && recordSearch === '') {
     // Optional: show empty state or loader if truly empty vs loading
  }

  const chips = (
    <>
      <OpsChip icon={<BarChart size={11} />} label={`${rows.length} lançamentos`} accent={false} />
      <OpsChip icon={<TrendingUp size={11} />} label={`${stats.margin.toFixed(0)}% realizado`} accent="green" />
      <OpsChip icon={<FileText size={11} />} label="CONSOLIDADO" accent={false} />
    </>
  );

  return (
    <ScreenContainer className="pb-32">
      <div className="flex flex-col">
        
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Financeiro."
          subtitle="Radar Financeiro"
          action={
            <button 
              className="flex items-center h-[42px] gap-2 rounded-[14px] bg-white/[0.04] border border-white/[0.08] px-4 text-[10px] text-[var(--text-secondary)] font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
            >
              {capitalizedMonth.toUpperCase()} <ChevronDown className="h-3 w-3 text-[var(--accent-gold)]" strokeWidth={3} />
            </button>
          }
          chips={chips}
        />

        <div className="px-6 py-8 flex flex-col gap-6">
          
          {/* 1. FINANCIAL HERO */}
          <Section>
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
              {/* Gold ambient radial glow */}
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)]">FLUXO DE CAIXA REALIZADO</span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-[32px] font-black text-white leading-none tracking-tight">{formatCurrencyBRL(stats.revenue)}</h3>
                  <div className="flex items-baseline gap-4">
                    <Stack className="gap-0.5 items-end">
                       <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">Esperado</SectionLabel>
                       <Value className="text-sm font-mono opacity-80">{formatCurrencyBRL(stats.expected)}</Value>
                    </Stack>
                    <div className="h-6 w-px bg-white/10" />
                    <Stack className="gap-0.5 items-end">
                       <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">A Receber</SectionLabel>
                       <Value className="text-sm font-mono text-[var(--accent-red)]">{formatCurrencyBRL(stats.pending)}</Value>
                    </Stack>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 2. REVENUE ALERT HUB */}
          <ExecutiveSummaryGrid>
             <ValueBlock label="A Receber" value={formatCurrencyBRL(stats.pending)} icon={<AlertTriangle size={12} />} variant="danger" />
             <ValueBlock label="Pendências" value={stats.countPending} icon={<Clock size={12} />} variant="warning" />
          </ExecutiveSummaryGrid>

          {/* 3. CONTINUOUS LEDGER */}
          <Section>
            <SearchInput value={recordSearch} onChange={setRecordSearch} placeholder="Pesquisar lançamento..." />
            
            <SurfaceCard padding="none">
               <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px]">
                  <SectionLabel>Histórico de Recebimentos</SectionLabel>
                  <Receipt size={12} className="text-[#3A3A3A]" />
               </div>

               {filteredRows.length === 0 ? (
                 <div className="py-20 text-center opacity-30">
                    <Body className="font-mono text-[10px] font-black tracking-widest uppercase">LIVRO_RAZÃO_LIMPO</Body>
                 </div>
               ) : (
                 <Stack className="gap-0">
                  {filteredRows.map((row, idx) => (
                      <InteractiveRow
                        key={row.id}
                        onClick={() => row.status !== 'paid' && setEditingDraft({ workOrderId: row.id, receivedAmount: String(row.openBalance) })}
                        leftSlot={
                          <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.07] grid place-items-center">
                             {row.status === 'paid' ? <CheckCircle2 size={16} className="text-[var(--accent-green)]" /> : row.title.includes('[RECORRENTE]') ? <Clock size={16} className="text-[var(--accent-gold)]" /> : <DollarSign size={16} className="text-white/40" />}
                          </div>
                        }
                      >
                          <div className="flex items-center gap-4 w-full">
                            <div className="flex-1 min-w-0">
                               <Body className="truncate leading-tight uppercase font-black tracking-tight text-white">
                                  {row.clientName || 'CLIENTE_AVULSO'}
                               </Body>
                               <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">
                                  {row.title.replace('[RECORRENTE]', '').trim()} · {new Date(row.updatedAt).toLocaleDateString('pt-BR')}
                               </Subtitle>
                            </div>
                             <Stack className="items-end gap-1 shrink-0">
                                <FinancialValue 
                                  value={row.status === 'paid' ? row.receivedValue : row.openBalance} 
                                  compact 
                                  className={cn("text-[14px] font-mono font-bold", row.status === 'paid' ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]")} 
                                />
                                <StatusPill status={row.status} className="scale-90 origin-right" />
                             </Stack>
                           </div>
                      </InteractiveRow>
                  ))}
                 </Stack>
               )}
               <div className="h-1" />
            </SurfaceCard>
          </Section>

          <ContextBanner title="Consolidação Ativa" meta="Fluxo financeiro auditado por Event Store imutável." icon={<ShieldCheck size={14} />} />
        </div>
      </div>

      <Modal isOpen={!!editingDraft} title="Registrar Pagamento" confirmLabel="Confirmar" onClose={() => setEditingDraft(null)} onConfirm={saveAdjustment}>
        {editingDraft && (
          <div className="flex flex-col gap-6 py-4 pb-32">
            <MonetaryInput label="Valor Recebido" value={Number(editingDraft.receivedAmount) || 0} onChange={(v) => setEditingDraft(d => d ? {...d, receivedAmount: String(v)} : null)} />
            <ContextBanner title="Integridade" meta="Esta ação atualizará o saldo devedor no CRM." icon={<ShieldCheck size={14} />} />
          </div>
        )}
      </Modal>

      {/* WOW CELEBRATION MODAL */}
      {wowCelebration && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md p-6 animate-fade-in">
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
