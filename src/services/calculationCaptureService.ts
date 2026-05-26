import { CalculationCapture } from '../core/types/workflow';
import { CalculationCaptureRepository } from '../repositories/calculationCaptureRepository';
import { DexieCalculationCaptureRepository } from '../repositories/dexieCalculationCaptureRepository';

export class CalculationCaptureService {
  private repository: CalculationCaptureRepository;

  constructor(repository?: CalculationCaptureRepository) {
    this.repository = repository ?? new DexieCalculationCaptureRepository();
  }

  async listCaptures(): Promise<CalculationCapture[]> {
    return this.repository.listCaptures();
  }

  async addCaptures(captures: CalculationCapture[]): Promise<void> {
    await this.repository.createManyCaptures(captures);
  }

  async deleteCapture(id: string): Promise<void> {
    await this.repository.deleteCapture(id);
  }

  async updateCapture(capture: CalculationCapture): Promise<void> {
    await this.repository.updateCapture(capture);
  }
}

export const calculationCaptureService = new CalculationCaptureService();
