import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { loadClients, saveClients, loadWorkOrders, saveWorkOrders, loadActiveWorkOrderId, saveActiveWorkOrderId } from './clientWorkOrderStorage';
import type { Client, Service as WorkOrder } from '../../../core/types/business';

describe('clientWorkOrderStorage', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
      }
    });
  });

  afterEach(() => {
    store = {};
  });

  const mockClient: Client = {
    id: 'client-1',
    name: 'Test Client',
    phone: '123456789',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockWorkOrder: WorkOrder = {
    id: 'os-1',
    clientId: 'client-1',
    title: 'Test Service',
    status: 'in-progress',
    priority: 'normal',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
