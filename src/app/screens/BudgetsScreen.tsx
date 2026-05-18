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
  captures: _captures,
  context,
  userPlan: activeUserPlan,
  goTo,
  onRemove: _onRemove,
  onUpdate: _onUpdate,
  onConvertApprovedBudgetToWorkOrder
}: BudgetsScreenProps) {
  // Ocultamos a base técnica (cálculos) nesta versão para focar no financeiro
  const budgetCaptures: CalculationCapture[] = []; 
  
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Orçamentos</h1></header>
      <ActiveWorkContextCard {...context} />
      
      <BudgetWorkspaceClientBridge technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onTechnicalCaptureConverted={() => {}} onConvertApprovedBudgetToWorkOrder={onConvertApprovedBudgetToWorkOrder} />
    </section>
  );
}
