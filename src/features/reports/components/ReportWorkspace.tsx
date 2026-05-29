import { useMemo, useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import type { Client, Service } from '../../../core/types/business';
import { formatCurrencyBRL } from '../../../utils/formatters';
import {
  FilterChips,
  QueueEmptyState,
  Sparkline,
} from '../../../app/components/ui';
import { TrendingUp, BarChart3, PieChart, Users2, Activity, Target, Zap } from 'lucide-react';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../../ui/runtime';
import { OperationalFlowLayout, SplitMetricLayout } from '../../../ui/layouts';
import { Priority } from '../../../ui/attention';
import { AppHeader, MetricCard, SectionTitle, SurfaceCard } from '../../../ui/primitives';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
  activeClient: Client | null;
  activeWorkOrder: Service | null;
  context?: Record<string, unknown>;
}

type ReportCategory = 'financeiro' | 'clientes' | 'servicos';

const CATEGORIES = [
  { id: 'financeiro', label: 'VISÃO GERAL' },
  { id: 'clientes',   label: 'PERFORMANCE' },
  { id: 'servicos',   label: 'CATÁLOGO' },
];

/**
 * ReportWorkspace: Executive Intelligence dashboard.
 * Mission: Visual Convergence (Executive BI style).
 */
export function ReportWorkspace({ captures }: ReportWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');

  const financeStats = useMemo(() => {
    const totalRevenue = captures.reduce((acc, c) => acc + (Number(c.unitValue) * Number(c.quantity) || 0), 0);
    const totalCosts = totalRevenue * 0.4;
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Performance trends
    const revenueTrend = [20, 25, 22, 30, 35, 32, 40, 45];
    const marginTrend = [35, 38, 36, 40, 42, 41, 44, 46];

    return { totalRevenue, totalCosts, totalProfit, avgMargin, revenueTrend, marginTrend };
  }, [captures]);

  const clientStats = useMemo(() => {
    const clients: Record<string, { name: string; total: number; count: number }> = {};
    captures.forEach((c) => {
      const name = c.clientId || 'Cliente Avulso';
      if (!clients[name]) clients[name] = { name, total: 0, count: 0 };
      clients[name].total += (Number(c.unitValue) * Number(c.quantity) || 0);
      clients[name].count += 1;
    });
    return Object.values(clients).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [captures]);

  const money = (val: number) => formatCurrencyBRL(val);

  return (
    <SemanticScreen type="analytics">
      <OperationalFlowLayout
        header={
          <AppHeader 
            eyebrow="BUSINESS INTELLIGENCE"
            title="Performance"
            subtitle="Análise executiva de rentabilidade e métricas de volume acumulado."
            action={
               <div className="flex items-center gap-2 bg-[var(--accent-gold)]/10 px-3 py-1.5 rounded-full border border-[var(--accent-gold)]/20">
                  <Activity className="h-3 w-3 text-[var(--accent-gold)] animate-pulse" />
                  <span className="text-[9px] font-black text-[var(--accent-gold)] tracking-widest uppercase">LIVE_STATS</span>
               </div>
            }
          />
        }
      >
        {/* 1. CATEGORY NAV (P1) */}
        <Priority.P1 className="mb-4">
          <FilterChips 
            items={CATEGORIES}
            active={[activeCategory]}
            onChange={(active) => setActiveCategory(active[0] as ReportCategory || 'financeiro')}
          />
        </Priority.P1>

        <Priority.P2 className="flex flex-col gap-xl pb-32">
          {activeCategory === 'financeiro' && (
            <>
              <SectionTitle 
                action={<TrendingUp className="h-4 w-4 text-[var(--accent-green)]" />}
              >
                Inteligência Financeira
              </SectionTitle>
              
              <div className="flex flex-col gap-md">
                {/* Master Revenue Card */}
                <SurfaceCard className="bg-gradient-to-br from-white/[0.05] to-transparent relative overflow-hidden group">
                   <div className="flex justify-between items-end relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.2em] uppercase flex items-center gap-2">
                           <Target className="h-3 w-3" /> FATURAMENTO_BRUTO_ESTIMADO
                        </span>
                        <div className="num text-[42px] font-bold text-[var(--text-primary)] tracking-tighter leading-none mt-2">
                          {money(financeStats.totalRevenue)}
                        </div>
                      </div>
                      <div className="h-12 w-32 mb-1">
                        <Sparkline data={financeStats.revenueTrend} stroke="var(--accent-gold)" height={48} />
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Zap className="h-12 w-12 text-[var(--accent-gold)]" />
                   </div>
                </SurfaceCard>

                <SplitMetricLayout>
                  <MetricCard 
                    label="Margem de Lucro" 
                    value={`${financeStats.avgMargin.toFixed(0)}%`} 
                    trend={<Sparkline data={financeStats.marginTrend} stroke="var(--accent-green)" height={24} />}
                    featured
                  />
                  <MetricCard 
                    label="Lançamentos" 
                    value={captures.length} 
                    trend={<span className="text-[10px] font-black text-[var(--text-muted)] opacity-40">VOLUME_TOTAL</span>}
                  />
                </SplitMetricLayout>
              </div>

              <SectionTitle>Estrutura de Custos</SectionTitle>
              <SurfaceCard className="p-8 border-l-4 border-l-[var(--accent-blue)]">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-ui-xs font-black text-[var(--text-primary)] uppercase tracking-tight">Análise de Composição</span>
                     <span className="text-[9px] font-medium text-[var(--text-muted)] opacity-60 tracking-widest uppercase">Base: Média Trimestral</span>
                  </div>
                  <PieChart className="h-4 w-4 text-[var(--accent-blue)] opacity-60" />
                </div>
                <div className="flex flex-col gap-6">
                  {[
                    { label: 'INSUMOS E MATERIAIS', val: '42%', color: 'var(--accent-gold)' },
                    { label: 'CUSTOS LOGÍSTICOS', val: '18%', color: 'var(--accent-blue)' },
                    { label: 'RENTABILIDADE LÍQUIDA', val: '40%', color: 'var(--accent-green)' }
                  ].map(item => (
                    <div key={item.label} className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[9px] font-black tracking-[0.15em] text-[var(--text-muted)]">
                        <span>{item.label}</span>
                        <span className="text-[var(--text-primary)]">{item.val}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full rounded-full transition-all duration-1000 ease-premium" style={{ width: item.val, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </>
          )}

          {activeCategory === 'clientes' && (
            <>
              <SectionTitle 
                action={<Users2 className="h-4 w-4 text-[var(--accent-blue)] opacity-60" />}
              >
                Top Performance por Cliente
              </SectionTitle>
              
              <div className="flex flex-col gap-sm pb-40">
                {clientStats.length === 0 ? (
                  <QueueEmptyState 
                    title="Nenhum registro de faturamento" 
                    meta="As métricas de performance serão geradas após as primeiras liquidações." 
                    icon={<BarChart3 className="h-8 w-8" />}
                  />
                ) : (
                  clientStats.map((c, idx) => (
                    <div key={c.name} className="group flex items-center gap-md p-5 rounded-2xl bg-white/[0.04] border var(--border-subtle) hover:bg-white/[0.08] transition-all cursor-default">
                       <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-[10px] font-black border var(--border-subtle) shrink-0 group-hover:bg-[var(--accent-blue)]/10 group-hover:text-[var(--accent-blue)] transition-all">
                          {idx + 1}
                       </div>
                       <div className="flex-1 min-w-0">
                          <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors tracking-tight">{c.name.toUpperCase()}</strong>
                          <span className="text-[9px] font-black text-[var(--text-muted)] opacity-40 uppercase tracking-widest">{c.count} OPERAÇÕES FINALIZADAS</span>
                       </div>
                       <div className="num text-ui-md font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                          {money(c.total)}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeCategory === 'servicos' && (
            <QueueEmptyState 
              title="Intelligence em Breve" 
              meta="Análise técnica granular por categoria de serviço para otimizar suas propostas e reduzir perdas operacionais." 
              icon={<Zap className="h-8 w-8" />}
            />
          )}
        </Priority.P2>
      </OperationalFlowLayout>
    </SemanticScreen>
  );
}
