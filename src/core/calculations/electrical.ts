import type {
  CurrentFromPowerInput,
  EnergyConsumptionInput,
  PowerFromCurrentInput,
  VoltageDropInput,
  VoltageDropResult,
} from '../types/electrical';
import { ensurePositiveNumber, ensurePowerFactor } from '../validation/numberValidation';

const SQRT_3 = Math.sqrt(3);

const RESISTIVITY = {
  copper: 0.0175,
  aluminum: 0.0282,
} as const;

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

export function roundTechnical(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
