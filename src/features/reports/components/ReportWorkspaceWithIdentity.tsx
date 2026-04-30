import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ProfessionalIdentityCard } from '../../settings/components/ProfessionalIdentityCard';
import { ReportWorkspace } from './ReportWorkspace';

interface ReportWorkspaceWithIdentityProps {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}

export function ReportWorkspaceWithIdentity(props: ReportWorkspaceWithIdentityProps) {
  return (
    <>
      <ProfessionalIdentityCard contextLabel="Identidade do relatório" />
      <ReportWorkspace {...props} />
    </>
  );
}
