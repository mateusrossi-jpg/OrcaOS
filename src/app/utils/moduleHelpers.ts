import type { CalculatorModule } from '../../core/access/featureAccess';
import type { GeneralCalculatorModule } from '../../features/calculators/components/GeneralCalculatorWorkspace';
import type { CalculationSectorId, CalculationSectorGroup } from '../appTypes';

const calculationSectorGroups: CalculationSectorGroup[] = [
  {
    id: 'financial',
    title: 'Precificação',
    description: 'Cálculos voltados a preço, financeiro, margem/lucro, tempo, deslocamento, materiais, impostos/taxas e parcelamento/juros.',
    icon: 'R$',
    moduleIds: ['orcamentoTecnico'],
  },
];

export function isGeneralCalculatorModule(module: CalculatorModule): module is GeneralCalculatorModule {
  return module === 'orcamentoTecnico';
}

export function isProfessionalDomainModule(module: CalculatorModule): boolean {
  return false;
}

export function isExpansionModule(module: CalculatorModule): boolean {
  return module === 'financeiroAvancado';
}

export function getSectorForModule(moduleId: string): CalculationSectorId {
  return calculationSectorGroups.find((group) => group.moduleIds.includes(moduleId))?.id ?? 'financial';
}
