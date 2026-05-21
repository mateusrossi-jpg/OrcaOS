import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculateServiceProfit } from '../../core/finance/serviceProfit';
import { isBudgetPendingAction, isBudgetRevenueRecognized } from '../../core/finance/budgetLifecycle';
import { EmptyState, MetricCard, MoneyValue, PageShell, SectionHeader } from '../components/designSystem';
import { PageHeader } from '../components/ui';

interface HomeScreenProps {
  goTo: (tab: AppTab) => void;
  captures: CalculationCapture[];
  clients: Client[];
  workOrders: WorkOrder[];
  savedBudgets: SavedBudgetRecord[];
  context: ActiveWorkContext;
  onStartNewAttendance: () => void;
  onSelectBudget?: (budget: SavedBudgetRecord) => void;
}

export function HomeScreen({
  goTo,
  workOrders,
  savedBudgets,
  onSelectBudget
}: HomeScreenProps) {
  const currentMonthBudgets = savedBudgets.filter(isBudgetFromCurrentMonth);

  const revenue = currentMonthBudgets
    .filter((b) => isBudgetRevenueRecognized(b.status))
    .reduce((acc, b) => acc + calculateSavedBudgetValue(b), 0);

  const expenses = currentMonthBudgets.reduce((total, budget) => {
    const materialEstimate = budget.materialCost ?? budget.items
      .filter((item) => item.category === 'material')
      .reduce((itemTotal, item) => itemTotal + item.quantity * item.unitPrice, 0);
    return total + materialEstimate + (budget.operationalCost ?? 0) + budget.travelCost + budget.additionalFees;
  }, 0);

  const profit = Math.max(revenue - expenses, 0);

  const pendingBudgets = savedBudgets.filter((b) => isBudgetPendingAction(b.status));
  const activeServices = workOrders.filter(w => w.status === 'in-progress');
  const pendingPayments = workOrders.filter(w => w.paymentStatus === 'pending' || w.paymentStatus === 'partial');
  const recentClosings = savedBudgets.filter((b) => b.status === 'finalizado').slice(0, 4);

  return (
    <PageShell className="aferix-dashboard-screen">
      <PageHeader
        title="Controle seu lucro"
        description="Visão geral do seu negócio."
      />

      <section className="aferix-panel-card home-finance-overview">
        <SectionHeader title="Resultado no Mês" eyebrow="Financeiro" />
        <div className="metric-grid dashboard-metric-grid">
          <MetricCard label="Lucro Líquido" value={<MoneyValue value={profit} />} tone="brand" featured />
          <MetricCard label="Entradas" value={<MoneyValue value={revenue} />} />
          <MetricCard label="Saídas" value={<MoneyValue value={expenses} tone="danger" />} />
        </div>
      </section>

      <section className="home-operations-grid">
        <div className="aferix-panel-card home-command-panel">
          <SectionHeader title="Status Operacional" eyebrow="Operação" />
          <div className="status-compact-list">
            <button className="status-compact-item" type="button" onClick={() => goTo('budgets')}>
              <span className="status-label">Orçamentos aguardando</span>
              <strong className="status-value">{pendingBudgets.length}</strong>
            </button>
            <div className="status-compact-item">
              <span className="status-label">Serviços em execução</span>
              <strong className="status-value">{activeServices.length}</strong>
            </div>
            <div className="status-compact-item">
              <span className="status-label">Pagamentos pendentes</span>
              <strong className="status-value">{pendingPayments.length}</strong>
            </div>
          </div>
        </div>

        <div className="aferix-panel-card home-recent-strip">
          <SectionHeader title="Orçamentos finalizados recentes" eyebrow="Resultado" />
          <div className="continuous-list">
            {recentClosings.length === 0 ? (
              <EmptyState title="Nenhum orçamento finalizado" description="Quando um orçamento for finalizado, o resultado aparecerá aqui automaticamente." />
            ) : (
              recentClosings.map((record) => {
                const profitRecord = calculateServiceProfit({
                  receivedAmount: calculateSavedBudgetValue(record),
                  materialCost: record.materialCost ?? 0,
                  travelCost: record.travelCost,
                  cardFee: 0,
                  estimatedTax: 0,
                  otherCosts: (record.additionalFees || 0) + (record.operationalCost || 0),
                });
                return (
                  <article key={record.id} className="continuous-list-item home-compact-row">
                    <div className="client-col">
                      <strong>{record.title}</strong>
                      <small>{record.clientName || 'Cliente final'}</small>
                    </div>
                    <div className="value-col align-right">
                      <MoneyValue value={profitRecord.netProfit} tone={profitRecord.netProfit >= 0 ? 'success' : 'danger'} compact />
                      <small className="tone-success">Finalizado</small>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="aferix-panel-card home-recent-strip">
          <SectionHeader title="Orçamentos pendentes" eyebrow="Vendas" />
          <div className="continuous-list">
            {pendingBudgets.length === 0 ? (
              <EmptyState title="Sem pendências" description="Orçamentos enviados aparecem aqui." />
            ) : (
              pendingBudgets.slice(0, 4).map((budget) => (
                <article key={budget.id} className="continuous-list-item home-compact-row clickable-row" onClick={() => onSelectBudget?.(budget)}>
                  <div className="client-col">
                    <strong className="home-budget-client">{budget.clientName || 'Cliente Avulso'}</strong>
                    <small className="home-budget-title">{budget.title || 'Orçamento sem título'}</small>
                  </div>
                  <em className="value-col">Orçamento enviado</em>
                </article>
              ))
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
