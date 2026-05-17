import { describe, expect, it } from 'vitest';
import {
  calculateFinalPrice,
  calculateSalePriceByTargetMargin,
  calculateSalePriceByMarkup,
  roundTrade,
} from '../../../core/calculations/trade';

describe('Financial Simulator Logic Protection', () => {
  it('correctly calculates final price based on markup and margin settings', () => {
    const markup = calculateFinalPrice({
      material: 100,
      labor: 200,
      travel: 50,
      percent: 25,
      marginMode: 'markup-cost',
    });

    const margin = calculateFinalPrice({
      material: 100,
      labor: 200,
      travel: 50,
      percent: 25,
      marginMode: 'margin-sale',
    });

    expect(markup.total).toBe(437.5); // (100+200+50) * 1.25
    expect(roundTrade(markup.effectiveMarginPercent)).toBe(20);

    expect(roundTrade(margin.total, 2)).toBe(466.67); // (100+200+50) / 0.75
    expect(roundTrade(margin.effectiveMarginPercent)).toBe(25);
  });

  it('correctly calculates markup and target margins directly', () => {
    const markupPrice = calculateSalePriceByMarkup({ cost: 100, markupPercent: 30, taxPercent: 5 });
    expect(roundTrade(markupPrice.finalPrice, 2)).toBe(136.5);

    const marginPrice = calculateSalePriceByTargetMargin({ cost: 100, marginPercent: 20, taxPercent: 10 });
    expect(roundTrade(marginPrice.minimumPrice, 2)).toBe(125);
    expect(roundTrade(marginPrice.suggestedPrice, 2)).toBe(137.5);
  });

  it('gracefully handles zeroes and empty percentages without returning NaN or Infinity', () => {
    const result = calculateFinalPrice({
      material: 0,
      labor: 0,
      travel: 0,
      percent: 0,
      marginMode: 'markup-cost',
    });

    expect(result.total).toBe(0);
    expect(Number.isFinite(result.total)).toBe(true);

    const marginResult = calculateFinalPrice({
      material: 0,
      labor: 0,
      travel: 0,
      percent: 0,
      marginMode: 'margin-sale',
    });

    expect(marginResult.total).toBe(0);
    expect(Number.isFinite(marginResult.total)).toBe(true);
  });

  it('correctly rounds commercial values to appropriate decimals', () => {
    expect(roundTrade(10.555)).toBe(10.56);
    expect(roundTrade(10.554)).toBe(10.55);
    expect(roundTrade(10.5, 0)).toBe(11);
  });
});
