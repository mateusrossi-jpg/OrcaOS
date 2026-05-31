export type FinanceStatus = 'pending' | 'partial' | 'paid';

export interface SimpleFinanceRecord {
  id: string;
  title: string;
  clientName: string;
  status: FinanceStatus;
  workOrderId: string;
  expectedValue: number;
  receivedValue: number;
  openBalance: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleFinanceRecordInput {
  id?: string | null;
  title: string;
  clientName: string;
  status?: FinanceStatus;
  workOrderId: string;
  expectedValue: number;
  receivedValue: number;
  materialCost: number;
  travelCost: number;
  cardFee: number;
  estimatedTax: number;
  otherCosts: number;
}
