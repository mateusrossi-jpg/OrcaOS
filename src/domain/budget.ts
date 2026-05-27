/**
 * SINGLE SOURCE OF TRUTH (SSOT) FOR BUDGET DOMAIN
 * 
 * Todo o ciclo de vida, cálculo e persistência do Orçamento
 * devem ser baseados EXCLUSIVAMENTE nas tipagens deste arquivo.
 */

export const BUDGET_STATUS = {
  INICIADO: 'iniciado',
  EM_REVISAO: 'em_revisao',
  ENVIADO: 'enviado',
  AUTORIZADO: 'autorizado',
  EM_EXECUCAO: 'em_execucao',
  FINALIZADO: 'finalizado',
  ARQUIVADO: 'arquivado',
  RECUSADO: 'recusado',
  CANCELADO: 'cancelado',
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
  sourceId?: string;
  catalogId?: string;
}

export interface Budget {
  id: string;
  clientId?: string;
  clientName?: string; // Fallback/livre UI
  title: string;
  status: BudgetStatus;
  
  // Financial Core Inputs
  chargedValue: number; // Preço do Serviço Final (Faturamento)
  materialCost: number;
  travelCost: number;
  helperCost: number;
  fees: number;
  discounts: number;
  otherCosts: number;
  
  items: BudgetItem[];
  
  // Presentation & Terms
  templateId?: string;
  notes?: string;
  commercialNotes?: string;
  technicalNotes?: string;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: number | string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  finalizedAt?: string;
  
  financialSnapshot?: FinancialSnapshot;
}
