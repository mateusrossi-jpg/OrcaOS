export type CalculatorModule = 'orcamentoTecnico';

export type CalculationDestination = 'survey' | 'budget' | 'both';

export type TechnicalItemType = 'service' | 'material' | 'technicalObservation' | 'diagnostic' | 'projectSpecification';

export type MaterialSupplyMode = 'professional' | 'client' | 'mixed' | 'undefined';

export interface CalculationCapture {
  id: string;
  module: CalculatorModule;
  moduleLabel: string;
  calculatorLabel: string;
  destination: CalculationDestination;
  createdAt: string;
  summary: string;
  details: string[];
  
  // Dados operacionais para o ERP
  itemType: TechnicalItemType;
  editableDescription: string;
  technicalNote?: string;
  quantity: string;
  unitValue: string;
  shouldGenerateBudgetItem: boolean;
  convertedToBudgetItem: boolean;
  reportReady: boolean;
  
  // Suporte a fotos e fornecimento
  imageDataUrl?: string;
  materialSupplyMode?: MaterialSupplyMode;
  materialReferenceUnitValue?: string;
  clientPurchaseRequired?: boolean;

  // Vínculos
  clientId?: string;
  workOrderId?: string;
}
