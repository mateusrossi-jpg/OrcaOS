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
  materialCost: number;
  travelCost: number;
  helperCost: number;
  otherCosts: number;
  fees: number;
  discounts: number;
  chargedValue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
}

export interface Budget {
  id: string;
  title: string;
  clientId: string;
  status: BudgetStatus;
  chargedValue: number;
  materialCost: number;
  travelCost: number;
  helperCost: number;
  fees: number;
  discounts: number;
  otherCosts: number;
  createdAt: number;
  updatedAt: number;
  finalizedAt?: number;
  financialSnapshot?: FinancialSnapshot;
}
