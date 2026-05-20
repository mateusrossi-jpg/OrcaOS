import { lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';

const ReportWorkspace = lazy(() => import('../../features/reports/components/ReportWorkspace').then((module) => ({ default: module.ReportWorkspace })));

interface ReportsScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
}

export function ReportsScreen({ captures, context }: ReportsScreenProps) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Relatórios e Performance</h1>
        <p>Visão geral da sua saúde financeira e operacional.</p>
      </header>
      
      <ReportWorkspace 
        captures={captures} 
        activeClient={context.activeClient} 
        activeWorkOrder={context.activeWorkOrder} 
      />
    </section>
  );
}
