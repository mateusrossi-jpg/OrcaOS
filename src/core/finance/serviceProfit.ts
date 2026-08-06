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

function safeAmount(value: number | undefined, label: string): number {
  const amount = value ?? 0;
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${label} não pode ser negativo ou inválido.`);
  }
  return amount;
}

export function calculateServiceProfit(input: ServiceProfitInput): ServiceProfitResult {
  const receivedAmount = safeAmount(input.receivedAmount, 'Valor recebido');
  const materialCost = safeAmount(input.materialCost, 'Material');
  const travelCost = safeAmount(input.travelCost, 'Deslocamento');
  const otherCosts = safeAmount(input.otherCosts, 'Outros custos');
  const cardFee = safeAmount(input.cardFee, 'Taxa de cartão');
  const estimatedTax = safeAmount(input.estimatedTax, 'Imposto estimado');

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
  const safeBase = safeAmount(base, 'Base');
  const safePercent = safeAmount(percent, 'Percentual');
  return safeBase * safePercent / 100;
}
