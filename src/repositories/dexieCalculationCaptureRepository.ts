import { CalculationCapture } from '../core/types/workflow';
import { CalculationCaptureRepository } from './calculationCaptureRepository';
import { db } from '../storage/dexieDatabase';

export class DexieCalculationCaptureRepository implements CalculationCaptureRepository {
  async createCapture(capture: CalculationCapture): Promise<void> {
    await db.calculationCaptures.add(capture);
  }

  async createManyCaptures(captures: CalculationCapture[]): Promise<void> {
    await db.calculationCaptures.bulkAdd(captures);
  }

  async getCaptureById(id: string): Promise<CalculationCapture | undefined> {
    return await db.calculationCaptures.get(id);
  }

  async listCaptures(): Promise<CalculationCapture[]> {
    const all = await db.calculationCaptures.toArray();
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listCapturesByWorkOrderId(workOrderId: string): Promise<CalculationCapture[]> {
    const all = await db.calculationCaptures.where('workOrderId').equals(workOrderId).toArray();
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateCapture(capture: CalculationCapture): Promise<void> {
    await db.calculationCaptures.put(capture);
  }

  async deleteCapture(id: string): Promise<void> {
    await db.calculationCaptures.delete(id);
  }
}
