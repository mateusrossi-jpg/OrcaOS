import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ElectricalCalculatorWorkspace } from './ElectricalCalculatorWorkspace';
import { ElectricalFundamentalsHumanWorkspace } from './ElectricalFundamentalsHumanWorkspace';
import { ExpansionCalculatorsWorkspace } from './ExpansionCalculatorsWorkspace';

type ElectricalSection = 'base' | 'residential' | 'sizing' | 'lighting' | 'signals';

interface UnifiedElectricalWorkspaceProps {
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

const sectionCopy: Record<ElectricalSection, { title: string; text: string }> = {
  base: {
    title: 'Base elétrica',
    text: 'Use para Ohm, corrente, potência, resistores, VA e consumo antes de dimensionar o serviço.',
  },
  residential: {
    title: 'Instalação residencial',
    text: 'Use para cabo, disjuntor, queda, carga instalada, circuitos, fases, aterramento e DR/DPS.',
  },
  sizing: {
    title: 'Dimensionamento',
    text: 'Use para queda de tensão, seção por queda, distância máxima, AWG, transformador, cabo/disjuntor e eletroduto.',
  },
  lighting: {
    title: 'Iluminação',
    text: 'Use para estimar lúmens necessários e quantidade inicial de luminárias por ambiente.',
  },
  signals: {
    title: 'Sinais e automação',
    text: 'Use para escalas 4-20 mA, 0-10 V e conversão para valor de engenharia.',
  },
};

export function UnifiedElectricalWorkspace({ userPlan = 'free', onUpgradeRequest, onCaptureCalculation }: UnifiedElectricalWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<ElectricalSection>('base');
  const copy = sectionCopy[activeSection];

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={activeSection === 'base' ? 'active' : ''} type="button" onClick={() => setActiveSection('base')}>Base</button>
        <button className={activeSection === 'residential' ? 'active' : ''} type="button" onClick={() => setActiveSection('residential')}>Residencial</button>
        <button className={activeSection === 'sizing' ? 'active' : ''} type="button" onClick={() => setActiveSection('sizing')}>Dimensionamento</button>
        <button className={activeSection === 'lighting' ? 'active' : ''} type="button" onClick={() => setActiveSection('lighting')}>Iluminação</button>
        <button className={activeSection === 'signals' ? 'active' : ''} type="button" onClick={() => setActiveSection('signals')}>Sinais</button>
      </div>

      <div className="survey-intro-card">
        <span>
          <strong>{copy.title}</strong>
          <small>{copy.text}</small>
        </span>
      </div>

      {activeSection === 'base' && <ElectricalFundamentalsHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'residential' && <ExpansionCalculatorsWorkspace selectedModule="eletricaResidencial" userPlan={userPlan} onUpgradeRequest={onUpgradeRequest} onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'sizing' && <ElectricalCalculatorWorkspace selectedModule="installations" userPlan={userPlan} onUpgradeRequest={onUpgradeRequest} onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'lighting' && <ElectricalCalculatorWorkspace selectedModule="lighting" userPlan={userPlan} onUpgradeRequest={onUpgradeRequest} onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'signals' && <ElectricalCalculatorWorkspace selectedModule="industrialAutomation" userPlan={userPlan} onUpgradeRequest={onUpgradeRequest} onCaptureCalculation={onCaptureCalculation} />}
    </div>
  );
}
