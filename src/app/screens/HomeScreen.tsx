import { useMemo } from 'react';
import { Plus, TrendingUp, FileText, Bell } from "lucide-react";
import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { 
  MoneyValue, 
  Sparkline,
  ERPLoader
} from '../components/ui';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../ui/runtime';
import { ExecutiveDashboardLayout } from '../../ui/layouts';
import { Priority } from '../../ui/attention';
import { SurfaceCard, MetricCard, SectionTitle, OperationalListItem } from '../../ui/primitives';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

/**
 * HomeScreen: The cinematic authority hub of Aferix.
 * Orchestrated by the 3-Layer Visual Architecture.
 */
export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();

  const pulse = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyFinalized = budgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO && new Date(b.updatedAt) >= startOfMonth);
    const profit = monthlyFinalized.reduce((acc, b) => acc + (b.financialSnapshot?.lucroBruto || calculateBudget(b).lucroBruto), 0);
    const revenue = monthlyFinalized.reduce((acc, b) => acc + (b.financialSnapshot ? (b.chargedValue - b.discounts) : calculateBudget(b).totalComercial), 0);
    
    const executing = budgets.filter(b => b.status === BUDGET_STATUS.EM_EXECUCAO);
    const authorized = budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO);
    
    const activeWork = [...executing, ...authorized].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { profit, revenue, margin, activeWork };
  }, [budgets]);

  if (isLoading) return <SemanticScreen type="dashboard"><ERPLoader message="Sincronizando..." /></SemanticScreen>;

  const currentMonthYear = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonthYear = currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);

  // financial visual trend lines
  const profitTrend = [12, 16, 14, 20, 24, 21, 28, 32];
  const revenueTrend = [15, 22, 18, 25, 30, 28, 35, 40];
  const marginTrend = [35, 38, 36, 40, 42, 41, 43, 45];

  return (
    <SemanticScreen type="dashboard">
      <ExecutiveDashboardLayout
        header={
          <header className="flex flex-col gap-lg">
            <div className="flex justify-between items-center">
              <Priority.P3 className="flex items-center gap-sm">
                <span className="text-ui-xs tracking-[0.3em] font-black text-[var(--text-primary)]">AFERIX</span>
                <span className="text-ui-xs opacity-50">OS.V5</span>
              </Priority.P3>
              <div className="flex items-center gap-md">
                <button className="relative w-12 h-12 grid place-items-center bg-[var(--bg-surface-glass)] rounded-[var(--radius-button)] border var(--border-subtle) text-[var(--text-secondary)] transition-all active:scale-[0.9]" onClick={() => onNavigate('settings')}>
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-[var(--accent-gold)] rounded-full shadow-[var(--shadow-cinematic)]" />
                </button>
              </div>
            </div>
            
            <Priority.P1 className="flex flex-col gap-xs">
              <p className="text-ui-xs text-[var(--accent-gold)] font-black tracking-widest">BOA NOITE</p>
              <h1 className="text-h1 text-[var(--text-primary)]">
                Mateus, <span className="text-[var(--text-muted)] opacity-40">tudo pronto.</span>
              </h1>
              <p className="text-ui-base text-[var(--text-secondary)] opacity-80">Sua operação está sincronizada e ativa.</p>
            </Priority.P1>
          </header>
        }
        footer={
          <div className="grid grid-cols-2 gap-md">
            <button 
              onClick={() => onNavigate('budgets')}
              className="h-16 rounded-[var(--radius-button)] bg-[var(--bg-surface-glass)] backdrop-blur-2xl border var(--border-soft) flex items-center justify-center gap-md text-white font-bold text-ui-base shadow-soft transition-all active:scale-[0.95]"
            >
              <FileText className="h-5 w-5 opacity-60" /> 
              <span>OPERAÇÃO</span>
            </button>

            <button 
              onClick={() => onNavigate('new-budget')}
              className="h-16 rounded-[var(--radius-button)] bg-[var(--accent-gold)] border border-[var(--accent-gold)]/20 flex items-center justify-center gap-md text-black font-bold text-ui-base shadow-[var(--shadow-button)] transition-all active:scale-[0.95]"
            >
              <Plus className="h-5 w-5" strokeWidth={3} /> 
              <span>NOVO</span>
            </button>
          </div>
        }
      >
        {/* 1. PRIMARY FOCUS: PROFIT HERO */}
        <Priority.P1>
          <SurfaceCard 
            className="group relative overflow-hidden cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all duration-500"
            onClick={() => onNavigate('money')}
          >
            <div className="relative z-10">
              <div className="text-ui-xs text-[var(--text-muted)] opacity-50 mb-8 flex items-center justify-between">
                <span>LUCRO ESTIMADO NO MÊS</span>
                <span className="num opacity-30">{capitalizedMonthYear}</span>
              </div>
              
              <div className="mb-4">
                <p className="num text-[48px] font-bold text-[var(--accent-gold)] leading-none tracking-tighter">
                  <MoneyValue value={pulse.profit} />
                </p>
                <p className="mt-6 flex items-center gap-sm text-[var(--accent-green)] font-bold text-ui-sm">
                  <TrendingUp className="h-4 w-4" strokeWidth={3} />
                  <span>+18% VS. MÊS ANTERIOR</span>
                </p>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-5 pointer-events-none">
              <Sparkline 
                data={profitTrend} 
                stroke="var(--accent-gold)" 
                fill="transparent" 
                height={80} 
              />
            </div>
          </SurfaceCard>
        </Priority.P1>

        {/* 2. SECONDARY DATA: KPI GRID */}
        <Priority.P2 className="grid grid-cols-2 gap-md">
          <MetricCard 
            label="Faturamento" 
            value={<MoneyValue value={pulse.revenue} compact />} 
            color="var(--accent-blue)" 
            trend={<Sparkline data={revenueTrend} stroke="var(--accent-blue)" height={32} />}
          />
          <MetricCard 
            label="Margem Real" 
            value={`${pulse.margin.toFixed(0)}%`} 
            color="var(--accent-green)" 
            trend={<Sparkline data={marginTrend} stroke="var(--accent-green)" height={32} />}
          />
        </Priority.P2>

        {/* 3. CONTEXTUAL FEED: ACTIVE WORK */}
        <Priority.P2 className="flex flex-col">
          <SectionTitle 
            action={
              <button 
                onClick={() => onNavigate('work-history')}
                className="text-ui-xs text-[var(--accent-gold)] font-black"
              >
                VER AGENDA
              </button>
            }
          >
            Trabalhos Ativos
          </SectionTitle>

          <div className="flex flex-col gap-sm">
            {pulse.activeWork.slice(0, 3).map((job) => {
              const dateObj = new Date(job.updatedAt || job.createdAt || Date.now());
              const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <OperationalListItem 
                  key={job.id}
                  title={job.title}
                  subtitle={`${job.clientName || 'Cliente'} • ${time}`}
                  onClick={() => onSelectBudget?.(job)}
                  className="bg-white/[0.04]"
                />
              );
            })}
          </div>
        </Priority.P2>
      </ExecutiveDashboardLayout>
    </SemanticScreen>
  );
}
