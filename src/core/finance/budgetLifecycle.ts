import type { BudgetStatus } from '../types/business';

export const BUDGET_OPEN_STATUSES: BudgetStatus[] = ['draft', 'sent'];
export const BUDGET_CLOSED_STATUSES: BudgetStatus[] = ['approved', 'rejected', 'expired', 'cancelled'];

export function isBudgetOpenStatus(status: BudgetStatus): boolean {
  return BUDGET_OPEN_STATUSES.includes(status);
}

export function isBudgetClosedStatus(status: BudgetStatus): boolean {
  return BUDGET_CLOSED_STATUSES.includes(status);
}

export function isBudgetPendingAction(status: BudgetStatus): boolean {
  return status === 'sent';
}

export function isBudgetRevenueRecognized(status: BudgetStatus): boolean {
  return status === 'approved';
}

const ALLOWED_BUDGET_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['approved', 'rejected', 'expired', 'cancelled'],
  approved: [],
  rejected: [],
  expired: [],
  cancelled: [],
};

export function canBudgetTransitionTo(from: BudgetStatus, to: BudgetStatus): boolean {
  if (from === to) return true;
  return ALLOWED_BUDGET_TRANSITIONS[from].includes(to);
}
