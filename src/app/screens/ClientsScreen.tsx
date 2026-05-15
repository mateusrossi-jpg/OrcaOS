import { lazy } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';

const ClientWorkOrderWorkspace = lazy(() => import('../../features/clients/components/ClientWorkOrderWorkspace').then((module) => ({ default: module.ClientWorkOrderWorkspace })));

interface ClientsScreenProps {
  initialSection?: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';
  sectionRequestKey?: number;
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
  onStartSurvey: () => void;
}

export function ClientsScreen({
  initialSection,
  sectionRequestKey,
  onContextChange,
  onOpenBudgets,
  onStartSurvey
}: ClientsScreenProps) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Atendimentos</h1>
        <p>Vincule um cliente agora ou continue sem cliente, levante dados e gere orçamento antes de converter em OS.</p>
      </header>
      <ClientWorkOrderWorkspace
        initialSection={initialSection}
        sectionRequestKey={sectionRequestKey}
        onContextChange={onContextChange}
        onOpenBudgets={onOpenBudgets}
        onStartSurvey={onStartSurvey}
      />
    </section>
  );
}
