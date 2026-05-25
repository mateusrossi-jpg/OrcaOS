/**
 * Invariant assertions for Aferix Core
 * Fails early and loudly if critical state is corrupted.
 */

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[Invariant Violation] ${message}`);
  }
}

export function assertValidNumber(value: unknown, fieldName: string): asserts value is number {
  invariant(typeof value === 'number' && !Number.isNaN(value), `${fieldName} must be a valid number, got ${typeof value === 'number' ? 'NaN' : typeof value}.`);
}

export function assertValidDateString(value: string | undefined | null, fieldName: string): void {
  if (!value) return;
  const date = new Date(value);
  invariant(!Number.isNaN(date.getTime()), `${fieldName} must be a valid ISO string, got invalid date.`);
}

export function assertValidArray<T>(value: unknown, fieldName: string): asserts value is T[] {
  invariant(Array.isArray(value), `${fieldName} must be an array.`);
}

export function assertValidBudgetStatus(status: unknown): void {
  const allowed = ['iniciado', 'em_revisao', 'enviado', 'autorizado', 'em_execucao', 'finalizado', 'arquivado', 'recusado', 'cancelado', 'draft', 'sent', 'approved', 'rejected', 'expired'];
  invariant(typeof status === 'string' && allowed.includes(status), `Invalid BudgetStatus: ${String(status)}`);
}

export function ensureSafePayload<T>(payload: T, fallback: T): T {
  try {
    // Perform a deep clone to drop undefined/functions and verify serialization
    return JSON.parse(JSON.stringify(payload));
  } catch (e) {
    console.error('Payload serialization failed, returning fallback.', e);
    return fallback;
  }
}
