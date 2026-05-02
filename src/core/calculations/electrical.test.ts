import { describe, expect, it } from 'vitest';
import {
  calculateAirConditioningSizing,
  calculateApparentPower,
  calculateCableSectionFromVoltageDrop,
  calculateConduitFill,
  calculateCurrentFromVoltageResistance,
  calculateCurrentFromApparentPower,
  calculateCurrentFromPower,
  calculateEnergyConsumption,
  calculateLighting,
  calculateMaxDistanceFromVoltageDrop,
  calculateMotorCurrent,
  calculateMotorSpeed,
  calculateParallelResistance,
  calculatePowerByResistance,
  calculatePowerFromCurrent,
  calculatePulleyRatio,
  calculateResistanceFromVoltageCurrent,
  calculateSeriesResistance,
  calculateTransformerSizing,
  calculateVoltageFromCurrentResistance,
  calculateVoltageDrop,
  convertAwgToMm2,
  recommendCircuit,
  roundTechnical,
  scaleAnalogSignal,
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
    const currentAmps = 10;
    const voltageVolts = 380;
    const powerFactor = 0.92;
    const power = calculatePowerFromCurrent({
      currentAmps,
      voltageVolts,
      powerFactor,
      phase: 'three-phase',
    });
    const expectedPower = Math.sqrt(3) * voltageVolts * currentAmps * powerFactor;

    expect(roundTechnical(power)).toBe(roundTechnical(expectedPower));
  });

  it('calculates all Ohm law targets', () => {
    const resistance = calculateResistanceFromVoltageCurrent({
      voltageVolts: 220,
      currentAmps: 10,
    });
    const current = calculateCurrentFromVoltageResistance({
      voltageVolts: 220,
      resistanceOhms: 22,
    });
    const voltage = calculateVoltageFromCurrentResistance({
      currentAmps: 10,
      resistanceOhms: 22,
    });

    expect(roundTechnical(resistance)).toBe(22);
    expect(roundTechnical(current)).toBe(10);
    expect(roundTechnical(voltage)).toBe(220);
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

  it('calculates maximum distance by voltage drop', () => {
    const result = calculateMaxDistanceFromVoltageDrop({
      currentAmps: 10,
      sectionMm2: 2.5,
      voltageVolts: 220,
      maxDropPercent: 4,
    });

    expect(roundTechnical(result.maxDropVolts)).toBe(8.8);
    expect(roundTechnical(result.maxDistanceMeters)).toBe(62.86);
  });

  it('sizes transformer by kVA with margin', () => {
    const result = calculateTransformerSizing({
      loadWatts: 8000,
      powerFactor: 0.8,
      safetyMarginPercent: 20,
    });

    expect(roundTechnical(result.apparentPowerKva)).toBe(10);
    expect(roundTechnical(result.apparentPowerWithMarginKva)).toBe(12);
    expect(result.suggestedCommercialKva).toBe(15);
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

  it('calculates motor current', () => {
    const result = calculateMotorCurrent({
      mechanicalPowerKw: 1.5,
      voltageVolts: 380,
      efficiency: 0.85,
      powerFactor: 0.8,
      phase: 'three-phase',
    });

    expect(roundTechnical(result)).toBe(3.35);
  });

  it('calculates motor synchronous speed and slip', () => {
    const result = calculateMotorSpeed({
      frequencyHz: 60,
      poles: 4,
      measuredRpm: 1720,
    });

    expect(roundTechnical(result.synchronousRpm)).toBe(1800);
    expect(roundTechnical(result.slipPercent ?? 0)).toBe(4.44);
  });

  it('calculates pulley ratio', () => {
    const result = calculatePulleyRatio({
      motorRpm: 1720,
      motorPulleyDiameterMm: 80,
      drivenPulleyDiameterMm: 160,
    });

    expect(roundTechnical(result.ratio)).toBe(0.5);
    expect(roundTechnical(result.drivenRpm)).toBe(860);
  });

  it('scales analog signals', () => {
    const currentLoop = scaleAnalogSignal({
      inputValue: 12,
      inputMin: 4,
      inputMax: 20,
      engineeringMin: 0,
      engineeringMax: 100,
    });
    const voltageSignal = scaleAnalogSignal({
      inputValue: 5,
      inputMin: 0,
      inputMax: 10,
      engineeringMin: 0,
      engineeringMax: 100,
    });

    expect(roundTechnical(currentLoop.engineeringValue)).toBe(50);
    expect(roundTechnical(currentLoop.percent)).toBe(50);
    expect(roundTechnical(voltageSignal.engineeringValue)).toBe(50);
    expect(roundTechnical(voltageSignal.percent)).toBe(50);
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
