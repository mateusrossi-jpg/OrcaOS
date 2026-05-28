import { useEffect, useMemo, useState } from 'react';
import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { useBudgetHistory } from '../../../hooks/useBudgetHistory';
import { BUDGET_STATUS } from '../../../domain/budget';
import { FinanceFacade, type ConsolidatedFinanceRecord } from '../../finance/financeFacade';
import { ProfileFacade } from '../../settings/profileFacade';
import { 
  MetricCard, 
  Surface, 
  ListCard, 
  ListItem, 
  FilterChips, 
  QueueEmptyState,
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

export function ReportWorkspace({ captures: _captures, activeClient: _activeClient = null, activeWorkOrder: _activeWorkOrder = null }: ReportWorkspaceProps) {
  const [showAllClientStats, setShowAllClientStats] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');
  
  const { budgets: savedBudgets, isLoading } = useBudgetHistory();
  const [financeRecords, setFinanceRecords] = useState<ConsolidatedFinanceRecord[]>([]);
  const [profileName, setProfileName] = useState('Profissional');

  useEffect(() => {
    let active = true;
    async function loadProfileName() {
      const profile = await ProfileFacade.getProfile();
      if (!active) return;
      setProfileName(profile.businessName || profile.professionalName || 'Profissional');
    }

    void loadProfileName();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadFinance() {
      const records = await FinanceFacade.getRealizedRecords();
      if (active) setFinanceRecords(records);
    }
    void loadFinance();
    return () => { active = false; };
  }, [savedBudgets]); // Reload if budgets change

  // Calculate Hero Data: Planned vs Actual
  const heroData = useMemo(() => {
    const plannedProfit = savedBudgets
      .filter(b => b.status === BUDGET_STATUS.FINALIZADO)
      .reduce((sum, b) => sum + (b.financialSnapshot?.lucroBruto || 0), 0);
    
    const actualProfit = financeRecords.reduce((sum, r) => sum + r.netProfit, 0);

    const delta = actualProfit - plannedProfit;
    const isPositive = delta >= 0;

    return { plannedProfit, actualProfit, delta, isPositive };
  }, [savedBudgets, financeRecords]);

  // Category specific data
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
      <div className="report-workspace-container">
        <Surface>
          <div className="loading-state-placeholder">Carregando dados financeiros...</div>
        </Surface>
      </div>
    );
  }

  return (
    <div className="report-workspace-container">
      {/* Hero Card: Planned vs Actual */}
      <Surface className="report-hero-card">
        <div className="hero-main-metric">
          <span>Lucro Realizado (Geral)</span>
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
      </Surface>

      {/* Category Selector */}
      <Surface className="report-category-nav">
        <FilterChips 
          items={CATEGORIES}
          active={[activeCategory]}
          onChange={(active) => setActiveCategory(active[0] || 'financeiro')}
          ariaLabel="Selecionar categoria de relatório"
        />
      </Surface>

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
              label="Minha Margem Média" 
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
              value={financeRecords.length} 
            />
            <MetricCard 
              label="Orçamentos Enviados" 
              value={savedBudgets.filter(b => b.status === BUDGET_STATUS.ENVIADO).length} 
              tone="brand"
            />
          </div>
        )}

        {activeCategory === 'desempenho' && (
          <div className="metric-grid">
            <MetricCard 
              label="Taxa de Aprovação" 
              value={`${savedBudgets.length > 0 ? ((savedBudgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO).length / savedBudgets.length) * 100).toFixed(0) : 0}%`} 
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
