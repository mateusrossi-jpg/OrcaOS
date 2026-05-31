import { useMemo, useState, useEffect, memo } from 'react';
import { TrendingUp, ChevronDown, Landmark, ShieldCheck, CreditCard, Receipt, DollarSign, AlertCircle, FileSignature, LandmarkIcon, Activity, ChevronRight, Clock, FileText, BarChart } from "lucide-react";
import { 
  MoneyValue, 
  MonetaryInput,
  SearchInput,
  QueueEmptyState,
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
  SemanticBadge,
  AppHeader,
  OpsChip,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Heading,
  Value,
  FinancialValue,
  ERPLoader
} from '../../../ui/system';

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
    const margin = expected > 0 ? (revenue / expected) * 100 : 0;
    return { revenue, expected, pending, margin };
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[124px] scrollbar-none">
        
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Caixa."
          action={
            <button 
              className="flex items-center h-[42px] gap-2 rounded-[14px] bg-white/[0.04] border border-white/[0.08] px-4 text-[10px] text-[var(--text-secondary)] font-black tracking-widest hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
            >
              {capitalizedMonth.toUpperCase()} <ChevronDown className="h-3 w-3 text-[var(--accent-gold)]" strokeWidth={3} />
            </button>
          }
          chips={chips}
        />

        <div className="px-4 flex flex-col gap-8">
          
          {/* 1. FINANCIAL HERO */}
          <Section className="gap-3">
            <SectionLabel className="ml-2">Fluxo de Caixa Realizado</SectionLabel>
            <SurfaceCard variant="cinematic" padding="lg">
               <div className="flex items-center justify-between mb-8">
                  <SectionLabel className="text-[var(--accent-gold)]">Consolidação de Receita</SectionLabel>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                     <Activity size={11} className="text-[var(--accent-green)]" />
                     <Value className="text-[11px]">Realizado</Value>
                  </div>
               </div>
               
               <Heading className="text-[32px] mb-3">
                  {formatCurrencyBRL(stats.revenue)}
               </Heading>
               <Body className="text-[var(--accent-gold)] font-bold tracking-tight">
                  Total Liquidado no Período
               </Body>

               <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-2.5 mt-6">
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[8.5px]">Valor Esperado</SectionLabel>
                     <Value className="text-sm">{formatCurrencyBRL(stats.expected)}</Value>
                  </div>
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[8.5px]">Saldo em Aberto</SectionLabel>
                     <Value className="text-sm text-[var(--accent-red)]">{formatCurrencyBRL(stats.pending)}</Value>
                  </div>
               </div>
            </SurfaceCard>
          </Section>

          {/* 2. REVENUE ALERT HUB */}
          <ExecutiveSummaryGrid>
             <ValueBlock label="Margem" value={`${stats.margin.toFixed(0)}%`} icon={<Activity size={12} />} variant="success" />
             <ValueBlock label="Recorrência" value={rows.filter(r => r.title.includes('[RECORRENTE]')).length} icon={<FileSignature size={12} />} variant="warning" />
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
                        onClick={() => setEditingDraft({ workOrderId: row.workOrderId, receivedAmount: '' })}
                        leftSlot={
                          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center">
                             {row.title.includes('[RECORRENTE]') ? <Clock size={16} className="text-[var(--accent-gold)]" /> : <DollarSign size={16} className="text-white/40" />}
                          </div>
                        }
                      >
                         <div className="flex items-center gap-4 w-full">
                            <div className="flex-1 min-w-0">
                               <Body className="truncate leading-tight uppercase">
                                  {row.title.replace('[RECORRENTE]', '').trim()}
                               </Body>
                               <Subtitle className="text-[11px] truncate opacity-60 mt-0.5 uppercase font-mono tracking-wider">
                                  {row.clientName} · {new Date(row.updatedAt).toLocaleDateString('pt-BR')}
                               </Subtitle>
                            </div>
                            <Stack className="items-end gap-1 shrink-0">
                               <FinancialValue value={row.receivedValue} compact className={cn("text-[13px]", row.status === 'paid' ? "text-[var(--accent-green)]" : "text-white")} />
                               <StatusPill status={row.status} className="scale-75 origin-right" />
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
          <div className="flex flex-col gap-6 py-4">
            <MonetaryInput label="Valor Recebido" value={Number(editingDraft.receivedAmount) || 0} onChange={(v) => setEditingDraft(d => d ? {...d, receivedAmount: String(v)} : null)} />
            <ContextBanner title="Integridade" meta="Esta ação atualizará o saldo devedor no CRM." icon={<ShieldCheck size={14} />} />
          </div>
        )}
      </Modal>

    </ScreenContainer>
  );
}
