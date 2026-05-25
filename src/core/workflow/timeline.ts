import { createId } from '../../app/utils/idHelpers';

export type WorkflowEventType =
  | 'created'
  | 'updated'
  | 'sent'
  | 'authorized'
  | 'execution_started'
  | 'execution_paused'
  | 'execution_resumed'
  | 'finished'
  | 'archived'
  | 'blocked'
  | 'exported'
  | 'client_viewed'
  | 'financial_locked'
  | 'commented';

export type WorkflowMutation = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

export type OperationalTimelineEntry = {
  id: string;
  workflowId: string;
  type: WorkflowEventType;
  timestamp: string;
  operator?: string;
  context?: string;
  meta?: {
    oldValue?: unknown;
    newValue?: unknown;
    mutations?: WorkflowMutation[];
  };
};

function safeGetTime(isoString: string): number {
  const time = new Date(isoString).getTime();
  return isNaN(time) ? 0 : time;
}

export function createTimelineEntry(
  args: Omit<OperationalTimelineEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): OperationalTimelineEntry {
  return {
    ...args,
    id: args.id || createId('ev'),
    timestamp: args.timestamp || new Date().toISOString(),
  };
}

export function appendWorkflowEvent(
  entries: OperationalTimelineEntry[],
  args: Omit<OperationalTimelineEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): OperationalTimelineEntry[] {
  const newEntry = createTimelineEntry(args);
  return [...entries, newEntry];
}

export function buildWorkflowTimeline(entries: OperationalTimelineEntry[]): OperationalTimelineEntry[] {
  return [...entries].sort((a, b) => safeGetTime(a.timestamp) - safeGetTime(b.timestamp));
}

export function getWorkflowHistory(entries: OperationalTimelineEntry[], workflowId: string): OperationalTimelineEntry[] {
  const filtered = entries.filter((e) => e.workflowId === workflowId);
  return buildWorkflowTimeline(filtered);
}

export function getLastWorkflowEvent(entries: OperationalTimelineEntry[], workflowId: string): OperationalTimelineEntry | null {
  const history = getWorkflowHistory(entries, workflowId);
  if (history.length === 0) return null;
  return history[history.length - 1];
}

export function hasWorkflowEvent(entries: OperationalTimelineEntry[], workflowId: string, type: WorkflowEventType): boolean {
  return entries.some((e) => e.workflowId === workflowId && e.type === type);
}

export function getWorkflowEventSummary(type: WorkflowEventType): string {
  switch (type) {
    case 'created':
      return 'Orçamento criado.';
    case 'updated':
      return 'Orçamento atualizado.';
    case 'sent':
      return 'Orçamento enviado.';
    case 'authorized':
      return 'Orçamento autorizado.';
    case 'execution_started':
      return 'Execução iniciada.';
    case 'execution_paused':
      return 'Execução pausada.';
    case 'execution_resumed':
      return 'Execução retomada.';
    case 'finished':
      return 'Operação finalizada.';
    case 'archived':
      return 'Registro arquivado.';
    case 'blocked':
      return 'Operação bloqueada.';
    case 'exported':
      return 'Exportação gerada.';
    case 'client_viewed':
      return 'Cliente visualizou orçamento.';
    case 'financial_locked':
      return 'Financeiro bloqueado.';
    case 'commented':
      return 'Comentário registrado.';
    default:
      return 'Evento desconhecido.';
  }
}
