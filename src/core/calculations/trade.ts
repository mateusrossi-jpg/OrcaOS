import { ensurePositiveNumber } from '../validation/numberValidation';

export type FlowUnit = 'lmin' | 'm3h';
export type PressureUnit = 'bar' | 'psi' | 'mca';
export type PowerUnit = 'kw' | 'cv' | 'hp';
export type ThermalUnit = 'btuh' | 'watts';
export type MarginMode = 'markup-cost' | 'margin-sale';

export const PRESSURE_PSI_PER_BAR = 14.5038;
export const PRESSURE_MCA_PER_BAR = 10.197;
export const KW_PER_CV = 0.7355;
export const KW_PER_HP = 0.7457;
export const WATTS_PER_BTUH = 0.293071;

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

export function roundTrade(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateRectangularReservoir(input: { widthM: number; lengthM: number; heightM: number }) {
  ensurePositiveNumber(input.widthM, 'Largura');
  ensurePositiveNumber(input.lengthM, 'Comprimento');
  ensurePositiveNumber(input.heightM, 'Altura');

  const cubicMeters = input.widthM * input.lengthM * input.heightM;
  return { cubicMeters, liters: cubicMeters * 1000 };
}

export function calculateCylindricalReservoir(input: { diameterM: number; heightM: number }) {
  ensurePositiveNumber(input.diameterM, 'Diâmetro');
  ensurePositiveNumber(input.heightM, 'Altura');

  const radiusM = input.diameterM / 2;
  const cubicMeters = Math.PI * radiusM ** 2 * input.heightM;
  return { radiusM, cubicMeters, liters: cubicMeters * 1000 };
}

export function calculateDailyWaterConsumption(input: { people: number; litersPerPersonDay: number }) {
  ensurePositiveNumber(input.people, 'Pessoas');
  ensurePositiveNumber(input.litersPerPersonDay, 'Consumo por pessoa');

  const litersPerDay = input.people * input.litersPerPersonDay;
  return { litersPerDay, cubicMetersPerDay: litersPerDay / 1000 };
}

export function calculateReservoirAutonomy(input: { reservoirLiters: number; people: number; litersPerPersonDay: number }) {
  ensurePositiveNumber(input.reservoirLiters, 'Reservatório');
  const consumption = calculateDailyWaterConsumption({ people: input.people, litersPerPersonDay: input.litersPerPersonDay });

  return { ...consumption, days: input.reservoirLiters / consumption.litersPerDay };
}

export function convertFlow(input: { value: number; unit: FlowUnit }) {
  ensurePositiveNumber(input.value, 'Vazão');

  const litersPerMinute = input.unit === 'm3h' ? input.value * 1000 / 60 : input.value;
  const litersPerHour = litersPerMinute * 60;
  return { litersPerMinute, litersPerHour, cubicMetersPerHour: litersPerHour / 1000 };
}

export function calculateFillTime(input: { volumeLiters: number; flowValue: number; flowUnit: FlowUnit }) {
  ensurePositiveNumber(input.volumeLiters, 'Volume');
  const flow = convertFlow({ value: input.flowValue, unit: input.flowUnit });
  const minutes = input.volumeLiters / flow.litersPerMinute;

  return { ...flow, minutes, hours: minutes / 60 };
}

export function convertPressure(input: { value: number; unit: PressureUnit }) {
  ensurePositiveNumber(input.value, 'Pressão');

  const bar = input.unit === 'psi'
    ? input.value / PRESSURE_PSI_PER_BAR
    : input.unit === 'mca'
      ? input.value / PRESSURE_MCA_PER_BAR
      : input.value;

  return { bar, psi: bar * PRESSURE_PSI_PER_BAR, mca: bar * PRESSURE_MCA_PER_BAR };
}

export function calculateWallArea(input: { widthM: number; heightM: number; walls: number; discountAreaM2?: number }) {
  ensurePositiveNumber(input.widthM, 'Largura');
  ensurePositiveNumber(input.heightM, 'Altura');
  ensurePositiveNumber(input.walls, 'Paredes');
  ensureNonNegativeNumber(input.discountAreaM2 ?? 0, 'Descontos');

  const grossAreaM2 = input.widthM * input.heightM * input.walls;
  return { grossAreaM2, netAreaM2: Math.max(grossAreaM2 - (input.discountAreaM2 ?? 0), 0) };
}

export function calculateAreaWithLoss(input: { widthM: number; lengthM: number; lossPercent?: number }) {
  ensurePositiveNumber(input.widthM, 'Largura');
  ensurePositiveNumber(input.lengthM, 'Comprimento');
  ensureNonNegativeNumber(input.lossPercent ?? 0, 'Perda');

  const areaM2 = input.widthM * input.lengthM;
  return { areaM2, totalAreaM2: areaM2 * (1 + (input.lossPercent ?? 0) / 100) };
}

export function calculateConcreteVolume(input: { widthM: number; lengthM: number; thicknessCm: number; lossPercent?: number; bagsPerM3?: number }) {
  ensurePositiveNumber(input.widthM, 'Largura');
  ensurePositiveNumber(input.lengthM, 'Comprimento');
  ensurePositiveNumber(input.thicknessCm, 'Espessura');
  ensureNonNegativeNumber(input.lossPercent ?? 0, 'Perda');

  const cubicMeters = input.widthM * input.lengthM * input.thicknessCm / 100;
  const totalCubicMeters = cubicMeters * (1 + (input.lossPercent ?? 0) / 100);
  return {
    cubicMeters,
    totalCubicMeters,
    bags: input.bagsPerM3 !== undefined ? Math.ceil(totalCubicMeters * input.bagsPerM3) : undefined,
  };
}

export function calculateBlocks(input: { wallAreaM2: number; blockWidthCm: number; blockHeightCm: number; lossPercent?: number }) {
  ensurePositiveNumber(input.wallAreaM2, 'Área');
  ensurePositiveNumber(input.blockWidthCm, 'Largura do bloco');
  ensurePositiveNumber(input.blockHeightCm, 'Altura do bloco');
  ensureNonNegativeNumber(input.lossPercent ?? 0, 'Perda');

  const blockAreaM2 = input.blockWidthCm / 100 * input.blockHeightCm / 100;
  const pieces = Math.ceil(input.wallAreaM2 / blockAreaM2 * (1 + (input.lossPercent ?? 0) / 100));
  return { blockAreaM2, pieces };
}

export function calculateTiles(input: { areaM2: number; tileWidthCm: number; tileHeightCm: number; piecesPerBox: number; lossPercent?: number }) {
  ensurePositiveNumber(input.areaM2, 'Área');
  ensurePositiveNumber(input.tileWidthCm, 'Largura da peça');
  ensurePositiveNumber(input.tileHeightCm, 'Altura da peça');
  ensurePositiveNumber(input.piecesPerBox, 'Peças por caixa');
  ensureNonNegativeNumber(input.lossPercent ?? 0, 'Perda');

  const tileAreaM2 = input.tileWidthCm / 100 * input.tileHeightCm / 100;
  const pieces = Math.ceil(input.areaM2 / tileAreaM2 * (1 + (input.lossPercent ?? 0) / 100));
  return { tileAreaM2, pieces, boxes: Math.ceil(pieces / input.piecesPerBox) };
}

export function calculatePaintLiters(input: { areaM2: number; coats: number; yieldM2PerLiter: number; lossPercent?: number }) {
  ensurePositiveNumber(input.areaM2, 'Área');
  ensurePositiveNumber(input.coats, 'Demãos');
  ensurePositiveNumber(input.yieldM2PerLiter, 'Rendimento');
  ensureNonNegativeNumber(input.lossPercent ?? 0, 'Perda');

  const liters = input.areaM2 * input.coats / input.yieldM2PerLiter * (1 + (input.lossPercent ?? 0) / 100);
  return { liters, gallons36L: Math.ceil(liters / 3.6), cans18L: Math.ceil(liters / 18) };
}

export function calculateRoomPaintingArea(input: { lengthM: number; widthM: number; heightM: number; discountAreaM2?: number; extraAreaM2?: number }) {
  ensurePositiveNumber(input.lengthM, 'Comprimento');
  ensurePositiveNumber(input.widthM, 'Largura');
  ensurePositiveNumber(input.heightM, 'Altura');
  ensureNonNegativeNumber(input.discountAreaM2 ?? 0, 'Descontos');
  ensureNonNegativeNumber(input.extraAreaM2 ?? 0, 'Área extra');

  const perimeterM = 2 * (input.lengthM + input.widthM);
  const wallAreaM2 = perimeterM * input.heightM;
  const netAreaM2 = Math.max(wallAreaM2 + (input.extraAreaM2 ?? 0) - (input.discountAreaM2 ?? 0), 0);
  return { perimeterM, wallAreaM2, netAreaM2 };
}

export function calculatePaintingBudget(input: { areaM2: number; coats: number; yieldM2PerLiter: number; paintPricePerLiter: number; laborPricePerM2: number; lossPercent?: number }) {
  const paint = calculatePaintLiters({
    areaM2: input.areaM2,
    coats: input.coats,
    yieldM2PerLiter: input.yieldM2PerLiter,
    lossPercent: input.lossPercent,
  });
  ensureNonNegativeNumber(input.paintPricePerLiter, 'Preço da tinta');
  ensureNonNegativeNumber(input.laborPricePerM2, 'Mão de obra');

  const material = paint.liters * input.paintPricePerLiter;
  const labor = input.areaM2 * input.laborPricePerM2;
  return { ...paint, material, labor, total: material + labor };
}

export function convertVolume(input: { value: number; unit: 'cubicMeters' | 'liters' }) {
  ensureNonNegativeNumber(input.value, 'Volume');
  const cubicMeters = input.unit === 'liters' ? input.value / 1000 : input.value;
  return { cubicMeters, liters: cubicMeters * 1000 };
}

export function convertPower(input: { value: number; unit: PowerUnit }) {
  ensureNonNegativeNumber(input.value, 'Potência');
  const kw = input.unit === 'cv' ? input.value * KW_PER_CV : input.unit === 'hp' ? input.value * KW_PER_HP : input.value;
  return { kw, cv: kw / KW_PER_CV, hp: kw / KW_PER_HP };
}

export function convertThermalPower(input: { value: number; unit: ThermalUnit }) {
  ensureNonNegativeNumber(input.value, 'Potência térmica');
  const watts = input.unit === 'btuh' ? input.value * WATTS_PER_BTUH : input.value;
  return { watts, btuh: watts / WATTS_PER_BTUH };
}

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
