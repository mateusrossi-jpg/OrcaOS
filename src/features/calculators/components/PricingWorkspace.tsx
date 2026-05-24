import { useState } from 'react';
import type { UserPlan } from '../../../core/access/featureAccess';
import type { CalculationCapture } from '../../../core/types/workflow';
import { calculateFinalPrice, calculateSalePriceByMarkup, calculateSalePriceByTargetMargin, type MarginMode } from '../../../core/calculations/trade';
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
      <AferixTabs
        items={[
          { id: 'quick', label: 'Preço Rápido' },
          { id: 'margin', label: 'Margem Real' },
          { id: 'markup', label: 'Markup' }
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      <div className="pricing-content aferix-panel-card" style={{ marginTop: '16px' }}>
        <div className="settings-form-grid" style={{ marginBottom: '16px' }}>
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
          <div className="pricing-result-card aferix-card-kpi" style={{ marginTop: '16px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--aferix-text-secondary)', fontSize: '0.86rem' }}>Preço sugerido</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--aferix-yellow)' }}>{formatCurrency(quickResult.total)}</strong>
            </header>
            <div className="pricing-stats" style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--aferix-text-secondary)', fontSize: '0.78rem' }}>Lucro bruto</span>
                <strong style={{ color: 'var(--aferix-green)' }}>{formatCurrency(quickResult.profit)}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--aferix-text-secondary)', fontSize: '0.78rem' }}>Margem real</span>
                <strong>{roundTechnical(quickResult.effectiveMarginPercent)}%</strong>
              </div>
            </div>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => handleCapture('Preço Sugerido', quickResult)}>
              Usar este preço
            </Button>
          </div>
        )}

        {(activeTab === 'margin' || activeTab === 'markup') && !isPro && (
          <div className="pro-lock-overlay aferix-card-elevated" style={{ marginTop: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
            <strong style={{ color: 'var(--aferix-yellow)', fontSize: '1.1rem' }}>🔒 Recurso do Aferix Pro</strong>
            <p style={{ color: 'var(--aferix-text-secondary)', fontSize: '0.9rem', maxWidth: '320px', margin: '0' }}>
              Cálculos avançados de margem real e markup estão disponíveis na versão Pro.
            </p>
            <Button variant="primary" onClick={onUpgradeRequest} style={{ marginTop: '8px' }}>
              Conhecer Planos
            </Button>
          </div>
        )}

        {activeTab === 'margin' && isPro && (
          <div className="pricing-result-card aferix-card-kpi" style={{ marginTop: '16px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--aferix-text-secondary)', fontSize: '0.86rem' }}>Margem Real Pro</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--aferix-yellow)' }}>{formatCurrency(quickResult.total)}</strong>
            </header>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => handleCapture('Margem Real', quickResult)}>
              Capturar preço de margem
            </Button>
          </div>
        )}

        {activeTab === 'markup' && isPro && (
          <div className="pricing-result-card aferix-card-kpi" style={{ marginTop: '16px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--aferix-text-secondary)', fontSize: '0.86rem' }}>Markup Comercial Pro</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--aferix-yellow)' }}>{formatCurrency(quickResult.total)}</strong>
            </header>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => handleCapture('Markup Comercial', quickResult)}>
              Capturar preço de markup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
