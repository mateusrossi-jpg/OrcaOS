import type { BudgetStatus } from '../types/business';

export const BUDGET_OPEN_STATUSES: BudgetStatus[] = [
  'iniciado',
  'em_revisao',
  'enviado',
  'autorizado',
  'em_execucao',
  'draft',
  'sent',
  'approved',
];

export const BUDGET_CLOSED_STATUSES: BudgetStatus[] = [
  'finalizado',
  'recusado',
  'cancelado',
  'rejected',
  'expired',
  'cancelled',
];

export function isBudgetOpenStatus(status: BudgetStatus): boolean {
  return BUDGET_OPEN_STATUSES.includes(status);
}

export function isBudgetClosedStatus(status: BudgetStatus): boolean {
  return BUDGET_CLOSED_STATUSES.includes(status);
}

export function isBudgetPendingAction(status: BudgetStatus): boolean {
  return status === 'enviado' || status === 'sent';
}

export function isBudgetRevenueRecognized(status: BudgetStatus): boolean {
  return status === 'finalizado';
}

const ALLOWED_BUDGET_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  iniciado: ['em_revisao', 'cancelado'],
  em_revisao: ['enviado', 'iniciado', 'cancelado'],
  enviado: ['autorizado', 'recusado', 'cancelado'],
  autorizado: ['em_execucao', 'cancelado'],
  em_execucao: ['finalizado', 'cancelado'],
  finalizado: [],
  recusado: [],
  cancelado: [],

  // Compatibilidade legado
  draft: ['sent', 'cancelled'],
  sent: ['approved', 'rejected', 'expired', 'cancelled'],
  approved: [],
  rejected: [],
  expired: [],
  cancelled: [],
};

export function canBudgetTransitionTo(from: BudgetStatus, to: BudgetStatus): boolean {
  if (from === to) return true;
  return ALLOWED_BUDGET_TRANSITIONS[from]?.includes(to) ?? false;
}
