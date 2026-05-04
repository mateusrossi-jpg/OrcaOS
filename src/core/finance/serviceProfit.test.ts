import { describe, expect, it } from 'vitest';
import { calculatePercentAmount, calculateServiceProfit } from './serviceProfit';

describe('service profit', () => {
  it('calculates real estimated profit for a completed service', () => {
    const result = calculateServiceProfit({
      receivedAmount: 780,
      materialCost: 210,
      travelCost: 35,
      cardFee: 18,
      estimatedTax: 46.8,
    });

    expect(result.directCosts).toBe(245);
    expect(result.financialCosts).toBe(64.8);
    expect(result.grossProfit).toBe(535);
    expect(result.netProfit).toBeCloseTo(470.2);
    expect(result.netMarginPercent).toBeCloseTo(60.282);
  });

  it('returns zero margin when nothing was received', () => {
    const result = calculateServiceProfit({ receivedAmount: 0, materialCost: 10 });

    expect(result.netProfit).toBe(-10);
    expect(result.netMarginPercent).toBe(0);
  });

  it('calculates percentage amounts used for card fees and estimated taxes', () => {
    expect(calculatePercentAmount(780, 6)).toBe(46.8);
  });

  it('rejects invalid negative values', () => {
    expect(() => calculateServiceProfit({ receivedAmount: 100, materialCost: -1 })).toThrow('Material');
  });
});
