import type { Client, WorkOrder } from '../../core/types/business';
import { formatWorkOrderDate, priorityLabel, statusLabel } from '../utils/workOrderLabels';

interface ActiveWorkContextCardProps {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

export function ActiveWorkContextCard({ activeClient, activeWorkOrder }: ActiveWorkContextCardProps) {
  if (!activeWorkOrder) {
    return <aside className="active-work-context-card empty-context"><span className="app-icon tone-gray">OS</span><div><strong>Nenhuma OS ativa</strong><small>Crie ou ative uma OS em Clientes / OS para vincular o atendimento atual.</small></div></aside>;
  }

  return (
    <aside className="active-work-context-card">
      <span className="app-icon tone-blue">OS</span>
      <div>
        <strong>{activeWorkOrder.title}</strong>
        <small>{activeClient?.name ?? 'Cliente não vinculado'} · {statusLabel(activeWorkOrder.status)} · Prioridade {priorityLabel(activeWorkOrder.priority)}</small>
        <small>{activeWorkOrder.address || activeClient?.address || 'Sem endereço'} · {formatWorkOrderDate(activeWorkOrder.scheduledDate)}</small>
      </div>
    </aside>
  );
}
