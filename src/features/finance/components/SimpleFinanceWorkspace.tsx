import { useMemo, useState } from 'react';
import { TrendingUp, ChevronDown, Landmark, ShieldCheck, CreditCard, Receipt } from "lucide-react";
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
import { cn } from '../../../utils/ui';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../../ui/runtime';
import { FinancialInsightLayout } from '../../../ui/layouts';
import { Priority } from '../../../ui/attention';
import { AppHeader, SectionTitle, SurfaceCard } from '../../../ui/primitives';

interface AdjustmentDraft {
  budgetId: string;
  receivedAmount: string;
  materialCost: string;
  travelCost: string;
  cardFee: string;
  otherCosts: string;
}

/**
 * SimpleFinanceWorkspace: Executive Ledger.
 * Mission: Executive Composition (Institutional Balance Hero, Continuous Stream).
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
            eyebrow="AUDITORIA_INSTITUCIONAL"
            title="Consolidação"
            subtitle="Auditoria de liquidez e fechamento de resultados operacionais."
            action={
              <button className="flex items-center gap-sm rounded-full border var(--border-soft) bg-[var(--bg-surface-glass)] px-4 py-2 text-ui-xs text-[var(--text-muted)] font-black tracking-widest transition-colors hover:text-[var(--text-primary)]">
                {capitalizedMonth.toUpperCase()} <ChevronDown className="h-3 w-3" strokeWidth={3} />
              </button>
            }
          />
        }
      >
        {/* 1. HERO DOMINANCE: THE BALANCE OBJECT */}
        <Priority.P1>
          <SurfaceCard className="mb-6 bg-gradient-to-br from-white/[0.08] to-transparent relative overflow-hidden group shadow-card border-t-white/10" padding="lg">
            <div className="flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-[var(--accent-gold)]" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.25em] uppercase">SALDO_CONSOLIDADO</span>
                 </div>
                 <ShieldCheck className="h-4 w-4 text-[var(--accent-green)] opacity-50" />
              </div>
              
              <span className="num text-[52px] font-bold text-[var(--text-primary)] leading-none tracking-tighter">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.profit)}
              </span>
              
              <div className="mt-12 flex items-center justify-between border-t var(--border-subtle) pt-10">
                 <div className="grid grid-cols-2 gap-xl w-full">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black text-[var(--text-muted)] tracking-widest uppercase opacity-40">RECEITA_TOTAL</span>
                       <span className="num text-h3 font-bold text-[var(--text-primary)]">
                          <MoneyValue value={stats.revenue} compact />
                       </span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black text-[var(--text-muted)] tracking-widest uppercase opacity-40">MARGEM_REAL</span>
                       <span className="num text-h3 font-bold text-[var(--accent-green)]">
                          {stats.margin.toFixed(0)}%
                       </span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            <CreditCard className="absolute bottom-8 right-8 h-12 w-12 text-white/5 pointer-events-none" />
          </SurfaceCard>
        </Priority.P1>

        {/* 2. LEDGER SEARCH (Reduced card count) */}
        <Priority.P2 className="mb-6">
          <SearchInput 
            value={recordSearch}
            onChange={setRecordSearch}
            placeholder="Pesquisar entrada contábil..." 
          />
        </Priority.P2>

        {/* 3. CONTINUOUS LEDGER SURFACE (Object-first) */}
        <Priority.P2 className="flex flex-col">
          <SectionTitle 
             action={<span className="text-[10px] font-black text-[var(--text-muted)] opacity-30 tracking-widest uppercase">FLOW: SETTLED</span>}
          >
            Linha do Tempo de Liquidações
          </SectionTitle>
          
          <SurfaceCard padding="none" className="overflow-hidden mb-40">
            <div className="flex flex-col">
              {filteredRows.length === 0 ? (
                <div className="py-24">
                  <QueueEmptyState 
                    title="Sem lançamentos liquidados" 
                    meta="As operações finalizadas na aba de fluxo serão listadas aqui."
                    icon={<Landmark className="h-8 w-8" />}
                  />
                </div>
              ) : (
                filteredRows.map((row, idx) => (
                  <div 
                    key={row.budgetId} 
                    className={cn(
                      "group flex items-center gap-md py-6 px-shell transition-all duration-300 hover:bg-white/[0.04] active:scale-[0.99] cursor-pointer",
                      idx !== 0 && "border-t var(--border-subtle)"
                    )}
                    onClick={() => openAdjustment(row)}
                  >
                     <div className="h-10 w-10 rounded-xl bg-white/[0.03] border var(--border-subtle) flex items-center justify-center text-[var(--accent-green)] shrink-0 transition-all group-hover:bg-[var(--accent-green)]/10">
                        <Receipt className="h-4 w-4" />
                     </div>
                     
                     <div className="flex-1 min-w-0 ml-1">
                        <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors tracking-tight uppercase leading-tight mb-1">{row.title}</strong>
                        <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">{row.clientName} · {formatDate(row.updatedAt)}</span>
                     </div>
                     
                     <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                        <div className="num text-ui-md font-bold text-[var(--accent-green)] tracking-tight">
                          +{formatCurrencyBRL(row.netProfit)}
                        </div>
                        <div className="text-[8px] font-black text-[var(--text-muted)] opacity-20 uppercase tracking-widest">LIQUIDADO</div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </SurfaceCard>
        </Priority.P2>

        {/* 4. MODAL & GUIDE */}
        <Modal
          isOpen={!!editingDraft}
          title="Audit Trail Adjustment"
          confirmLabel="Liquidar Ajuste"
          onClose={() => setEditingDraft(null)}
          onConfirm={saveAdjustment}
        >
          {editingDraft && (
            <div className="flex flex-col gap-lg py-4">
              <MonetaryInput label="Receita Bruta Final" value={parseAmount(editingDraft.receivedAmount)} onChange={(v: number) => setEditingDraft(d => d ? {...d, receivedAmount: String(v)} : null)} />
              <div className="grid grid-cols-2 gap-md">
                <MonetaryInput label="Custo Material" value={parseAmount(editingDraft.materialCost)} onChange={(v: number) => setEditingDraft(d => d ? {...d, materialCost: String(v)} : null)} />
                <MonetaryInput label="Custo Logística" value={parseAmount(editingDraft.travelCost)} onChange={(v: number) => setEditingDraft(d => d ? {...d, travelCost: String(v)} : null)} />
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
