import type { WorkOrder } from '../../core/types/business';

export function statusLabel(status: WorkOrder['status']): string {
  const labels: Record<WorkOrder['status'], string> = { open: 'Aberta', scheduled: 'Agendada', 'in-progress': 'Em execução', done: 'Concluída', cancelled: 'Cancelada' };
  return labels[status];
}

export function priorityLabel(priority?: WorkOrder['priority']): string {
  const labels: Record<NonNullable<WorkOrder['priority']>, string> = { low: 'Baixa', normal: 'Normal', high: 'Alta', urgent: 'Urgente' };
  return labels[priority ?? 'normal'];
}

export function formatWorkOrderDate(value?: string): string {
  if (!value) return 'Sem data agendada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
