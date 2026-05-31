import React, { useState, useMemo, memo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin, CalendarDays, Activity, Plus } from "lucide-react";
import { useBudgetHistory } from '../hooks/useBudgetHistory';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import {
  MoneyValue,
  QueueEmptyState,
  StatusPill,
  ERPLoader
} from '../app/components/ui';
import { cn } from '../utils/ui';

// ── Unified UI Architecture ──────────────────────────────────────────────────
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel,
  OpsChip,
  InteractiveRow
} from '../ui/system';

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
 * Refactored for absolute Home DNA parity (Phase 4D).
 */
export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = memo(({ onOpenBudget, onNewBudget }) => {
  const { budgets, isLoading } = useBudgetHistory();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [query] = useState('');

  const filteredBudgets = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return budgets;
    return budgets.filter(b => 
      (b.title?.toLowerCase() || '').includes(normalized) || 
      (b.clientName?.toLowerCase() || '').includes(normalized)
    );
  }, [budgets, query]);

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Sincronizando Cronograma..." /></ScreenContainer>;

  const chips = (
    <>
      <OpsChip icon={<Clock size={11} />} label={`${budgets.length} compromissos`} accent={false} />
      <OpsChip icon={<Activity size={11} />} label="FLUXO_TEMPORAL" accent={false} />
    </>
  );

  return (
    <ScreenContainer className="pb-32 pt-0 px-0">
      {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
      <AppHeader 
        title="Agenda." 
        chips={chips}
        action={
          <div className="h-12 w-12 grid place-items-center bg-[#141414] border border-white/10 rounded-full text-[#D4A94E] shadow-inner">
            <CalendarDays className="h-5 w-5" />
          </div>
        }
      />

      <div className="px-6 flex flex-col gap-6">
      
      {/* 1. CALENDAR NAVIGATION HUD */}
      <div className="mb-8 -mx-6 px-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max px-2 py-4">
          {calendarDays.map((d) => {
            const active = d.getDate() === selectedDate;
            const hasJobs = budgets.some(b => new Date(b.updatedAt).toDateString() === d.toDateString());
            const isToday = d.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={d.getTime()}
                onClick={() => setSelectedDate(d.getDate())}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "68px",
                  height: "96px",
                  borderRadius: "16px",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: active ? "#D4A94E" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "transparent" : isToday ? "rgba(212,169,78,0.3)" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: active ? "0 6px 20px rgba(212,169,78,0.25)" : "none",
                  transform: active ? "scale(1.05)" : "scale(1)",
                  zIndex: active ? 10 : 1
                }}
              >
                {active && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />}
                <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", color: active ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)", marginBottom: "8px", position: "relative", zIndex: 10 }}>
                  {week[d.getDay()]}
                </span>
                <span style={{ fontSize: "24px", fontWeight: 800, color: active ? "black" : "#EFEFEF", lineHeight: 1, position: "relative", zIndex: 10 }}>
                  {d.getDate()}
                </span>
                {hasJobs && (
                  <div style={{ marginTop: "12px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: active ? "black" : "#D4A94E", position: "relative", zIndex: 10 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TIMELINE SURFACE */}
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#D4A94E]" />
                <h2 className="text-[17px] font-bold text-white tracking-tight">
                  {new Date(new Date().setDate(selectedDate)).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                </h2>
             </div>
             <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em" }}>{filteredBudgets.length} ATENDIMENTOS_MAPEADOS</p>
          </div>
        </div>

        <SurfaceCard padding="none" className="overflow-hidden mb-12">
          <div className="flex flex-col">
            {filteredBudgets.length === 0 ? (
              <div className="py-24 px-6 text-center opacity-30">
                <p className="font-mono text-[10px] font-black tracking-widest uppercase">HORÁRIO_DISPONÍVEL</p>
              </div>
            ) : (
              filteredBudgets.map((budget, idx) => {
                const totals = calculateBudget(budget);
                const date = new Date(budget.updatedAt);
                const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <InteractiveRow 
                    key={budget.id} 
                    onClick={() => onOpenBudget(budget.id)}
                    className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
                    leftSlot={
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "72px", padding: "12px 0", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "#EFEFEF" }} className="num">{time}</span>
                        <span style={{ fontSize: "8px", fontWeight: 900, color: "rgba(255,255,255,0.2)", marginTop: "4px", letterSpacing: "0.15em" }} className="font-mono">TIME_LOG</span>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: "15px", fontWeight: 700, color: "#EFEFEF", display: "block", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{budget.title || 'VISITA_TÉCNICA'}</strong>
                        <div className="flex items-center gap-2">
                          <MapPin size={10} style={{ color: "#D4A94E", opacity: 0.6 }} />
                          <span style={{ fontSize: "11.5px", color: "#505050", textTransform: "uppercase", fontWeight: 600 }}>{budget.clientName || 'CLIENTE_AVULSO'}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                         <span className="num text-[13px] font-bold text-white"><MoneyValue value={totals.totalComercial} compact /></span>
                         <StatusPill status={budget.status} className="scale-75 origin-right" />
                      </div>
                    </div>
                  </InteractiveRow>
                );
              })
            )}
          </div>
        </SurfaceCard>
      </div>
      </div>

      <button 
        onClick={onNewBudget}
        style={{
          position: "fixed", bottom: "120px", right: "24px", height: "64px", width: "64px", 
          borderRadius: "50%", backgroundColor: "#D4A94E", color: "black", border: "none", 
          display: "grid", placeItems: "center", boxShadow: "0 8px 32px rgba(212,169,78,0.35)", zIndex: 1000, cursor: "pointer"
        }}
        className="hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </ScreenContainer>
  );
});
