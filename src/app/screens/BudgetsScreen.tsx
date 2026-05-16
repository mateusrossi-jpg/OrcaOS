import { lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';
import type { UserPlan } from '../../core/access/featureAccess';
import type { AppTab } from '../appTypes';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';

const BudgetWorkspaceClientBridge = lazy(() => import('../../features/budgets/components/BudgetWorkspaceClientBridge').then((module) => ({ default: module.BudgetWorkspaceClientBridge })));
const TechnicalCaptureList = lazy(() => import('../../features/workflow/components/TechnicalCaptureList').then((module) => ({ default: module.TechnicalCaptureList })));

interface BudgetsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
  userPlan: UserPlan;
  goTo: (tab: AppTab) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
  onConvertApprovedBudgetToWorkOrder: () => void;
}

export function BudgetsScreen({
  captures,
  context,
  userPlan: activeUserPlan,
  goTo,
  onRemove,
  onUpdate,
  onConvertApprovedBudgetToWorkOrder
}: BudgetsScreenProps) {
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Propostas</h1></header>
      <ActiveWorkContextCard {...context} />
      {budgetCaptures.length > 0 && (
        <details className="budget-technical-drawer">
          <summary>
            <span><strong>Base técnica do orçamento</strong><small>{budgetCaptures.length} item(ns) vindos de cálculos ou itens técnicos.</small></span>
            <em>Revisar</em>
          </summary>
          <TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou adicione itens diretamente no orçamento para montar a base técnica." onRemove={onRemove} onUpdate={onUpdate} />
        </details>
      )}
      <BudgetWorkspaceClientBridge technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} onConvertApprovedBudgetToWorkOrder={onConvertApprovedBudgetToWorkOrder} />
    </section>
  );
}
