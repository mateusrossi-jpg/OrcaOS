import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ProfessionalIdentityCard } from '../../settings/components/ProfessionalIdentityCard';
import { BudgetWorkspace } from './BudgetWorkspace';

interface BudgetWorkspaceWithIdentityProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
  onTechnicalCaptureConverted?: (id: string) => void;
}

export function BudgetWorkspaceWithIdentity(props: BudgetWorkspaceWithIdentityProps) {
  return (
    <>
      <ProfessionalIdentityCard contextLabel="Identidade da proposta" />
      <BudgetWorkspace {...props} />
    </>
  );
}
