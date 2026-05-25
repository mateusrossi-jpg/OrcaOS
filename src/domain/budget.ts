export const BUDGET_STATUS = {
  INICIADO: 'iniciado',
  EXECUCAO: 'execucao',
  REVISAO: 'revisao',
  ENVIADO: 'enviado',
  AUTORIZADO: 'autorizado',
  RECUSADO: 'recusado',
  FINALIZADO: 'finalizado',
} as const;

export type BudgetStatus = typeof BUDGET_STATUS[keyof typeof BUDGET_STATUS];

export interface FinancialSnapshot {
  custoTotal: number;
  lucroBruto: number;
  margemPercentual: number;
  statusLucro: 'saudavel' | 'atencao' | 'prejuizo';
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'labor' | 'material' | 'other';
}

export interface Budget {
  id: string;
  clientId?: string;
  clientName?: string; // Support legacy UI
  title: string;
  status: BudgetStatus;
  chargedValue: number;
  materialCost: number;
  travelCost: number;
  helperCost: number;
  fees: number;
  discounts: number;
  otherCosts: number;
  items?: BudgetItem[]; // Support legacy itemization
  notes?: string;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
  financialSnapshot?: FinancialSnapshot;
}
