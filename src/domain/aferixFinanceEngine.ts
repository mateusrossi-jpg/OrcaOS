import { Budget } from './budget';

export interface BudgetInputs {
  chargedValue: number;
  materialCost: number;
  travelCost: number;
  helperCost: number;
  fees: number;
  discounts: number;
  otherCosts: number;
}

export interface BudgetCalculationResult {
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  statusLucro: 'saudavel' | 'atencao' | 'prejuizo';
}

export function calculateBudget(inputs: BudgetInputs): BudgetCalculationResult {
  const {
    chargedValue,
    materialCost,
    travelCost,
    helperCost,
    fees,
    discounts,
    otherCosts,
  } = inputs;

  const totalCost = materialCost + travelCost + helperCost + otherCosts + fees;
  const netChargedValue = chargedValue - discounts;
  const grossProfit = netChargedValue - totalCost;
  
  let marginPercent = 0;
  if (netChargedValue > 0) {
    marginPercent = (grossProfit / netChargedValue) * 100;
  }

  let statusLucro: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
  
  if (grossProfit < 0) {
    statusLucro = 'prejuizo';
  } else if (marginPercent < 20) {
    statusLucro = 'atencao';
  }

  return {
    totalCost,
    grossProfit,
    marginPercent,
    statusLucro,
  };
}
