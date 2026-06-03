import { generateUUID } from '../core/utils/idGenerator';
import { contractService } from './contractService';
import { SimpleFinanceService } from './SimpleFinanceService';
import { operationalEventService } from './operationalEventService';
import { Contract } from '../domain/contract';

export class ContractBillingSchedulerService {
  /**
   * Scans all active contracts and generates financial records for the current period.
   * Logic: If no record exists for the contract in the current billing cycle, generate one.
   */
  async processContractBilling(): Promise<void> {
    const activeContracts = await contractService.getAll();
    const activeOnly = activeContracts.filter(c => c.status === 'active');
    
    const financeService = new SimpleFinanceService();
    const allFinanceRecords = await financeService.listRecords();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const contract of activeOnly) {
      // Logic for determining if billing is due
      // Simple MVP Logic: Ensure there's a record for this contract ID in this Month/Year
      const alreadyBilled = allFinanceRecords.some(f => 
        f.title.includes(`[RECORRENTE]`) &&
        f.title.includes(contract.id.slice(0, 8)) &&
        new Date(f.createdAt).getMonth() === currentMonth &&
        new Date(f.createdAt).getFullYear() === currentYear
      );

      if (!alreadyBilled) {
        await this.generateContractInvoice(contract);
      }
    }
  }

  private async generateContractInvoice(contract: Contract): Promise<void> {
    const financeService = new SimpleFinanceService();
    const recordId = generateUUID();
    const competenceMonth = `${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    const client = { name: 'Cliente Desconhecido' }; // Mock placeholder as per requirements
    
    await financeService.saveRecord({
      id: recordId,
      title: `${contract.title} - ${competenceMonth}`,
      clientId: contract.clientId,
      siteId: contract.siteIds?.[0], // Pick first site if available
      clientName: client?.name || 'Cliente Desconhecido', // Placeholder, usually client name fetched from service
      status: 'pending',
      workOrderId: `contract-${contract.id}`, // Linked to contract virtual "WorkOrder"
      expectedValue: contract.billingAmount,
      receivedValue: 0,
      materialCost: 0,
      travelCost: 0,
      cardFee: 0,
      estimatedTax: 0,
      otherCosts: 0
    });

    await operationalEventService.emitEvent({
      aggregateId: contract.id,
      aggregateType: 'contract',
      eventType: 'RECURRING_BILLING_GENERATED' as any,
      metadata: { clientId: contract.clientId, financeRecordId: recordId },
      snapshot: { amount: contract.billingAmount, billingDate: new Date().toISOString() }
    });
  }
}

export const contractBillingScheduler = new ContractBillingSchedulerService();
