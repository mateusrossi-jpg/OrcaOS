import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client, WorkOrder } from '../../../core/types/business';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  loadActiveWorkOrderId,
  loadClients,
  loadWorkOrders,
  saveActiveWorkOrderId,
  saveClients,
  saveWorkOrders,
} from './clientWorkOrderStorage';

const client: Client = {
  id: 'client-1',
  name: 'Cliente exemplo',
  phone: '',
};

const workOrder: WorkOrder = {
  id: 'wo-1',
  clientId: 'client-1',
  title: 'Instalação elétrica',
  status: 'open',
};

describe('client and work order storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('saves and loads clients and work orders', () => {
    saveClients([client]);
    saveWorkOrders([workOrder]);

    expect(loadClients()).toEqual([client]);
    expect(loadWorkOrders()).toEqual([workOrder]);
  });

  it('filters invalid client and work order records', () => {
    window.localStorage.setItem('orcaos:clients:v1', JSON.stringify([client, { id: 123 }, { id: 'missing-name' }]));
    window.localStorage.setItem('orcaos:work-orders:v1', JSON.stringify([workOrder, { id: 'bad-status', title: 'Inválida', status: 'waiting' }]));

    expect(loadClients()).toEqual([client]);
    expect(loadWorkOrders()).toEqual([workOrder]);
  });

  it('persists and clears the active work order id', () => {
    saveActiveWorkOrderId('wo-1');
    expect(loadActiveWorkOrderId()).toBe('wo-1');

    saveActiveWorkOrderId(null);
    expect(loadActiveWorkOrderId()).toBeNull();
  });

  it('returns safe defaults when browser storage is unavailable', () => {
    vi.unstubAllGlobals();

    expect(loadClients()).toEqual([]);
    expect(loadWorkOrders()).toEqual([]);
    expect(loadActiveWorkOrderId()).toBeNull();
  });
});
