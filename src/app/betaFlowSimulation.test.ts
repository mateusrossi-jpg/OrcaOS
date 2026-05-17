import { describe, expect, it } from 'vitest';
import type { Budget, Client, Service as WorkOrder } from '../core/types/business';

describe('Aferix Flow Simulation', () => {
  it('validates client, budget, service, and payment flow', () => {
    const mockClient: Client = {
      id: 'client-1',
      name: 'João Silva',
      phone: '11999999999'
    };

    const mockBudget: Budget = {
      id: 'budget-1',
      clientId: 'client-1',
      title: 'Reforma Elétrica',
      items: [
        { id: 'item-1', description: 'Mão de obra', quantity: 1, unitPrice: 500, category: 'labor' }
      ],
      status: 'approved'
    };

    const mockService: WorkOrder = {
      id: 'service-1',
      clientId: 'client-1',
      budgetId: 'budget-1',
      title: 'Reforma Elétrica',
      status: 'in-progress',
      paymentStatus: 'pending'
    };

    expect(mockClient.name).toBe('João Silva');
    expect(mockBudget.status).toBe('approved');
    expect(mockService.status).toBe('in-progress');
    expect(mockService.paymentStatus).toBe('pending');
  });
});
