import { describe, expect, it } from 'vitest';
import { canUseCalculator, canUsePlanFeature, proFeatureTitle } from './featureAccess';

describe('feature access gates', () => {
  it('keeps free calculators open and pro calculators locked for free users', () => {
    expect(canUseCalculator('current', 'free')).toBe(true);
    expect(canUseCalculator('voltage-drop', 'free')).toBe(false);
    expect(canUseCalculator('voltage-drop', 'pro')).toBe(true);
  });

  it('uses the central plan gate for modern calculator workspaces', () => {
    expect(canUsePlanFeature('free', 'free')).toBe(true);
    expect(canUsePlanFeature('pro', 'free')).toBe(false);
    expect(canUsePlanFeature('pro', 'pro')).toBe(true);
    expect(canUsePlanFeature('soon', 'pro')).toBe(false);
  });

  it('keeps upgrade copy consistent', () => {
    expect(proFeatureTitle('pro')).toBe('Recurso do OrçaOS Pro');
    expect(proFeatureTitle('soon')).toBe('Recurso em breve');
  });
});
