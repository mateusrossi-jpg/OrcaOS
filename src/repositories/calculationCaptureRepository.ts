import { CalculationCapture } from '../core/types/workflow';

export interface CalculationCaptureRepository {
  createCapture(capture: CalculationCapture): Promise<void>;
  createManyCaptures(captures: CalculationCapture[]): Promise<void>;
  getCaptureById(id: string): Promise<CalculationCapture | undefined>;
  listCaptures(): Promise<CalculationCapture[]>;
  listCapturesByWorkOrderId(workOrderId: string): Promise<CalculationCapture[]>;
  updateCapture(capture: CalculationCapture): Promise<void>;
  deleteCapture(id: string): Promise<void>;
}
