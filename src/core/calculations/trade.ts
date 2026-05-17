import { ensurePositiveNumber } from '../validation/numberValidation';

export type MarginMode = 'markup-cost' | 'margin-sale';

function ensureNonNegativeNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} deve ser um número válido maior ou igual a zero.`);
  }
}

function ensurePercent(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${fieldName} deve estar entre 0 e 100%.`);
  }
}

/**
 * Cálculos Comerciais e Financeiros do Aferix
 */

export function calculateLabor(input: { quantity: number; unitValue: number; travel?: number }) {
  ensurePositiveNumber(input.quantity, 'Quantidade');
  ensurePositiveNumber(input.unitValue, 'Valor unitário');
  ensureNonNegativeNumber(input.travel ?? 0, 'Deslocamento');

  const subtotal = input.quantity * input.unitValue;
  return { subtotal, travel: input.travel ?? 0, total: subtotal + (input.travel ?? 0) };
}

export function calculateFinalPrice(input: { material: number; labor: number; travel?: number; percent: number; marginMode: MarginMode; taxPercent?: number; discountPercent?: number }) {
  ensureNonNegativeNumber(input.material, 'Material');
  ensureNonNegativeNumber(input.labor, 'Mão de obra');
  ensureNonNegativeNumber(input.travel ?? 0, 'Deslocamento');
  ensureNonNegativeNumber(input.taxPercent ?? 0, 'Impostos');
  ensurePercent(input.discountPercent ?? 0, 'Desconto');
  
  if (input.marginMode === 'margin-sale' && (!Number.isFinite(input.percent) || input.percent < 0 || input.percent >= 100)) {
    throw new Error('Margem sobre venda deve ser menor que 100%.');
  }
  if (input.marginMode === 'markup-cost') ensureNonNegativeNumber(input.percent, 'Markup');

  const base = input.material + input.labor + (input.travel ?? 0);
  const priceBeforeTax = input.marginMode === 'margin-sale'
    ? base / (1 - input.percent / 100)
    : base * (1 + input.percent / 100);
  const profit = priceBeforeTax - base;
  const tax = priceBeforeTax * ((input.taxPercent ?? 0) / 100);
  const beforeDiscount = priceBeforeTax + tax;
  const discount = beforeDiscount * ((input.discountPercent ?? 0) / 100);
  const total = beforeDiscount - discount;

  return {
    base,
    priceBeforeTax,
    profit,
    effectiveMarginPercent: priceBeforeTax > 0 ? profit / priceBeforeTax * 100 : 0,
    tax,
    discount,
    total,
  };
}

export function calculateSalePriceByTargetMargin(input: { cost: number; marginPercent: number; taxPercent?: number; plannedDiscountPercent?: number }) {
  ensureNonNegativeNumber(input.cost, 'Custo');
  if (!Number.isFinite(input.marginPercent) || input.marginPercent < 0 || input.marginPercent >= 100) {
    throw new Error('Margem desejada deve ser menor que 100%.');
  }
  ensureNonNegativeNumber(input.taxPercent ?? 0, 'Taxas');
  ensurePercent(input.plannedDiscountPercent ?? 0, 'Desconto planejado');

  const minimumPrice = input.cost / (1 - input.marginPercent / 100);
  const priceWithTax = minimumPrice * (1 + (input.taxPercent ?? 0) / 100);
  const suggestedPrice = priceWithTax / (1 - (input.plannedDiscountPercent ?? 0) / 100);
  const profit = minimumPrice - input.cost;

  return {
    minimumPrice,
    suggestedPrice,
    profit,
    effectiveMarginPercent: minimumPrice > 0 ? profit / minimumPrice * 100 : 0,
  };
}

export function calculateSalePriceByMarkup(input: { cost: number; markupPercent: number; taxPercent?: number }) {
  ensureNonNegativeNumber(input.cost, 'Custo');
  ensureNonNegativeNumber(input.markupPercent, 'Markup');
  ensureNonNegativeNumber(input.taxPercent ?? 0, 'Taxas');

  const priceBeforeTax = input.cost * (1 + input.markupPercent / 100);
  const finalPrice = priceBeforeTax * (1 + (input.taxPercent ?? 0) / 100);
  const grossProfit = finalPrice - input.cost;

  return {
    finalPrice,
    grossProfit,
    effectiveMarginPercent: finalPrice > 0 ? grossProfit / finalPrice * 100 : 0,
  };
}

export function calculateDailyRate(input: { days: number; dailyValue: number; helperDailyValue?: number; travel?: number }) {
  ensurePositiveNumber(input.days, 'Dias');
  ensurePositiveNumber(input.dailyValue, 'Diária');
  ensureNonNegativeNumber(input.helperDailyValue ?? 0, 'Ajudante');
  ensureNonNegativeNumber(input.travel ?? 0, 'Deslocamento');

  const professional = input.days * input.dailyValue;
  const helper = input.days * (input.helperDailyValue ?? 0);
  return { professional, helper, travel: input.travel ?? 0, total: professional + helper + (input.travel ?? 0) };
}

export function calculateHourlyRate(input: { hours: number; hourlyValue: number; travel?: number }) {
  ensurePositiveNumber(input.hours, 'Horas');
  ensurePositiveNumber(input.hourlyValue, 'Valor hora');
  ensureNonNegativeNumber(input.travel ?? 0, 'Deslocamento');

  const subtotal = input.hours * input.hourlyValue;
  return { subtotal, travel: input.travel ?? 0, total: subtotal + (input.travel ?? 0) };
}

export function calculateInstallments(input: { total: number; installments: number; interestPercent?: number }) {
  ensurePositiveNumber(input.total, 'Total');
  ensurePositiveNumber(input.installments, 'Parcelas');
  ensureNonNegativeNumber(input.interestPercent ?? 0, 'Acréscimo');

  const adjustedTotal = input.total * (1 + (input.interestPercent ?? 0) / 100);
  return { adjustedTotal, installmentValue: adjustedTotal / input.installments };
}

export function calculateUpfront(input: { total: number; upfrontPercent: number }) {
  ensurePositiveNumber(input.total, 'Total');
  ensurePercent(input.upfrontPercent, 'Entrada');

  const upfront = input.total * input.upfrontPercent / 100;
  return { upfront, remaining: input.total - upfront };
}
