export type QueueDerivedState =
  | 'ready'
  | 'urgent'
  | 'overdue'
  | 'blocked'
  | 'inactive'
  | 'awaiting_client'
  | 'awaiting_material'
  | 'execution_delayed'
  | 'execution_active';

export type QueuePriority =
  | 'critical'
  | 'high'
  | 'normal'
  | 'low';

export type QueueWorkflowStatus =
  | 'draft'
  | 'review'
  | 'sent'
  | 'authorized'
  | 'execution'
  | 'finished'
  | 'archived'
  | 'blocked';

export type QueueWorkflowInput = {
  id: string;
  status: QueueWorkflowStatus | string;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string;
  authorizedAt?: string;
  executionStartedAt?: string;
  finishedAt?: string;
  blocked?: boolean;
  blockedReason?: string;
  awaitingMaterial?: boolean;
  financialPending?: boolean;
  urgent?: boolean;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function safeGetTime(dateString?: string): number {
  if (!dateString) return 0;
  const time = new Date(dateString).getTime();
  return isNaN(time) ? 0 : time;
}

function diffDays(startMs: number, endMs: number): number {
  if (!startMs || !endMs) return 0;
  return (endMs - startMs) / MS_PER_DAY;
}

export function getWorkflowAging(workflow: QueueWorkflowInput, now: number = Date.now()): number {
  const start = safeGetTime(workflow.createdAt);
  if (!start) return 0;
  return diffDays(start, now);
}

export function getWorkflowDelay(workflow: QueueWorkflowInput, now: number = Date.now()): number {
  if (workflow.status === 'sent') {
    return diffDays(safeGetTime(workflow.sentAt), now);
  }
  if (workflow.status === 'authorized') {
    return diffDays(safeGetTime(workflow.authorizedAt), now);
  }
  return 0;
}

export function getWorkflowIdleTime(workflow: QueueWorkflowInput, now: number = Date.now()): number {
  const lastActive = safeGetTime(workflow.updatedAt) || safeGetTime(workflow.createdAt);
  if (!lastActive) return 0;
  return diffDays(lastActive, now);
}

export function getWorkflowExecutionTime(workflow: QueueWorkflowInput, now: number = Date.now()): number {
  const start = safeGetTime(workflow.executionStartedAt);
  if (!start) return 0;
  const end = workflow.finishedAt ? safeGetTime(workflow.finishedAt) : now;
  return diffDays(start, end);
}

export function isWorkflowBlocked(workflow: QueueWorkflowInput): boolean {
  return workflow.status === 'blocked' || !!workflow.blocked;
}

export function getWorkflowBlockReason(workflow: QueueWorkflowInput): string {
  if (workflow.blockedReason) return workflow.blockedReason;
  return 'Operação bloqueada.';
}

export interface QueueEvaluation {
  warning: string;
  derivedState: QueueDerivedState;
  priority: QueuePriority;
}

function evaluateQueueRules(workflow: QueueWorkflowInput, now: number = Date.now()): QueueEvaluation {
  if (isWorkflowBlocked(workflow)) {
    return {
      warning: 'Operação bloqueada.',
      derivedState: 'blocked',
      priority: 'critical'
    };
  }

  if (workflow.status === 'finished' || workflow.status === 'archived') {
    return {
      warning: 'Operação concluída.',
      derivedState: 'inactive',
      priority: 'low'
    };
  }

  if (workflow.awaitingMaterial) {
    return {
      warning: 'Aguardando material.',
      derivedState: 'awaiting_material',
      priority: 'high'
    };
  }

  if (workflow.status === 'execution') {
    const idleDays = getWorkflowIdleTime(workflow, now);
    if (idleDays > 1) {
      return {
        warning: 'Fluxo interrompido.',
        derivedState: 'inactive',
        priority: 'critical'
      };
    }
    return {
      warning: 'Execução ativa.',
      derivedState: 'execution_active',
      priority: 'normal'
    };
  }

  if (workflow.status === 'authorized') {
    const authorizedDays = diffDays(safeGetTime(workflow.authorizedAt), now);
    if (!workflow.executionStartedAt && authorizedDays > 2) {
      return {
        warning: 'Execução pendente.',
        derivedState: 'execution_delayed',
        priority: 'high'
      };
    }
  }

  if (workflow.status === 'sent') {
    const sentDays = diffDays(safeGetTime(workflow.sentAt), now);
    if (sentDays > 3) {
      return {
        warning: 'Aguardando cliente.',
        derivedState: 'awaiting_client',
        priority: 'high'
      };
    }
  }

  if (workflow.urgent) {
    return {
      warning: 'Operação urgente.',
      derivedState: 'urgent',
      priority: 'high'
    };
  }

  const idleDraftDays = getWorkflowIdleTime(workflow, now);
  if (idleDraftDays > 7 && workflow.status === 'draft') {
    return {
      warning: 'Rascunho esquecido.',
      derivedState: 'overdue',
      priority: 'normal'
    };
  }

  return {
    warning: 'Fluxo regular.',
    derivedState: 'ready',
    priority: 'normal'
  };
}

export function getQueuePriority(workflow: QueueWorkflowInput, now?: number): QueuePriority {
  return evaluateQueueRules(workflow, now).priority;
}

export function getQueueDerivedState(workflow: QueueWorkflowInput, now?: number): QueueDerivedState {
  return evaluateQueueRules(workflow, now).derivedState;
}

export function getWorkflowWarning(workflow: QueueWorkflowInput, now?: number): string {
  return evaluateQueueRules(workflow, now).warning;
}

export function sortOperationalQueue(workflows: QueueWorkflowInput[], now: number = Date.now()): QueueWorkflowInput[] {
  const priorityWeight: Record<QueuePriority, number> = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1
  };

  return [...workflows].sort((a, b) => {
    const evalA = evaluateQueueRules(a, now);
    const evalB = evaluateQueueRules(b, now);
    
    const weightA = priorityWeight[evalA.priority];
    const weightB = priorityWeight[evalB.priority];
    
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    
    // Within same priority rules:
    // blocked first
    if (evalA.derivedState === 'blocked' && evalB.derivedState !== 'blocked') return -1;
    if (evalB.derivedState === 'blocked' && evalA.derivedState !== 'blocked') return 1;
    
    // urgent first
    if (evalA.derivedState === 'urgent' && evalB.derivedState !== 'urgent') return -1;
    if (evalB.derivedState === 'urgent' && evalA.derivedState !== 'urgent') return 1;
    
    // older idle time first (larger idle time = smaller sort index)
    const idleA = getWorkflowIdleTime(a, now);
    const idleB = getWorkflowIdleTime(b, now);
    return idleB - idleA;
  });
}

export interface QueueSummary {
  total: number;
  urgent: number;
  overdue: number;
  blocked: number;
  awaitingClient: number;
  awaitingMaterial: number;
  activeExecution: number;
  delayedExecution: number;
  finished: number;
}

export function buildQueueSummary(workflows: QueueWorkflowInput[], now: number = Date.now()): QueueSummary {
  const summary: QueueSummary = {
    total: workflows.length,
    urgent: 0,
    overdue: 0,
    blocked: 0,
    awaitingClient: 0,
    awaitingMaterial: 0,
    activeExecution: 0,
    delayedExecution: 0,
    finished: 0,
  };

  for (const workflow of workflows) {
    const ev = evaluateQueueRules(workflow, now);
    
    if (ev.derivedState === 'urgent') summary.urgent++;
    if (ev.derivedState === 'overdue') summary.overdue++;
    if (ev.derivedState === 'blocked') summary.blocked++;
    if (ev.derivedState === 'awaiting_client') summary.awaitingClient++;
    if (ev.derivedState === 'awaiting_material') summary.awaitingMaterial++;
    if (ev.derivedState === 'execution_active') summary.activeExecution++;
    if (ev.derivedState === 'execution_delayed') summary.delayedExecution++;
    if (workflow.status === 'finished' || workflow.status === 'archived') summary.finished++;
  }

  return summary;
}
