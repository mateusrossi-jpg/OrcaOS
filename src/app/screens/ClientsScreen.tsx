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
        <h1>Clientes e Serviços</h1>
        <p>Gerencie seus clientes, orçamentos e serviços em um só lugar.</p>
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
