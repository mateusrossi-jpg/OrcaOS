import { useMemo, useState, memo } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import type { Client, Service } from '../../../core/types/business';
import { formatCurrencyBRL, safeMoneyValue } from '../../../utils/formatters';
import {
  FilterChips,
  QueueEmptyState,
  Sparkline
} from '../../../app/components/ui';
import { TrendingUp, BarChart3, PieChart, Users2, Activity, Target, Zap, ChevronRight, ChevronLeft, DollarSign, Briefcase, Award, BarChart, FileText, MapPin, Boxes } from 'lucide-react';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../../ui/runtime';
import { 
  SurfaceCard,
  ScreenContainer,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  SemanticBadge,
  AppHeader,
  OpsChip,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Heading,
  Value,
  FinancialValue,
  ERPLoader
} from '../../../ui/system';
import { HeroCard } from '../../../components/HeroCard';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
  activeClient: Client | null;
  activeWorkOrder: Service | null;
  context?: Record<string, unknown>;
  onBack?: () => void;
}

type ReportCategory = 'financeiro' | 'clientes' | 'servicos';

const CATEGORIES = [
  { id: 'financeiro', label: 'FINANCEIRO' },
  { id: 'clientes',   label: 'CLIENTES' },
  { id: 'servicos',   label: 'SERVIÇOS' },
];

/**
 * ReportWorkspace: Executive Intelligence dashboard.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export const ReportWorkspace = memo(function ReportWorkspace({ captures, onBack }: ReportWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');

  const financeStats = useMemo(() => {
    const totalRevenue = captures.reduce((acc, c) => acc + (safeMoneyValue(c.unitValue) * safeMoneyValue(c.quantity)), 0);
    const totalCosts = totalRevenue * 0.4;
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const revenueTrend = [20, 25, 22, 30, 35, 32, 40, 45];
    return { totalRevenue, totalCosts, totalProfit, avgMargin, revenueTrend };
  }, [captures]);

  const clientStats = useMemo(() => {
    const clients: Record<string, { name: string; total: number; count: number }> = {};
    captures.forEach((c) => {
      const name = c.clientId || 'CLIENTE_AVULSO';
      if (!clients[name]) clients[name] = { name, total: 0, count: 0 };
      clients[name].total += (safeMoneyValue(c.unitValue) * safeMoneyValue(c.quantity));
      clients[name].count += 1;
    });
    return Object.values(clients).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [captures]);

  const chips = (
    <>
       <OpsChip icon={<BarChart size={11} />} label={`${captures.length} transações`} accent={false} />
       <OpsChip icon={<TrendingUp size={11} />} label={`${financeStats.avgMargin.toFixed(0)}% margem`} accent="green" />
    </>
  );

  return (
    <ScreenContainer className="pb-32">
      {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
      <AppHeader 
        title="Performance." 
        onBack={onBack} 
        chips={chips} 
      />

      <div className="px-6 py-8 flex flex-col gap-12">
        
        {/* ━━━ EXECUTIVE BI COCKPIT ━━━ */}
        <Section className="gap-4">
          <ExecutiveSummaryGrid>
             <ValueBlock label="Receita Bruta" value={formatCurrencyBRL(financeStats.totalRevenue)} icon={<Target size={12} />} variant="warning" />
             <ValueBlock label="Margem Média" value={`${financeStats.avgMargin.toFixed(0)}%`} icon={<TrendingUp size={12} />} variant="success" />
          </ExecutiveSummaryGrid>
        </Section>

        <Section className="gap-2">
          <FilterChips items={CATEGORIES} active={[activeCategory]} onChange={(active) => setActiveCategory(active[0] as ReportCategory || 'financeiro')} />
        </Section>

        <Section className="gap-6 pb-12">
          {activeCategory === 'financeiro' && (
            <Section className="gap-4">
               <SectionLabel className="ml-2">Fluxo de Rentabilidade</SectionLabel>
               
               <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
                  {/* Gold ambient radial glow */}
                  <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
                  
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)] font-bold">TENDÊNCIA DE RECEITA TOTAL</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-[32px] font-black text-white leading-none tracking-tight">{formatCurrencyBRL(financeStats.totalRevenue)}</h3>
                    </div>
                    
                    <div className="flex flex-col gap-6 mt-2">
                      <div className="h-10 w-full opacity-60">
                         <Sparkline data={financeStats.revenueTrend} stroke="var(--accent-gold)" height={40} />
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-[var(--accent-green)] w-[64%] shadow-[0_0_12px_var(--accent-green)]" />
                      </div>
                      <div className="flex justify-between">
                         <SectionLabel className="!text-[9px] opacity-30">Custo: {formatCurrencyBRL(financeStats.totalCosts)}</SectionLabel>
                         <SectionLabel className="!text-[9px] !text-[var(--accent-green)] font-bold">Lucro: {formatCurrencyBRL(financeStats.totalProfit)}</SectionLabel>
                      </div>
                    </div>
                  </div>
                </div>

               <div className="grid grid-cols-2 gap-3">
                  <SurfaceCard padding="md" className="gap-1">
                     <SectionLabel className="!text-[8px]">VOLUME_OP</SectionLabel>
                     <Value className="text-xl">{captures.length}</Value>
                  </SurfaceCard>
                  <SurfaceCard padding="md" className="gap-1">
                     <SectionLabel className="!text-[8px]">TICKET_MÉDIO</SectionLabel>
                     <Value className="text-xl">
                        {formatCurrencyBRL(captures.length > 0 ? financeStats.totalRevenue / captures.length : 0)}
                     </Value>
                  </SurfaceCard>
               </div>
            </Section>
          )}

          {activeCategory === 'clientes' && (
            <Section className="gap-6">
               <SectionLabel className="ml-2">Top Performance Strategic</SectionLabel>
               <SurfaceCard padding="none">
                  <Stack className="gap-0">
                    {clientStats.map((c, idx) => (
                      <InteractiveRow 
                        key={c.name} 
                        className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
                      >
                         <div className="flex items-center gap-4 w-full">
                            <div className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-[11px] font-black font-mono text-white/20 shrink-0">
                               {(idx + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0">
                               <Body className="truncate font-bold uppercase">{c.name}</Body>
                               <SectionLabel className="!text-[10px] opacity-30 mt-0.5">{c.count} LANÇAMENTOS</SectionLabel>
                            </div>
                            <Value className="text-sm shrink-0">{formatCurrencyBRL(c.total)}</Value>
                         </div>
                      </InteractiveRow>
                    ))}
                  </Stack>
               </SurfaceCard>
            </Section>
          )}

          {activeCategory === 'servicos' && (
            <div className="py-20 text-center opacity-30">
               <Body className="font-mono text-[10px] font-black tracking-widest uppercase">MAPA_EM_CONSTRUÇÃO</Body>
            </div>
          )}
        </Section>
      </div>
    </ScreenContainer>
  );
});
