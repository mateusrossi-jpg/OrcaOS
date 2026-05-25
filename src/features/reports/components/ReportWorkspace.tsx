import { useMemo, useState } from 'react';
import type { Client, WorkOrder, Budget } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { loadSavedBudgets, type SavedBudgetRecord } from '../../budgets/storage/savedBudgetsStorage';
import { loadSimpleFinanceRecords, type SimpleFinanceRecord } from '../../finance/storage/simpleFinanceStorage';
import { loadProfessionalProfile } from '../../settings/storage/professionalProfileStorage';
import { calculateServiceProfit } from '../../../core/finance/serviceProfit';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import { 
  MetricCard, 
  PanelCard, 
  ListCard, 
  ListItem, 
  FilterChips, 
  QueueEmptyState,
  MoneyValue,
  Button
} from '../../../app/components/ui';
import './ReportWorkspace.css';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}

type ReportCategory = 'financeiro' | 'clientes' | 'serviços' | 'desempenho';

const CATEGORIES: Array<{ id: ReportCategory; label: string }> = [
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'serviços', label: 'Serviços' },
  { id: 'desempenho', label: 'Desempenho' }
];

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function ReportWorkspace({ captures, activeClient = null, activeWorkOrder = null }: ReportWorkspaceProps) {
  const [showAllClientStats, setShowAllClientStats] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');
  
  const savedBudgets = useMemo(() => loadSavedBudgets(), []);
  const financeRecords = useMemo(() => loadSimpleFinanceRecords(), []);
  const profile = useMemo(() => loadProfessionalProfile(), []);

  const profileName = profile.businessName || profile.professionalName || 'Profissional';

  // Calculate Hero Data: Planned vs Actual
  const heroData = useMemo(() => {
    const plannedProfit = savedBudgets
      .filter(b => b.status === 'finalizado')
      .reduce((sum, b) => sum + (b.lucro_liquido || 0), 0);
    
    const actualProfit = financeRecords
      .filter(r => r.status === 'realized')
      .reduce((sum, r) => sum + calculateServiceProfit(r).netProfit, 0);

    const delta = actualProfit - plannedProfit;
    const isPositive = delta >= 0;

    return { plannedProfit, actualProfit, delta, isPositive };
  }, [savedBudgets, financeRecords]);

  // Category specific data
  const financeStats = useMemo(() => {
    const realized = financeRecords.filter(r => r.status === 'realized');
    const totalRevenue = realized.reduce((sum, r) => sum + r.receivedAmount, 0);
    const totalCosts = realized.reduce((sum, r) => {
      const p = calculateServiceProfit(r);
      return sum + p.directCosts;
    }, 0);
    const avgMargin = realized.length > 0
      ? realized.reduce((sum, r) => sum + calculateServiceProfit(r).netMarginPercent, 0) / realized.length
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

  return (
    <div className="report-workspace-container">
      {/* Hero Card: Planned vs Actual */}
      <PanelCard className="report-hero-card">
        <div className="hero-main-metric">
          <span>Lucro Realizado (Mês)</span>
          <strong>{money(heroData.actualProfit)}</strong>
        </div>
        <div className="hero-comparison-grid">
          <div className="comparison-item">
            <span>Lucro Previsto</span>
            <strong>{money(heroData.plannedProfit)}</strong>
          </div>
          <div className="comparison-item">
            <span>Diferença</span>
            <div className={`comparison-delta ${heroData.isPositive ? 'delta-positive' : 'delta-negative'}`}>
              {heroData.isPositive ? '▲' : '▼'} {money(Math.abs(heroData.delta))}
            </div>
            <small className="comparison-note">{heroData.isPositive ? 'Acima do orçado' : 'Abaixo do orçado'}</small>
          </div>
        </div>
      </PanelCard>

      {/* Category Selector */}
      <PanelCard className="report-category-nav">
        <FilterChips 
          items={CATEGORIES}
          active={[activeCategory]}
          onChange={(active) => setActiveCategory(active[0] || 'financeiro')}
          ariaLabel="Selecionar categoria de relatório"
        />
      </PanelCard>

      {/* Category Content */}
      <section className="report-category-content">
        {activeCategory === 'financeiro' && (
          <div className="metric-grid">
            <MetricCard 
              label="Faturamento Bruto" 
              value={money(financeStats.totalRevenue)} 
            />
            <MetricCard 
              label="Custos Operacionais" 
              value={money(financeStats.totalCosts)} 
              tone="danger"
            />
            <MetricCard 
              label="Margem Média Líquida" 
              value={`${financeStats.avgMargin.toFixed(1)}%`} 
              tone={financeStats.avgMargin >= 0 ? 'brand' : 'danger'}
            />
          </div>
        )}

        {activeCategory === 'clientes' && (
          <ListCard title="Maiores Clientes (Faturamento)">
            {clientStats.length === 0 ? (
              <QueueEmptyState title="Nenhum dado disponível" meta="Nenhum dado de cliente disponível para exibição." />
            ) : visibleClientStats.map((c, i) => (
              <ListItem 
                key={i}
                title={c.name}
                context={`${c.count} atendimentos`}
                value={<strong>{money(c.total)}</strong>}
              />
            ))}
                      {clientStats.length > 5 && (
              <div className="report-list-expand-wrap">
                <Button
                  variant="ghost"
                  className="density-toggle-cta"
                  onClick={() => setShowAllClientStats((current) => !current)}
                >
                  {showAllClientStats ? 'Ver menos' : `Ver mais (${hiddenClientStatsCount})`}
                </Button>
              </div>
            )}
          </ListCard>
        )}

        {activeCategory === 'serviços' && (
          <div className="metric-grid">
            <MetricCard 
              label="Serviços Concluídos" 
              value={financeRecords.filter(r => r.status === 'realized').length} 
            />
            <MetricCard 
              label="Orçamentos Enviados" 
              value={savedBudgets.filter(b => b.status === 'enviado').length} 
              tone="brand"
            />
          </div>
        )}

        {activeCategory === 'desempenho' && (
          <div className="metric-grid">
            <MetricCard 
              label="Taxa de Aprovação" 
              value={`${savedBudgets.length > 0 ? ((savedBudgets.filter(b => b.status === 'finalizado').length / savedBudgets.length) * 100).toFixed(0) : 0}%`} 
              tone="brand"
              featured
            />
          </div>
        )}
      </section>

      {/* Hidden Print/Document Preview for QA compliance */}
      <div className="report-document-premium report-document-hidden">
        <header className="report-doc-header">
          {profileName === 'Aferix' ? (
            <img className="report-doc-logo" src="/icons/aferix-wordmark-document.svg" alt="Aferix" />
          ) : (
            <div className="doc-branding">
              <img className="report-doc-logo-sub" src="/icons/aferix-wordmark-document.svg" alt="Aferix" />
              <h2>{profileName}</h2>
            </div>
          )}
        </header>
        <QueueEmptyState title="Relatório Completo" meta="Selecione um período para gerar o documento completo." />
      </div>
    </div>
  );
}
