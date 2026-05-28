import { useMemo } from 'react';
import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { PageShell, PageHeader, QueueEmptyState, ListItem, ListCard, StatusBadge, SectionTitle, MoneyValue, ActionMenu, MetricCard, PrimaryButton } from '../components/ui';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import type { Budget } from '../../domain/budget';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading, deleteBudget } = useBudgetHistory();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      await deleteBudget(id);
    }
  };

  // 3. Atividade Recente: Lista enxuta (max 3 a 5 itens)
  const recentBudgets = (budgets || []).slice(0, 5);

  const monthlyProfit = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return (budgets || [])
      .filter(b => new Date(b.updatedAt) >= startOfMonth && b.status !== 'cancelado')
      .reduce((acc, b) => acc + (calculateBudget(b).lucroBruto), 0);
  }, [budgets]);

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="Painel" />
        <div className="empty-state-card">
          <strong>Carregando...</strong>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-home-screen">
      <div className="home-hero-header aferix-mb-lg">
        <PageHeader 
          title="Olá, Profissional" 
          sourceLabel="Seu resumo operacional de hoje."
          action={
            <div className="aferix-d-flex aferix-gap-sm">
              <PrimaryButton onClick={() => onNavigate('new-budget')}>
                + Orçamento
              </PrimaryButton>
            </div>
          }
        />
      </div>

      <div className="home-finance-overview aferix-mb-xl">
        <div className="aferix-grid-4">
          <MetricCard 
            label="Lucro do Mês (Est.)" 
            value={<MoneyValue value={monthlyProfit} />} 
            tone="brand"
            featured
          />
          <MetricCard 
            label="Orçamentos Ativos" 
            value={budgets.filter(b => b.status === 'iniciado' || b.status === 'enviado').length} 
          />
          <MetricCard 
            label="Em Execução" 
            value={budgets.filter(b => b.status === 'em_execucao').length} 
          />
          <MetricCard 
            label="Histórico Total" 
            value={budgets.length} 
          />
        </div>
      </div>

      {recentBudgets.length === 0 ? (
        <QueueEmptyState
          title="Nenhuma atividade"
          meta="Seus orçamentos recentes aparecerão aqui para acesso rápido."
          action={null}
        />
      ) : (
        <div className="home-recent-activity">
          <SectionTitle title="Atividade Recente" />
          <ListCard>
            {recentBudgets.map((budget) => (
              <ListItem
                key={budget.id}
                onClick={() => onSelectBudget?.(budget)}
                title={budget.title || 'Sem título'}
                context={budget.clientName || 'Cliente não informado'}
                status={<StatusBadge status={budget.status} syncStatus={budget.syncStatus} />}
                value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
                action={
                  <ActionMenu
                    label="…"
                    items={[
                      { id: 'open', label: 'Abrir', onSelect: () => onSelectBudget?.(budget) },
                      { id: 'delete', label: 'Excluir', tone: 'danger', onSelect: () => handleDelete(budget.id) },
                    ]}
                  />
                }
              />
            ))}
          </ListCard>
        </div>
      )}

      <style>{`
        .aferix-grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        @media (max-width: 768px) {
          .aferix-grid-4 {
            grid-template-columns: 1fr 1fr;
          }
        }

        .home-recent-activity {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          width: 100%;
        }
      `}</style>
    </PageShell>
  );
}
