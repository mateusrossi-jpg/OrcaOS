import type { Client, Service as WorkOrder } from '../../../core/types/business';
import { safeJsonParse } from '../../../core/runtime/safeGuards';

const CLIENTS_STORAGE_KEY = 'orcaos:clients:v1';
const WORK_ORDERS_STORAGE_KEY = 'orcaos:work-orders:v1';
const ACTIVE_WORK_ORDER_STORAGE_KEY = 'orcaos:active-work-order:v1';

function isClient(value: unknown): value is Client {
  if (!value || typeof value !== 'object') return false;
  const client = value as Partial<Client>;
  return typeof client.id === 'string' && typeof client.name === 'string';
}

function isWorkOrder(value: unknown): value is WorkOrder {
  if (!value || typeof value !== 'object') return false;
  const workOrder = value as Partial<WorkOrder>;
  const validStatuses: ServiceStatus[] = ['draft', 'awaiting_schedule', 'scheduled', 'in-progress', 'done', 'cancelled'];
  return (
    typeof workOrder.id === 'string' &&
    typeof workOrder.title === 'string' &&
    validStatuses.includes(workOrder.status as ServiceStatus)
  );
}

function readJsonArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  if (typeof window === 'undefined') return [];

  const storedValue = window.localStorage.getItem(key);
  const parsedValue = safeJsonParse<unknown[]>(storedValue, []);
    
  // Migração de dados legados para os novos status se necessário
  if (Array.isArray(parsedValue)) {
    const migrated = (parsedValue as Array<Record<string, unknown>>).map((item) => {
      if (item.status === 'open') {
        return { ...item, status: 'awaiting_schedule' };
      }
      return item;
    });
    return migrated.filter(guard) as unknown as T[];
  }
  return [];
}

function writeJsonArray<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function loadClients(): Client[] {
  return readJsonArray(CLIENTS_STORAGE_KEY, isClient);
}

export function saveClients(clients: Client[]): void {
  writeJsonArray(CLIENTS_STORAGE_KEY, clients);
}

export function loadWorkOrders(): WorkOrder[] {
  return readJsonArray(WORK_ORDERS_STORAGE_KEY, isWorkOrder);
}

export function saveWorkOrders(workOrders: WorkOrder[]): void {
  writeJsonArray(WORK_ORDERS_STORAGE_KEY, workOrders);
}

export function loadActiveWorkOrderId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_WORK_ORDER_STORAGE_KEY);
}

export function saveActiveWorkOrderId(workOrderId: string | null): void {
  if (typeof window === 'undefined') return;

  if (!workOrderId) {
    window.localStorage.removeItem(ACTIVE_WORK_ORDER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACTIVE_WORK_ORDER_STORAGE_KEY, workOrderId);
}
