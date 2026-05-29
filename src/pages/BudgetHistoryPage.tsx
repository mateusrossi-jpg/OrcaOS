import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin, Search, CalendarDays } from "lucide-react";
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
 * BudgetHistoryPage: Professional agenda and temporal work log.
 * Mission: Visual Convergence (Fantastical / Linear Timeline style).
 */
export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = ({ onOpenBudget, onNewBudget }) => {
  const { budgets, isLoading } = useBudgetHistory();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [query, setQuery] = useState('');

  const filteredBudgets = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return budgets;
    return budgets.filter(b => 
      (b.title?.toLowerCase() || '').includes(normalized) || 
      (b.clientName?.toLowerCase() || '').includes(normalized)
    );
  }, [budgets, query]);

  if (isLoading) return <SemanticScreen type="timeline"><ERPLoader message="Sincronizando agenda..." /></SemanticScreen>;

  return (
    <SemanticScreen type="timeline">
      <TimelineLayout
        header={
          <div className="flex flex-col gap-lg">
            <AppHeader
              eyebrow="FLUXO TEMPORAL"
              title="Sua Agenda"
              subtitle="Cronograma de visitas técnicas e monitoramento de prazos operacionais."
              action={
                 <button className="h-12 w-12 grid place-items-center bg-[var(--bg-surface-glass)] border var(--border-soft) rounded-full text-[var(--accent-gold)]">
                    <CalendarDays className="h-5 w-5" />
                 </button>
              }
            />
            
            <Priority.P2>
              <div className="relative flex items-center h-[56px] rounded-[var(--radius-button)] bg-[var(--bg-surface-glass)] border var(--border-subtle) px-shell focus-within:border-[var(--accent-gold)]/40 focus-within:bg-white/[0.06] transition-all group">
                <Search className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-gold)] transition-colors" />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Localizar agendamento..."
                  className="flex-1 bg-transparent border-none outline-none ml-md text-ui-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40"
                />
              </div>
            </Priority.P2>
          </div>
        }
      >
        {/* 1. TEMPORAL NAVIGATION: THE STRIP (P1) */}
        <Priority.P1 className="mb-14 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-md min-w-max px-2 py-2">
            {calendarDays.slice(0, 14).map((d) => {
              const active = d.getDate() === selectedDate;
              const hasJobs = budgets.some(b => new Date(b.updatedAt).toDateString() === d.toDateString());
              const isToday = d.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={d.getTime()}
                  onClick={() => setSelectedDate(d.getDate())}
                  className={cn(
                    "flex flex-col items-center justify-center transition-all duration-500 cursor-pointer border relative",
                    "w-[64px] h-[92px] rounded-2xl",
                    active 
                      ? "bg-[var(--accent-gold)] text-black border-transparent shadow-card scale-[1.1] z-10" 
                      : "bg-white/[0.04] border-[var(--border-soft)] hover:bg-white/[0.08]",
                    isToday && !active && "ring-1 ring-[var(--accent-gold)]/40 border-[var(--accent-gold)]/20"
                  )}
                >
                  <span className={cn("text-[10px] font-black tracking-widest mb-2", active ? "text-black/60" : "text-[var(--text-muted)]")}>
                    {week[d.getDay()]}
                  </span>
                  <span className={cn("text-h2 font-bold num leading-none", active ? "text-black" : "text-[var(--text-primary)]")}>
                    {d.getDate()}
                  </span>
                  {hasJobs && (
                    <span className={cn("mt-3 h-1 w-1 rounded-full", active ? "bg-black" : "bg-[var(--accent-gold)]")} />
                  )}
                  {isToday && !active && (
                     <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-[var(--accent-gold)] bg-black/40 px-1.5 rounded-full border border-[var(--accent-gold)]/20">HOJE</span>
                  )}
                </button>
              );
            })}
          </div>
        </Priority.P1>

        {/* 2. TEMPORAL LEDGER (P2) */}
        <Priority.P2 className="flex flex-col gap-lg">
          <div className="mb-4 -ml-8 pl-8 flex items-end justify-between">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                  <h2 className="text-h3 font-bold text-[var(--text-primary)] tracking-tight">
                    {new Date(new Date().setDate(selectedDate)).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                  </h2>
               </div>
               <p className="text-[10px] text-[var(--text-muted)] font-black tracking-[0.2em]">{filteredBudgets.length} REGISTROS PARA ESTA DATA</p>
            </div>
            <div className="text-[10px] font-black text-[var(--text-muted)] opacity-30 uppercase tracking-[0.2em] mb-1">UTC-03:00</div>
          </div>

          <div className="flex flex-col gap-sm">
            {filteredBudgets.length === 0 ? (
              <div className="-ml-8 pl-8">
                <QueueEmptyState 
                  title="Horário Disponível" 
                  meta="Nenhum atendimento técnico registrado para este slot temporal."
                  icon={<CalendarIcon className="h-8 w-8" />}
                />
              </div>
            ) : (
              filteredBudgets.map((budget) => {
                const totals = calculateBudget(budget);
                const date = new Date(budget.updatedAt);
                const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <SurfaceCard 
                    key={budget.id} 
                    className="group flex items-center gap-lg cursor-pointer transition-all duration-300 active:scale-[0.98] hover:bg-white/[0.08]"
                    onClick={() => onOpenBudget(budget.id)}
                  >
                    {/* SaaS-Style Timeline Log */}
                    <div className="flex flex-col items-center shrink-0 w-20 py-5 rounded-2xl bg-white/[0.04] border var(--border-subtle) group-hover:bg-[var(--accent-gold)]/10 group-hover:border-[var(--accent-gold)]/20 transition-all">
                      <span className="num text-h3 font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] leading-none">{time}</span>
                      <span className="text-[8px] font-black opacity-30 mt-2 uppercase tracking-widest group-hover:text-[var(--accent-gold)] group-hover:opacity-60">SCHEDULE</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <strong className="block text-ui-md font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate tracking-tight">{budget.title.toUpperCase()}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] opacity-60 mb-4 font-black tracking-widest">
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="truncate">{budget.clientName || 'CLIENTE AVULSO'}</span>
                      </div>
                      <StatusPill status={budget.status} />
                    </div>

                    <div className="shrink-0 text-right flex flex-col items-end gap-3">
                      <div className="num text-h3 font-bold text-[var(--accent-gold)] tracking-tighter">
                        <MoneyValue value={totals.totalComercial} compact />
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                    </div>
                  </SurfaceCard>
                );
              })
            )}
          </div>
        </Priority.P2>
      </TimelineLayout>
      
      <FloatingActionButton label="Agendar Visita" onClick={onNewBudget} />
    </SemanticScreen>
  );
};
