import { describe, expect, it } from 'vitest';
import {
  calculateConduitFill,
  calculateVoltageDrop,
  recommendCircuit,
  roundTechnical,
} from './electrical';
import {
  calculateAreaWithLoss,
  calculateBlocks,
  calculateConcreteVolume,
  calculateDailyRate,
  calculateFinalPrice,
  calculateHourlyRate,
  calculateInstallments,
  calculatePaintLiters,
  calculateReservoirAutonomy,
  calculateSalePriceByMarkup,
  calculateSalePriceByTargetMargin,
  calculateTiles,
  calculateUpfront,
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

  it('covers construction quantities used by advanced field modules', () => {
    const area = calculateAreaWithLoss({ widthM: 4, lengthM: 5, lossPercent: 10 });
    const concrete = calculateConcreteVolume({ widthM: 3, lengthM: 4, thicknessCm: 10, lossPercent: 10, bagsPerM3: 7 });
    const blocks = calculateBlocks({ wallAreaM2: 10, blockWidthCm: 39, blockHeightCm: 19, lossPercent: 10 });
    const tiles = calculateTiles({ areaM2: 20, tileWidthCm: 60, tileHeightCm: 60, piecesPerBox: 4, lossPercent: 10 });

    expect(roundTrade(area.totalAreaM2)).toBe(22);
    expect(roundTrade(concrete.totalCubicMeters)).toBe(1.32);
    expect(concrete.bags).toBe(10);
    expect(blocks.pieces).toBe(149);
    expect(tiles.pieces).toBe(62);
    expect(tiles.boxes).toBe(16);
  });

  it('covers painting quantity and commercial service helpers', () => {
    const paint = calculatePaintLiters({ areaM2: 45, coats: 2, yieldM2PerLiter: 10, lossPercent: 10 });
    const daily = calculateDailyRate({ days: 2, dailyValue: 320, helperDailyValue: 180, travel: 80 });
    const hourly = calculateHourlyRate({ hours: 5, hourlyValue: 95, travel: 60 });
    const installments = calculateInstallments({ total: 1200, installments: 6, interestPercent: 12 });
    const upfront = calculateUpfront({ total: 1200, upfrontPercent: 35 });

    expect(roundTrade(paint.liters)).toBe(9.9);
    expect(paint.gallons36L).toBe(3);
    expect(daily.total).toBe(1080);
    expect(hourly.total).toBe(535);
    expect(roundTrade(installments.installmentValue)).toBe(224);
    expect(upfront.upfront).toBe(420);
    expect(upfront.remaining).toBe(780);
  });

  it('covers advanced unit converters without asking equivalent values twice', () => {
    const power = convertPower({ value: 1, unit: 'kw' });
    const thermal = convertThermalPower({ value: 12000, unit: 'btuh' });

    expect(roundTrade(power.cv, 3)).toBe(1.36);
    expect(roundTrade(power.hp, 3)).toBe(1.341);
    expect(roundTrade(thermal.watts)).toBe(3516.85);
  });
});
