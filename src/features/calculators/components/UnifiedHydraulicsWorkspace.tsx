import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ExpansionCalculatorsWorkspace } from './ExpansionCalculatorsWorkspace';
import { HydraulicsCalculatorWorkspace } from './StableHydraulicsCalculatorWorkspace';

type HydraulicsSection = 'basic' | 'installations';

interface UnifiedHydraulicsWorkspaceProps {
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

export function UnifiedHydraulicsWorkspace({ userPlan = 'free', onUpgradeRequest, onCaptureCalculation }: UnifiedHydraulicsWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<HydraulicsSection>('basic');
  const isBasic = activeSection === 'basic';

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={isBasic ? 'active' : ''} type="button" onClick={() => setActiveSection('basic')}>
          Básico
        </button>
        <button className={!isBasic ? 'active' : ''} type="button" onClick={() => setActiveSection('installations')}>
          Instalações
        </button>
      </div>

      <div className="survey-intro-card">
        <span>
          <strong>{isBasic ? 'Hidráulica básica' : 'Instalações hidráulicas'}</strong>
          <small>
            {isBasic
              ? 'Use para reservatórios, consumo, autonomia, vazão, enchimento e pressão.'
              : 'Use para caixa por pessoas, piscina, esgoto, pressão por coluna e bomba simples.'}
          </small>
        </span>
      </div>

      {isBasic && <HydraulicsCalculatorWorkspace onCaptureCalculation={onCaptureCalculation} />}
      {!isBasic && <ExpansionCalculatorsWorkspace selectedModule="hidraulicaAvancada" userPlan={userPlan} onUpgradeRequest={onUpgradeRequest} onCaptureCalculation={onCaptureCalculation} />}
    </div>
  );
}
