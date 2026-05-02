import { describe, expect, it } from 'vitest';
import {
  calculateConduitFill,
  calculateVoltageDrop,
  recommendCircuit,
  roundTechnical,
} from './electrical';
import {
  calculateFinalPrice,
  calculateReservoirAutonomy,
  calculateSalePriceByMarkup,
  calculateSalePriceByTargetMargin,
  convertFlow,
  convertPower,
  convertPressure,
  convertThermalPower,
  roundTrade,
} from './trade';

describe('field expansion calculation coverage', () => {
  it('keeps residential voltage drop and conduit fill predictable', () => {
    const drop = calculateVoltageDrop({
      currentAmps: 20,
      distanceMeters: 25,
      sectionMm2: 2.5,
      voltageVolts: 220,
      material: 'copper',
      phase: 'single-phase',
    });
    const conduit = calculateConduitFill({
      conduitInternalDiameterMm: 20,
      cableExternalDiameterMm: 4,
      cableCount: 3,
    });

    expect(roundTechnical(drop.dropVolts)).toBe(7);
    expect(roundTechnical(drop.dropPercent)).toBe(3.18);
    expect(roundTechnical(conduit.fillPercent)).toBe(12);
  });

  it('recommends circuit current, breaker and cable from practical field inputs', () => {
    const circuit = recommendCircuit({
      powerWatts: 4400,
      voltageVolts: 220,
      powerFactor: 1,
      phase: 'single-phase',
    });

    expect(roundTechnical(circuit.currentAmps)).toBe(20);
    expect(circuit.suggestedBreakerAmps).toBe(20);
    expect(circuit.suggestedCableSectionMm2).toBe(2.5);
  });

  it('distinguishes planned target margin from applied discount pricing', () => {
    const planned = calculateSalePriceByTargetMargin({
      cost: 800,
      marginPercent: 30,
      taxPercent: 6,
      plannedDiscountPercent: 5,
    });
    const appliedDiscount = calculateFinalPrice({
      material: 800,
      labor: 0,
      percent: 30,
      marginMode: 'margin-sale',
      taxPercent: 6,
      discountPercent: 5,
    });

    expect(roundTrade(planned.suggestedPrice, 2)).toBe(1275.19);
    expect(roundTrade(planned.effectiveMarginPercent)).toBe(30);
    expect(roundTrade(appliedDiscount.total, 2)).toBe(1150.86);
  });

  it('distinguishes markup on cost from margin on sale for quick pricing', () => {
    const markup = calculateSalePriceByMarkup({
      cost: 800,
      markupPercent: 30,
      taxPercent: 6,
    });

    expect(roundTrade(markup.finalPrice, 2)).toBe(1102.4);
    expect(roundTrade(markup.effectiveMarginPercent)).toBe(27.43);
  });

  it('covers hydraulic autonomy and flow conversions used by advanced modules', () => {
    const autonomy = calculateReservoirAutonomy({
      reservoirLiters: 1000,
      people: 4,
      litersPerPersonDay: 150,
    });
    const flow = convertFlow({ value: 1.2, unit: 'm3h' });
    const pressure = convertPressure({ value: 12, unit: 'mca' });

    expect(roundTrade(autonomy.days)).toBe(1.67);
    expect(roundTrade(flow.litersPerMinute)).toBe(20);
    expect(roundTrade(pressure.bar, 3)).toBe(1.177);
  });

  it('covers advanced unit converters without asking equivalent values twice', () => {
    const power = convertPower({ value: 1, unit: 'kw' });
    const thermal = convertThermalPower({ value: 12000, unit: 'btuh' });

    expect(roundTrade(power.cv, 3)).toBe(1.36);
    expect(roundTrade(power.hp, 3)).toBe(1.341);
    expect(roundTrade(thermal.watts)).toBe(3516.85);
  });
});
