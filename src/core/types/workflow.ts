import type { CalculatorModule } from '../access/featureAccess';

export type CalculationDestination = 'survey' | 'budget' | 'both';

export interface CalculationCapture {
  id: string;
  module: CalculatorModule;
  moduleLabel: string;
  calculatorLabel: string;
  destination: CalculationDestination;
  createdAt: string;
  summary: string;
  details: string[];
}
