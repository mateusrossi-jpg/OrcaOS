import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ClientProposalWorkspace } from '../../clientPortal/components/ClientProposalWorkspace';
import { BudgetWorkspace } from './BudgetWorkspace';

interface BudgetWorkspaceClientBridgeProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  onTechnicalCaptureConverted?: (id: string) => void;
}

export function BudgetWorkspaceClientBridge(props: BudgetWorkspaceClientBridgeProps) {
  return (
    <>
      <BudgetWorkspace {...props} />
      <ClientProposalWorkspace />
    </>
  );
}
