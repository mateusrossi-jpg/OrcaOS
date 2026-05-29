import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin, CalendarDays } from "lucide-react";
import { useBudgetHistory } from '../hooks/useBudgetHistory';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import {
  MoneyValue,
  QueueEmptyState,
  StatusPill,
  ERPLoader
} from '../app/components/ui';
import { cn } from '../utils/ui';

// Unified UI Architecture Layers
import { SemanticScreen } from '../ui/runtime';
import { TimelineLayout } from '../ui/layouts';
import { Priority } from '../ui/attention';
import { AppHeader, FloatingActionButton, SurfaceCard } from '../ui/primitives';

interface BudgetHistoryPageProps {
  onOpenBudget: (id: string) => void;
  onNewBudget: () => void;
}

const week = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

// Generate 14 days centered around today
const calendarDays = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 3 + i);
  return date;
});

/**
 * BudgetHistoryPage: Professional Agenda.
 * Mission: Executive Composition (Integrated Temporal Navigation, Single Timeline Surface).
 */
export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = ({ onOpenBudget, onNewBudget }) => {
  const { budgets, isLoading } = useBudgetHistory();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [query, _setQuery] = useState('');

  const filteredBudgets = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return budgets;
    return budgets.filter(b => 
      (b.title?.toLowerCase() || '').includes(normalized) || 
      (b.clientName?.toLowerCase() || '').includes(normalized)
    );
  }, [budgets, query]);

  if (isLoading) return <SemanticScreen type="timeline"><ERPLoader message="Sincronizando Cronograma..." /></SemanticScreen>;

  return (
    <SemanticScreen type="timeline">
      <TimelineLayout
        header={
          <div className="flex flex-col gap-lg">
            <AppHeader
              eyebrow="FLUXO_TEMPORAL"
              title="Sua Agenda"
              subtitle="Gerenciamento de janelas técnicas e compromissos operacionais."
              action={
                 <div className="h-12 w-12 grid place-items-center bg-[var(--bg-surface-glass)] border var(--border-soft) rounded-full text-[var(--accent-gold)] shadow-inner">
                    <CalendarDays className="h-5 w-5" />
                 </div>
              }
            />
            
            {/* Integrated Navigation Object (P1) */}
            <Priority.P1 className="mb-4 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-md min-w-max px-2 py-2">
                {calendarDays.map((d) => {
                  const active = d.getDate() === selectedDate;
                  const hasJobs = budgets.some(b => new Date(b.updatedAt).toDateString() === d.toDateString());
                  const isToday = d.toDateString() === new Date().toDateString();
                  
                  return (
                    <button
                      key={d.getTime()}
                      onClick={() => setSelectedDate(d.getDate())}
                      className={cn(
                        "flex flex-col items-center justify-center transition-all duration-500 cursor-pointer border relative overflow-hidden",
                        "w-[68px] h-[96px] rounded-2xl",
                        active 
                          ? "bg-[var(--accent-gold)] text-black border-transparent shadow-card scale-[1.1] z-10" 
                          : "bg-white/[0.04] border-[var(--border-soft)] hover:bg-white/[0.08] shadow-soft",
                        isToday && !active && "ring-1 ring-[var(--accent-gold)]/30 border-[var(--accent-gold)]/20"
                      )}
                    >
                      {active && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />}
                      <span className={cn("text-[10px] font-black tracking-widest mb-2 relative z-10", active ? "text-black/60" : "text-[var(--text-muted)]")}>
                        {week[d.getDay()]}
                      </span>
                      <span className={cn("text-h2 font-bold num leading-none relative z-10", active ? "text-black" : "text-[var(--text-primary)]")}>
                        {d.getDate()}
                      </span>
                      {hasJobs && (
                        <span className={cn("mt-3 h-1.5 w-1.5 rounded-full relative z-10", active ? "bg-black" : "bg-[var(--accent-gold)]")} />
                      )}
                    </button>
                  );
                })}
              </div>
            </Priority.P1>
          </div>
        }
      >
        {/* 2. CONTINUOUS TIMELINE (Object-first) */}
        <Priority.P2 className="flex flex-col gap-lg">
          <div className="mb-4 -ml-8 pl-8 flex items-end justify-between">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                  <h2 className="text-h3 font-bold text-[var(--text-primary)] tracking-tight">
                    {new Date(new Date().setDate(selectedDate)).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                  </h2>
               </div>
               <p className="text-[10px] text-[var(--text-muted)] font-black tracking-[0.2em]">{filteredBudgets.length} ATENDIMENTOS_MAPEADOS</p>
            </div>
          </div>

          <SurfaceCard padding="none" className="overflow-hidden mb-40">
            <div className="flex flex-col">
              {filteredBudgets.length === 0 ? (
                <div className="py-24 px-shell">
                  <QueueEmptyState 
                    title="Horário Disponível" 
                    meta="Nenhum registro técnico para esta janela temporal."
                    icon={<CalendarIcon className="h-8 w-8" />}
                  />
                </div>
              ) : (
                filteredBudgets.map((budget, idx) => {
                  const totals = calculateBudget(budget);
                  const date = new Date(budget.updatedAt);
                  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={budget.id} 
                      className={cn(
                        "group flex items-center gap-lg py-7 px-shell transition-all duration-300 hover:bg-white/[0.04] active:scale-[0.99] cursor-pointer relative",
                        idx !== 0 && "border-t var(--border-subtle)"
                      )}
                      onClick={() => onOpenBudget(budget.id)}
                    >
                      {/* Integrated Timebeat */}
                      <div className="flex flex-col items-center shrink-0 w-20 py-5 rounded-2xl bg-white/[0.04] border var(--border-subtle) group-hover:bg-[var(--accent-gold)]/10 group-hover:border-[var(--accent-gold)]/20 transition-all">
                        <span className="num text-h3 font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] leading-none">{time}</span>
                        <span className="text-[8px] font-black opacity-30 mt-2 uppercase tracking-widest group-hover:text-[var(--accent-gold)] group-hover:opacity-60">LOG</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <strong className="block text-ui-md font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate tracking-tight uppercase mb-1">{budget.title || 'VISITA_TÉCNICA'}</strong>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] opacity-60 mb-4 font-black tracking-widest">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="truncate">{budget.clientName || 'CLIENTE_AVULSO'}</span>
                        </div>
                        <StatusPill status={budget.status} />
                      </div>

                      <div className="shrink-0 text-right flex flex-col items-end gap-3 ml-4">
                        <div className="num text-h3 font-bold text-[var(--accent-gold)] tracking-tighter">
                          <MoneyValue value={totals.totalComercial} compact />
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SurfaceCard>
        </Priority.P2>
      </TimelineLayout>
      
      <FloatingActionButton label="Agendar Visita" onClick={onNewBudget} />
    </SemanticScreen>
  );
};
