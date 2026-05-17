import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { calculateFinalPrice, calculateSalePriceByMarkup, calculateSalePriceByTargetMargin, type MarginMode } from '../../../core/calculations/trade';
import { roundTechnical } from '../../../core/format/number';
import { formatCurrency } from '../../../core/format/currency';

interface PricingWorkspaceProps {
  userPlan: UserPlan;
  onUpgradeRequest: () => void;
  onCaptureCalculation: (capture: CalculationCapture) => void;
}

export function PricingWorkspace({
  userPlan,
  onUpgradeRequest,
  onCaptureCalculation
}: PricingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'margin' | 'markup'>('quick');
  const [cost, setCost] = useState('0');
  const [margin, setMargin] = useState('30');
  const [tax, setTax] = useState('0');
  
  const isPro = userPlan === 'pro';

  function handleCapture(title: string, result: any) {
    onCaptureCalculation({
      id: `price-${Date.now()}`,
      module: 'orcamentoTecnico',
      moduleLabel: 'Precificação',
      calculatorLabel: title,
      destination: 'budget',
      createdAt: new Date().toISOString(),
      summary: `${title}: ${formatCurrency(result.total || result.suggestedPrice || result.finalPrice)}`,
      details: [
        `Custo base: ${formatCurrency(Number(cost))}`,
        `Margem/Markup: ${margin}%`,
        `Impostos/Taxas: ${tax}%`,
        `Resultado: ${formatCurrency(result.total || result.suggestedPrice || result.finalPrice)}`
      ],
      itemType: 'service',
      editableDescription: title,
      quantity: '1',
      unitValue: String(result.total || result.suggestedPrice || result.finalPrice),
      shouldGenerateBudgetItem: true,
      convertedToBudgetItem: false,
      reportReady: true
    });
  }

  const numericCost = Number(cost.replace(',', '.')) || 0;
  const numericMargin = Number(margin.replace(',', '.')) || 0;
  const numericTax = Number(tax.replace(',', '.')) || 0;

  const quickResult = calculateFinalPrice({
    material: 0,
    labor: numericCost,
    percent: numericMargin,
    marginMode: 'margin-sale',
    taxPercent: numericTax
  });

  return (
    <div className="pricing-workspace">
      <nav className="tab-nav">
        <button className={activeTab === 'quick' ? 'active' : ''} onClick={() => setActiveTab('quick')}>Preço Rápido</button>
        <button className={activeTab === 'margin' ? 'active' : ''} onClick={() => setActiveTab('margin')}>Margem Real</button>
        <button className={activeTab === 'markup' ? 'active' : ''} onClick={() => setActiveTab('markup')}>Markup</button>
      </nav>

      <div className="pricing-content aferix-panel-card">
        <div className="settings-form-grid">
          <label className="general-form-field">
            <span>Custo do serviço/material (R$)</span>
            <input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
          </label>
          <label className="general-form-field">
            <span>{activeTab === 'markup' ? 'Markup (%)' : 'Margem (%)'}</span>
            <input inputMode="decimal" value={margin} onChange={(e) => setMargin(e.target.value)} />
          </label>
          <label className="general-form-field">
            <span>Impostos e Taxas (%)</span>
            <input inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value)} />
          </label>
        </div>

        {activeTab === 'quick' && (
          <div className="pricing-result-card">
            <header>
              <span>Preço sugerido</span>
              <strong>{formatCurrency(quickResult.total)}</strong>
            </header>
            <div className="pricing-stats">
              <div><span>Lucro bruto</span><strong>{formatCurrency(quickResult.profit)}</strong></div>
              <div><span>Margem real</span><strong>{roundTechnical(quickResult.effectiveMarginPercent)}%</strong></div>
            </div>
            <button className="primary-action" onClick={() => handleCapture('Preço Sugerido', quickResult)}>Usar este preço</button>
          </div>
        )}

        {(activeTab === 'margin' || activeTab === 'markup') && !isPro && (
          <div className="pro-lock-overlay">
            <strong>Recurso do Aferix Pro</strong>
            <p>Cálculos avançados de margem real e markup estão disponíveis na versão Pro.</p>
            <button className="primary-action" onClick={onUpgradeRequest}>Conhecer Planos</button>
          </div>
        )}

        {activeTab === 'margin' && isPro && (
           <div className="pricing-result-card">
             {/* Lógica simplificada de margem Pro */}
             <button className="primary-action" onClick={() => handleCapture('Margem Real', quickResult)}>Capturar</button>
           </div>
        )}

        {activeTab === 'markup' && isPro && (
           <div className="pricing-result-card">
             {/* Lógica simplificada de markup Pro */}
             <button className="primary-action" onClick={() => handleCapture('Markup Comercial', quickResult)}>Capturar</button>
           </div>
        )}
      </div>
    </div>
  );
}
