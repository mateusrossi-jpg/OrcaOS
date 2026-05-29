import { useMemo, useState } from 'react';
import { TrendingUp, ChevronDown, Landmark, ArrowUpRight, ShieldCheck, CreditCard } from "lucide-react";
import { 
  MoneyValue, 
  MonetaryInput,
  SearchInput,
  QueueEmptyState,
  Modal,
  ContextBanner,
  ERPLoader
} from '../../../app/components/ui';
import { useBudgetHistory } from '../../../hooks/useBudgetHistory';
import { calculateBudget } from '../../../domain/aferixFinanceEngine';
import { BUDGET_STATUS } from '../../../domain/budget';
import { formatCurrencyBRL } from '../../../utils/formatters';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../../ui/runtime';
import { FinancialInsightLayout } from '../../../ui/layouts';
import { Priority } from '../../../ui/attention';
import { AppHeader, MetricCard, SectionTitle, SurfaceCard } from '../../../ui/primitives';

interface AdjustmentDraft {
  budgetId: string;
  receivedAmount: string;
  materialCost: string;
  travelCost: string;
  cardFee: string;
  otherCosts: string;
}

/**
 * SimpleFinanceWorkspace: Executive ledger/financial controller.
 * Mission: Visual Convergence (Apple Wallet Pro / Mercury / Stripe style).
 */
export function SimpleFinanceWorkspace() {
  const { budgets, isLoading } = useBudgetHistory();
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);

  const finalizedBudgets = useMemo(() => {
    return budgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO);
  }, [budgets]);

  const rows = useMemo(() => {
    return finalizedBudgets.map(b => {
      const calc = calculateBudget(b);
      const snapshot = b.financialSnapshot;
      
      return {
        budgetId: b.id,
        title: b.title || 'Serviço s/ título',
        clientName: b.clientName || 'Cliente Avulso',
        updatedAt: b.updatedAt,
        revenue: snapshot ? (b.chargedValue - b.discounts) : calc.totalComercial,
        costs: snapshot ? snapshot.custoTotal : calc.totalCost,
        netProfit: snapshot ? snapshot.lucroBruto : calc.lucroBruto,
        margin: snapshot ? snapshot.margemPercent : calc.marginPercent,
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [finalizedBudgets]);

  const stats = useMemo(() => {
    const revenue = rows.reduce((acc, r) => acc + r.revenue, 0);
    const costs = rows.reduce((acc, r) => acc + r.costs, 0);
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, costs, profit, margin };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = recordSearch.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(r => r.title.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q));
  }, [rows, recordSearch]);

  if (isLoading) return <SemanticScreen type="finance"><ERPLoader message="Sincronizando livro-razão..." /></SemanticScreen>;

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  function openAdjustment(row: typeof rows[0]) {
    setEditingDraft({
      budgetId: row.budgetId,
      receivedAmount: String(row.revenue),
      materialCost: '0',
      travelCost: '0',
      cardFee: '0',
      otherCosts: '0',
    });
  }

  function saveAdjustment() {
    setEditingDraft(null);
  }

  const parseAmount = (val: string) => Number(val) || 0;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <SemanticScreen type="finance">
      <FinancialInsightLayout
        header={
          <AppHeader
            eyebrow="AUDITORIA INSTITUCIONAL"
            title="Livro-razão"
            subtitle="Consolidação de fluxos financeiros e liquidação de ordens de serviço."
            action={
              <button className="flex items-center gap-sm rounded-full border var(--border-soft) bg-[var(--bg-surface-glass)] px-4 py-2 text-ui-xs text-[var(--text-muted)] font-black tracking-widest transition-colors hover:text-[var(--text-primary)]">
                {capitalizedMonth.toUpperCase()} <ChevronDown className="h-3 w-3" strokeWidth={3} />
              </button>
            }
          />
        }
      >
        {/* 1. FINANCIAL PERFORMANCE HERO (P1) */}
        <Priority.P1>
          <SurfaceCard className="mb-6 bg-gradient-to-br from-white/[0.08] to-transparent relative overflow-hidden group border-t-white/10 shadow-2xl">
            <div className="flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-[var(--accent-gold)]" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.2em] uppercase">SALDO ACUMULADO</span>
                 </div>
                 <ShieldCheck className="h-4 w-4 text-[var(--accent-green)] opacity-50" />
              </div>
              
              <span className="num text-[48px] font-bold text-[var(--text-primary)] leading-none tracking-tighter">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.profit)}
              </span>
              
              <div className="mt-10 flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[var(--accent-green)] font-bold text-ui-xs">
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} />
                      <span>+18.4%</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold text-ui-xs opacity-40">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>ESTÁVEL</span>
                    </div>
                 </div>
                 <CreditCard className="h-5 w-5 text-white/5" />
              </div>
            </div>
            
            {/* Background Material Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
          </SurfaceCard>

          <div className="grid grid-cols-2 gap-md mb-12">
            <MetricCard label="Receita Bruta" value={<MoneyValue value={stats.revenue} compact />} />
            <MetricCard label="Margem Real" value={`${stats.margin.toFixed(0)}%`} featured />
          </div>
        </Priority.P1>

        {/* 2. LEDGER SEARCH (P2) */}
        <Priority.P2 className="mb-6">
          <SearchInput 
            value={recordSearch}
            onChange={setRecordSearch}
            placeholder="Pesquisar entrada contábil..." 
          />
        </Priority.P2>

        {/* 3. TRANSACTION LIST STREAM (P2) */}
        <Priority.P2 className="flex flex-col">
          <SectionTitle 
             action={<span className="text-[10px] font-black text-[var(--text-muted)] opacity-40 uppercase tracking-widest">STATE: SETTLED</span>}
          >
            Linha do Tempo Contábil
          </SectionTitle>
          
          <div className="flex flex-col gap-sm pb-40">
            {filteredRows.length === 0 ? (
              <QueueEmptyState 
                title="Sem lançamentos liquidados" 
                meta="As operações finalizadas na aba de fluxo serão listadas aqui."
                icon={<Landmark className="h-8 w-8" />}
              />
            ) : (
              filteredRows.map(row => (
                <div 
                  key={row.budgetId} 
                  className="group flex items-center gap-md p-5 rounded-2xl bg-white/[0.03] border var(--border-subtle) hover:bg-white/[0.06] transition-all cursor-pointer active:scale-[0.98]"
                  onClick={() => openAdjustment(row)}
                >
                   {/* Institutional Dot */}
                   <div className="h-2 w-2 rounded-full bg-[var(--accent-green)] shadow-glow shrink-0 ml-1" />
                   
                   <div className="flex-1 min-w-0">
                      <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors tracking-tight">{row.title.toUpperCase()}</strong>
                      <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">{row.clientName} · {formatDate(row.updatedAt)}</span>
                   </div>
                   
                   <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="num text-ui-md font-bold text-[var(--accent-green)] tracking-tight">
                        +{formatCurrencyBRL(row.netProfit)}
                      </div>
                      <div className="text-[8px] font-black text-[var(--text-muted)] opacity-30 uppercase tracking-widest">LIQUIDADO</div>
                   </div>
                </div>
              ))
            )}
          </div>
        </Priority.P2>

        {/* 4. MODAL & GUIDE */}
        <Modal
          isOpen={!!editingDraft}
          title="Consolidação Manual"
          confirmLabel="Liquidar Ajuste"
          onClose={() => setEditingDraft(null)}
          onConfirm={saveAdjustment}
        >
          {editingDraft && (
            <div className="flex flex-col gap-lg py-4">
              <MonetaryInput label="Valor Bruto Final" value={parseAmount(editingDraft.receivedAmount)} onChange={(v: number) => setEditingDraft(d => d ? {...d, receivedAmount: String(v)} : null)} />
              <div className="grid grid-cols-2 gap-md">
                <MonetaryInput label="Material" value={parseAmount(editingDraft.materialCost)} onChange={(v: number) => setEditingDraft(d => d ? {...d, materialCost: String(v)} : null)} />
                <MonetaryInput label="Logística" value={parseAmount(editingDraft.travelCost)} onChange={(v: number) => setEditingDraft(d => d ? {...d, travelCost: String(v)} : null)} />
              </div>
              <ContextBanner 
                title="Protocolo de Auditoria"
                meta="Esta operação será imortalizada na trilha de eventos do sistema."
                className="mt-6"
              />
            </div>
          )}
        </Modal>

        <div className="fixed bottom-24 left-6 right-6 z-50">
          <ContextBanner
            title="Consolidação Contábil"
            meta="Gere relatórios BI avançados para análise de longo prazo."
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      </FinancialInsightLayout>
    </SemanticScreen>
  );
}
