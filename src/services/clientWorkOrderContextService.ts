import type { Client, Service as WorkOrder } from '../core/types/business';
import {
  loadActiveWorkOrderId,
  loadClients,
  loadWorkOrders,
  saveActiveWorkOrderId,
  saveClients,
  saveWorkOrders,
} from '../features/clients/storage/clientWorkOrderStorage';

export const clientWorkOrderContextService = {
  loadClients(): Client[] {
    return loadClients();
  },

  saveClients(clients: Client[]): void {
    saveClients(clients);
  },

  loadWorkOrders(): WorkOrder[] {
    return loadWorkOrders();
  },

  saveWorkOrders(workOrders: WorkOrder[]): void {
    saveWorkOrders(workOrders);
  },

  loadActiveWorkOrderId(): string | null {
    return loadActiveWorkOrderId();
  },

  saveActiveWorkOrderId(workOrderId: string | null): void {
    saveActiveWorkOrderId(workOrderId);
  }
};