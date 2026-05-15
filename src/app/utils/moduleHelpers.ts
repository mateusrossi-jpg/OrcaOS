import type { CalculatorModule } from '../../core/access/featureAccess';
import type { GeneralCalculatorModule } from '../../features/calculators/components/GeneralCalculatorWorkspace';
import { calculationSectorGroups } from '../orcaAppData';
import type { CalculationSectorId } from '../orcaAppTypes';

export function isGeneralCalculatorModule(module: CalculatorModule): module is GeneralCalculatorModule {
  return false;
}

export function isProfessionalDomainModule(module: CalculatorModule): boolean {
  return module === 'refrigeration' || module === 'motors' || module === 'rewinding' || module === 'transformadores' || module === 'solar';
}

export function isExpansionModule(module: CalculatorModule): boolean {
  return module === 'eletricaResidencial' || module === 'financeiroAvancado' || module === 'construcaoAvancada' || module === 'hidraulicaAvancada' || module === 'conversoresAvancados';
}

export function getSectorForModule(moduleId: string): CalculationSectorId {
  return calculationSectorGroups.find((group) => group.moduleIds.includes(moduleId))?.id ?? 'financial';
}
