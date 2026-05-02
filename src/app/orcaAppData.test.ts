import { describe, expect, it } from 'vitest';
import { calculatorAccessRules, type CalculatorModule } from '../core/access/featureAccess';
import { calculationModules, calculationSectorGroups, navItems, planLabel } from './orcaAppData';

const implementedStandaloneModules: CalculatorModule[] = [
  'fundamentosGerais',
  'fundamentals',
  'obras',
  'pintura',
  'conversores',
  'orcamentoTecnico',
  'hidraulica',
  'eletricaResidencial',
  'financeiroAvancado',
  'construcaoAvancada',
  'hidraulicaAvancada',
  'conversoresAvancados',
  'refrigeration',
  'motors',
  'rewinding',
  'transformadores',
  'solar',
  'diagnosticoTecnico',
];

describe('OrçaOS app data integrity', () => {
  it('keeps main navigation unique and grouped', () => {
    const ids = navItems.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'home',
      'clients',
      'calculations',
      'survey',
      'budgets',
      'catalog',
      'reports',
      'settings',
      'store',
    ]);
    expect(navItems.every((item) => item.label && item.description && item.section)).toBe(true);
  });

  it('keeps every calculation sector connected to existing modules', () => {
    const moduleIds = new Set(calculationModules.map((module) => module.id));

    expect(calculationSectorGroups.length).toBeGreaterThan(0);
    for (const sector of calculationSectorGroups) {
      expect(sector.moduleIds.length).toBeGreaterThan(0);
      for (const moduleId of sector.moduleIds) {
        expect(moduleIds.has(moduleId)).toBe(true);
      }
    }
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
    expect(planLabel('free')).toBe('LIVRE');
    expect(planLabel('pro')).toBe('PRO');
    expect(planLabel('soon')).toBe('EM BREVE');
  });
});
