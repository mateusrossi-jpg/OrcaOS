import { useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { ExpansionCalculatorsWorkspace } from './ExpansionCalculatorsWorkspace';
import { GeneralCalculatorWorkspace } from './GeneralCalculatorWorkspace';
import { GeneralFundamentalsWorkspace, type FundamentalMode } from './GeneralFundamentalsWorkspace';

type FinancialSection = 'quick' | 'productivity' | 'percentages' | 'margin';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

const productivityModes: FundamentalMode[] = ['cost-per-area', 'cost-per-unit', 'cost-per-meter', 'productivity-time'];
const percentageModes: FundamentalMode[] = ['rule-of-three', 'percentage', 'increase-percent', 'discount-percent', 'difference-percent', 'profit-margin', 'markup'];

export function UnifiedFinancialWorkspace({ onCaptureCalculation }: Props) {
  const [activeSection, setActiveSection] = useState<FinancialSection>('quick');

  return (
    <div className="general-calculator-workspace">
      <div className="section-mode-tabs">
        <button className={activeSection === 'quick' ? 'active' : ''} type="button" onClick={() => setActiveSection('quick')}>Orçamento</button>
        <button className={activeSection === 'productivity' ? 'active' : ''} type="button" onClick={() => setActiveSection('productivity')}>Produtividade</button>
        <button className={activeSection === 'percentages' ? 'active' : ''} type="button" onClick={() => setActiveSection('percentages')}>Percentuais</button>
        <button className={activeSection === 'margin' ? 'active' : ''} type="button" onClick={() => setActiveSection('margin')}>Preço e margem</button>
      </div>

      <div className="survey-intro-card">
        <span>
          <strong>
            {activeSection === 'quick' && 'Orçamento rápido'}
            {activeSection === 'productivity' && 'Custos e produtividade'}
            {activeSection === 'percentages' && 'Percentuais e negociação'}
            {activeSection === 'margin' && 'Preço e margem'}
          </strong>
          <small>
            {activeSection === 'quick' && 'Use para mão de obra, diária, hora técnica, parcelamento, sinal e preço final simples.'}
            {activeSection === 'productivity' && 'Use para transformar quantidade, custo e produtividade em base de orçamento.'}
            {activeSection === 'percentages' && 'Use para regra de três, acréscimo, desconto, margem, markup e conferências comerciais.'}
            {activeSection === 'margin' && 'Use para margem real, markup, desconto máximo, taxas, entrada, deslocamento e faixas comerciais.'}
          </small>
        </span>
      </div>

      {activeSection === 'quick' && <GeneralCalculatorWorkspace selectedModule="orcamentoTecnico" onCaptureCalculation={onCaptureCalculation} />}
      {activeSection === 'productivity' && (
        <GeneralFundamentalsWorkspace
          modes={productivityModes}
          title="Custos e produtividade"
          description="Custo por m², unidade, metro linear e tempo estimado por produtividade."
          moduleLabel="Custos e produtividade"
          note="Use para transformar quantidade, custo e produtividade em base de orçamento."
          onCaptureCalculation={onCaptureCalculation}
        />
      )}
      {activeSection === 'percentages' && (
        <GeneralFundamentalsWorkspace
          modes={percentageModes}
          title="Percentuais e negociação"
          description="Proporções, porcentagens, acréscimos, descontos, variação, margem e markup."
          moduleLabel="Percentuais e negociação"
          note="Use como apoio comercial para negociação, formação de preço e conferência de margem."
          onCaptureCalculation={onCaptureCalculation}
        />
      )}
      {activeSection === 'margin' && <ExpansionCalculatorsWorkspace selectedModule="financeiroAvancado" onCaptureCalculation={onCaptureCalculation} />}
    </div>
  );
}
