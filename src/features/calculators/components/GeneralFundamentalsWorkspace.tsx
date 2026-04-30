import { useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import './GeneralFundamentalsWorkspace.css';

type FundamentalMode =
  | 'rule-of-three'
  | 'percentage'
  | 'increase-percent'
  | 'discount-percent'
  | 'rectangle-area'
  | 'simple-volume'
  | 'cost-per-area';

interface GeneralFundamentalsWorkspaceProps {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface FundamentalRule {
  mode: FundamentalMode;
  label: string;
  description: string;
  icon: string;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface FundamentalResult {
  error: string | null;
  cards: ResultCardData[];
  summary: string;
  details: string[];
}

const fundamentalRules: FundamentalRule[] = [
  { mode: 'rule-of-three', label: 'Regra de três', description: 'Resolva proporções simples para qualquer serviço técnico.', icon: '∝' },
  { mode: 'percentage', label: 'Porcentagem', description: 'Calcule uma porcentagem sobre qualquer valor.', icon: '%' },
  { mode: 'increase-percent', label: 'Acréscimo', description: 'Aplique acréscimo percentual sobre custo, preço ou quantidade.', icon: '+' },
  { mode: 'discount-percent', label: 'Desconto', description: 'Aplique desconto percentual para orçamento e negociação.', icon: '−' },
  { mode: 'rectangle-area', label: 'Área retangular', description: 'Calcule área em m² para parede, piso, teto, pintura e revestimento.', icon: '▭' },
  { mode: 'simple-volume', label: 'Volume simples', description: 'Calcule volume de caixa/prisma para concreto, reservatórios e materiais.', icon: '◧' },
  { mode: 'cost-per-area', label: 'Custo por m²', description: 'Calcule custo total ou unitário por metro quadrado.', icon: 'R$' },
];

const defaultValues: Record<string, string> = {
  baseA: '10',
  baseB: '100',
  targetA: '25',
  value: '100',
  percent: '10',
  width: '3',
  height: '2.8',
  length: '4',
  area: '12',
  totalCost: '600',
  unitCost: '50',
};

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function ensureFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Informe um valor válido para ${label}.`);
  }
  return value;
}

function ensurePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Informe um valor válido para ${label}.`);
  }
  return value;
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function money(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return (
    <article className="fundamental-result-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

function NumberField({ label, value, suffix, min, step = 0.01, onChange }: {
  label: string;
  value: string;
  suffix?: string;
  min?: number;
  step?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="fundamental-form-field">
      <span>{label}</span>
      <div>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          placeholder="Digite o valor"
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <small>{suffix}</small>}
      </div>
    </label>
  );
}

export function GeneralFundamentalsWorkspace({ onCaptureCalculation }: GeneralFundamentalsWorkspaceProps) {
  const [activeCalculator, setActiveCalculator] = useState<FundamentalMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeCalculator ? fundamentalRules.find((rule) => rule.mode === activeCalculator) : null;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string, positive = true): number {
    const parsed = parseNumber(values[key] ?? '');
    return positive ? ensurePositive(parsed, label) : ensureFinite(parsed, label);
  }

  const result = useMemo<FundamentalResult>(() => {
    if (!activeCalculator) return { error: null, cards: [], summary: '', details: [] };

    try {
      if (activeCalculator === 'rule-of-three') {
        const baseA = n('baseA', 'valor A');
        const baseB = n('baseB', 'valor B');
        const targetA = n('targetA', 'novo valor A');

        if (baseA === 0) throw new Error('O valor A não pode ser zero na regra de três.');

        const resultValue = (baseB * targetA) / baseA;
        return {
          error: null,
          cards: [{ label: 'Resultado', value: `${round(resultValue)}`, helper: `${round(baseA)} está para ${round(baseB)} assim como ${round(targetA)} está para X` }],
          summary: `Regra de três: resultado ${round(resultValue)}`,
          details: [`Valor A: ${round(baseA)}`, `Valor B: ${round(baseB)}`, `Novo valor A: ${round(targetA)}`, `Resultado: ${round(resultValue)}`],
        };
      }

      if (activeCalculator === 'percentage') {
        const value = n('value', 'valor');
        const percent = n('percent', 'porcentagem', false);
        const percentageValue = value * percent / 100;
        return {
          error: null,
          cards: [{ label: 'Porcentagem', value: `${round(percentageValue)}`, helper: `${round(percent)}% de ${round(value)}` }],
          summary: `${round(percent)}% de ${round(value)} = ${round(percentageValue)}`,
          details: [`Valor base: ${round(value)}`, `Porcentagem: ${round(percent)}%`, `Resultado: ${round(percentageValue)}`],
        };
      }

      if (activeCalculator === 'increase-percent') {
        const value = n('value', 'valor');
        const percent = n('percent', 'acréscimo', false);
        const increase = value * percent / 100;
        const finalValue = value + increase;
        return {
          error: null,
          cards: [
            { label: 'Acréscimo', value: `${round(increase)}`, helper: `${round(percent)}% sobre ${round(value)}` },
            { label: 'Valor final', value: `${round(finalValue)}`, helper: 'valor com acréscimo' },
          ],
          summary: `Valor com acréscimo: ${round(finalValue)}`,
          details: [`Valor base: ${round(value)}`, `Acréscimo: ${round(percent)}%`, `Valor acrescido: ${round(increase)}`, `Valor final: ${round(finalValue)}`],
        };
      }

      if (activeCalculator === 'discount-percent') {
        const value = n('value', 'valor');
        const percent = n('percent', 'desconto', false);
        const discount = value * percent / 100;
        const finalValue = value - discount;
        return {
          error: null,
          cards: [
            { label: 'Desconto', value: `${round(discount)}`, helper: `${round(percent)}% sobre ${round(value)}` },
            { label: 'Valor final', value: `${round(finalValue)}`, helper: 'valor com desconto' },
          ],
          summary: `Valor com desconto: ${round(finalValue)}`,
          details: [`Valor base: ${round(value)}`, `Desconto: ${round(percent)}%`, `Valor descontado: ${round(discount)}`, `Valor final: ${round(finalValue)}`],
        };
      }

      if (activeCalculator === 'rectangle-area') {
        const width = n('width', 'largura');
        const height = n('height', 'altura/comprimento');
        const area = width * height;
        return {
          error: null,
          cards: [{ label: 'Área', value: `${round(area)} m²`, helper: 'largura × altura/comprimento' }],
          summary: `Área retangular: ${round(area)} m²`,
          details: [`Largura: ${round(width)} m`, `Altura/comprimento: ${round(height)} m`, `Área: ${round(area)} m²`],
        };
      }

      if (activeCalculator === 'simple-volume') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const height = n('height', 'altura');
        const volume = width * length * height;
        const liters = volume * 1000;
        return {
          error: null,
          cards: [
            { label: 'Volume', value: `${round(volume, 3)} m³`, helper: 'largura × comprimento × altura' },
            { label: 'Em litros', value: `${round(liters)} L`, helper: '1 m³ = 1000 L' },
          ],
          summary: `Volume simples: ${round(volume, 3)} m³`,
          details: [`Largura: ${round(width)} m`, `Comprimento: ${round(length)} m`, `Altura: ${round(height)} m`, `Volume: ${round(volume, 3)} m³`, `Litros: ${round(liters)} L`],
        };
      }

      const area = n('area', 'área');
      const totalCost = n('totalCost', 'custo total');
      const unitCost = area > 0 ? totalCost / area : 0;
      const totalFromUnit = area * n('unitCost', 'custo por m²');
      return {
        error: null,
        cards: [
          { label: 'Custo por m²', value: money(unitCost), helper: `${money(totalCost)} ÷ ${round(area)} m²` },
          { label: 'Total pelo unitário', value: money(totalFromUnit), helper: `${round(area)} m² × ${money(n('unitCost', 'custo por m²'))}` },
        ],
        summary: `Custo por m²: ${money(unitCost)}`,
        details: [`Área: ${round(area)} m²`, `Custo total informado: ${money(totalCost)}`, `Custo por m² calculado: ${money(unitCost)}`, `Total pelo custo unitário: ${money(totalFromUnit)}`],
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', cards: [], summary: '', details: [] };
    }
  }, [activeCalculator, values]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || result.cards.length === 0 || result.error) return;

    const capture: CalculationCapture = {
      id: createId('general-fundamental'),
      module: 'fundamentosGerais',
      moduleLabel: 'Fundamentos gerais',
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: result.summary,
      details: result.details,
    };

    onCaptureCalculation?.(capture);

    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no levantamento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no levantamento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveCalculator(null);
    setAddedMessage(null);
  }

  return (
    <div className="fundamental-workspace">
      <div className="fundamental-plan-banner">
        <div>
          <strong>Fundamentos gerais</strong>
          <span>Base gratuita transversal para elétrica, construção civil, hidráulica, pintura, orçamento e demais serviços.</span>
        </div>
        <em>{fundamentalRules.length} grátis</em>
      </div>

      <div className="fundamental-picker-list">
        {fundamentalRules.map((calculator) => (
          <button className="fundamental-picker-card" key={calculator.mode} type="button" onClick={() => setActiveCalculator(calculator.mode)}>
            <span className="app-icon tone-green">{calculator.icon}</span>
            <span>
              <strong>{calculator.label}</strong>
              <small>{calculator.description}</small>
            </span>
            <em>LIVRE</em>
            <span className="chevron">›</span>
          </button>
        ))}
      </div>

      {activeCalculator && activeRule && (
        <div className="fundamental-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="fundamental-overlay-backdrop" onClick={closeCalculator} />
          <section className="fundamental-overlay-panel">
            <header className="fundamental-overlay-header">
              <button type="button" onClick={closeCalculator}>‹</button>
              <div>
                <span>Fundamentos gerais</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>LIVRE</em>
            </header>

            <form className="fundamental-form" onSubmit={(event) => event.preventDefault()}>
              {activeCalculator === 'rule-of-three' && (
                <>
                  <NumberField label="Valor A" value={values.baseA} onChange={(value) => setValue('baseA', value)} />
                  <NumberField label="Valor B" value={values.baseB} onChange={(value) => setValue('baseB', value)} />
                  <NumberField label="Novo valor A" value={values.targetA} onChange={(value) => setValue('targetA', value)} />
                </>
              )}

              {['percentage', 'increase-percent', 'discount-percent'].includes(activeCalculator) && (
                <>
                  <NumberField label="Valor base" value={values.value} onChange={(value) => setValue('value', value)} />
                  <NumberField label="Porcentagem" value={values.percent} suffix="%" min={-100} onChange={(value) => setValue('percent', value)} />
                </>
              )}

              {activeCalculator === 'rectangle-area' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Altura/comprimento" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                </>
              )}

              {activeCalculator === 'simple-volume' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                  <NumberField label="Altura" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                </>
              )}

              {activeCalculator === 'cost-per-area' && (
                <>
                  <NumberField label="Área" value={values.area} suffix="m²" onChange={(value) => setValue('area', value)} />
                  <NumberField label="Custo total" value={values.totalCost} suffix="R$" onChange={(value) => setValue('totalCost', value)} />
                  <NumberField label="Custo por m²" value={values.unitCost} suffix="R$/m²" onChange={(value) => setValue('unitCost', value)} />
                </>
              )}
            </form>

            {result.error && <p className="fundamental-error-message">{result.error}</p>}

            {result.cards.length > 0 && (
              <div className="fundamental-result-grid">
                {result.cards.map((card) => <ResultCard key={card.label} {...card} />)}
              </div>
            )}

            {addedMessage && <p className="fundamental-added-message">{addedMessage}</p>}

            <div className="fundamental-capture-actions">
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="fundamental-note">Cálculo geral de apoio. Use para estimativas, conferências rápidas, levantamentos e formação de orçamento.</small>
          </section>
        </div>
      )}
    </div>
  );
}
