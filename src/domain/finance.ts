export interface SimpleFinanceRecord {
  id: string;
  title: string;
  clientName: string;
  status: 'forecast' | 'realized';
  receivedAmount: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
  sourceBudgetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleFinanceRecordInput {
  id?: string | null;
  title: string;
  clientName: string;
  status?: 'forecast' | 'realized';
  receivedAmount: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
  sourceBudgetId?: string;
}
