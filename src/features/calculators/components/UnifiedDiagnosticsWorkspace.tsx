import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { type DomainMode, ProfessionalDomainWorkspace } from './ProfessionalDomainWorkspace';

type DiagnosticsSection = 'report' | 'risk' | 'maintenance';

interface UnifiedDiagnosticsWorkspaceProps {
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

const sectionConfig: Record<DiagnosticsSection, { title: string; text: string; modes: DomainMode[] }> = {
  report: {
    title: 'Checklist para relatório',
    text: 'Use depois da visita para organizar o que foi conferido e gerar texto claro para o cliente.',
    modes: ['diagnostic-checklist'],
  },
  risk: {
    title: 'Risco e prioridade',
    text: 'Use escolhas simples de campo para explicar se o atendimento é baixo, médio, alto ou urgente.',
    modes: ['urgency', 'risk'],
  },
  maintenance: {
    title: 'Manutenção',
    text: 'Use para preventiva, prazo de manutenção e comparação simples entre preventiva e corretiva.',
    modes: ['maintenance', 'preventive-vs-corrective'],
  },
};

export function UnifiedDiagnosticsWorkspace({ userPlan = 'free', onUpgradeRequest, onCaptureCalculation }: UnifiedDiagnosticsWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<DiagnosticsSection>('report');
  const config = sectionConfig[activeSection];

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={activeSection === 'report' ? 'active' : ''} type="button" onClick={() => setActiveSection('report')}>Checklist</button>
        <button className={activeSection === 'risk' ? 'active' : ''} type="button" onClick={() => setActiveSection('risk')}>Risco/prioridade</button>
        <button className={activeSection === 'maintenance' ? 'active' : ''} type="button" onClick={() => setActiveSection('maintenance')}>Manutenção</button>
      </div>

      <div className="survey-intro-card">
        <span>
          <strong>{config.title}</strong>
          <small>{config.text}</small>
        </span>
      </div>

      <ProfessionalDomainWorkspace
        key={activeSection}
        selectedModule="diagnosticoTecnico"
        modeFilter={config.modes}
        userPlan={userPlan}
        onUpgradeRequest={onUpgradeRequest}
        onCaptureCalculation={onCaptureCalculation}
      />
    </div>
  );
}
