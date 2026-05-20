import { useMemo, useState } from 'react';
import type { Client, WorkOrder, Budget } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { loadSavedBudgets, type SavedBudgetRecord } from '../../budgets/storage/savedBudgetsStorage';
import { loadSimpleFinanceRecords, type SimpleFinanceRecord } from '../../finance/storage/simpleFinanceStorage';
import { calculateServiceProfit } from '../../../core/finance/serviceProfit';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import './ReportWorkspace.css';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}

type ReportCategory = 'financeiro' | 'clientes' | 'serviços' | 'desempenho';

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function budgetRecordTotal(record: SavedBudgetRecord): number {
  const budget: Budget = {
    id: record.id,
    title: record.title,
    status: record.status,
    discount: record.discount,
    travelCost: record.travelCost,
    additionalFees: record.additionalFees,
    items: record.items,
  };
  try {
    return calculateBudgetTotal(budget);
  } catch {
    return 0;
  }
}

export function ReportWorkspace({ captures, activeClient = null, activeWorkOrder = null }: ReportWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('financeiro');
  
  const savedBudgets = useMemo(() => loadSavedBudgets(), []);
  const financeRecords = useMemo(() => loadSimpleFinanceRecords(), []);

  // Calculate Hero Data: Planned vs Actual
  const heroData = useMemo(() => {
    const plannedProfit = savedBudgets
      .filter(b => b.status === 'approved')
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
    return Array.from(clientMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [financeRecords]);

  return (
    <div className="report-workspace-container">
      {/* Hero Card: Planned vs Actual */}
      <section className="report-hero-card">
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
            <small style={{ fontSize: '0.65rem', color: 'var(--aferix-text-muted)' }}>
              {heroData.isPositive ? 'Acima do orçado' : 'Abaixo do orçado'}
            </small>
          </div>
        </div>
      </section>

      {/* Category Selector */}
      <nav className="report-category-selector">
        {[
          { id: 'financeiro', label: 'Financeiro', icon: '💰' },
          { id: 'clientes', label: 'Clientes', icon: '👤' },
          { id: 'serviços', label: 'Serviços', icon: '🛠️' },
          { id: 'desempenho', label: 'Desempenho', icon: '📈' }
        ].map((cat) => (
          <button 
            key={cat.id} 
            className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id as ReportCategory)}
          >
            <i>{cat.icon}</i>
            <span>{cat.label}</span>
          </button>
        ))}
      </nav>

      {/* Category Content */}
      <section className="report-category-content">
        {activeCategory === 'financeiro' && (
          <>
            <article className="report-stat-card">
              <div className="report-stat-info">
                <span>Faturamento Bruto</span>
                <strong>{money(financeStats.totalRevenue)}</strong>
              </div>
            </article>
            <article className="report-stat-card">
              <div className="report-stat-info">
                <span>Custos Operacionais</span>
                <strong className="tone-danger">{money(financeStats.totalCosts)}</strong>
              </div>
            </article>
            <article className="report-stat-card">
              <div className="report-stat-info">
                <span>Margem Média Líquida</span>
                <strong>{financeStats.avgMargin.toFixed(1)}%</strong>
              </div>
            </article>
          </>
        )}

        {activeCategory === 'clientes' && (
          <div className="aferix-panel-card">
            <header><h3>Maiores Clientes (Faturamento)</h3></header>
            <div className="ranking-list" style={{ marginTop: '1rem' }}>
              {clientStats.length === 0 ? (
                <p style={{ color: 'var(--aferix-text-muted)' }}>Nenhum dado de cliente disponível.</p>
              ) : clientStats.map((c, i) => (
                <div key={i} className="report-ranking-item">
                  <div className="client-col">
                    <strong>{c.name}</strong>
                    <small>{c.count} atendimentos</small>
                  </div>
                  <div className="value-col">
                    <strong>{money(c.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'serviços' && (
          <>
            <article className="report-stat-card">
              <div className="report-stat-info">
                <span>Serviços Concluídos</span>
                <strong>{financeRecords.filter(r => r.status === 'realized').length}</strong>
              </div>
            </article>
            <article className="report-stat-card">
              <div className="report-stat-info">
                <span>Orçamentos Aguardando</span>
                <strong>{savedBudgets.filter(b => b.status === 'sent').length}</strong>
              </div>
            </article>
          </>
        )}

        {activeCategory === 'desempenho' && (
          <article className="report-stat-card">
            <div className="report-stat-info">
              <span>Taxa de Aprovação</span>
              <strong>
                {savedBudgets.length > 0 
                  ? ((savedBudgets.filter(b => b.status === 'approved').length / savedBudgets.length) * 100).toFixed(0) 
                  : 0}%
              </strong>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
