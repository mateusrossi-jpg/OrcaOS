import { lazy, memo } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';

const ReportWorkspace = lazy(() => import('../../features/reports/components/ReportWorkspace').then((module) => ({ default: module.ReportWorkspace })));

interface ReportsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
  onBack?: () => void;
}

export const ReportsScreen = memo(function ReportsScreen({ captures, context, onBack }: ReportsScreenProps) {
  return (
    <ReportWorkspace
      captures={captures}
      activeClient={context.activeClient}
      activeWorkOrder={context.activeWorkOrder}
      onBack={onBack}
    />
  );
});
