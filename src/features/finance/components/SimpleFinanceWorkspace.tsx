import { useMemo, useState, useEffect, memo } from 'react';
import { TrendingUp, ChevronDown, Receipt, DollarSign, Activity, FileText, BarChart, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { 
  MoneyValue, 
  MonetaryInput,
  SearchInput,
  Modal,
  ContextBanner
} from '../../../app/components/ui';

import { SimpleFinanceService } from '../../../services/SimpleFinanceService';
import { SimpleFinanceRecord } from '../../../domain/finance';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { cn } from '../../../utils/ui';
import { operationalFacade } from '../../workflow/operationalFacade';

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
  const [records, setRecords] = useState<SimpleFinanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    const service = new SimpleFinanceService();
    const data = await service.listRecords();
    setRecords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const rows = useMemo(() => {
    return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [records]);

  const stats = useMemo(() => {
    const revenue = rows.reduce((acc, r) => acc + r.receivedValue, 0);
    const expected = rows.reduce((acc, r) => acc + r.expectedValue, 0);
    const pending = rows.reduce((acc, r) => acc + (r.status !== 'paid' ? r.openBalance : 0), 0);
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
    try {
      await operationalFacade.registerPayment(editingDraft.workOrderId, Number(editingDraft.receivedAmount) || 0);
      await fetchRecords();
    } catch (e) { console.error(e); } finally { setEditingDraft(null); }
  }

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Sincronizando caixa..." /></ScreenContainer>;

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
          action={
            <button 
              className="flex items-center h-[42px] gap-2 rounded-[14px] bg-white/[0.04] border border-white/[0.08] px-4 text-[10px] text-[var(--text-secondary)] font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
            >
              {capitalizedMonth.toUpperCase()} <ChevronDown className="h-3 w-3 text-[var(--accent-gold)]" strokeWidth={3} />
            </button>
          }
          chips={chips}
        />

        <div className="px-6 py-8 flex flex-col gap-12">
          
          {/* 1. FINANCIAL HERO */}
          <Section className="gap-4">
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
          <Section className="gap-3">
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

    </ScreenContainer>
  );
}
