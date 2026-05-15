import type { CalculatorModule } from '../../core/access/featureAccess';
import type { GeneralCalculatorModule } from '../../features/calculators/components/GeneralCalculatorWorkspace';
import { calculationSectorGroups } from '../orcaAppData';
import type { CalculationSectorId } from '../orcaAppTypes';

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
