import { Plus, Clock, TrendingUp, AlertCircle, ChevronRight, CheckCircle2, Bell } from "lucide-react";
import type { AppTab } from '../appTypes';
import { 
  MoneyValue, 
  ERPLoader
} from '../components/ui';

// Domain Authorities (Purified Data Layer)
import { useFinancialCycleSummary } from '../../features/finance/hooks/useFinancialCycleSummary';
import { useOperationsSummary } from '../../features/operations/hooks/useOperationsSummary';
import { useOperationsAlerts } from '../../features/operations/hooks/useOperationsAlerts';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../ui/runtime';
import { ExecutiveDashboardLayout } from '../../ui/layouts';
import { Priority } from '../../ui/attention';
import { SurfaceCard, SectionTitle } from '../../ui/primitives';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budgetId: string) => void;
}

/**
 * AFERIX HOME OPERATING SYSTEM (V1)
 * Purpose: Prioritize Operational Attention.
 * Laws: Problem (P0) > Opportunity (P1) > Information (P2).
 */
export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { revenue, profit, costs } = useFinancialCycleSummary();
  const { executingCount, pendingCount } = useOperationsSummary();
  const alerts = useOperationsAlerts();
  
  // TO-DO: Replace with actual auth context
  const userName = "Mateus";
  const currentMonthYear = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonthYear = currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);

  // Split alerts by Constitutional Priority
  const p0Alerts = alerts.filter(a => a.priority >= 8);
  const p1Alerts = alerts.filter(a => a.priority < 8 && a.priority >= 5);

  return (
    <SemanticScreen type="dashboard">
      <ExecutiveDashboardLayout
        header={
          <header className="flex flex-col gap-6">
            {/* 1. AMBIENT HUD (Top Context) */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.3em] font-black text-[var(--accent-gold)] uppercase opacity-60">
                   {capitalizedMonthYear}
                </span>
                <h1 className="text-h2 text-[var(--text-primary)] tracking-tighter leading-tight mt-1">
                   Olá, {userName}.
                </h1>
              </div>
              <div className="flex items-center gap-md">
                 <button className="relative w-12 h-12 grid place-items-center bg-white/[0.03] rounded-2xl border var(--border-subtle) text-[var(--text-muted)]" onClick={() => onNavigate('settings')}>
                   <Bell className="h-5 w-5" />
                   <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-[var(--accent-gold)] rounded-full shadow-glow" />
                 </button>
              </div>
            </div>

            {/* REVENUE GOAL (L1 Typography) */}
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.2em] uppercase mb-1">Resultado Mensal</span>
               <div className="text-[64px] font-bold text-[var(--text-primary)] tracking-tightest leading-none num">
                  <MoneyValue value={profit} />
               </div>
            </div>
          </header>
        }
        footer={
           /* TO-DO: Replace with Component Constitution Global FAB */
           <div className="fixed bottom-10 right-6 z-50">
              <button 
                onClick={() => onNavigate('new-budget')}
                className="w-16 h-16 rounded-full bg-[var(--accent-gold)] flex items-center justify-center text-black shadow-glow active:scale-95 transition-all"
              >
                <Plus className="h-8 w-8" strokeWidth={3} />
              </button>
           </div>
        }
      >
        
        {/* SECTION B: ATENÇÃO AGORA (P0 - Problems) */}
        <Priority.P1 className="flex flex-col">
          <SectionTitle className="mt-0">ATENÇÃO AGORA</SectionTitle>
          <div className="flex flex-col gap-sm">
            {p0Alerts.length > 0 ? (
              p0Alerts.map((alert) => (
                <SurfaceCard 
                  key={alert.id}
                  padding="md"
                  className="group flex items-center gap-md cursor-pointer hover:bg-white/[0.06] transition-all border-l-2 border-l-[var(--accent-red)]"
                  onClick={() => onSelectBudget?.(alert.id)}
                >
                  <div className="h-10 w-10 rounded-xl bg-[var(--accent-red)]/10 flex items-center justify-center text-[var(--accent-red)] shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate tracking-tight uppercase">{alert.title}</strong>
                    <span className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                       {alert.type}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard className="py-12 flex flex-col items-center gap-3 opacity-30">
                 <CheckCircle2 className="h-8 w-8 text-[var(--accent-green)]" />
                 <span className="text-ui-xs font-black tracking-widest">OPERAÇÃO_LIMPA</span>
              </SurfaceCard>
            )}
          </div>
        </Priority.P1>

        {/* SECTION C: OPORTUNIDADES (P1 - Opportunities) */}
        <Priority.P2 className="flex flex-col">
          <SectionTitle>OPORTUNIDADES</SectionTitle>
          <div className="flex flex-col gap-sm">
            {p1Alerts.map((alert) => (
              <SurfaceCard 
                key={alert.id}
                padding="md"
                className="group flex items-center gap-md cursor-pointer hover:bg-white/[0.06] transition-all border-l-2 border-l-[var(--accent-gold)]"
                onClick={() => onSelectBudget?.(alert.id)}
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)] shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate tracking-tight uppercase">{alert.title}</strong>
                  <span className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                     {alert.type}
                  </span>
                </div>
                <button className="h-10 px-4 rounded-lg bg-white/[0.05] text-[10px] font-black tracking-widest hover:bg-white/[0.1] transition-all">
                  SEGUIR
                </button>
              </SurfaceCard>
            ))}
          </div>
        </Priority.P2>

        {/* SECTION D: HOJE (P2 - Informational) */}
        <Priority.P2 className="flex flex-col">
          <SectionTitle>STATUS_OPERACIONAL</SectionTitle>
          <SurfaceCard padding="none" className="overflow-hidden bg-white/[0.02] border-none shadow-none">
            <div className="grid grid-cols-2 gap-px bg-white/[0.05]">
              <div className="bg-[var(--bg-primary)] p-8 flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-muted)] tracking-widest opacity-40 uppercase">
                    <Clock className="h-3 w-3" /> EXECUTANDO
                 </div>
                 <span className="num text-h2 font-bold text-[var(--text-primary)]">{executingCount}</span>
              </div>
              <div className="bg-[var(--bg-primary)] p-8 flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-muted)] tracking-widest opacity-40 uppercase">
                    <TrendingUp className="h-3 w-3" /> EM_ANÁLISE
                 </div>
                 <span className="num text-h2 font-bold text-[var(--text-primary)]">{pendingCount}</span>
              </div>
            </div>
          </SurfaceCard>
        </Priority.P2>

        {/* Bottom Spacing */}
        <div className="h-32" />
      </ExecutiveDashboardLayout>
    </SemanticScreen>
  );
}
