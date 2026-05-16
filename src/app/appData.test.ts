import { describe, expect, it } from 'vitest';
import { calculatorAccessRules, type CalculatorModule } from '../core/access/featureAccess';
import { calculationModules, navItems, planLabel } from './appData';

const implementedStandaloneModules: CalculatorModule[] = [
  'orcamentoTecnico',
];

describe('Aferix app data integrity', () => {
  it('keeps main navigation unique and grouped', () => {
    const ids = navItems.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'home',
      'budgets',
      'clients',
      'financial',
      'catalog',
      'calculations',
      'purchaseList',
      'reports',
      'survey',
      'store',
      'settings',
    ]);
    expect(navItems.every((item) => item.label && item.description && item.section)).toBe(true);
    expect(navItems.filter((item) => item.primary).map((item) => item.id)).toEqual(['home', 'budgets', 'clients', 'financial', 'catalog']);
  });

  it('keeps active modules attached to an implemented calculator workspace', () => {
    const accessModules = new Set(calculatorAccessRules.map((rule) => rule.module));
    const standaloneModules = new Set<CalculatorModule>(implementedStandaloneModules);

    for (const module of calculationModules.filter((item) => item.available)) {
      expect(module.calculatorModule, `${module.title} precisa apontar para calculatorModule`).toBeDefined();
      expect(
        standaloneModules.has(module.calculatorModule as CalculatorModule) || accessModules.has(module.calculatorModule as CalculatorModule),
        `${module.title} aponta para um módulo sem workspace ou regra de acesso`,
      ).toBe(true);
    }
  });

  it('keeps unavailable modules as soon without calculator workspaces', () => {
    for (const module of calculationModules.filter((item) => !item.available)) {
      expect(module.plan).toBe('soon');
      expect(module.calculatorModule).toBeUndefined();
      expect(module.count.toLowerCase()).toContain('em breve');
    }
  });

  it('keeps plan labels concise for badges', () => {
    expect(planLabel('free')).toBe('Livre');
    expect(planLabel('pro')).toBe('Pro');
    expect(planLabel('soon')).toBe('Em breve');
  });
});
