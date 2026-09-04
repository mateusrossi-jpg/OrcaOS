// LEGACY: Storage keys with orcaos prefix are kept for backward compatibility.
import { safeJsonParse, safeArray, safeString } from '../../core/runtime/safeGuards';

const CLEANUP_MARKER_KEY = 'orcaos:validation-seed-cleaned:v1';
const CLIENTS_KEY = 'orcaos:clients:v1';
const WORK_ORDERS_KEY = 'orcaos:work-orders:v1';
const ACTIVE_WORK_ORDER_KEY = 'orcaos:active-work-order:v1';
const CAPTURES_KEY = 'orcaos:calculation-captures:v1';
const BUDGETS_KEY = 'orcaos:saved-budgets:v1';

function hasStorage(): boolean {
  // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readArray(key: string): unknown[] {
  // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
  const raw = window.localStorage.getItem(key);
  return safeArray(safeJsonParse(raw, []));
}

function writeArray(key: string, items: unknown[]): void {
  // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
  window.localStorage.setItem(key, JSON.stringify(items));
}

function isValidationRecord(value: unknown): boolean {
  const id = safeString((value as Record<string, unknown>)?.id);
  const name = safeString((value as Record<string, unknown>)?.name);
  const title = safeString((value as Record<string, unknown>)?.title);
  const address = safeString((value as Record<string, unknown>)?.address);
  const clientName = safeString((value as Record<string, unknown>)?.clientName);

  return (
    id.startsWith('validation-') ||
    name === 'Cliente de teste' ||
    name === 'Cliente recorrente' ||
    clientName === 'Cliente de teste' ||
    clientName === 'Cliente recorrente' ||
    title === 'Instalação de tomadas no quarto' ||
    title === 'Revisão de orçamento enviado' ||
    title === 'Manutenção preventiva aprovada' ||
    address.includes('Rua de Teste') ||
    address.includes('Avenida de Validação')
  );
}

function removeValidationItems(key: string): string[] {
  const items = readArray(key);
  if (items.length === 0) return [];

  const removedIds = items.filter(isValidationRecord).map((item) => safeString((item as Record<string, unknown>)?.id)).filter(Boolean);
  if (removedIds.length === 0) return [];

  writeArray(key, items.filter((item) => !isValidationRecord(item)));
  return removedIds;
}

export function cleanupRuntimeValidationData(): void {
  if (!hasStorage()) return;

  removeValidationItems(CLIENTS_KEY);
  removeValidationItems(WORK_ORDERS_KEY);
  removeValidationItems(BUDGETS_KEY);
  removeValidationItems(CAPTURES_KEY);
  // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
  const activeWorkOrderId = window.localStorage.getItem(ACTIVE_WORK_ORDER_KEY);

  if (activeWorkOrderId) {
    // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
    window.localStorage.removeItem(ACTIVE_WORK_ORDER_KEY);
  }

  // eslint-disable-next-line no-restricted-syntax -- Legacy localStorage bridge (migration-only)
  window.localStorage.setItem(CLEANUP_MARKER_KEY, new Date().toISOString());
}
