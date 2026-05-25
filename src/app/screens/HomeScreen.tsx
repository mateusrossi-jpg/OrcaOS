import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculateServiceProfit } from '../../core/finance/serviceProfit';
import { isBudgetRevenueRecognized } from '../../core/finance/budgetLifecycle';
import { 
  QueueEmptyState, 
  MetricCard, 
  MoneyValue, 
  PageShell, 
  PageHeader, 
  SectionTitle, 
  ListCard, 
  ListItem, 
  StatusBadge,
  PanelCard
} from '../components/ui';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  captures: CalculationCapture[];
  clients: Client[];
  workOrders: WorkOrder[];
  savedBudgets: SavedBudgetRecord[];
  context: ActiveWorkContext;
  onStartNewAttendance: () => void;
  onSelectBudget?: (budget: SavedBudgetRecord) => void;
}

const HOME_VISIBLE_LIMIT = 5;

type AlertSeverity = 'critical' | 'attention' | 'opportunity';

interface HomeAlert {
  id: string;
  title: string;
  description: string;
  action: () => void;
  severity: AlertSeverity;
  badge: string;
}

const severityRank: Record<AlertSeverity, number> = {
  critical: 0,
  attention: 1,
  opportunity: 2,
};

export function HomeScreen({
  onNavigate,
  workOrders,
  savedBudgets,
  onSelectBudget,
}: HomeScreenProps) {
  const currentMonthBudgets = savedBudgets.filter(isBudgetFromCurrentMonth);

  const revenue = currentMonthBudgets
    .filter((b) => isBudgetRevenueRecognized(b.status))
    .reduce((acc, b) => acc + calculateSavedBudgetValue(b), 0);

  const expenses = currentMonthBudgets
    .filter((b) => isBudgetRevenueRecognized(b.status))
    .reduce((total, budget) => {
      const materialEstimate = budget.materialCost ?? budget.items
        .filter((item) => item.category === 'material')
        .reduce((itemTotal, item) => itemTotal + item.quantity * item.unitPrice, 0);
      return total + materialEstimate + (budget.operationalCost ?? 0) + budget.travelCost + budget.additionalFees;
    }, 0);

  const profit = revenue - expenses;
  const averageMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Novos indicadores BI (Pulse Advanced)
  const finalizedMonth = currentMonthBudgets.filter((b) => b.status === 'finalizado');
  const authorizedMonth = currentMonthBudgets.filter((b) => b.status === 'autorizado');
  const sentMonth = currentMonthBudgets.filter((b) => b.status === 'enviado');
  
  const successCount = finalizedMonth.length + authorizedMonth.length;
  const opportunityCount = successCount + sentMonth.length;
  const conversionRate = opportunityCount > 0 ? (successCount / opportunityCount) * 100 : 0;

  const averageTicket = finalizedMonth.length > 0 ? revenue / finalizedMonth.length : 0;
  
  const pipelineTotal = savedBudgets
    .filter((b) => ['iniciado', 'em_revisao', 'enviado', 'autorizado', 'em_execucao'].includes(b.status))
    .reduce((acc, b) => acc + calculateSavedBudgetValue(b), 0);

  const awaitingReplyBudgets = savedBudgets.filter((b) => b.status === 'enviado');
  const inExecutionBudgets = savedBudgets.filter((b) => b.status === 'em_execucao');
  const authorizedBudgets = savedBudgets.filter((b) => b.status === 'autorizado');
  const pendingPayments = workOrders.filter((w) => w.paymentStatus === 'pending' || w.paymentStatus === 'partial');

  const noMarginBudgets = savedBudgets
    .filter((b) => !isLockedStatus(b.status))
    .filter((b) => {
      const serviceProfit = calculateServiceProfit({
        receivedAmount: calculateSavedBudgetValue(b),
        materialCost: b.materialCost ?? 0,
        travelCost: b.travelCost,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: (b.additionalFees || 0) + (b.operationalCost || 0),
      });
      return serviceProfit.netMarginPercent <= 0;
    });

  const alerts: HomeAlert[] = [
    ...noMarginBudgets.slice(0, 2).map((budget) => ({
      id: `margin-${budget.id}`,
      title: 'Orçamento sem margem',
      description: `${budget.title || 'Orçamento sem título'} · ${budget.clientName || 'Cliente não informado'}`,
      action: () => onSelectBudget?.(budget),
      severity: 'critical' as const,
      badge: 'Crítico',
    })),
    ...awaitingReplyBudgets.slice(0, 2).map((budget) => ({
      id: `reply-${budget.id}`,
      title: 'Cliente aguardando retorno',
      description: `${budget.clientName || 'Cliente não informado'} · ${budget.title || 'Orçamento sem título'}`,
      action: () => onSelectBudget?.(budget),
      severity: 'attention' as const,
      badge: 'Atenção',
    })),
    ...authorizedBudgets.slice(0, 2).map((budget) => ({
      id: `auth-${budget.id}`,
      title: 'Pronto para iniciar execução',
      description: `${budget.title || 'Orçamento sem título'} · autorizado`,
      action: () => onSelectBudget?.(budget),
      severity: 'opportunity' as const,
      badge: 'Próximo passo',
    })),
  ]
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, HOME_VISIBLE_LIMIT);

  const activeBudget = savedBudgets
    .filter((b) => !isLockedStatus(b.status))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  const emAndamentoCount = savedBudgets.filter((b) => b.status === 'iniciado' || b.status === 'em_execucao').length;
  const revisaoCount = savedBudgets.filter((b) => b.status === 'em_revisao').length;
  const enviadoCount = savedBudgets.filter((b) => b.status === 'enviado').length;
  const autorizadoCount = savedBudgets.filter((b) => b.status === 'autorizado').length;

  const receitaPrevista = savedBudgets
    .filter((b) => !isLockedStatus(b.status))
    .reduce((acc, b) => acc + calculateSavedBudgetValue(b), 0);

  return (
    <PageShell className="aferix-operational-screen">
      <PageHeader title="Central Operacional" />

      {activeBudget && (
        <PanelCard className="operational-active-budget" onClick={() => onSelectBudget?.(activeBudget)}>
          <div className="operational-active-budget-content">
            <StatusBadge status={activeBudget.status} />
            <span className="active-budget-client">{activeBudget.clientName || 'Cliente não informado'}</span>
            <strong className="active-budget-title">{activeBudget.title || 'Sem título'}</strong>
            <span className="active-budget-value-dominate">
              <MoneyValue value={calculateSavedBudgetValue(activeBudget)} />
            </span>
          </div>
        </PanelCard>
      )}

      <ListCard title="Fila de Trabalho">
        <div className="operational-queue-grid">
          <button className="queue-item" type="button" onClick={() => onNavigate('work-history')}>
            <span className="queue-label">Em andamento</span>
            <strong className="queue-value">{emAndamentoCount}</strong>
          </button>
          <button className="queue-item" type="button" onClick={() => onNavigate('work-history')}>
            <span className="queue-label">Revisão</span>
            <strong className="queue-value">{revisaoCount}</strong>
          </button>
          <button className="queue-item" type="button" onClick={() => onNavigate('work-history')}>
            <span className="queue-label">Enviado</span>
            <strong className="queue-value">{enviadoCount}</strong>
          </button>
          <button className="queue-item" type="button" onClick={() => onNavigate('work-history')}>
            <span className="queue-label">Autorizado</span>
            <strong className="queue-value">{autorizadoCount}</strong>
          </button>
        </div>
      </ListCard>

      <PanelCard className="operational-finance-snapshot">
        <SectionTitle title="Posição Financeira" />
        <div className="metric-grid compact-metric-grid">
          <MetricCard label="Receita prevista" value={<MoneyValue value={receitaPrevista} compact />} />
          <MetricCard label="Receita realizada" value={<MoneyValue value={revenue} compact />} />
          <MetricCard label="Lucro líquido" value={<MoneyValue value={profit} tone={profit >= 0 ? 'success' : 'danger'} compact />} tone={profit >= 0 ? 'success' : 'danger'} />
        </div>
      </PanelCard>
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

function isLockedStatus(status: SavedBudgetRecord['status']): boolean {
  return status === 'finalizado' || status === 'recusado' || status === 'cancelado';
}
