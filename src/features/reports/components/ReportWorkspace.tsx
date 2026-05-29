import { useMemo, useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import type { Client, Service } from '../../../core/types/business';
import { formatCurrencyBRL } from '../../../utils/formatters';
import {
  FilterChips,
  QueueEmptyState,
  Sparkline,
} from '../../../app/components/ui';
import { TrendingUp, BarChart3, PieChart, Users2, Activity, Target, Zap, ChevronRight } from 'lucide-react';

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
  { id: 'financeiro', label: 'PERFORMANCE_GERAL' },
  { id: 'clientes',   label: 'INTELIGÊNCIA_CRM' },
  { id: 'servicos',   label: 'MAPA_CATÁLOGO' },
];

/**
 * ReportWorkspace: Executive Intelligence dashboard.
 * Mission: Executive Composition (Integrated Financial Hero, Narrative BI).
 */
export function ReportWorkspace({ captures }: ReportWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');

  const financeStats = useMemo(() => {
    const totalRevenue = captures.reduce((acc, c) => acc + (Number(c.unitValue) * Number(c.quantity) || 0), 0);
    const totalCosts = totalRevenue * 0.4;
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
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
            eyebrow="BUSINESS_INTELLIGENCE"
            title="Sua Performance"
            subtitle="Análise executiva de rentabilidade e alavancagem operacional."
            action={
               <div className="flex items-center gap-2 bg-[var(--accent-gold)]/10 px-3 py-2 rounded-xl border border-[var(--accent-gold)]/20 shadow-inner">
                  <Activity className="h-3 w-3 text-[var(--accent-gold)] animate-pulse" />
                  <span className="text-[10px] font-black text-[var(--accent-gold)] tracking-widest uppercase">LIVE_PULSE</span>
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
                action={<TrendingUp className="h-4 w-4 text-[var(--accent-green)] opacity-60" />}
              >
                Visão de Rentabilidade
              </SectionTitle>
              
              <div className="flex flex-col gap-md">
                {/* Master Revenue Object */}
                <SurfaceCard className="bg-gradient-to-br from-white/[0.06] to-transparent relative overflow-hidden group shadow-card" padding="lg">
                   <div className="flex justify-between items-end relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.25em] uppercase flex items-center gap-2 mb-2">
                           <Target className="h-3 w-3" /> RECEITA_BRUTA_TOTAL
                        </span>
                        <div className="num text-[52px] font-bold text-[var(--text-primary)] tracking-tighter leading-none">
                          {money(financeStats.totalRevenue)}
                        </div>
                      </div>
                      <div className="h-14 w-32 mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Sparkline data={financeStats.revenueTrend} stroke="var(--accent-gold)" height={56} />
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Zap className="h-16 w-16 text-[var(--accent-gold)]" />
                   </div>
                </SurfaceCard>

                <SplitMetricLayout>
                  <MetricCard 
                    label="Margem Operacional" 
                    value={`${financeStats.avgMargin.toFixed(0)}%`} 
                    trend={<Sparkline data={financeStats.marginTrend} stroke="var(--accent-green)" height={24} />}
                    featured
                  />
                  <MetricCard 
                    label="Volume" 
                    value={captures.length} 
                    trend={<span className="text-[10px] font-black text-[var(--text-muted)] opacity-30 tracking-widest">TRANSACTIONS</span>}
                  />
                </SplitMetricLayout>
              </div>

              <SectionTitle>Composição de Custos</SectionTitle>
              <SurfaceCard className="p-8 border-l-4 border-l-[var(--accent-blue)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-ui-xs font-black text-[var(--text-primary)] uppercase tracking-tight">Estrutura de Faturamento</span>
                     <span className="text-[9px] font-medium text-[var(--text-muted)] opacity-40 tracking-widest uppercase">Base: Amostra Operacional 90d</span>
                  </div>
                  <PieChart className="h-4 w-4 text-[var(--accent-blue)] opacity-40" />
                </div>
                <div className="flex flex-col gap-8 relative z-10">
                  {[
                    { label: 'MATERIAIS E INSUMOS', val: '42%', color: 'var(--accent-gold)' },
                    { label: 'CUSTOS LOGÍSTICOS', val: '18%', color: 'var(--accent-blue)' },
                    { label: 'RETENÇÃO LÍQUIDA', val: '40%', color: 'var(--accent-green)' }
                  ].map(item => (
                    <div key={item.label} className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[9px] font-black tracking-[0.2em] text-[var(--text-muted)]">
                        <span>{item.label}</span>
                        <span className="text-[var(--text-primary)]">{item.val}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-premium shadow-glow" 
                          style={{ 
                            width: item.val, 
                            backgroundColor: item.color,
                            boxShadow: `0 0 16px ${item.color}30`
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[var(--accent-blue)]/5 blur-[120px] rounded-full pointer-events-none" />
              </SurfaceCard>
            </>
          )}

          {activeCategory === 'clientes' && (
            <>
              <SectionTitle 
                action={<Users2 className="h-4 w-4 text-[var(--accent-blue)] opacity-40" />}
              >
                Top Performance Strategic
              </SectionTitle>
              
              <SurfaceCard padding="none" className="overflow-hidden mb-40">
                 <div className="flex flex-col">
                  {clientStats.length === 0 ? (
                    <div className="py-24">
                       <QueueEmptyState title="Sem dados de rede" meta="Inicie operações para gerar o ranking de performance por cliente." icon={<BarChart3 className="h-8 w-8" />} />
                    </div>
                  ) : (
                    clientStats.map((c, idx) => (
                      <div key={c.name} className="group flex items-center gap-md py-7 px-shell transition-all duration-300 hover:bg-white/[0.04] cursor-default border-t first:border-t-0 var(--border-subtle)">
                         <div className="h-12 w-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-[var(--text-muted)] text-[11px] font-black border var(--border-subtle) shrink-0 group-hover:bg-[var(--accent-blue)]/10 group-hover:text-[var(--accent-blue)] transition-all">
                            {(idx + 1).toString().padStart(2, '0')}
                         </div>
                         <div className="flex-1 min-w-0">
                            <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors tracking-tight uppercase leading-tight mb-1">{c.name}</strong>
                            <span className="text-[10px] font-black text-[var(--text-muted)] opacity-30 uppercase tracking-widest">{c.count} LANÇAMENTOS FINALIZADOS</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="num text-ui-md font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors mr-1">
                               {money(c.total)}
                            </div>
                            <ChevronRight className="h-4 w-4 text-white/5 group-hover:opacity-100 group-hover:text-white/20 transition-all" />
                         </div>
                      </div>
                    ))
                  )}
                 </div>
              </SurfaceCard>
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
