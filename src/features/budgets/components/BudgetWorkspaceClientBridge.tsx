import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ClientProposalWorkspace } from '../../clientPortal/components/ClientProposalWorkspace';
import { ProfessionalIdentityCard } from '../../settings/components/ProfessionalIdentityCard';
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
      <ProfessionalIdentityCard contextLabel="Identidade da proposta" />
      <BudgetWorkspace {...props} />
      <ClientProposalWorkspace technicalCaptures={props.technicalCaptures ?? []} activeClient={props.activeClient ?? null} activeWorkOrder={props.activeWorkOrder ?? null} />
    </>
  );
}
