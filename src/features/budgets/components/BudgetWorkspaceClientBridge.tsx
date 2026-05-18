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
  onTechnicalCaptureConverted?: (id: string) => void;
  onConvertApprovedBudgetToWorkOrder?: () => void;
  forceNewBudget?: boolean;
}

export function BudgetWorkspaceClientBridge(props: BudgetWorkspaceClientBridgeProps) {
  return (
    <BudgetWorkspace {...props} />
  );
}
