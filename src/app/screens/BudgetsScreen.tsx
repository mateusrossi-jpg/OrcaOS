import { lazy, useState } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';
import type { UserPlan } from '../../core/access/featureAccess';
import type { AppTab } from '../appTypes';
import { PageHeader, PageShell } from '../components/ui';

const BudgetWorkspaceClientBridge = lazy(() => import('../../features/budgets/components/BudgetWorkspaceClientBridge').then((module) => ({ default: module.BudgetWorkspaceClientBridge })));

interface BudgetsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
  userPlan: UserPlan;
  onNavigate: (tab: AppTab) => void;
  onViewClient?: (clientId: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
  forceNewBudget?: boolean;
  initialBudgetId?: string | null;
}

export function BudgetsScreen({
  context,
  userPlan: activeUserPlan,
  onNavigate,
  onViewClient,
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
    <PageShell className="wide-screen budgets-screen-premium">
      <PageHeader 
        title="Novo orçamento" 
        eyebrow="Work"
        description="Produza e edite orçamentos no fluxo operacional principal." 
      />
      
      <BudgetWorkspaceClientBridge 
        key={resetKey}
        technicalCaptures={budgetCaptures} 
        activeClient={context.activeClient} 
        activeWorkOrder={context.activeWorkOrder} 
        userPlan={activeUserPlan} 
        onUpgradeRequest={() => onNavigate('store')} 
        onViewClient={onViewClient}
        onTechnicalCaptureConverted={() => {}} 
        forceNewBudget={initialForceNewBudget || resetKey > 0}
        initialBudgetId={initialBudgetId}
      />
    </PageShell>
  );
}
