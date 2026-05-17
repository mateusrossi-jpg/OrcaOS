import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { EmptyState, MetricCard, MoneyValue, PageHeader, PageShell, SectionHeader } from '../components/designSystem';
import { formatCompactCurrency, formatCurrency } from '../../core/format/currency';

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
    <PageShell className="aferix-dashboard-screen">
      <header className="home-hero-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Controle seu lucro</h1>
          <p style={{ color: 'var(--aferix-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Resumo financeiro e operacional das suas atividades.</p>
        </div>
        <button type="button" className="primary-action" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 700 }} onClick={onStartNewAttendance}>
          + Novo Orçamento
        </button>
      </header>

      <section className="aferix-panel-card" style={{ marginBottom: '1.5rem' }}>
        <SectionHeader title="Resultado no Mês" eyebrow="Financeiro" />
        <div className="metric-grid dashboard-metric-grid">
          <MetricCard label="Lucro Líquido" value={<MoneyValue value={profit} tone="success" />} tone="success" />
          <MetricCard label="Entradas" value={<MoneyValue value={revenue} />} />
          <MetricCard label="Saídas" value={<MoneyValue value={expenses} tone="danger" />} />
        </div>
      </section>

      <div className="home-action-toolbar compact-actions">
        <button type="button" className="ghost-action" onClick={() => goTo('clients')}>Clientes</button>
        <button type="button" className="ghost-action" onClick={() => goTo('financial')}>Financeiro</button>
        <button type="button" className="ghost-action" onClick={() => goTo('settings')}>Mais</button>
      </div>

      <section className="aferix-panel-card home-command-panel">
        <SectionHeader title="Atenção Necessária" eyebrow="Operação" />
        
        <div className="status-highlights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="highlight-card" onClick={() => goTo('budgets')} style={{ padding: '1rem', background: 'var(--aferix-surface-active)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: pendingBudgets.length > 0 ? 'var(--aferix-primary)' : 'inherit' }}>{pendingBudgets.length}</strong>
            <small style={{ color: 'var(--aferix-text-muted)', fontSize: '0.75rem' }}>Orçamentos<br/>Aguardando</small>
          </div>
          <div className="highlight-card" onClick={() => goTo('clients')} style={{ padding: '1rem', background: 'var(--aferix-surface-active)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: activeServices.length > 0 ? 'var(--aferix-primary)' : 'inherit' }}>{activeServices.length}</strong>
            <small style={{ color: 'var(--aferix-text-muted)', fontSize: '0.75rem' }}>Serviços em<br/>Execução</small>
          </div>
          <div className="highlight-card" onClick={() => goTo('clients')} style={{ padding: '1rem', background: 'var(--aferix-surface-active)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: pendingPayments.length > 0 ? 'var(--aferix-danger, #ef4444)' : 'inherit' }}>{pendingPayments.length}</strong>
            <small style={{ color: 'var(--aferix-text-muted)', fontSize: '0.75rem' }}>Pagamentos<br/>Pendentes</small>
          </div>
        </div>

        <div className="home-recent-strip">
          <div className="continuous-list">
            {activeServices.length === 0 ? (
              <EmptyState title="Tudo em dia" description="Crie um novo orçamento para começar." />
            ) : (
              activeServices.slice(0, 5).map(order => {
                const orderClient = clients.find(c => c.id === order.clientId);
                return (
                  <article key={order.id} className="continuous-list-item" onClick={() => goTo('clients')}>
                    <div className="client-col">
                      <strong>{orderClient?.name ?? 'Cliente Avulso'}</strong>
                      <small>{order.title}</small>
                    </div>
                    <em className="value-col" style={{ fontSize: '0.75rem', color: 'var(--aferix-primary)' }}>Em execução</em>
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
