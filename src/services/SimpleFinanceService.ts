import { SimpleFinanceRecord, SimpleFinanceRecordInput } from '../domain/finance';
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

    const record: SimpleFinanceRecord = {
      id: existingRecord?.id ?? input.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `finance-${Date.now()}`),
      title: input.title,
      clientName: input.clientName,
      status: input.status ?? existingRecord?.status ?? 'realized',
      receivedAmount: input.receivedAmount,
      materialCost: input.materialCost,
      travelCost: input.travelCost,
      cardFee: input.cardFee,
      estimatedTax: input.estimatedTax,
      otherCosts: input.otherCosts,
      sourceBudgetId: input.sourceBudgetId,
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

  async deleteRecord(id: string): Promise<void> {
    await this.repository.deleteRecord(id);
  }
}
