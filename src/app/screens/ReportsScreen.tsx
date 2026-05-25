import { lazy } from 'react';
import { PageHeader, PageShell } from '../components/ui';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';

const ReportWorkspace = lazy(() => import('../../features/reports/components/ReportWorkspace').then((module) => ({ default: module.ReportWorkspace })));

interface ReportsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
}

export function ReportsScreen({ captures, context }: ReportsScreenProps) {
  return (
    <PageShell className="wide-screen reports-screen-harmonized">
      <PageHeader title="Relatórios" />
      <ReportWorkspace
        captures={captures}
        activeClient={context.activeClient}
        activeWorkOrder={context.activeWorkOrder}
      />
    </PageShell>
  );
}
