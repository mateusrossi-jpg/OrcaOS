// LEGACY: Storage keys with orcaos prefix are kept for backward compatibility.
const CLEANUP_MARKER_KEY = 'orcaos:validation-seed-cleaned:v1';
const CLIENTS_KEY = 'orcaos:clients:v1';
const WORK_ORDERS_KEY = 'orcaos:work-orders:v1';
const ACTIVE_WORK_ORDER_KEY = 'orcaos:active-work-order:v1';
const CAPTURES_KEY = 'orcaos:calculation-captures:v1';
const BUDGETS_KEY = 'orcaos:saved-budgets:v1';

function hasStorage(): boolean {
  // eslint-disable-next-line no-restricted-syntax -- TODO: Refactor legacy storage access
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readArray(key: string): unknown[] {
  try {
    // eslint-disable-next-line no-restricted-syntax -- TODO: Refactor legacy storage access
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, items: unknown[]): void {
  // eslint-disable-next-line no-restricted-syntax -- TODO: Refactor legacy storage access
  window.localStorage.setItem(key, JSON.stringify(items));
}

function getString(value: unknown, field: string): string {
  if (!value || typeof value !== 'object') return '';
  const candidate = (value as Record<string, unknown>)[field];
  return typeof candidate === 'string' ? candidate : '';
}

function isValidationRecord(value: unknown): boolean {
  const id = getString(value, 'id');
  const name = getString(value, 'name');
  const title = getString(value, 'title');
  const address = getString(value, 'address');
  const clientName = getString(value, 'clientName');

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

  const removedIds = items.filter(isValidationRecord).map((item) => getString(item, 'id')).filter(Boolean);
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
  // eslint-disable-next-line no-restricted-syntax -- TODO: Refactor legacy storage access
  const activeWorkOrderId = window.localStorage.getItem(ACTIVE_WORK_ORDER_KEY);

  if (activeWorkOrderId) {
    // eslint-disable-next-line no-restricted-syntax -- TODO: Refactor legacy storage access
    window.localStorage.removeItem(ACTIVE_WORK_ORDER_KEY);
  }

  // eslint-disable-next-line no-restricted-syntax -- TODO: Refactor legacy storage access
  window.localStorage.setItem(CLEANUP_MARKER_KEY, new Date().toISOString());
}
