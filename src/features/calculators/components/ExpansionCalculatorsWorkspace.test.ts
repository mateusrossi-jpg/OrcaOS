import { describe, expect, it } from 'vitest';
import { getExpansionCalculatorPlanStats } from './ExpansionCalculatorsWorkspace';

describe('advanced calculator monetization', () => {
  it('keeps pricing calculators as a meaningful Pro package', () => {
    const stats = getExpansionCalculatorPlanStats('financeiroAvancado');

    expect(stats.total).toBeGreaterThanOrEqual(14);
    expect(stats.pro).toBe(stats.total);
    expect(stats.free).toBe(0);
  });
});
