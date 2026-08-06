export const financialSafety = {
  safeCurrency(value: number | string | null | undefined, fallback = 0): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return fallback;
    const amount = this.normalizeMoney(parsed);
    return amount < 0 ? fallback : amount;
  },

  normalizeMoney(value: number): number {
    if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
    // Fix JS float issues (e.g. 0.1 + 0.2) and round to 2 decimal places safely
    return Math.round((value + Number.EPSILON) * 100) / 100;
  },

  safePercentage(value: number | string | null | undefined, fallback = 0): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return fallback;
    return this.clampFinancialValue(parsed, 0, 100);
  },

  clampFinancialValue(value: number, min: number, max: number): number {
    const num = this.normalizeMoney(value);
    if (num < min) return min;
    if (num > max) return max;
    return num;
  },

  detectFinancialCorruption(
    totals: { totalServices: number; materialCost: number; operationalCosts: number; netFinalValue: number; marginPercent: number }
  ): string[] {
    const warnings: string[] = [];

    if (!Number.isFinite(totals.totalServices) || totals.totalServices < 0) warnings.push('Invalid totalServices (Negative or Infinity)');
    if (!Number.isFinite(totals.materialCost) || totals.materialCost < 0) warnings.push('Invalid materialCost (Negative or Infinity)');
    if (!Number.isFinite(totals.operationalCosts) || totals.operationalCosts < 0) warnings.push('Invalid operationalCosts (Negative or Infinity)');

    if (totals.marginPercent < -500 || totals.marginPercent > 500) {
      warnings.push(`Impossible margin detected: ${totals.marginPercent}%`);
    }

    if (totals.netFinalValue > totals.totalServices * 2) {
      warnings.push(`Absurd profit detected. Profit: ${totals.netFinalValue}, Revenue: ${totals.totalServices}`);
    }

    return warnings;
  }
};
