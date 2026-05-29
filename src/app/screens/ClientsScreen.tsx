import { lazy, useRef } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import { PageTitle, PageShell } from '../components/ui';
import { Plus } from 'lucide-react';

const ClientWorkOrderWorkspace = lazy(() => import('../../features/clients/components/ClientWorkOrderWorkspace').then((module) => ({ default: module.ClientWorkOrderWorkspace })));

interface ClientsScreenProps {
  initialSection?: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';
  initialClientId?: string | null;
  sectionRequestKey?: number;
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
  onBack?: () => void;
}

export function ClientsScreen({
  initialSection,
  initialClientId,
  sectionRequestKey,
  onContextChange,
  onOpenBudgets,
  onBack
}: ClientsScreenProps) {
  const triggerNewClientRef = useRef<(() => void) | null>(null);

  return (
    <PageShell>
      <PageTitle
        onBack={onBack}
        eyebrow="Operação"
        title="Clientes"
        subtitle="Gerencie sua carteira de clientes e histórico comercial."
        action={
          <button 
            onClick={() => triggerNewClientRef.current?.()}
            className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] transition-all active:scale-[0.9]"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
          </button>
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
