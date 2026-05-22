import type { UserPlan } from '../../../core/access/featureAccess';
import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { BudgetWorkspace } from './BudgetWorkspace';

interface BudgetWorkspaceClientBridgeProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onViewClient?: (clientId: string) => void;
  onTechnicalCaptureConverted?: (id: string) => void;
  forceNewBudget?: boolean;
  initialBudgetId?: string | null;
}

export function BudgetWorkspaceClientBridge(props: BudgetWorkspaceClientBridgeProps) {
  return (
    <BudgetWorkspace {...props} />
  );
}
