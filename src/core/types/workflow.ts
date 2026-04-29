import type { CalculatorModule } from '../access/featureAccess';

export type CalculationDestination = 'survey' | 'budget' | 'both';

export type TechnicalItemType =
  | 'diagnostic'
  | 'technicalObservation'
  | 'service'
  | 'material'
  | 'projectSpecification';

export interface CalculationCapture {
  id: string;
  module: CalculatorModule;
  moduleLabel: string;
  calculatorLabel: string;
  destination: CalculationDestination;
  createdAt: string;
  summary: string;
  details: string[];
  itemType?: TechnicalItemType;
  editableDescription?: string;
  technicalNote?: string;
  quantity?: string;
  unitValue?: string;
  shouldGenerateBudgetItem?: boolean;
  convertedToBudgetItem?: boolean;
  imageDataUrl?: string;
  reportReady?: boolean;
}
