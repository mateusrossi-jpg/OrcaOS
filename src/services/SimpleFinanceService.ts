import { generateUUID } from '../core/utils/idGenerator';
import { SimpleFinanceRecord, SimpleFinanceRecordInput, FinanceStatus } from '../domain/finance';
import { SimpleFinanceRepository } from '../repositories/simpleFinanceRepository';
import { DexieSimpleFinanceRepository } from '../repositories/dexieSimpleFinanceRepository';

export class SimpleFinanceService {
  private repository: SimpleFinanceRepository;

  constructor(repository?: SimpleFinanceRepository) {
    this.repository = repository ?? new DexieSimpleFinanceRepository();
  }

  async listRecords(): Promise<SimpleFinanceRecord[]> {
    return await this.repository.listRecords();
  }

  async saveRecord(input: SimpleFinanceRecordInput): Promise<SimpleFinanceRecord> {
    const currentRecords = await this.listRecords();
    const existingRecord = input.id ? currentRecords.find((r) => r.id === input.id) : undefined;
    const now = new Date().toISOString();

    const expected = input.expectedValue;
    const received = input.receivedValue;
    const openBalance = Math.max(0, expected - received);
    
    let status: FinanceStatus = 'pending';
    if (received > 0) {
      status = received >= expected ? 'paid' : 'partial';
    }

    const record: SimpleFinanceRecord = {
      id: existingRecord?.id ?? input.id ?? (generateUUID()),
      companyId: input.companyId ?? 'default-company',
      workspaceId: input.workspaceId ?? 'default-workspace',
      title: input.title,
      clientId: input.clientId,
      siteId: input.siteId,
      clientName: input.clientName,
      status,
      workOrderId: input.workOrderId,
      expectedValue: expected,
      receivedValue: received,
      openBalance,
      materialCost: input.materialCost,
      travelCost: input.travelCost,
      cardFee: input.cardFee,
      estimatedTax: input.estimatedTax,
      otherCosts: input.otherCosts,
      createdAt: existingRecord?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingRecord) {
      await this.repository.updateRecord(record);
    } else {
      await this.repository.createRecord(record);
    }
    return record;
  }

  async registerPayment(workOrderId: string, amount: number): Promise<SimpleFinanceRecord | null> {
    const currentRecords = await this.listRecords();
    const record = currentRecords.find((r) => r.workOrderId === workOrderId);
    if (!record) {
      // No existing record, create a new one with expected and received values set to amount
      return this.saveRecord({
        title: `Finance for ${workOrderId}`,
        clientId: '',
        siteId: '',
        clientName: '',
        workOrderId,
        expectedValue: amount,
        receivedValue: amount,
        materialCost: 0,
        travelCost: 0,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: 0
      });
    }
    
    const newReceived = record.receivedValue + amount;
    
    return this.saveRecord({
      ...record,
      receivedValue: newReceived
    });
  }

  async deleteRecord(id: string): Promise<void> {
    await this.repository.deleteRecord(id);
  }
}
