import { lazy } from 'react';
import { PageTitle, PageShell } from '../components/ui';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';

const ReportWorkspace = lazy(() => import('../../features/reports/components/ReportWorkspace').then((module) => ({ default: module.ReportWorkspace })));

interface ReportsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
  onBack?: () => void;
}

export function ReportsScreen({ captures, context, onBack }: ReportsScreenProps) {
  return (
    <PageShell>
      <PageTitle 
        onBack={onBack}
        eyebrow="Relatórios e BI" 
        title="Performance" 
        subtitle="Métricas baseadas em levantamentos técnicos." 
      />
      <ReportWorkspace
        captures={captures}
        activeClient={context.activeClient}
        activeWorkOrder={context.activeWorkOrder}
      />
    </PageShell>
  );
}

