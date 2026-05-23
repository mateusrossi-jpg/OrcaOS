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

function safeAmount(value: number | undefined): number {
  const amount = value ?? 0;
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return amount;
}

export function calculateServiceProfit(input: ServiceProfitInput): ServiceProfitResult {
  const receivedAmount = safeAmount(input.receivedAmount);
  const materialCost = safeAmount(input.materialCost);
  const travelCost = safeAmount(input.travelCost);
  const otherCosts = safeAmount(input.otherCosts);
  const cardFee = safeAmount(input.cardFee);
  const estimatedTax = safeAmount(input.estimatedTax);

  const directCosts = materialCost + travelCost + otherCosts;
  const financialCosts = cardFee + estimatedTax;
  const grossProfit = receivedAmount - directCosts;
  const netProfit = grossProfit - financialCosts;
  const netMarginPercent = receivedAmount > 0 ? (netProfit / receivedAmount) * 100 : 0;

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
  const safeBase = safeAmount(base);
  const safePercent = safeAmount(percent);
  return safeBase * safePercent / 100;
}
