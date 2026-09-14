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

    const expected = Number(input.expectedValue) || 0;
    const received = Number(input.receivedValue) || 0;
    const openBalance = Math.max(0, expected - received);
    
    let status: FinanceStatus = input.status ?? 'pending';
    if (received >= expected && expected > 0) {
      status = 'paid';
    } else if (received > 0) {
      status = 'partial';
    } else if (!input.status) {
      status = 'pending';
    }

    const record: SimpleFinanceRecord = {
      id: existingRecord?.id ?? input.id ?? (generateUUID()),
      companyId: input.companyId ?? 'default-company',
      workspaceId: input.workspaceId ?? 'default-workspace',
      title: input.title,
      clientId: input.clientId ?? '',
      siteId: input.siteId,
      clientName: input.clientName ?? '',
      status,
      workOrderId: input.workOrderId ?? '',
      expectedValue: expected,
      receivedValue: received,
      openBalance,
      materialCost: Number(input.materialCost) || 0,
      travelCost: Number(input.travelCost) || 0,
      cardFee: Number(input.cardFee) || 0,
      estimatedTax: Number(input.estimatedTax) || 0,
      otherCosts: Number(input.otherCosts) || 0,
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

  async registerExpense(input: {
    title: string;
    category?: string;
    amount: number;
    notes?: string;
    companyId?: string;
    workspaceId?: string;
  }): Promise<SimpleFinanceRecord> {
    const isFuel = input.category === 'fuel' || input.title.toLowerCase().includes('gasolina') || input.title.toLowerCase().includes('combust');
    return await this.saveRecord({
      title: input.title,
      clientId: 'EXPENSE',
      clientName: input.category === 'fuel' ? 'Combustível' : (input.category || 'Despesa'),
      workOrderId: '',
      expectedValue: 0,
      receivedValue: 0,
      materialCost: isFuel ? 0 : (input.category === 'material' ? input.amount : 0),
      travelCost: isFuel ? input.amount : 0,
      otherCosts: (!isFuel && input.category !== 'material') ? input.amount : 0,
      cardFee: 0,
      estimatedTax: 0,
      status: 'paid',
      companyId: input.companyId,
      workspaceId: input.workspaceId,
    });
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
