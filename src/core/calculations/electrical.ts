import type {
  AirConditioningSizingInput,
  AirConditioningSizingResult,
  ApparentPowerInput,
  CircuitRecommendationInput,
  CircuitRecommendationResult,
  ConduitFillInput,
  ConduitFillResult,
  CurrentFromApparentPowerInput,
  CurrentFromPowerInput,
  EnergyConsumptionInput,
  LightingInput,
  LightingResult,
  PowerFromCurrentInput,
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
