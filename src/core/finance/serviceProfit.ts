import { financialSafety } from './financialSafety';

export interface ServiceProfitInput {
  receivedAmount: number;
  materialCost?: number;
  travelCost?: number;
  cardFee?: number;
  estimatedTax?: number;
  otherCosts?: number;
}

export interface ServiceProfitResult {
  receivedAmount: number;
  directCosts: number;
  financialCosts: number;
  grossProfit: number;
  netProfit: number;
  netMarginPercent: number;
}

export function calculateServiceProfit(input: ServiceProfitInput): ServiceProfitResult {
  const receivedAmount = financialSafety.safeCurrency(input.receivedAmount);
  const materialCost = financialSafety.safeCurrency(input.materialCost);
  const travelCost = financialSafety.safeCurrency(input.travelCost);
  const otherCosts = financialSafety.safeCurrency(input.otherCosts);
  const cardFee = financialSafety.safeCurrency(input.cardFee);
  const estimatedTax = financialSafety.safeCurrency(input.estimatedTax);

  const directCosts = financialSafety.normalizeMoney(materialCost + travelCost + otherCosts);
  const financialCosts = financialSafety.normalizeMoney(cardFee + estimatedTax);
  const grossProfit = financialSafety.normalizeMoney(receivedAmount - directCosts);
  const netProfit = financialSafety.normalizeMoney(grossProfit - financialCosts);
  
  let netMarginPercent = 0;
  if (receivedAmount > 0) {
    netMarginPercent = financialSafety.normalizeMoney((netProfit / receivedAmount) * 100);
  }

  return {
    receivedAmount,
    directCosts,
    financialCosts,
    grossProfit,
    netProfit,
    netMarginPercent,
  };
}

export function calculatePercentAmount(base: number, percent: number): number {
  const safeBase = financialSafety.safeCurrency(base);
  const safePercent = financialSafety.safePercentage(percent);
  return financialSafety.normalizeMoney((safeBase * safePercent) / 100);
}
