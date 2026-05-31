import type { Client, Service } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ProfessionalIdentityCard } from '../../settings/components/ProfessionalIdentityCard';
import { ReportWorkspace } from './ReportWorkspace';

interface ReportWorkspaceWithIdentityProps {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: Service | null;
}

export function ReportWorkspaceWithIdentity({
  captures,
  activeClient = null,
  activeWorkOrder = null
}: ReportWorkspaceWithIdentityProps) {
  return (
    <>
      <ProfessionalIdentityCard contextLabel="Identidade do relatório" />
      <ReportWorkspace 
        captures={captures}
        activeClient={activeClient}
        activeWorkOrder={activeWorkOrder}
        context={{ businessName: 'Aferix' }} 
      />
    </>
  );
}

