import { describe, expect, it } from 'vitest';
import { loadClients, saveClients, loadWorkOrders, saveWorkOrders, loadActiveWorkOrderId, saveActiveWorkOrderId } from './clientWorkOrderStorage';
import type { Client, Service as WorkOrder } from '../../../core/types/business';

describe('clientWorkOrderStorage', () => {
  const mockClient: Client = {
    id: 'client-1',
    name: 'Test Client',
    phone: '123456789',
    email: 'test@example.com'
  };

  const mockWorkOrder: WorkOrder = {
    id: 'os-1',
    clientId: 'client-1',
    title: 'Test Service',
    status: 'in-progress',
    priority: 'normal',
    paymentStatus: 'pending'
  };

  it('correctly loads and saves clients', () => {
    saveClients([mockClient]);
    const clients = loadClients();
    expect(clients).toHaveLength(1);
    expect(clients[0]).toEqual(mockClient);
  });

  it('correctly loads and saves work orders', () => {
    saveWorkOrders([mockWorkOrder]);
    const workOrders = loadWorkOrders();
    expect(workOrders).toHaveLength(1);
    expect(workOrders[0]).toEqual(mockWorkOrder);
  });

  it('correctly manages active work order ID', () => {
    saveActiveWorkOrderId('os-1');
    expect(loadActiveWorkOrderId()).toBe('os-1');
    saveActiveWorkOrderId(null);
    expect(loadActiveWorkOrderId()).toBeNull();
  });
});
