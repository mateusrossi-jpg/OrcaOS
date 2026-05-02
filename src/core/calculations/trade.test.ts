import { describe, expect, it } from 'vitest';
import {
  calculateAreaWithLoss,
  calculateBlocks,
  calculateConcreteVolume,
  calculateCylindricalReservoir,
  calculateDailyRate,
  calculateDailyWaterConsumption,
  calculateFillTime,
  calculateFinalPrice,
  calculateHourlyRate,
  calculateInstallments,
  calculateLabor,
  calculatePaintLiters,
  calculatePaintingBudget,
  calculateRectangularReservoir,
  calculateReservoirAutonomy,
  calculateRoomPaintingArea,
  calculateTiles,
  calculateUpfront,
  calculateWallArea,
  convertFlow,
  convertPower,
  convertPressure,
  convertThermalPower,
  convertVolume,
  roundTrade,
} from './trade';

describe('trade calculations', () => {
  it('calculates hydraulic reservoir, consumption and flow helpers', () => {
    expect(roundTrade(calculateRectangularReservoir({ widthM: 1.2, lengthM: 1.5, heightM: 1 }).liters)).toBe(1800);
    expect(roundTrade(calculateCylindricalReservoir({ diameterM: 1, heightM: 1 }).liters)).toBe(785.4);
    expect(calculateDailyWaterConsumption({ people: 4, litersPerPersonDay: 150 }).litersPerDay).toBe(600);
    expect(roundTrade(calculateReservoirAutonomy({ reservoirLiters: 1000, people: 4, litersPerPersonDay: 150 }).days)).toBe(1.67);
    expect(convertFlow({ value: 0.6, unit: 'm3h' }).litersPerMinute).toBe(10);
    expect(calculateFillTime({ volumeLiters: 1000, flowValue: 20, flowUnit: 'lmin' }).minutes).toBe(50);
    expect(roundTrade(convertPressure({ value: 1, unit: 'bar' }).mca, 3)).toBe(10.197);
  });

  it('calculates construction quantities', () => {
    const wall = calculateWallArea({ widthM: 3, heightM: 2.8, walls: 4, discountAreaM2: 2 });
    expect(roundTrade(wall.grossAreaM2)).toBe(33.6);
    expect(roundTrade(wall.netAreaM2)).toBe(31.6);
    expect(roundTrade(calculateAreaWithLoss({ widthM: 3, lengthM: 4, lossPercent: 10 }).totalAreaM2)).toBe(13.2);
    expect(calculateConcreteVolume({ widthM: 3, lengthM: 4, thicknessCm: 8, lossPercent: 10, bagsPerM3: 7 }).bags).toBe(8);
    expect(calculateBlocks({ wallAreaM2: wall.netAreaM2, blockWidthCm: 39, blockHeightCm: 19, lossPercent: 10 }).pieces).toBe(470);
    expect(calculateTiles({ areaM2: 12, tileWidthCm: 60, tileHeightCm: 60, piecesPerBox: 4, lossPercent: 10 }).boxes).toBe(10);
  });

  it('calculates painting quantities and budget', () => {
    const room = calculateRoomPaintingArea({ lengthM: 4, widthM: 3, heightM: 2.8, discountAreaM2: 2 });
    expect(roundTrade(room.wallAreaM2)).toBe(39.2);
    expect(roundTrade(room.netAreaM2)).toBe(37.2);
    const paint = calculatePaintLiters({ areaM2: 31.6, coats: 2, yieldM2PerLiter: 10, lossPercent: 10 });
    expect(roundTrade(paint.liters, 3)).toBe(6.952);
    expect(paint.gallons36L).toBe(2);
    const budget = calculatePaintingBudget({ areaM2: 31.6, coats: 2, yieldM2PerLiter: 10, paintPricePerLiter: 35, laborPricePerM2: 18, lossPercent: 10 });
    expect(roundTrade(budget.material, 2)).toBe(243.32);
    expect(roundTrade(budget.total, 2)).toBe(812.12);
  });

  it('converts volume, pressure, power and thermal units', () => {
    expect(convertVolume({ value: 1, unit: 'cubicMeters' }).liters).toBe(1000);
    expect(roundTrade(convertPressure({ value: 14.5038, unit: 'psi' }).bar, 3)).toBe(1);
    expect(roundTrade(convertPower({ value: 1, unit: 'cv' }).kw, 4)).toBe(0.7355);
    expect(roundTrade(convertThermalPower({ value: 12000, unit: 'btuh' }).watts)).toBe(3516.85);
  });

  it('calculates financial service prices', () => {
    expect(calculateLabor({ quantity: 10, unitValue: 45, travel: 50 }).total).toBe(500);
    expect(calculateDailyRate({ days: 2, dailyValue: 250, helperDailyValue: 120, travel: 50 }).total).toBe(790);
    expect(calculateHourlyRate({ hours: 6, hourlyValue: 80, travel: 50 }).total).toBe(530);
    expect(calculateInstallments({ total: 900, installments: 3, interestPercent: 0 }).installmentValue).toBe(300);
    expect(calculateUpfront({ total: 900, upfrontPercent: 30 }).remaining).toBe(630);
  });

  it('distinguishes markup on cost from margin on sale', () => {
    const markup = calculateFinalPrice({ material: 300, labor: 500, travel: 50, percent: 25, marginMode: 'markup-cost' });
    const margin = calculateFinalPrice({ material: 300, labor: 500, travel: 50, percent: 25, marginMode: 'margin-sale' });

    expect(markup.total).toBe(1062.5);
    expect(roundTrade(markup.effectiveMarginPercent)).toBe(20);
    expect(roundTrade(margin.total, 2)).toBe(1133.33);
    expect(roundTrade(margin.effectiveMarginPercent)).toBe(25);
  });
});
