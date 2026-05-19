import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { EmptyState, MetricCard, MoneyValue, PageShell, SectionHeader } from '../components/designSystem';
import './HomeScreen.css';

interface HomeScreenProps {
  goTo: (tab: AppTab) => void;
  captures: CalculationCapture[];
  clients: Client[];
  workOrders: WorkOrder[];
  savedBudgets: SavedBudgetRecord[];
  context: ActiveWorkContext;
  onStartNewAttendance: () => void;
  onBudgetOpen: (budgetId: string) => void;
}

export function HomeScreen({
  goTo,
  clients,
  workOrders,
  savedBudgets,
  onStartNewAttendance,
  onBudgetOpen
}: HomeScreenProps) {
  const currentMonthBudgets = savedBudgets.filter(isBudgetFromCurrentMonth);
  
  // Financeiro
  const revenue = currentMonthBudgets.filter((b) => b.status === 'approved').reduce((acc, b) => acc + calculateSavedBudgetValue(b), 0);
  const expenses = currentMonthBudgets.reduce((total, budget) => {
    const materialEstimate = budget.materialCost ?? budget.items.filter((item) => item.category === 'material').reduce((itemTotal, item) => itemTotal + item.quantity * item.unitPrice, 0);
    return total + materialEstimate + (budget.operationalCost ?? 0) + budget.travelCost + budget.additionalFees;
  }, 0);
  const profit = Math.max(revenue - expenses, 0);

  // Status
  const pendingBudgets = savedBudgets.filter(b => b.status === 'sent');
  const activeServices = workOrders.filter(w => w.status === 'in-progress');
  const pendingPayments = workOrders.filter(w => w.paymentStatus === 'pending' || w.paymentStatus === 'partial');

  return (
    <PageShell className="aferix-dashboard-screen home-screen-mobile">
      <header className="home-hero-header">
        <div className="home-hero-title">
          <h1>Controle seu lucro</h1>
          <p>Resumo financeiro e operacional das suas atividades.</p>
        </div>
        <button type="button" className="primary-action hero-new-budget" onClick={onStartNewAttendance}>
          + Novo Orçamento
        </button>
      </header>

      <section className="aferix-panel-card results-month-panel">
        <SectionHeader title="Resultado no Mês" eyebrow="Financeiro" />
        <div className="metric-grid dashboard-metric-grid">
          <MetricCard label="Lucro Líquido" value={<MoneyValue value={profit} tone="success" />} tone="success" featured />
          <MetricCard label="Entradas" value={<MoneyValue value={revenue} />} />
          <MetricCard label="Saídas" value={<MoneyValue value={expenses} tone="danger" />} />
        </div>
      </section>

      <div className="home-action-toolbar compact-actions">
        <button type="button" className="ghost-action" onClick={() => goTo('clients')}>Clientes</button>
        <button type="button" className="ghost-action" onClick={() => goTo('financial')}>Financeiro</button>
        <button type="button" className="ghost-action" onClick={() => goTo('settings')}>Menu</button>
      </div>

      <section className="aferix-panel-card home-command-panel">
        <SectionHeader title="Atenção Necessária" eyebrow="Operação" />
        
        <div className="status-highlights-grid">
          <div className="highlight-card" onClick={() => goTo('budgets')}>
            <strong className={pendingBudgets.length > 0 ? 'active' : ''}>{pendingBudgets.length}</strong>
            <small>Propostas<br/>Enviadas</small>
          </div>
          <div className="highlight-card" onClick={() => goTo('work-orders')}>
            <strong className={activeServices.length > 0 ? 'active' : ''}>{activeServices.length}</strong>
            <small>Serviços em<br/>Execução</small>
          </div>
          <div className="highlight-card" onClick={() => goTo('financial')}>
            <strong className={pendingPayments.length > 0 ? 'danger' : ''}>{pendingPayments.length}</strong>
            <small>Pagamentos<br/>Pendentes</small>
          </div>
        </div>

        <div className="home-recent-lists">
          {pendingBudgets.length > 0 && (
            <div className="recent-list-group">
              <span className="orca-kicker">Propostas Pendentes</span>
              <div className="continuous-list">
                {pendingBudgets.slice(0, 3).map(budget => (
                  <article key={budget.id} className="continuous-list-item" onClick={() => onBudgetOpen(budget.id)}>
                    <div className="client-col">
                      <strong>{budget.title}</strong>
                      <small>{budget.clientName || 'Cliente Avulso'}</small>
                    </div>
                    <div className="value-col">
                      <MoneyValue value={calculateSavedBudgetValue(budget)} compact />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="recent-list-group">
            <span className="orca-kicker">Serviços em Execução</span>
            <div className="continuous-list">
              {activeServices.length === 0 ? (
                <EmptyState title="Tudo em dia" description="Crie um novo orçamento para começar." />
              ) : (
                activeServices.slice(0, 5).map(order => {
                  const orderClient = clients.find(c => c.id === order.clientId);
                  return (
                    <article key={order.id} className="continuous-list-item" onClick={() => goTo('work-orders')}>
                      <div className="client-col">
                        <strong>{order.title}</strong>
                        <small>{orderClient?.name ?? 'Cliente Avulso'}</small>
                      </div>
                      <em className="status-pill execution">Execução</em>
                    </article>
                  );
                })
              )}
            </div>
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
