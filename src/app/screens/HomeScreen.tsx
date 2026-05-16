import type { AppTab, ModuleCardData, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculationModules } from '../appData';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';
import { formatCompactCurrency } from '../../core/format/currency';

interface HomeScreenProps {
  goTo: (tab: AppTab) => void;
  openModule: (module: ModuleCardData) => void;
  captures: CalculationCapture[];
  clients: Client[];
  workOrders: WorkOrder[];
  savedBudgets: SavedBudgetRecord[];
  context: ActiveWorkContext;
  onStartNewAttendance: () => void;
}

export function HomeScreen({
  goTo,
  openModule,
  captures,
  clients,
  workOrders,
  savedBudgets,
  context,
  onStartNewAttendance
}: HomeScreenProps) {
  // const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled').length;
  // const pendingBudgets = savedBudgets.filter((budget) => budget.status === 'draft' || budget.status === 'sent').length;
  // const approvedBudgets = savedBudgets.filter((budget) => budget.status === 'approved').length;
  
  const currentMonthBudgets = savedBudgets.filter(isBudgetFromCurrentMonth);
  const monthlyBudgetTotal = currentMonthBudgets.reduce((total, budget) => total + calculateSavedBudgetValue(budget), 0);
  const accountsReceivable = currentMonthBudgets.filter((budget) => budget.status === 'sent' || budget.status === 'approved').reduce((total, budget) => total + calculateSavedBudgetValue(budget), 0);
  
  const monthlyExpenses = currentMonthBudgets.reduce((total, budget) => {
    const materialEstimate = budget.materialCost ?? budget.items.filter((item) => item.category === 'material').reduce((itemTotal, item) => itemTotal + item.quantity * item.unitPrice, 0);
    return total + materialEstimate + (budget.operationalCost ?? 0) + budget.travelCost + budget.additionalFees;
  }, 0);
  
  const monthlyCashFlow = monthlyBudgetTotal - monthlyExpenses;
  const monthlyNetProfit = Math.max(monthlyCashFlow, 0);
  
  // const budgetItems = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both').length;
  // const recentItems = captures.slice(0, 3);
  const pricingModule = calculationModules.find((module) => module.id === 'orcamentoTecnico') ?? calculationModules[0];

  return (
    <section className="app-screen aferix-dashboard-screen">
      <div className="home-action-toolbar">
        <button type="button" className="ghost-action" onClick={onStartNewAttendance}>Novo atendimento</button>
        <button type="button" className="ghost-action" onClick={() => goTo('budgets')}>Orçamento rápido</button>
        <button type="button" className="ghost-action" onClick={() => openModule(pricingModule)}>Precificar</button>
      </div>
      <ActiveWorkContextCard {...context} />

      <div className="dashboard-finance-tiles" aria-label="Resumo financeiro do mês">
        <article className="finance-tile net">
          <span>Lucro líquido do mês</span>
          <strong className="premium-accent">{formatCompactCurrency(monthlyNetProfit)}</strong>
        </article>
        <article className="finance-tile revenue">
          <span>Fluxo de caixa</span>
          <strong>{formatCompactCurrency(monthlyCashFlow)}</strong>
        </article>
        <article className="finance-tile pending">
          <span>Contas a receber</span>
          <strong>{formatCompactCurrency(accountsReceivable)}</strong>
        </article>
        <article className="finance-tile expense">
          <span>Despesas</span>
          <strong>{formatCompactCurrency(monthlyExpenses)}</strong>
        </article>
      </div>
      <section className="aferix-panel-card home-command-panel">
        <header><div><h2>Atendimentos em andamento</h2></div></header>
        <div className="home-recent-strip">
          <div className="continuous-list">
            {workOrders.filter(w => w.status !== 'done' && w.status !== 'cancelled').length === 0 ? (
              <div className="continuous-list-empty">Nenhum atendimento em aberto para hoje.</div>
            ) : (
              workOrders.filter(w => w.status !== 'done' && w.status !== 'cancelled').slice(0, 5).map(order => {
                const orderClient = clients.find(c => c.id === order.clientId);
                const orderBudget = savedBudgets.find(b => b.workOrderId === order.id);
                const budgetValue = orderBudget ? orderBudget.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) : 0;
                const createdAtDate = new Date(order.createdAt || Date.now());
                const timeString = isNaN(createdAtDate.getTime()) ? '--:--' : createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <article key={order.id} className="continuous-list-item">
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
    </section>
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
