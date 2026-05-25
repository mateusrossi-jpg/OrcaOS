import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import {
  PageShell,
  PageHeader,
  PanelCard,
  MetricCard,
  MoneyValue,
  QueueEmptyState,
  ListCard,
  ListItem,
  StatusBadge,
} from '../components/ui';

import type { Budget, BUDGET_STATUS } from '../../domain/budget';
interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();

  const now = new Date();
  const currentMonthBudgets = budgets.filter((b) => {
    const d = new Date(b.updatedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const inProgressCount = budgets.filter(
    (b) => b.status !== 'finalizado' && b.status !== 'recusado',
  ).length;

  const finalizedThisMonth = currentMonthBudgets.filter((b) => b.status === 'finalizado');
  const finalizedCount = finalizedThisMonth.length;

  const calculateSavedBudgetValue = (budget: Budget) => {
    const subtotal = (budget.items ?? []).reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    return Math.max(0, subtotal + (budget.travelCost ?? 0) + (budget.fees ?? 0) - (budget.discounts ?? 0));
  };

  const profitThisMonth = finalizedThisMonth.reduce((acc, b) => {
    const revenue = calculateSavedBudgetValue(b);
    const material = b.materialCost ?? (b.items ?? []).filter((i) => i.category === 'material')
      .reduce((t, i) => t + i.quantity * i.unitPrice, 0);
    const expenses = material + (b.helperCost ?? 0) + (b.travelCost ?? 0) + (b.fees ?? 0);
    return acc + (revenue - expenses);
  }, 0);

  const recentBudgets = budgets.slice(0, 3);

  return (
    <PageShell className="aferix-operational-screen">
      <PageHeader title="Hoje no Aferix" />

      <PanelCard className="operational-main-metrics">
        <div className="metric-grid compact-metric-grid">
          <MetricCard label="Em andamento" value={<strong>{inProgressCount}</strong>} />
          <MetricCard label="Finalizados este mês" value={<strong>{finalizedCount}</strong>} />
          <MetricCard
            label="Lucro deste mês"
            value={<MoneyValue value={profitThisMonth} tone={profitThisMonth >= 0 ? 'success' : 'danger'} compact />}
          />
        </div>
        <button className="primary-button" onClick={() => onNavigate('new-budget')}>Novo orçamento</button>
      </PanelCard>

      {budgets.length === 0 ? (
        <QueueEmptyState
          title="Comece criando seu primeiro orçamento."
          action={<button className="primary-button" onClick={() => onNavigate('new-budget')}>Criar orçamento</button>}
        />
      ) : (
        <ListCard title="Últimos orçamentos">
          {recentBudgets.map((budget) => (
            <ListItem
              key={budget.id}
              onClick={() => onSelectBudget?.(budget)}
              title={budget.title || 'Sem título'}
              context={<StatusBadge status={budget.status} />}
              value={<MoneyValue value={calculateSavedBudgetValue(budget)} compact />}
            />
          ))}
        </ListCard>
      )}
    </PageShell>
  );
}
