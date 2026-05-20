import { lazy, useState } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';
import type { UserPlan } from '../../core/access/featureAccess';
import type { AppTab } from '../appTypes';

const BudgetWorkspaceClientBridge = lazy(() => import('../../features/budgets/components/BudgetWorkspaceClientBridge').then((module) => ({ default: module.BudgetWorkspaceClientBridge })));

interface BudgetsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
  userPlan: UserPlan;
  goTo: (tab: AppTab) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
  onConvertApprovedBudgetToWorkOrder: () => void;
  forceNewBudget?: boolean;
  initialBudgetId?: string | null;
}

export function BudgetsScreen({
  context,
  userPlan: activeUserPlan,
  goTo,
  onConvertApprovedBudgetToWorkOrder,
  forceNewBudget: initialForceNewBudget = false,
  initialBudgetId = null
}: BudgetsScreenProps) {
  // Ocultamos a base técnica (cálculos) nesta versão para focar no financeiro
  const budgetCaptures: CalculationCapture[] = []; 
  const [resetKey, setResetKey] = useState(0);

  function handleNewBudget() {
    setResetKey(current => current + 1);
  }
  
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Orçamentos</h1>
      </header>
      
      <BudgetWorkspaceClientBridge 
        key={resetKey}
        technicalCaptures={budgetCaptures} 
        activeClient={context.activeClient} 
        activeWorkOrder={context.activeWorkOrder} 
        userPlan={activeUserPlan} 
        onUpgradeRequest={() => goTo('store')} 
        onTechnicalCaptureConverted={() => {}} 
        onConvertApprovedBudgetToWorkOrder={onConvertApprovedBudgetToWorkOrder} 
        forceNewBudget={initialForceNewBudget || resetKey > 0}
        initialBudgetId={initialBudgetId}
      />
    </section>
  );
}
