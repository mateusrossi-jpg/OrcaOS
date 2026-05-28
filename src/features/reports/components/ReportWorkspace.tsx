import { useEffect, useMemo, useState } from 'react';
import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { useBudgetHistory } from '../../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../../domain/budget';
import { FinanceFacade, type ConsolidatedFinanceRecord } from '../../finance/financeFacade';
import { ProfileFacade } from '../../settings/profileFacade';
import { 
  KpiCard, 
  MetricCard,
  Surface, 
  ListCard, 
  FilterChips, 
  QueueEmptyState,
  Button,
  SectionTitle
} from '../../../app/components/ui';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}

type ReportCategory = 'financeiro' | 'clientes' | 'operacao';

const CATEGORIES: Array<{ id: ReportCategory; label: string }> = [
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'operacao', label: 'Operação' }
];

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function ReportWorkspace({ captures: _captures, activeClient: _activeClient = null, activeWorkOrder: _activeWorkOrder = null }: ReportWorkspaceProps) {
  const [showAllClientStats, setShowAllClientStats] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');
  
  const { budgets: savedBudgets, isLoading } = useBudgetHistory();
  const [financeRecords, setFinanceRecords] = useState<ConsolidatedFinanceRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function loadFinance() {
      const records = await FinanceFacade.getRealizedRecords();
      if (active) setFinanceRecords(records);
    }
    void loadFinance();
    return () => { active = false; };
  }, [savedBudgets]);

  const heroData = useMemo(() => {
    const plannedProfit = savedBudgets
      .filter(b => b.status === BUDGET_STATUS.FINALIZADO)
      .reduce((sum, b) => sum + (b.financialSnapshot?.lucroBruto || 0), 0);
    
    const actualProfit = financeRecords.reduce((sum, r) => sum + r.netProfit, 0);
    const delta = actualProfit - plannedProfit;
    const isPositive = delta >= 0;

    return { plannedProfit, actualProfit, delta, isPositive };
  }, [savedBudgets, financeRecords]);

  const financeStats = useMemo(() => {
    const totalRevenue = financeRecords.reduce((sum, r) => sum + r.receivedAmount, 0);
    const totalCosts = financeRecords.reduce((sum, r) => sum + r.directCosts, 0);
    const avgMargin = financeRecords.length > 0
      ? financeRecords.reduce((sum, r) => sum + r.netMarginPercent, 0) / financeRecords.length
      : 0;

    return { totalRevenue, totalCosts, avgMargin };
  }, [financeRecords]);

  const clientStats = useMemo(() => {
    const clientMap = new Map<string, { name: string, count: number, total: number }>();
    financeRecords.forEach(r => {
      const entry = clientMap.get(r.clientName) || { name: r.clientName || 'Cliente Avulso', count: 0, total: 0 };
      entry.count += 1;
      entry.total += r.receivedAmount;
      clientMap.set(r.clientName, entry);
    });
    return Array.from(clientMap.values()).sort((a, b) => b.total - a.total);
  }, [financeRecords]);

  const visibleClientStats = showAllClientStats ? clientStats : clientStats.slice(0, 5);
  const hiddenClientStatsCount = Math.max(clientStats.length - visibleClientStats.length, 0);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <QueueEmptyState title="Relatórios" meta="Consolidando dados operacionais..." />
      </div>
    );
  }

  return (
    <div className="aferix-d-flex aferix-flex-column aferix-gap-lg" style={{ maxWidth: '440px', margin: '0 auto', paddingBottom: 'var(--sz-2xl)' }}>
      
      {/* 1. HERO KPI (Elevation 2) */}
      <div className="aferix-mb-md">
        <KpiCard 
          label="Lucro Realizado (Histórico)"
          value={heroData.actualProfit}
          featured
          trend={{ 
            value: heroData.delta === 0 ? 'Exato' : money(Math.abs(heroData.delta)), 
            isPositive: heroData.isPositive, 
            label: heroData.isPositive ? 'acima do orçado' : 'abaixo do orçado' 
          }}
        />
      </div>

      {/* 2. CATEGORY SELECTOR */}
      <Surface elevation={1} padding="sm">
        <div className="aferix-filter-chips-wrapper">
          <FilterChips 
            items={CATEGORIES}
            active={[activeCategory]}
            onChange={(active) => setActiveCategory(active[0] as ReportCategory || 'financeiro')}
            ariaLabel="Categoria"
          />
        </div>
      </Surface>

      {/* 3. DYNAMIC CONTENT */}
      <section className="aferix-d-flex aferix-flex-column aferix-gap-md">
        {activeCategory === 'financeiro' && (
          <>
            <SectionTitle title="Métricas Financeiras" eyebrow="DRE Resumido" />
            <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sz-sm)' }}>
              <MetricCard label="Faturamento Bruto" value={money(financeStats.totalRevenue)} />
              <MetricCard label="Custos de Obra" value={money(financeStats.totalCosts)} tone="danger" />
            </div>
            <MetricCard 
              label="Margem Média Histórica" 
              value={`${financeStats.avgMargin.toFixed(1)}%`} 
              tone={financeStats.avgMargin >= 20 ? 'success' : 'warning'}
            />
          </>
        )}

        {activeCategory === 'clientes' && (
          <>
            <SectionTitle title="Maiores Clientes" eyebrow="Por Faturamento" />
            <ListCard>
              {clientStats.length === 0 ? (
                <QueueEmptyState title="Vazio" />
              ) : visibleClientStats.map((c, i) => (
                <div key={i} className="aferix-p-md aferix-d-flex aferix-justify-between aferix-align-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  <div className="aferix-d-flex aferix-flex-column">
                    <strong className="aferix-font-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                    <small className="aferix-text-muted">{c.count} {c.count === 1 ? 'serviço' : 'serviços'}</small>
                  </div>
                  <strong className="tabular-nums" style={{ color: 'var(--brand-primary)', fontSize: '14px' }}>
                    {money(c.total)}
                  </strong>
                </div>
              ))}
              {clientStats.length > 5 && (
                <div className="aferix-p-sm aferix-text-center">
                  <Button variant="ghost" onClick={() => setShowAllClientStats((current) => !current)}>
                    {showAllClientStats ? 'Ver menos' : `Ver mais (${hiddenClientStatsCount})`}
                  </Button>
                </div>
              )}
            </ListCard>
          </>
        )}

        {activeCategory === 'operacao' && (
          <>
            <SectionTitle title="Funil Operacional" eyebrow="Performance" />
            <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sz-sm)' }}>
              <MetricCard 
                label="Serviços Concluídos" 
                value={financeRecords.length} 
              />
              <MetricCard 
                label="Taxa de Conversão" 
                value={`${savedBudgets.length > 0 ? ((savedBudgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO).length / savedBudgets.length) * 100).toFixed(0) : 0}%`} 
                tone="brand"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
