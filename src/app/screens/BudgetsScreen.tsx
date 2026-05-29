import { useState, useMemo } from 'react';
import { Plus, Terminal, Activity, Filter, ChevronRight, Zap } from "lucide-react";
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import { 
  MoneyValue,
  ERPLoader,
  SearchInput,
  FilterChips,
  StatusPill,
  QueueEmptyState,
  Sparkline
} from '../components/ui';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';
import { cn } from '../../utils/ui';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../ui/runtime';
import { OperationalFlowLayout, SplitMetricLayout } from '../../ui/layouts';
import { Priority } from '../../ui/attention';
import { AppHeader, MetricCard, SectionTitle, SurfaceCard } from '../../ui/primitives';

interface BudgetsScreenProps {
  onSelectBudget: (budget: Budget) => void;
  onNewBudget: () => void;
}

const FILTER_ITEMS = [
  { id: 'all',                         label: 'TODOS'      },
  { id: BUDGET_STATUS.ENVIADO,         label: 'ENVIADOS'   },
  { id: BUDGET_STATUS.AUTORIZADO,      label: 'APROVADOS'  },
  { id: BUDGET_STATUS.EM_EXECUCAO,     label: 'EXECUÇÃO'   },
  { id: BUDGET_STATUS.FINALIZADO,      label: 'FINALIZADOS'},
];

function formatCompactDate(dateStr: string | number | Date): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3).toUpperCase().replace('.', '');
  return `${day}.${month}`;
}

/**
 * BudgetsScreen: Operational Command Center.
 * Mission: Visual Convergence (Linear / Lovable / Command Center style).
 */
export function BudgetsScreen({ onSelectBudget, onNewBudget }: BudgetsScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredBudgets = useMemo(() => {
    let list = budgets || [];
    if (activeFilter !== 'all') {
      list = list.filter(b => b.status === activeFilter);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.clientName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [budgets, search, activeFilter]);

  const stats = useMemo(() => {
    let approvedValue = 0, executionValue = 0;
    const volumes = [5, 8, 4, 10, 12, 7, 15, 9];

    (budgets || []).forEach(b => {
      const totals = calculateBudget(b);
      const val = totals.totalComercial;
      if (b.status === BUDGET_STATUS.AUTORIZADO)      { approvedValue += val; }
      else if (b.status === BUDGET_STATUS.EM_EXECUCAO) { executionValue += val; }
    });

    return { approvedValue, executionValue, volumes };
  }, [budgets]);

  if (isLoading) return <SemanticScreen type="operational"><ERPLoader message="Inicializando Command Center..." /></SemanticScreen>;

  return (
    <SemanticScreen type="operational">
      <OperationalFlowLayout
        header={
          <AppHeader 
            eyebrow="SISTEMA OPERACIONAL"
            title="Fluxo de Trabalho"
            subtitle="Pipeline de autorizações e monitoramento de execuções em tempo real."
            action={
              <button 
                onClick={onNewBudget}
                className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] transition-all active:scale-[0.9] hover:brightness-110"
              >
                <Plus className="h-5 w-5" strokeWidth={3} />
              </button>
            }
          />
        }
      >
        {/* 1. COMMAND CENTER HUD (P1) */}
        <Priority.P1>
          <SurfaceCard className="mb-6 relative overflow-hidden group border-l-4 border-l-[var(--accent-gold)]">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[var(--accent-gold)] tracking-[0.2em] flex items-center gap-2">
                  <Activity className="h-3 w-3 animate-pulse" /> 
                  EM EXECUÇÃO AGORA
                </span>
                <div className="num text-[42px] font-bold text-[var(--text-primary)] tracking-tighter leading-none mt-2">
                  <MoneyValue value={stats.executionValue} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.2em] block mb-2">CAPACIDADE</span>
                <span className="text-h2 font-bold text-[var(--accent-green)]">84%</span>
              </div>
            </div>
            
            {/* HUD Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-5 pointer-events-none">
              <Sparkline data={stats.volumes} stroke="var(--accent-gold)" height={64} />
            </div>
          </SurfaceCard>

          <SplitMetricLayout>
            <MetricCard 
              label="Autorizados" 
              value={<MoneyValue value={stats.approvedValue} compact />} 
            />
            <MetricCard 
              label="Total Ativos" 
              value={filteredBudgets.length} 
              trend={<Zap className="h-4 w-4 text-[var(--accent-gold)] opacity-60" />}
            />
          </SplitMetricLayout>
        </Priority.P1>

        {/* 2. OPERATIONAL FILTERS (P2) */}
        <Priority.P2 className="flex flex-col gap-md">
          <div className="flex items-center gap-md">
            <SearchInput 
              value={search}
              onChange={setSearch}
              placeholder="Localizar projeto..." 
              className="flex-1"
            />
            <button className="h-[56px] w-[56px] grid place-items-center bg-[var(--bg-surface-glass)] border var(--border-soft) rounded-[var(--radius-button)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          
          <FilterChips 
            items={FILTER_ITEMS}
            active={[activeFilter]}
            onChange={(active) => setActiveFilter(active[0] || 'all')}
          />
        </Priority.P2>

        {/* 3. PIPELINE LIST (P2) */}
        <Priority.P2 className="flex flex-col">
          <SectionTitle 
            action={<span className="text-[10px] font-black text-[var(--text-muted)] opacity-30 tracking-widest">SORT: RECENT_ACTIVITY</span>}
          >
            Pipeline de Operações
          </SectionTitle>
          
          <div className="flex flex-col gap-sm pb-40">
            {filteredBudgets.length === 0 ? (
              <QueueEmptyState 
                title="Nenhuma operação encontrada" 
                meta="Refine sua busca ou crie um novo registro no sistema." 
                icon={<Terminal className="h-8 w-8" />}
              />
            ) : (
              filteredBudgets.map((budget, idx) => {
                const totals = calculateBudget(budget);
                const margin = totals.totalComercial > 0 ? (totals.lucroBruto / totals.totalComercial) * 100 : 0;
                
                return (
                  <div 
                    key={budget.id} 
                    className="group flex items-center gap-md p-5 rounded-2xl bg-white/[0.04] border var(--border-subtle) transition-all duration-300 active:scale-[0.98] cursor-pointer hover:bg-white/[0.07] relative overflow-hidden"
                    onClick={() => onSelectBudget(budget)}
                  >
                    {/* Time/Index ID Column */}
                    <div className="w-14 h-14 bg-white/[0.05] rounded-xl flex flex-col items-center justify-center mr-2 shrink-0 border var(--border-subtle) group-hover:bg-[var(--accent-gold)]/10 group-hover:border-[var(--accent-gold)]/20 transition-all">
                      <span className="num text-ui-md font-bold text-white leading-none">{(idx + 1).toString().padStart(2, '0')}</span>
                      <span className="text-[8px] font-black opacity-30 mt-1.5 uppercase tracking-widest group-hover:text-[var(--accent-gold)] group-hover:opacity-60">ID</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate mb-1 group-hover:text-[var(--accent-gold)] transition-colors uppercase tracking-tight">
                        {budget.title || 'PROJETO S/ TÍTULO'}
                      </strong>
                      <div className="flex items-center gap-2 mb-3">
                         <StatusPill status={budget.status} />
                         <span className="text-[10px] font-medium text-[var(--text-secondary)] opacity-40 truncate uppercase tracking-widest">
                           {budget.clientName || 'CLIENTE AVULSO'} · {formatCompactDate(budget.updatedAt || budget.createdAt || Date.now())}
                         </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end gap-1">
                      <div className="num text-ui-md font-bold text-[var(--accent-gold)] tracking-tight">
                        <MoneyValue value={totals.totalComercial} compact />
                      </div>
                      <div className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-md",
                        margin > 40 ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]" : "bg-white/5 text-[var(--text-muted)] opacity-60"
                      )}>
                        {margin.toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="ml-2 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>

                    {/* Subtle activity border line */}
                    {budget.status === BUDGET_STATUS.EM_EXECUCAO && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-gold)] shadow-glow" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Priority.P2>
      </OperationalFlowLayout>
    </SemanticScreen>
  );
}
