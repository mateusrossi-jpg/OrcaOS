import { useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { type DomainMode, ProfessionalDomainWorkspace } from './ProfessionalDomainWorkspace';

type DiagnosticsSection = 'report' | 'risk' | 'maintenance';

interface UnifiedDiagnosticsWorkspaceProps {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

const sectionConfig: Record<DiagnosticsSection, { title: string; text: string; modes: DomainMode[] }> = {
  report: {
    title: 'Texto para relatório',
    text: 'Use para gerar checklist técnico por área e transformar a inspeção em texto claro para o cliente.',
    modes: ['diagnostic-checklist'],
  },
  risk: {
    title: 'Risco e urgência',
    text: 'Use quando precisa explicar prioridade, gravidade e risco técnico do atendimento.',
    modes: ['urgency', 'risk'],
  },
  maintenance: {
    title: 'Manutenção',
    text: 'Use para preventiva, prazo de manutenção e comparação simples entre preventiva e corretiva.',
    modes: ['maintenance', 'preventive-vs-corrective'],
  },
};

export function UnifiedDiagnosticsWorkspace({ onCaptureCalculation }: UnifiedDiagnosticsWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<DiagnosticsSection>('report');
  const config = sectionConfig[activeSection];

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={activeSection === 'report' ? 'active' : ''} type="button" onClick={() => setActiveSection('report')}>Relatório</button>
        <button className={activeSection === 'risk' ? 'active' : ''} type="button" onClick={() => setActiveSection('risk')}>Risco</button>
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
        onCaptureCalculation={onCaptureCalculation}
      />
    </div>
  );
}
