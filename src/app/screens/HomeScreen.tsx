import { memo } from 'react';
import { 
  Bell, 
  WifiOff, 
  CloudUpload, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  ArrowRight,
  CalendarDays
} from "lucide-react";
import type { AppTab } from '../appTypes';
import './HomeScreen.css';
import { MoneyValue } from '../components/ui';
import { ERPSkeleton } from '../../ui/system';
import { useAccountPlan } from '../../hooks/useAccountPlan';
import { useHomeAttentionStack, AttentionItem } from '../hooks/useHomeAttentionStack';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../ui/runtime';
import { ExecutiveDashboardLayout } from '../../ui/layouts';
import { cn } from '../../utils/ui';
import { 
  P1Button, 
  SyncBadge,
  ExecutiveKPI,
  AttentionCard,
  OpportunityCard,
  SectionHeader,
  EmptyStateCard,
  KpiItem,
  OperationalStatusPill
} from '../../ui/primitives/AferixComponents';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: { id: string }) => void;
}

/**
 * AFERIX HOME OPERATING SYSTEM (RC-EXECUTIVE)
 * Reconstructed for OPERATIONAL COMMAND CENTER flow.
 */
export const HomeScreen = memo(function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { account } = useAccountPlan();
  const {
    isLoading,
    syncState,
    pendingSyncCount,
    p0,
    p1,
    p2,
    refresh
  } = useHomeAttentionStack();

  const userName = account?.displayName || "Mateus";
  const currentMonthYear = new Date().toLocaleString('pt-BR', { month: 'long' });
  const currentDay = new Date().getDate();

  // Navigates directly to the context
  const handleItemSelect = (item: AttentionItem) => {
    if (onSelectBudget) {
      onSelectBudget({ id: item.metadata?.budgetId || item.id });
    }
  };

  if (isLoading) {
    return (
      <SemanticScreen type="dashboard">
        <ExecutiveDashboardLayout header={null} footer={null}>
          <div className="flex flex-col gap-4">
             <ERPSkeleton variant="title" className="w-48 h-10" />
             <ERPSkeleton variant="title" className="w-full h-40" />
             <div className="grid grid-cols-2 gap-3">
               <ERPSkeleton variant="title" className="h-24" />
               <ERPSkeleton variant="title" className="h-24" />
             </div>
          </div>
        </ExecutiveDashboardLayout>
      </SemanticScreen>
    );
  }

  return (
    <SemanticScreen type="dashboard">
      <ExecutiveDashboardLayout
        header={
          <header className="mb-5 flex flex-col">
            <p className="text-ui-xs text-muted-foreground uppercase tracking-[0.18em]">Boa noite</p>
            <div className="flex justify-between items-center mt-1">
              <h1 className="text-h1 leading-tight">
                {userName}, <span className="text-primary">tudo sob controle</span>.
              </h1>
              <div className="flex items-center gap-2">
                <SyncBadge syncState={syncState} pendingSyncCount={pendingSyncCount} onRefresh={refresh} />
                <button 
                  className="w-10 h-10 grid place-items-center rounded-xl bg-white-1 border border-white-5 text-muted-foreground active-press transition-all" 
                  onClick={() => onNavigate('settings')}
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </header>
        }
        footer={null}
      >
        <div className="flex flex-col gap-4 pb-40">
          {/* 1. RESULT ("Am I making money?") */}
          <ExecutiveKPI 
            profit={p2.revenueKPIs.profit}
            margin={p2.revenueKPIs.profit > 0 ? p2.monthlyGoalProgress : 0}
            monthlyGoal={p2.monthlyGoal}
            monthlyGoalProgress={p2.monthlyGoalProgress}
          />

          {/* 2. OPERATIONAL INDICATORS ("What needs attention?") */}
          <div className="grid grid-cols-2 gap-3">
            <KpiItem 
              label="Propostas" 
              value={p1.length} 
              color="oklch(0.7 0.13 250)" 
              description={p1.length > 0 ? `${p1.length} aguardando aprovação` : 'Nenhuma pendente'}
            />
            <KpiItem 
              label="Execução" 
              value={p2.executingCount} 
              color="oklch(0.82 0.14 155)" 
              description={p2.executingCount > 0 ? `${p2.executingCount} trabalhos ativos` : 'Sem trabalhos agora'}
            />
            <KpiItem 
              label="Agenda" 
              value={p2.todayJobsCount} 
              color="oklch(0.82 0.14 85)" 
              description={p2.todayJobsCount > 0 ? `${p2.todayJobsCount} visitas hoje` : 'Agenda livre'}
            />
            <KpiItem 
              label="A Receber" 
              value={p2.revenueKPIs.revenue * 0.4} 
              color="oklch(0.7 0.15 310)" 
              isCurrency
              description="Pendências de pagamento"
            />
          </div>

          {/* 3. COMMERCIAL OPPORTUNITIES ("Where is money waiting?") */}

          <div>
             {p1.length > 0 ? (
               <section 
                  className="card flex items-start gap-3 p-4 active-press cursor-pointer border-2 border-[rgba(212,163,89,0.2)] bg-[rgba(212,163,89,0.05)] shadow-cinematic"
                  onClick={() => handleItemSelect(p1[0])}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgba(212,163,89,0.1)] text-primary shadow-glow">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ui-base font-black tracking-tight">{p1.length} orçamentos aguardando aprovação</p>
                    <p className="text-ui-sm mt-1 text-muted-foreground">Revise e reenvie para acelerar o caixa.</p>
                  </div>
                  <ChevronRight className="mt-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                </section>
             ) : (
                <EmptyStateCard 
                  type="opportunity"
                  title="SEM PENDÊNCIAS"
                  description="Todas as suas propostas comerciais estão em dia."
                />
             )}
          </div>

          {/* 4. UPCOMING JOBS ("What should I do next?") */}
          <div>
            <SectionHeader 
              title="O que fazer a seguir" 
              action="Ver agenda" 
            />
            
            <div className="flex flex-col gap-3">
              {p2.todayJobs.length > 0 ? (
                p2.todayJobs.slice(0, 3).map((job) => (
                  <section 
                    key={job.id} 
                    className="card flex items-center gap-3 p-3-5 active-press cursor-pointer"
                    onClick={() => handleItemSelect(job)}
                  >
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-center border border-white-5">
                      <span className="num text-ui-base font-bold leading-none">{currentDay}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mt-1">Mai</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ui-base font-semibold">{job.title}</p>
                      <p className="text-ui-sm mt-0.5 text-muted-foreground truncate">{job.subtitle.split('·')[0]}</p>
                      <div className="mt-1-5">
                        <OperationalStatusPill status={job.severity === 'high' ? 'em execução' : 'enviado'} />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                  </section>
                ))
              ) : (
                <EmptyStateCard 
                  type="opportunity"
                  title="AGENDA LIVRE"
                  description="Nenhuma visita técnica agendada para hoje."
                />
              )}
            </div>
          </div>

          {/* 5. OPERATIONAL BLOCKERS ("What is preventing revenue?") */}
          <div>
            <SectionHeader title="O que impede o faturamento" />
            <div className="flex flex-col gap-2">
              {p0.length > 0 ? (
                p0.slice(0, 3).map((item) => (
                   <div 
                    key={item.id}
                    className="card p-3.5 flex items-center justify-between gap-3 active-press cursor-pointer"
                    onClick={() => handleItemSelect(item)}
                   >
                     <div className="flex items-center gap-3 min-w-0">
                        <AlertCircle className={cn("h-4 w-4 shrink-0", item.severity === 'high' ? "text-[var(--accent-red)]" : "text-[var(--accent-gold)]")} />
                        <span className="text-ui-sm font-bold truncate tracking-tight">{item.title.toUpperCase()}</span>
                     </div>
                     <OperationalStatusPill status="aguardando" />
                   </div>
                ))
              ) : (
                <EmptyStateCard 
                  type="attention"
                  title="OPERAÇÃO LIMPA"
                  description="Sem bloqueios técnicos no momento."
                />
              )}
            </div>
          </div>
          
          {/* Primary Launcher */}
          <div className="mt-6 flex justify-center gap-3">
             <button className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl border border-white-10 bg-white-1 text-ui-sm font-bold active-press shadow-soft uppercase tracking-widest">
               <CalendarDays className="h-4 w-4 text-muted-foreground" /> Operação
             </button>
             <button 
               className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary text-black text-ui-sm font-black shadow-[0_8px_30px_-10px_oklch(0.82_0.14_85/0.7)] active-press uppercase tracking-widest"
               onClick={() => onNavigate('new-budget')}
             >
                <Plus className="h-4 w-4" /> Novo orçamento
             </button>
          </div>
        </div>
      </ExecutiveDashboardLayout>
    </SemanticScreen>
  );
});

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
