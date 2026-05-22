import { lazy, useRef } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';
import { PageHeader, Button, PageShell } from '../components/ui';

const ClientWorkOrderWorkspace = lazy(() => import('../../features/clients/components/ClientWorkOrderWorkspace').then((module) => ({ default: module.ClientWorkOrderWorkspace })));

interface ClientsScreenProps {
  initialSection?: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';
  initialClientId?: string | null;
  sectionRequestKey?: number;
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
}

export function ClientsScreen({
  initialSection,
  initialClientId,
  sectionRequestKey,
  onContextChange,
  onOpenBudgets
}: ClientsScreenProps) {
  const triggerNewClientRef = useRef<(() => void) | null>(null);

  return (
    <PageShell className="wide-screen">
      <PageHeader 
        title="Base · Clientes" 
        description="Gerencie sua carteira de clientes e contatos comerciais."
        action={
          <Button variant="primary" className="full-page-cta" onClick={() => triggerNewClientRef.current?.()}>
            + Novo Cliente
          </Button>
        }
      />
      <ClientWorkOrderWorkspace
        initialSection={initialSection}
        initialClientId={initialClientId}
        sectionRequestKey={sectionRequestKey}
        onContextChange={onContextChange}
        onOpenBudgets={onOpenBudgets}
        onNewClientRequest={(cb) => { triggerNewClientRef.current = cb; }}
      />
    </PageShell>
  );
}
