import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ConvertersHumanWorkspace } from './ConvertersHumanWorkspace';
import { ExpansionCalculatorsWorkspace } from './ExpansionCalculatorsWorkspace';

type ConverterSection = 'quick' | 'technical';

interface Props {
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

export function UnifiedConvertersWorkspace({ userPlan = 'free', onUpgradeRequest, onCaptureCalculation }: Props) {
  const [activeSection, setActiveSection] = useState<ConverterSection>('quick');

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={activeSection === 'quick' ? 'active' : ''} type="button" onClick={() => setActiveSection('quick')}>Rápidos</button>
        <button className={activeSection === 'technical' ? 'active' : ''} type="button" onClick={() => setActiveSection('technical')}>Técnicos</button>
      </div>

      <div className="survey-intro-card">
        <span>
          <strong>{activeSection === 'quick' ? 'Conversores rápidos' : 'Conversores técnicos'}</strong>
          <small>
            {activeSection === 'quick'
              ? 'Use quando você tem um valor e quer converter as equivalências principais sem preencher unidades repetidas.'
              : 'Use para rotinas específicas como AWG, polegadas, vazão completa, pressão completa, temperatura e kWh/R$.'}
          </small>
        </span>
      </div>

      {activeSection === 'quick' && <ConvertersHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'technical' && <ExpansionCalculatorsWorkspace selectedModule="conversoresAvancados" userPlan={userPlan} onUpgradeRequest={onUpgradeRequest} onCaptureCalculation={onCaptureCalculation} />}
    </div>
  );
}
