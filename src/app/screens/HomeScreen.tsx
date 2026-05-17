import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';
import { EmptyState, MetricCard, MoneyValue, PageHeader, PageShell, SectionHeader } from '../components/designSystem';
import { formatCompactCurrency } from '../../core/format/currency';

interface HomeScreenProps {
  goTo: (tab: AppTab) => void;
  captures: CalculationCapture[];
  clients: Client[];
  workOrders: WorkOrder[];
  savedBudgets: SavedBudgetRecord[];
  context: ActiveWorkContext;
  onStartNewAttendance: () => void;
}

export function HomeScreen({
  goTo,
  clients,
  workOrders,
  savedBudgets,
  context,
  onStartNewAttendance
}: HomeScreenProps) {
  const currentMonthBudgets = savedBudgets.filter(isBudgetFromCurrentMonth);
  const monthlyBudgetTotal = currentMonthBudgets.reduce((total, budget) => total + calculateSavedBudgetValue(budget), 0);
  const accountsReceivable = currentMonthBudgets.filter((budget) => budget.status === 'sent' || budget.status === 'approved').reduce((total, budget) => total + calculateSavedBudgetValue(budget), 0);
  
  const monthlyExpenses = currentMonthBudgets.reduce((total, budget) => {
    const materialEstimate = budget.materialCost ?? budget.items.filter((item) => item.category === 'material').reduce((itemTotal, item) => itemTotal + item.quantity * item.unitPrice, 0);
    return total + materialEstimate + (budget.operationalCost ?? 0) + budget.travelCost + budget.additionalFees;
  }, 0);
  
  const monthlyCashFlow = monthlyBudgetTotal - monthlyExpenses;
  const monthlyNetProfit = Math.max(monthlyCashFlow, 0);
  
  return (
    <PageShell className="aferix-dashboard-screen">
      <PageHeader
        title="Controle seu lucro"
        description="Gestão financeira simples para o seu dia a dia profissional."
        action={<button type="button" className="primary-action inline-action" onClick={onStartNewAttendance}>Novo orçamento</button>}
      />
      <ActiveWorkContextCard {...context} />

      <div className="metric-grid dashboard-metric-grid" aria-label="Resumo financeiro">
        <MetricCard label="Lucro no mês" value={<MoneyValue value={monthlyNetProfit} tone="success" />} tone="success" />
        <MetricCard label="A receber" value={<MoneyValue value={accountsReceivable} />} />
        <MetricCard label="Caixa" value={<MoneyValue value={monthlyCashFlow} />} />
      </div>

      <div className="home-action-toolbar compact-actions">
        <button type="button" className="ghost-action" onClick={() => goTo('clients')}>Atendimentos</button>
        <button type="button" className="ghost-action" onClick={() => goTo('financial')}>Financeiro</button>
        <button type="button" className="ghost-action" onClick={() => goTo('settings')}>Menu</button>
      </div>

      <section className="aferix-panel-card home-command-panel">
        <SectionHeader title="O que precisa de atenção" eyebrow="Atividades" />
        <div className="home-recent-strip">
          <div className="continuous-list">
            {workOrders.filter(w => w.status !== 'done' && w.status !== 'cancelled').length === 0 ? (
              <EmptyState title="Tudo em dia" description="Crie um novo orçamento para começar." />
            ) : (
              workOrders.filter(w => w.status !== 'done' && w.status !== 'cancelled').slice(0, 5).map(order => {
                const orderClient = clients.find(c => c.id === order.clientId);
                const orderBudget = savedBudgets.find(b => b.workOrderId === order.id);
                const budgetValue = orderBudget ? orderBudget.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) : 0;
                const createdAtDate = new Date(order.createdAt || Date.now());
                const timeString = isNaN(createdAtDate.getTime()) ? '--:--' : createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <article key={order.id} className="continuous-list-item" onClick={() => goTo('clients')}>
                    <span className="time-col">{timeString}</span>
                    <div className="client-col">
                      <strong>{orderClient?.name ?? 'Cliente Avulso'}</strong>
                      <small>{order.title}</small>
                    </div>
                    <em className="value-col">{formatCompactCurrency(budgetValue)}</em>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function calculateSavedBudgetValue(budget: SavedBudgetRecord): number {
  const subtotal = budget.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  return Math.max(0, subtotal + budget.travelCost + budget.additionalFees - budget.discount);
}

function isBudgetFromCurrentMonth(budget: SavedBudgetRecord): boolean {
  const referenceDate = new Date(budget.updatedAt);
  const now = new Date();
  return referenceDate.getFullYear() === now.getFullYear() && referenceDate.getMonth() === now.getMonth();
}
