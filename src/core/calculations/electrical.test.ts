import { describe, expect, it } from 'vitest';
import {
  calculateAirConditioningSizing,
  calculateApparentPower,
  calculateCableSectionFromVoltageDrop,
  calculateConduitFill,
  calculateCurrentFromApparentPower,
  calculateCurrentFromPower,
  calculateEnergyConsumption,
  calculateLighting,
  calculateParallelResistance,
  calculatePowerByResistance,
  calculatePowerFromCurrent,
  calculateResistanceFromVoltageCurrent,
  calculateSeriesResistance,
  calculateVoltageDrop,
  convertAwgToMm2,
  recommendCircuit,
  roundTechnical,
  suggestNearestAwg,
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

  it('calculates resistance by Ohm law', () => {
    const resistance = calculateResistanceFromVoltageCurrent({
      voltageVolts: 220,
      currentAmps: 10,
    });

    expect(roundTechnical(resistance)).toBe(22);
  });

  it('calculates power by resistance using current and voltage', () => {
    const byCurrent = calculatePowerByResistance({
      currentAmps: 10,
      resistanceOhms: 22,
    });
    const byVoltage = calculatePowerByResistance({
      voltageVolts: 220,
      resistanceOhms: 22,
    });

    expect(roundTechnical(byCurrent)).toBe(2200);
    expect(roundTechnical(byVoltage)).toBe(2200);
  });

  it('calculates series and parallel resistance', () => {
    const series = calculateSeriesResistance({ resistorsOhms: [100, 220, 330] });
    const parallel = calculateParallelResistance({ resistorsOhms: [100, 100] });

    expect(roundTechnical(series)).toBe(650);
    expect(roundTechnical(parallel)).toBe(50);
  });

  it('calculates apparent power from active power and power factor', () => {
    const apparentPower = calculateApparentPower({
      powerWatts: 1800,
      powerFactor: 0.9,
    });

    expect(roundTechnical(apparentPower)).toBe(2000);
  });

  it('calculates current from apparent power', () => {
    const current = calculateCurrentFromApparentPower({
      apparentPowerVa: 2200,
      voltageVolts: 220,
    });

    expect(roundTechnical(current)).toBe(10);
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

  it('calculates cable section by maximum voltage drop', () => {
    const result = calculateCableSectionFromVoltageDrop({
      currentAmps: 10,
      distanceMeters: 25,
      voltageVolts: 220,
      maxDropPercent: 4,
    });

    expect(roundTechnical(result.maxDropVolts)).toBe(8.8);
    expect(roundTechnical(result.requiredSectionMm2)).toBe(0.99);
  });

  it('converts AWG to mm2 and suggests nearest AWG', () => {
    expect(convertAwgToMm2('12')?.sectionMm2).toBe(3.31);
    expect(suggestNearestAwg(2.5)?.awg).toBe('12');
  });

  it('calculates lighting requirements', () => {
    const result = calculateLighting({
      areaM2: 12,
      targetLux: 300,
      lampLumens: 800,
    });

    expect(roundTechnical(result.requiredLumens)).toBe(3600);
    expect(result.lampQuantity).toBe(5);
  });

  it('estimates air conditioning BTU sizing', () => {
    const result = calculateAirConditioningSizing({
      areaM2: 12,
      people: 2,
      electronics: 1,
    });

    expect(roundTechnical(result.estimatedBtus)).toBe(8400);
    expect(result.suggestedCommercialBtus).toBe(9000);
  });

  it('calculates conduit fill percentage', () => {
    const result = calculateConduitFill({
      cableExternalDiameterMm: 4,
      cableCount: 3,
      conduitInternalDiameterMm: 16,
    });

    expect(roundTechnical(result.totalCableAreaMm2)).toBe(37.7);
    expect(roundTechnical(result.fillPercent)).toBe(18.75);
  });

  it('recommends circuit breaker and cable from load', () => {
    const result = recommendCircuit({
      powerWatts: 2200,
      voltageVolts: 220,
      powerFactor: 1,
    });

    expect(roundTechnical(result.currentAmps)).toBe(10);
    expect(result.suggestedBreakerAmps).toBe(10);
    expect(result.suggestedCableSectionMm2).toBe(1.5);
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
