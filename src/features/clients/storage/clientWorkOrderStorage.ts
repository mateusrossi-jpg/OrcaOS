import type { Client, Service as WorkOrder, ServiceStatus } from '../../../core/types/business';

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
  return (
    typeof workOrder.id === 'string' &&
    typeof workOrder.title === 'string' &&
    (workOrder.status === 'in-progress' ||
      workOrder.status === 'done' ||
      workOrder.status === 'cancelled')
  );
}

function readJsonArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) return [];

    const parsedValue: unknown = JSON.parse(storedValue);
    
    // Migração de dados legados para os novos status se necessário
    if (Array.isArray(parsedValue)) {
      const migrated = parsedValue.map((item: any) => {
        if (item.status === 'open' || item.status === 'scheduled') {
          return { ...item, status: 'in-progress' };
        }
        return item;
      });
      return migrated.filter(guard);
    }
    return [];
  } catch {
    return [];
  }
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
