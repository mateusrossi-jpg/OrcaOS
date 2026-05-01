import { createElement } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ConstructionHumanWorkspace } from './ConstructionHumanWorkspace';
import { GeneralCalculatorWorkspace as StableGeneralCalculatorWorkspace } from './StableGeneralCalculatorWorkspace';
import type { GeneralCalculatorModule } from './StableGeneralCalculatorWorkspace';

export type { GeneralCalculatorModule } from './StableGeneralCalculatorWorkspace';

interface GeneralCalculatorWorkspaceProps {
  selectedModule: GeneralCalculatorModule;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

export function GeneralCalculatorWorkspace({ selectedModule, onCaptureCalculation }: GeneralCalculatorWorkspaceProps) {
  if (selectedModule === 'obras') {
    return createElement(ConstructionHumanWorkspace, { onCaptureCalculation });
  }

  return createElement(StableGeneralCalculatorWorkspace, { selectedModule, onCaptureCalculation });
}
