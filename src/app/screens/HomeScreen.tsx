import type { AppTab, ActiveWorkContext } from '../appTypes';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import type { SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculateServiceProfit } from '../../core/finance/serviceProfit';
import { isBudgetRevenueRecognized } from '../../core/finance/budgetLifecycle';
import { 
  EmptyState, 
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

  const expenses = currentMonthBudgets.reduce((total, budget) => {
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

  const recentFinalized = savedBudgets.filter((b) => b.status === 'finalizado').slice(0, HOME_VISIBLE_LIMIT);

  return (
    <PageShell className="aferix-dashboard-screen">
      <PageHeader
        title="Pulse"
        description="Meu negócio está saudável hoje?"
      />

      <PanelCard className="home-finance-overview">
        <SectionTitle title="Diagnóstico rápido" eyebrow="Pulse" />
        <div className="metric-grid dashboard-metric-grid">
          <MetricCard 
            label="Lucro atual" 
            value={<MoneyValue value={profit} tone={profit >= 0 ? 'success' : 'danger'} />} 
            tone={profit >= 0 ? 'success' : 'danger'} 
            featured
          />
          <MetricCard 
            label="Margem média" 
            value={`${averageMargin.toFixed(1)}%`} 
            tone={averageMargin >= 20 ? 'success' : averageMargin > 0 ? 'brand' : 'danger'} 
          />
          <MetricCard 
            label="Ticket médio" 
            value={<MoneyValue value={averageTicket} compact />} 
          />
          <MetricCard 
            label="Taxa de conversão" 
            value={`${conversionRate.toFixed(0)}%`} 
            helper={`${successCount} fechados`}
            tone={conversionRate >= 50 ? 'success' : 'brand'}
          />
          <MetricCard 
            label="Pipeline (Em aberto)" 
            value={<MoneyValue value={pipelineTotal} compact />} 
            tone="brand"
          />
          <MetricCard 
            label="Recebimentos" 
            value={pendingPayments.length} 
            helper="pendentes"
          />
        </div>
      </PanelCard>

      <section className="home-operations-grid">
        <PanelCard className="home-command-panel">
          <SectionTitle title="Fila operacional" eyebrow="Work" />
          <div className="status-compact-list">
            <button className="status-compact-item" type="button" onClick={() => onNavigate('work-history')}>
              <span className="status-label">Aguardando resposta</span>
              <strong className="status-value">{awaitingReplyBudgets.length}</strong>
            </button>
            <button className="status-compact-item" type="button" onClick={() => onNavigate('work-history')}>
              <span className="status-label">Em execução</span>
              <strong className="status-value">{inExecutionBudgets.length}</strong>
            </button>
            <button className="status-compact-item" type="button" onClick={() => onNavigate('work-history')}>
              <span className="status-label">Finalização pendente</span>
              <strong className="status-value">{authorizedBudgets.length}</strong>
            </button>
          </div>
        </PanelCard>

        <ListCard title="Alertas operacionais" subtitle="Pulse">
          {alerts.length === 0 ? (
            <EmptyState 
              title="Sem alertas críticos" 
              description="Sua operação está estável neste momento." 
            />
          ) : (
            alerts.map((alert) => (
              <ListItem 
                key={alert.id}
                title={alert.title}
                subtitle={alert.description}
                status={<StatusBadge tone={alert.severity === 'critical' ? 'danger' : alert.severity === 'attention' ? 'brand' : 'success'}>{alert.badge}</StatusBadge>}
                onClick={alert.action}
              />
            ))
          )}
        </ListCard>

        <ListCard title="Finalizados recentes" subtitle="Money">
          {recentFinalized.length === 0 ? (
            <EmptyState 
              title="Nenhum orçamento finalizado" 
              description="Quando um orçamento for finalizado, o resultado aparecerá aqui automaticamente." 
            />
          ) : (
            recentFinalized.map((record) => {
              const profitRecord = calculateServiceProfit({
                receivedAmount: calculateSavedBudgetValue(record),
                materialCost: record.materialCost ?? 0,
                travelCost: record.travelCost,
                cardFee: 0,
                estimatedTax: 0,
                otherCosts: (record.additionalFees || 0) + (record.operationalCost || 0),
              });
              return (
                <ListItem 
                  key={record.id}
                  title={record.title}
                  subtitle={record.clientName || 'Cliente final'}
                  value={<MoneyValue value={profitRecord.netProfit} tone={profitRecord.netProfit >= 0 ? 'success' : 'danger'} compact />}
                  status={<StatusBadge status="finalizado" />}
                />
              );
            })
          )}
        </ListCard>
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

function isLockedStatus(status: SavedBudgetRecord['status']): boolean {
  return status === 'finalizado' || status === 'recusado' || status === 'cancelado';
}
