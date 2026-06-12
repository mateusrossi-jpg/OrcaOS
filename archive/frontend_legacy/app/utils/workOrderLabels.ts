import type { Service as WorkOrder, ServiceStatus } from '../../core/types/business';

export function statusLabel(status: ServiceStatus): string {
  const labels: Record<ServiceStatus, string> = {
    'draft': 'Rascunho',
    'awaiting_schedule': 'Aguardando agendamento',
    'scheduled': 'Agendada',
    'en_route': 'A caminho',
    'in-progress': 'Em execução',
    'done': 'Concluído',
    'cancelled': 'Cancelado',
  };

  return labels[status];
}

export function priorityLabel(priority?: WorkOrder['priority']): string {
  const labels: Record<NonNullable<WorkOrder['priority']>, string> = {
    low: 'Baixa',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
  };

  return labels[priority ?? 'normal'];
}
