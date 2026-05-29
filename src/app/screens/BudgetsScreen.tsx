import { useState, useMemo } from 'react';
import { Plus, Terminal, Activity, ChevronRight, ListFilter } from "lucide-react";
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
import { OperationalFlowLayout } from '../../ui/layouts';
import { Priority } from '../../ui/attention';
import { AppHeader, SurfaceCard } from '../../ui/primitives';

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
 * Mission: Executive Composition (Object-first Pipeline, Single Surface).
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
            eyebrow="SYSTEM_COMMAND"
            title="Pipeline Ativo"
            subtitle="Monitoramento tático de execuções e fluxo de propostas em tempo real."
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
        {/* 1. HERO DOMINANCE: INTEGRATED COMMAND HUD */}
        <Priority.P1>
          <SurfaceCard className="mb-6 relative overflow-hidden group shadow-card border-l-4 border-l-[var(--accent-gold)]" padding="lg">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[var(--accent-gold)] tracking-[0.25em] flex items-center gap-2 mb-2">
                  <Activity className="h-3 w-3 animate-pulse" /> 
                  EXECUÇÃO_PRESENTE
                </span>
                <div className="num text-[48px] font-bold text-[var(--text-primary)] tracking-tighter leading-none">
                  <MoneyValue value={stats.executionValue} />
                </div>
              </div>
              
              {/* Context Beats */}
              <div className="flex flex-col gap-6 items-end">
                 <div className="text-right">
                    <span className="text-[9px] font-black text-[var(--text-muted)] tracking-widest block opacity-40 mb-1">CAPACIDADE</span>
                    <span className="text-h3 font-bold text-[var(--accent-green)]">84%</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-black text-[var(--text-muted)] tracking-widest block opacity-40 mb-1">APROVADOS</span>
                    <span className="text-h3 font-bold text-[var(--text-primary)] tracking-tight">
                       <MoneyValue value={stats.approvedValue} compact />
                    </span>
                 </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-5 pointer-events-none">
              <Sparkline data={stats.volumes} stroke="var(--accent-gold)" height={64} />
            </div>
          </SurfaceCard>
        </Priority.P1>

        {/* 2. OPERATIONAL SEARCH HUD (Reduced card count) */}
        <Priority.P2 className="flex flex-col gap-md">
          <div className="flex items-center gap-md">
            <SearchInput 
              value={search}
              onChange={setSearch}
              placeholder="Localizar operação..." 
              className="flex-1"
            />
            <button className="h-[56px] w-[56px] grid place-items-center bg-[var(--bg-surface-glass)] border var(--border-soft) rounded-[var(--radius-button)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
              <ListFilter className="h-5 w-5" />
            </button>
          </div>
          
          <FilterChips 
            items={FILTER_ITEMS}
            active={[activeFilter]}
            onChange={(active) => setActiveFilter(active[0] || 'all')}
          />
        </Priority.P2>

        {/* 3. CONTINUOUS PIPELINE SURFACE (Object-first) */}
        <Priority.P2 className="flex flex-col">
          <SurfaceCard padding="none" className="overflow-hidden mb-40">
            <div className="flex flex-col">
              {filteredBudgets.length === 0 ? (
                <div className="py-24">
                  <QueueEmptyState 
                    title="Nenhuma operação em tela" 
                    meta="Refine sua busca ou inicie um novo ciclo operacional." 
                    icon={<Terminal className="h-8 w-8" />}
                  />
                </div>
              ) : (
                filteredBudgets.map((budget, idx) => {
                  const totals = calculateBudget(budget);
                  const margin = totals.totalComercial > 0 ? (totals.lucroBruto / totals.totalComercial) * 100 : 0;
                  const isExecuting = budget.status === BUDGET_STATUS.EM_EXECUCAO;

                  return (
                    <div 
                      key={budget.id} 
                      className={cn(
                        "group flex items-center gap-md py-7 px-shell transition-all duration-300 hover:bg-white/[0.04] active:scale-[0.99] cursor-pointer relative",
                        idx !== 0 && "border-t var(--border-subtle)"
                      )}
                      onClick={() => onSelectBudget(budget)}
                    >
                      {/* Active State Indicator */}
                      {isExecuting && (
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-gold)] shadow-glow z-10" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                           <StatusPill status={budget.status} />
                           <span className="text-[10px] font-black text-[var(--text-muted)] opacity-30 tracking-widest">
                              ID_{budget.id.split('-')[0].toUpperCase()}
                           </span>
                        </div>
                        <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors tracking-tight uppercase leading-tight mb-1">
                          {budget.title || 'PROJETO_SEM_TÍTULO'}
                        </strong>
                        <p className="text-[10px] font-medium text-[var(--text-secondary)] opacity-50 truncate uppercase tracking-widest">
                           {budget.clientName || 'CLIENTE_AVULSO'} · {formatCompactDate(budget.updatedAt || budget.createdAt || Date.now())}
                        </p>
                      </div>

                      <div className="shrink-0 text-right flex flex-col items-end gap-1 ml-4">
                        <div className="num text-ui-md font-bold text-[var(--accent-gold)] tracking-tight">
                          <MoneyValue value={totals.totalComercial} compact />
                        </div>
                        <div className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded bg-white/5",
                          margin > 40 ? "text-[var(--accent-green)]" : "text-[var(--text-muted)] opacity-60"
                        )}>
                          {margin.toFixed(0)}%_MARGEM
                        </div>
                      </div>
                      
                      <div className="ml-4 opacity-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SurfaceCard>
        </Priority.P2>
      </OperationalFlowLayout>
    </SemanticScreen>
  );
}
