import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { calculateFinalPrice } from '../../../core/calculations/trade';
import { roundTechnical } from '../../../core/format/number';
import { formatCurrency } from '../../../core/format/currency';
import { AferixTabs, Input, Button } from '../../../app/components/ui';

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

  function handleCapture(title: string, result: Record<string, number>) {
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
      <AferixTabs
        items={[
          { id: 'quick', label: 'Preço Rápido' },
          { id: 'margin', label: 'Margem Real' },
          { id: 'markup', label: 'Markup' }
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'quick' | 'margin' | 'markup')}
      />

      <div className="pricing-content aferix-panel-card aferix-mt-lg">
        <div className="settings-form-grid aferix-mb-lg">
          <Input
            className="general-form-field"
            label="Custo do serviço/material (R$)"
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <Input
            className="general-form-field"
            label={activeTab === 'markup' ? 'Markup (%)' : 'Margem (%)'}
            inputMode="decimal"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
          />
          <Input
            className="general-form-field"
            label="Impostos e Taxas (%)"
            inputMode="decimal"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
          />
        </div>

        {activeTab === 'quick' && (
          <div className="pricing-result-card aferix-card-kpi aferix-mt-lg">
            <header className="aferix-d-flex aferix-justify-between aferix-align-center aferix-mb-md">
              <span className="aferix-text-muted aferix-font-sm">Preço sugerido</span>
              <strong className="aferix-text-yellow aferix-font-xl">{formatCurrency(quickResult.total)}</strong>
            </header>
            <div className="pricing-stats aferix-d-flex aferix-gap-xl aferix-mb-lg">
              <div>
                <span className="aferix-d-block aferix-text-muted aferix-font-xs">Lucro bruto</span>
                <strong className="aferix-text-green">{formatCurrency(quickResult.profit)}</strong>
              </div>
              <div>
                <span className="aferix-d-block aferix-text-muted aferix-font-xs">Margem real</span>
                <strong>{roundTechnical(quickResult.effectiveMarginPercent)}%</strong>
              </div>
            </div>
            <Button variant="primary" className="aferix-w-full" onClick={() => handleCapture('Preço Sugerido', quickResult)}>
              Usar este preço
            </Button>
          </div>
        )}

        {(activeTab === 'margin' || activeTab === 'markup') && !isPro && (
          <div className="p-8 mt-8 text-center flex flex-col items-center gap-6 rounded-[var(--radius-card)] bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)]">
            <strong className="text-[var(--accent-gold)] text-[var(--fs-md)] font-bold">🔒 Recurso do Aferix Pro</strong>
            <p className="text-[var(--text-muted)] text-[var(--fs-sm)] max-w-[320px] leading-relaxed">
              Cálculos avançados de margem real e markup estão disponíveis na versão Pro.
            </p>
            <Button variant="primary" className="w-full" onClick={onUpgradeRequest}>
              Conhecer Planos
            </Button>
          </div>
        )}

        {activeTab === 'margin' && isPro && (
          <div className="pricing-result-card aferix-card-kpi aferix-mt-lg">
            <header className="aferix-d-flex aferix-justify-between aferix-align-center aferix-mb-md">
              <span className="aferix-text-muted aferix-font-sm">Margem Real Pro</span>
              <strong className="aferix-text-yellow aferix-font-xl">{formatCurrency(quickResult.total)}</strong>
            </header>
            <Button variant="primary" className="aferix-w-full" onClick={() => handleCapture('Margem Real', quickResult)}>
              Capturar preço de margem
            </Button>
          </div>
        )}

        {activeTab === 'markup' && isPro && (
          <div className="pricing-result-card aferix-card-kpi aferix-mt-lg">
            <header className="aferix-d-flex aferix-justify-between aferix-align-center aferix-mb-md">
              <span className="aferix-text-muted aferix-font-sm">Markup Comercial Pro</span>
              <strong className="aferix-text-yellow aferix-font-xl">{formatCurrency(quickResult.total)}</strong>
            </header>
            <Button variant="primary" className="aferix-w-full" onClick={() => handleCapture('Markup Comercial', quickResult)}>
              Capturar preço de markup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
