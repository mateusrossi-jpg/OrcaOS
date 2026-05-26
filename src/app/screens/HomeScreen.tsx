import { useState, useEffect, useMemo } from 'react';
import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import {
  PageShell,
  PageHeader,
  PanelCard,
  MetricCard,
  MoneyValue,
  QueueEmptyState,
  ListItem,
  StatusBadge,
  PrimaryButton,
  SectionTitle,
  ContextBanner,
  ListCard,
} from '../components/ui';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import type { Budget } from '../../domain/budget';
import { FinanceFacade, type ConsolidatedFinanceRecord } from '../../features/finance/financeFacade';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();
  const [financeRecords, setFinanceRecords] = useState<ConsolidatedFinanceRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const records = await FinanceFacade.getRealizedRecords();
      if (active) setFinanceRecords(records);
    }
    void load();
    return () => { active = false; };
  }, []);

  const now = new Date();
  const currentMonthBudgets = useMemo(() => budgets.filter((b) => {
    const d = new Date(b.updatedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }), [budgets, now]);

  const inProgressBudgets = useMemo(() => budgets.filter(
    (b) => b.status !== 'finalizado' && b.status !== 'recusado' && b.status !== 'arquivado',
  ), [budgets]);

  const activeBudget = inProgressBudgets.length > 0 ? inProgressBudgets[0] : null;

  const finalizedThisMonth = useMemo(() => currentMonthBudgets.filter((b) => b.status === 'finalizado'), [currentMonthBudgets]);
  
  const profitThisMonth = useMemo(() => financeRecords.reduce((acc, r) => {
    const d = new Date(r.updatedAt);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      return acc + r.netProfit;
    }
    return acc;
  }, 0), [financeRecords, now]);

  const recentBudgets = budgets.slice(0, 5);

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="Resumo" />
        <div className="empty-state-card">
          <strong>Carregando sua operação...</strong>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-operational-screen">
      <PageHeader 
        title="Hoje no Aferix" 
        action={
          <PrimaryButton onClick={() => onNavigate('new-budget')}>
            Novo orçamento
          </PrimaryButton>
        }
      />

      <div className="home-dashboard-layout">
        <PanelCard className="operational-metrics-panel">
          <div className="metric-grid compact-metric-grid">
            <MetricCard 
              label="Em andamento" 
              value={inProgressBudgets.length} 
              tone="brand"
            />
            <MetricCard 
              label="Finalizados (mês)" 
              value={finalizedThisMonth.length} 
            />
            <MetricCard
              label="Lucro (mês)"
              value={<MoneyValue value={profitThisMonth} tone={profitThisMonth >= 0 ? 'success' : 'danger'} compact />}
            />
          </div>
        </PanelCard>

        {activeBudget && (
          <div className="home-active-work-section">
            <SectionTitle title="Continuar trabalho" eyebrow="Última atualização" />
            <ContextBanner
              title={activeBudget.title || 'Orçamento sem título'}
              meta={`${activeBudget.clientName || 'Cliente não informado'} • ${new Date(activeBudget.updatedAt).toLocaleDateString()}`}
              icon={<span className="nav-icon">📄</span>}
              actionLabel="Retomar"
              onAction={() => onSelectBudget?.(activeBudget)}
            />
          </div>
        )}

        {budgets.length === 0 ? (
          <QueueEmptyState
            title="Sua operação começa aqui"
            icon="🚀"
            meta="Crie seu primeiro orçamento para começar a gerenciar seus ganhos com precisão."
            action={<PrimaryButton onClick={() => onNavigate('new-budget')}>Criar primeiro orçamento</PrimaryButton>}
          />
        ) : (
          <div className="home-recent-activity">
            <SectionTitle 
              title="Últimos orçamentos" 
              action={
                <button className="ghost-action" onClick={() => onNavigate('work-history')}>
                  Ver todos
                </button>
              }
            />
            <ListCard>
              {recentBudgets.map((budget) => (
                <ListItem
                  key={budget.id}
                  onClick={() => onSelectBudget?.(budget)}
                  title={budget.title || 'Sem título'}
                  context={budget.clientName || 'Cliente não informado'}
                  status={<StatusBadge status={budget.status} />}
                  value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
                />
              ))}
            </ListCard>
          </div>
        )}
      </div>

      <style>{`
        .home-dashboard-layout {
          display: grid;
          gap: 24px;
        }
        
        .operational-metrics-panel {
          padding: 16px !important;
        }
        
        @media (max-width: 768px) {
          .home-dashboard-layout {
            gap: 20px;
          }
        }
      `}</style>
    </PageShell>
  );
}
