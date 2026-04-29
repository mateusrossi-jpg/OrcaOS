import type {
  AirConditioningSizingInput,
  AirConditioningSizingResult,
  AnalogScalingInput,
  AnalogScalingResult,
  ApparentPowerInput,
  AwgConversionResult,
  CableSectionFromVoltageDropInput,
  CableSectionFromVoltageDropResult,
  CircuitRecommendationInput,
  CircuitRecommendationResult,
  ConduitFillInput,
  ConduitFillResult,
  CurrentFromApparentPowerInput,
  CurrentFromPowerInput,
  EnergyConsumptionInput,
  LightingInput,
  LightingResult,
  MaxDistanceFromVoltageDropInput,
  MaxDistanceFromVoltageDropResult,
  MotorCurrentInput,
  MotorSpeedInput,
  MotorSpeedResult,
  PowerByResistanceInput,
  PowerFromCurrentInput,
  PulleyRatioInput,
  PulleyRatioResult,
  ResistanceFromVoltageCurrentInput,
  ResistorNetworkInput,
  TransformerSizingInput,
  TransformerSizingResult,
  VoltageDropInput,
  VoltageDropResult,
} from '../types/electrical';
import { suggestNextBreaker } from '../../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../../data/electrical-tables/cableSections';
import { ensurePositiveNumber, ensurePowerFactor } from '../validation/numberValidation';

const SQRT_3 = Math.sqrt(3);
const CIRCLE_AREA_FACTOR = Math.PI / 4;

const RESISTIVITY = {
  copper: 0.0175,
  aluminum: 0.0282,
} as const;

const COMMERCIAL_BTUS = [7500, 9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000] as const;
const COMMERCIAL_KVA = [1, 2, 3, 5, 7.5, 10, 15, 20, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000] as const;

const AWG_TABLE: AwgConversionResult[] = [
  { awg: '20', sectionMm2: 0.52 },
  { awg: '18', sectionMm2: 0.82 },
  { awg: '16', sectionMm2: 1.31 },
  { awg: '14', sectionMm2: 2.08 },
  { awg: '12', sectionMm2: 3.31 },
  { awg: '10', sectionMm2: 5.26 },
  { awg: '8', sectionMm2: 8.37 },
  { awg: '6', sectionMm2: 13.3 },
  { awg: '4', sectionMm2: 21.15 },
  { awg: '2', sectionMm2: 33.62 },
  { awg: '1/0', sectionMm2: 53.49 },
  { awg: '2/0', sectionMm2: 67.43 },
  { awg: '3/0', sectionMm2: 85.01 },
  { awg: '4/0', sectionMm2: 107.22 },
];

export function calculateCurrentFromPower(input: CurrentFromPowerInput): number {
  const powerFactor = input.powerFactor ?? 1;
  const phase = input.phase ?? 'single-phase';

  ensurePositiveNumber(input.powerWatts, 'Potência');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');
  ensurePowerFactor(powerFactor);

  if (phase === 'three-phase') {
    return input.powerWatts / (SQRT_3 * input.voltageVolts * powerFactor);
  }

  return input.powerWatts / (input.voltageVolts * powerFactor);
}

export function calculatePowerFromCurrent(input: PowerFromCurrentInput): number {
  const powerFactor = input.powerFactor ?? 1;
  const phase = input.phase ?? 'single-phase';

  ensurePositiveNumber(input.currentAmps, 'Corrente');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');
  ensurePowerFactor(powerFactor);

  if (phase === 'three-phase') {
    return SQRT_3 * input.voltageVolts * input.currentAmps * powerFactor;
  }

  return input.voltageVolts * input.currentAmps * powerFactor;
}

export function calculateResistanceFromVoltageCurrent(input: ResistanceFromVoltageCurrentInput): number {
  ensurePositiveNumber(input.voltageVolts, 'Tensão');
  ensurePositiveNumber(input.currentAmps, 'Corrente');

  return input.voltageVolts / input.currentAmps;
}

export function calculatePowerByResistance(input: PowerByResistanceInput): number {
  ensurePositiveNumber(input.resistanceOhms, 'Resistência');

  if (input.currentAmps !== undefined) {
    ensurePositiveNumber(input.currentAmps, 'Corrente');
    return input.currentAmps ** 2 * input.resistanceOhms;
  }

  if (input.voltageVolts !== undefined) {
    ensurePositiveNumber(input.voltageVolts, 'Tensão');
    return input.voltageVolts ** 2 / input.resistanceOhms;
  }

  throw new Error('Informe corrente ou tensão para calcular potência por resistência.');
}

export function calculateSeriesResistance(input: ResistorNetworkInput): number {
  if (input.resistorsOhms.length === 0) {
    throw new Error('Informe pelo menos uma resistência.');
  }

  return input.resistorsOhms.reduce((total, resistor, index) => {
    ensurePositiveNumber(resistor, `Resistência ${index + 1}`);
    return total + resistor;
  }, 0);
}

export function calculateParallelResistance(input: ResistorNetworkInput): number {
  if (input.resistorsOhms.length === 0) {
    throw new Error('Informe pelo menos uma resistência.');
  }

  const inverseSum = input.resistorsOhms.reduce((total, resistor, index) => {
    ensurePositiveNumber(resistor, `Resistência ${index + 1}`);
    return total + 1 / resistor;
  }, 0);

  return 1 / inverseSum;
}

export function calculateApparentPower(input: ApparentPowerInput): number {
  const powerFactor = input.powerFactor ?? 1;

  ensurePositiveNumber(input.powerWatts, 'Potência');
  ensurePowerFactor(powerFactor);

  return input.powerWatts / powerFactor;
}

export function calculateCurrentFromApparentPower(input: CurrentFromApparentPowerInput): number {
  const phase = input.phase ?? 'single-phase';

  ensurePositiveNumber(input.apparentPowerVa, 'Potência aparente');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');

  if (phase === 'three-phase') {
    return input.apparentPowerVa / (SQRT_3 * input.voltageVolts);
  }

  return input.apparentPowerVa / input.voltageVolts;
}

export function calculateEnergyConsumption(input: EnergyConsumptionInput): {
  kwh: number;
  estimatedCost?: number;
} {
  ensurePositiveNumber(input.powerWatts, 'Potência');
  ensurePositiveNumber(input.hoursPerDay, 'Horas por dia');
  ensurePositiveNumber(input.days, 'Dias');

  const kwh = (input.powerWatts * input.hoursPerDay * input.days) / 1000;

  if (input.tariffPerKwh !== undefined) {
    ensurePositiveNumber(input.tariffPerKwh, 'Tarifa por kWh');
    return {
      kwh,
      estimatedCost: kwh * input.tariffPerKwh,
    };
  }

  return { kwh };
}

export function calculateVoltageDrop(input: VoltageDropInput): VoltageDropResult {
  const phase = input.phase ?? 'single-phase';
  const material = input.material ?? 'copper';
  const resistivity = RESISTIVITY[material];

  ensurePositiveNumber(input.currentAmps, 'Corrente');
  ensurePositiveNumber(input.distanceMeters, 'Distância');
  ensurePositiveNumber(input.sectionMm2, 'Seção do condutor');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');

  const multiplier = phase === 'three-phase' ? SQRT_3 : 2;
  const dropVolts = (multiplier * resistivity * input.distanceMeters * input.currentAmps) / input.sectionMm2;

  return {
    dropVolts,
    dropPercent: (dropVolts / input.voltageVolts) * 100,
  };
}

export function calculateCableSectionFromVoltageDrop(input: CableSectionFromVoltageDropInput): CableSectionFromVoltageDropResult {
  const phase = input.phase ?? 'single-phase';
  const material = input.material ?? 'copper';
  const resistivity = RESISTIVITY[material];

  ensurePositiveNumber(input.currentAmps, 'Corrente');
  ensurePositiveNumber(input.distanceMeters, 'Distância');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');
  ensurePositiveNumber(input.maxDropPercent, 'Queda máxima');

  const maxDropVolts = input.voltageVolts * (input.maxDropPercent / 100);
  const multiplier = phase === 'three-phase' ? SQRT_3 : 2;
  const requiredSectionMm2 = (multiplier * resistivity * input.distanceMeters * input.currentAmps) / maxDropVolts;

  return {
    maxDropVolts,
    requiredSectionMm2,
  };
}

export function calculateMaxDistanceFromVoltageDrop(input: MaxDistanceFromVoltageDropInput): MaxDistanceFromVoltageDropResult {
  const phase = input.phase ?? 'single-phase';
  const material = input.material ?? 'copper';
  const resistivity = RESISTIVITY[material];

  ensurePositiveNumber(input.currentAmps, 'Corrente');
  ensurePositiveNumber(input.sectionMm2, 'Seção do condutor');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');
  ensurePositiveNumber(input.maxDropPercent, 'Queda máxima');

  const maxDropVolts = input.voltageVolts * (input.maxDropPercent / 100);
  const multiplier = phase === 'three-phase' ? SQRT_3 : 2;
  const maxDistanceMeters = (maxDropVolts * input.sectionMm2) / (multiplier * resistivity * input.currentAmps);

  return {
    maxDropVolts,
    maxDistanceMeters,
  };
}

export function calculateTransformerSizing(input: TransformerSizingInput): TransformerSizingResult {
  const powerFactor = input.powerFactor ?? 1;
  const safetyMarginPercent = input.safetyMarginPercent ?? 20;

  ensurePositiveNumber(input.loadWatts, 'Carga');
  ensurePowerFactor(powerFactor);

  if (!Number.isFinite(safetyMarginPercent) || safetyMarginPercent < 0) {
    throw new Error('Margem de segurança não pode ser negativa.');
  }

  const apparentPowerKva = input.loadWatts / powerFactor / 1000;
  const apparentPowerWithMarginKva = apparentPowerKva * (1 + safetyMarginPercent / 100);
  const suggestedCommercialKva = COMMERCIAL_KVA.find((kva) => kva >= apparentPowerWithMarginKva) ?? COMMERCIAL_KVA[COMMERCIAL_KVA.length - 1];

  return {
    apparentPowerKva,
    apparentPowerWithMarginKva,
    suggestedCommercialKva,
  };
}

export function convertAwgToMm2(awg: string): AwgConversionResult | null {
  return AWG_TABLE.find((item) => item.awg === awg.trim().toUpperCase()) ?? null;
}

export function suggestNearestAwg(sectionMm2: number): AwgConversionResult | null {
  ensurePositiveNumber(sectionMm2, 'Seção em mm²');

  return AWG_TABLE.find((item) => item.sectionMm2 >= sectionMm2) ?? AWG_TABLE[AWG_TABLE.length - 1] ?? null;
}

export function calculateLighting(input: LightingInput): LightingResult {
  ensurePositiveNumber(input.areaM2, 'Área');
  ensurePositiveNumber(input.targetLux, 'Iluminância desejada');

  const requiredLumens = input.areaM2 * input.targetLux;

  if (input.lampLumens !== undefined) {
    ensurePositiveNumber(input.lampLumens, 'Lúmens por luminária');
    return {
      requiredLumens,
      lampQuantity: Math.ceil(requiredLumens / input.lampLumens),
    };
  }

  return { requiredLumens };
}

export function calculateAirConditioningSizing(input: AirConditioningSizingInput): AirConditioningSizingResult {
  const sunFactor = input.sunFactor ?? 1;

  ensurePositiveNumber(input.areaM2, 'Área');
  ensurePositiveNumber(sunFactor, 'Fator solar');

  if (!Number.isFinite(input.people) || input.people < 0) {
    throw new Error('Quantidade de pessoas não pode ser negativa.');
  }

  if (!Number.isFinite(input.electronics) || input.electronics < 0) {
    throw new Error('Quantidade de equipamentos não pode ser negativa.');
  }

  const baseBtus = input.areaM2 * 600;
  const peopleBtus = Math.max(input.people - 1, 0) * 600;
  const electronicsBtus = input.electronics * 600;
  const estimatedBtus = (baseBtus + peopleBtus + electronicsBtus) * sunFactor;
  const suggestedCommercialBtus = COMMERCIAL_BTUS.find((btu) => btu >= estimatedBtus) ?? COMMERCIAL_BTUS[COMMERCIAL_BTUS.length - 1];

  return {
    estimatedBtus,
    suggestedCommercialBtus,
  };
}

export function calculateMotorCurrent(input: MotorCurrentInput): number {
  const efficiency = input.efficiency ?? 0.85;
  const powerFactor = input.powerFactor ?? 0.8;
  const phase = input.phase ?? 'three-phase';

  ensurePositiveNumber(input.mechanicalPowerKw, 'Potência mecânica');
  ensurePositiveNumber(input.voltageVolts, 'Tensão');
  ensurePowerFactor(powerFactor);
  ensurePowerFactor(efficiency);

  const electricalPowerWatts = (input.mechanicalPowerKw * 1000) / efficiency;

  return calculateCurrentFromPower({
    powerWatts: electricalPowerWatts,
    voltageVolts: input.voltageVolts,
    powerFactor,
    phase,
  });
}

export function calculateMotorSpeed(input: MotorSpeedInput): MotorSpeedResult {
  ensurePositiveNumber(input.frequencyHz, 'Frequência');
  ensurePositiveNumber(input.poles, 'Polos');

  const synchronousRpm = (120 * input.frequencyHz) / input.poles;

  if (input.measuredRpm !== undefined) {
    ensurePositiveNumber(input.measuredRpm, 'Rotação medida');

    return {
      synchronousRpm,
      slipPercent: ((synchronousRpm - input.measuredRpm) / synchronousRpm) * 100,
    };
  }

  return { synchronousRpm };
}

export function calculatePulleyRatio(input: PulleyRatioInput): PulleyRatioResult {
  ensurePositiveNumber(input.motorRpm, 'Rotação do motor');
  ensurePositiveNumber(input.motorPulleyDiameterMm, 'Polia motora');
  ensurePositiveNumber(input.drivenPulleyDiameterMm, 'Polia movida');

  const ratio = input.motorPulleyDiameterMm / input.drivenPulleyDiameterMm;

  return {
    ratio,
    drivenRpm: input.motorRpm * ratio,
  };
}

export function scaleAnalogSignal(input: AnalogScalingInput): AnalogScalingResult {
  ensurePositiveNumber(input.inputMax - input.inputMin, 'Faixa de entrada');

  const percent = ((input.inputValue - input.inputMin) / (input.inputMax - input.inputMin)) * 100;
  const engineeringValue = input.engineeringMin + (percent / 100) * (input.engineeringMax - input.engineeringMin);

  return {
    engineeringValue,
    percent,
  };
}

export function calculateConduitFill(input: ConduitFillInput): ConduitFillResult {
  ensurePositiveNumber(input.cableExternalDiameterMm, 'Diâmetro externo do cabo');
  ensurePositiveNumber(input.cableCount, 'Quantidade de cabos');
  ensurePositiveNumber(input.conduitInternalDiameterMm, 'Diâmetro interno do eletroduto');

  const cableAreaMm2 = CIRCLE_AREA_FACTOR * input.cableExternalDiameterMm ** 2;
  const totalCableAreaMm2 = cableAreaMm2 * input.cableCount;
  const conduitAreaMm2 = CIRCLE_AREA_FACTOR * input.conduitInternalDiameterMm ** 2;

  return {
    cableAreaMm2,
    totalCableAreaMm2,
    conduitAreaMm2,
    fillPercent: (totalCableAreaMm2 / conduitAreaMm2) * 100,
  };
}

export function recommendCircuit(input: CircuitRecommendationInput): CircuitRecommendationResult {
  const currentAmps = calculateCurrentFromPower(input);

  return {
    currentAmps,
    suggestedBreakerAmps: suggestNextBreaker(currentAmps),
    suggestedCableSectionMm2: suggestMinimumCableSectionByCurrent(currentAmps),
  };
}

export function roundTechnical(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
