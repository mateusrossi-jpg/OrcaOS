import { useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ExpansionCalculatorsWorkspace } from './ExpansionCalculatorsWorkspace';
import { GeneralCalculatorWorkspace } from './GeneralCalculatorWorkspace';
import { GeneralFundamentalsWorkspace, type FundamentalMode } from './GeneralFundamentalsWorkspace';

type ConstructionSection = 'measurements' | 'materials' | 'composition';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

const measurementModes: FundamentalMode[] = ['rectangle-area', 'triangle-area', 'circle-area', 'rectangle-perimeter', 'simple-volume', 'loss-percent'];

export function UnifiedConstructionWorkspace({ onCaptureCalculation }: Props) {
  const [activeSection, setActiveSection] = useState<ConstructionSection>('measurements');

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={activeSection === 'measurements' ? 'active' : ''} type="button" onClick={() => setActiveSection('measurements')}>Medições</button>
        <button className={activeSection === 'materials' ? 'active' : ''} type="button" onClick={() => setActiveSection('materials')}>Materiais</button>
        <button className={activeSection === 'composition' ? 'active' : ''} type="button" onClick={() => setActiveSection('composition')}>Composição</button>
      </div>

      <div className="survey-intro-card">
        <span>
          <strong>
            {activeSection === 'measurements' && 'Medições de obra'}
            {activeSection === 'materials' && 'Materiais de obra'}
            {activeSection === 'composition' && 'Composição de obra'}
          </strong>
          <small>
            {activeSection === 'measurements' && 'Meça área, perímetro, volume e perda antes de quantificar materiais.'}
            {activeSection === 'materials' && 'Transforme medidas em concreto, blocos, piso, revestimento e quantidades básicas.'}
            {activeSection === 'composition' && 'Use para argamassas, rodapé, telhado, escada, rampa e estimativas mais completas.'}
          </small>
        </span>
      </div>

      {activeSection === 'measurements' && (
        <GeneralFundamentalsWorkspace
          modes={measurementModes}
          title="Medições de obra"
          description="Áreas, perímetro, volume simples e perda de material para levantamento de obra."
          moduleLabel="Medições de obra"
          note="Use como apoio de medição para levantamento, compra de material e conferência em campo."
          onCaptureCalculation={onCaptureCalculation}
        />
      )}
      {activeSection === 'materials' && <GeneralCalculatorWorkspace selectedModule="obras" onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'composition' && <ExpansionCalculatorsWorkspace selectedModule="construcaoAvancada" onCaptureCalculation={onCaptureCalculation} />}
    </div>
  );
}
