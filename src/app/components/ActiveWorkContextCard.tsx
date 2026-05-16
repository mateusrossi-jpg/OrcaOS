import type { Client, WorkOrder } from '../../core/types/business';
import { formatWorkOrderDate, priorityLabel, statusLabel } from '../utils/workOrderLabels';

interface ActiveWorkContextCardProps {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

export function ActiveWorkContextCard({ activeClient, activeWorkOrder }: ActiveWorkContextCardProps) {
  if (!activeWorkOrder) {
    return (
      <aside className="active-work-context-card empty-context">
        <span className="app-icon tone-gray">AT</span>
        <div>
          <strong>Nenhum atendimento ativo</strong>
          <small>Crie ou retome um atendimento para vincular cálculos, orçamento e relatório.</small>
        </div>
      </aside>
    );
  }

  return (
    <aside className="active-work-context-card">
      <span className="app-icon tone-blue">AT</span>
      <div>
        <strong>{activeWorkOrder.title}</strong>
        <small>{activeClient?.name ?? 'Cliente não vinculado'} · {statusLabel(activeWorkOrder.status)} · Prioridade {priorityLabel(activeWorkOrder.priority)}</small>
        <small>{activeWorkOrder.address || activeClient?.address || 'Sem endereço'} · {formatWorkOrderDate(activeWorkOrder.scheduledDate)}</small>
      </div>
    </aside>
  );
}
