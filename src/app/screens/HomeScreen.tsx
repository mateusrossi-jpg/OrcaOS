import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculateServiceProfit } from '../../core/finance/serviceProfit';
import { loadSimpleFinanceRecords } from '../../features/finance/storage/simpleFinanceStorage';
import { EmptyState, MetricCard, MoneyValue, PageShell, SectionHeader } from '../components/designSystem';

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
  const recentClosings = loadSimpleFinanceRecords().slice(0, 4);

  return (
    <PageShell className="aferix-dashboard-screen">
      <header className="screen-header home-hero-header">
        <div>
          <h1>Controle seu lucro</h1>
        </div>
      </header>

      <section className="aferix-panel-card home-finance-overview">
        <SectionHeader title="Resultado no Mês" eyebrow="Financeiro" />
        <div className="metric-grid dashboard-metric-grid">
          <MetricCard label="Lucro Líquido" value={<MoneyValue value={profit} tone="success" />} tone="success" />
          <MetricCard label="Entradas" value={<MoneyValue value={revenue} />} />
          <MetricCard label="Saídas" value={<MoneyValue value={expenses} tone="danger" />} />
        </div>
      </section>

      <section className="home-operations-grid">
        <div className="aferix-panel-card home-command-panel">
          <SectionHeader title="Atenção Necessária" eyebrow="Operação" />
          <div className="status-highlights-grid home-signal-grid">
            <button className="highlight-card" type="button" onClick={() => goTo('budgets')}>
              <strong>{pendingBudgets.length}</strong>
              <small>Orçamentos aguardando</small>
            </button>
            <div className="highlight-card">
              <strong>{activeServices.length}</strong>
              <small>Serviços em execução</small>
            </div>
            <div className="highlight-card">
              <strong>{pendingPayments.length}</strong>
              <small>Pagamentos pendentes</small>
            </div>
          </div>
        </div>

        <div className="aferix-panel-card home-recent-strip">
          <SectionHeader title="Fechamentos recentes" eyebrow="Resultado" />
          <div className="continuous-list">
            {recentClosings.length === 0 ? (
              <EmptyState title="Sem fechamentos" description="Fechamentos salvos aparecem aqui." />
            ) : (
              recentClosings.map((record) => {
                const profitRecord = calculateServiceProfit(record);
                return (
                  <article key={record.id} className="continuous-list-item home-compact-row">
                    <div className="client-col">
                      <strong>{record.title}</strong>
                      <small>{record.clientName || 'Cliente final'} · {record.status === 'forecast' ? 'Aguardando' : 'Finalizado'}</small>
                    </div>
                    <em className="value-col"><MoneyValue value={profitRecord.netProfit} tone={profitRecord.netProfit >= 0 ? 'success' : 'danger'} compact /></em>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="aferix-panel-card home-recent-strip">
          <SectionHeader title="Propostas em aberto" eyebrow="Vendas" />
          <div className="continuous-list">
            {pendingBudgets.length === 0 ? (
              <EmptyState title="Sem pendências" description="Propostas enviadas aparecem aqui." />
            ) : (
              pendingBudgets.slice(0, 4).map((budget) => (
                <article key={budget.id} className="continuous-list-item home-compact-row clickable-row" onClick={() => onSelectBudget?.(budget)}>
                  <div className="client-col">
                    <strong style={{ display: 'block' }}>{budget.clientName || 'Cliente Avulso'}</strong>
                    <small style={{ color: 'var(--aferix-text-muted)' }}>{budget.title || 'Orçamento sem título'}</small>
                  </div>
                  <em className="value-col">Enviado</em>
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
