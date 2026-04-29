import { describe, expect, it } from 'vitest';
import {
  calculateCurrentFromPower,
  calculateEnergyConsumption,
  calculatePowerFromCurrent,
  calculateVoltageDrop,
  roundTechnical,
} from './electrical';

describe('electrical calculations', () => {
  it('calculates current from power in a single-phase circuit', () => {
    const current = calculateCurrentFromPower({
      powerWatts: 2200,
      voltageVolts: 220,
      powerFactor: 1,
    });

    expect(roundTechnical(current)).toBe(10);
  });

  it('calculates power from current in a single-phase circuit', () => {
    const power = calculatePowerFromCurrent({
      currentAmps: 10,
      voltageVolts: 220,
      powerFactor: 1,
    });

    expect(roundTechnical(power)).toBe(2200);
  });

  it('calculates power from current in a three-phase circuit', () => {
    const power = calculatePowerFromCurrent({
      currentAmps: 10,
      voltageVolts: 380,
      powerFactor: 0.92,
      phase: 'three-phase',
    });

    expect(roundTechnical(power)).toBe(6055.92);
  });

  it('calculates energy consumption and estimated cost', () => {
    const result = calculateEnergyConsumption({
      powerWatts: 1000,
      hoursPerDay: 2,
      days: 30,
      tariffPerKwh: 0.95,
    });

    expect(roundTechnical(result.kwh)).toBe(60);
    expect(roundTechnical(result.estimatedCost ?? 0)).toBe(57);
  });

  it('calculates simplified voltage drop', () => {
    const result = calculateVoltageDrop({
      currentAmps: 10,
      distanceMeters: 25,
      sectionMm2: 2.5,
      voltageVolts: 220,
    });

    expect(roundTechnical(result.dropVolts)).toBe(3.5);
    expect(roundTechnical(result.dropPercent)).toBe(1.59);
  });

  it('rejects invalid power factor', () => {
    expect(() =>
      calculateCurrentFromPower({
        powerWatts: 2200,
        voltageVolts: 220,
        powerFactor: 1.2,
      }),
    ).toThrow('Fator de potência');
  });
});
