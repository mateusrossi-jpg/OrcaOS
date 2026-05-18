import { lazy } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';

const ClientWorkOrderWorkspace = lazy(() => import('../../features/clients/components/ClientWorkOrderWorkspace').then((module) => ({ default: module.ClientWorkOrderWorkspace })));

interface ClientsScreenProps {
  initialSection?: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';
  sectionRequestKey?: number;
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
}

export function ClientsScreen({
  initialSection,
  sectionRequestKey,
  onContextChange,
  onOpenBudgets
}: ClientsScreenProps) {
  return (
    <section className="app-screen wide-screen">
      <ClientWorkOrderWorkspace
        initialSection={initialSection}
        sectionRequestKey={sectionRequestKey}
        onContextChange={onContextChange}
        onOpenBudgets={onOpenBudgets}
      />
    </section>
  );
}
