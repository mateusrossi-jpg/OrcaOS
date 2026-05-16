import { useMemo, useState } from 'react';
import {
  calculatePaintLiters,
  calculatePaintingBudget,
  calculateRoomPaintingArea,
} from '../../../core/calculations/trade';
import { formatCurrency } from '../../../core/format/currency';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import './GeneralCalculatorWorkspace.css';

type PaintingMode = 'paint-area' | 'paint-liters' | 'paint-budget';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface PaintingRule {
  mode: PaintingMode;
  label: string;
  description: string;
  icon: string;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface PaintingResult {
  error: string | null;
  summary: string;
  details: string[];
  orientation: string;
  formula: string[];
  cards: ResultCardData[];
}

const rules: PaintingRule[] = [
  { mode: 'paint-area', label: 'Área a pintar', description: 'Meça o cômodo e desconte portas, janelas e áreas que não serão pintadas.', icon: '▨' },
  { mode: 'paint-liters', label: 'Tinta necessária', description: 'Informe a área já medida para estimar litros, galões e latas.', icon: '◍' },
  { mode: 'paint-budget', label: 'Orçamento de pintura', description: 'Estime material e mão de obra usando área, tinta e valores unitários.', icon: 'R$' },
];

const defaultValues: Record<string, string> = {
  length: '4',
  width: '3',
  height: '2.8',
  discountArea: '2',
  extraArea: '0',
  measuredArea: '30',
  coats: '2',
  paintYieldM2PerLiter: '10',
  lossPercent: '10',
  paintLiterPrice: '35',
  laborPricePerM2: '18',
  prepCost: '0',
};

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function requirePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Informe um valor maior que zero para ${label}.`);
  return value;
}

function requireNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`);
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
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function emptyResult(): PaintingResult {
  return { error: null, summary: '', details: [], orientation: '', formula: [], cards: [] };
}

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[]): PaintingResult {
  return { error: null, summary, cards, details, orientation, formula };
}

function NumberField({ label, value, suffix, step = 0.01, onChange }: { label: string; value: string; suffix?: string; step?: number; onChange: (value: string) => void }) {
  return (
    <label className="general-form-field">
      <span>{label}</span>
      <div>
        <input type="number" inputMode="decimal" min="0" step={step} value={value} placeholder="Digite o valor" onFocus={handleNumericInputFocus} onChange={(event) => onChange(event.target.value)} />
        {suffix && <small className="technical-unit">{suffix}</small>}
      </div>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="general-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function PaintingHumanWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<PaintingMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string): number {
    return requirePositive(parseNumber(values[key] ?? ''), label);
  }

  function optionalN(key: string, label: string): number {
    const rawValue = values[key] ?? '';
    if (!rawValue.trim()) return 0;
    return requireNonNegative(parseNumber(rawValue), label);
  }

  const calculated = useMemo<PaintingResult>(() => {
    if (!activeRule) return emptyResult();

    try {
      if (activeRule.mode === 'paint-area') {
        const length = n('length', 'comprimento');
        const width = n('width', 'largura');
        const height = n('height', 'altura');
        const discount = optionalN('discountArea', 'descontos');
        const extra = optionalN('extraArea', 'área extra');
        const { wallAreaM2: wallArea, netAreaM2: netArea } = calculateRoomPaintingArea({
          lengthM: length,
          widthM: width,
          heightM: height,
          discountAreaM2: discount,
          extraAreaM2: extra,
        });
        return result(
          `Área a pintar: ${round(netArea)} m²`,
          [
            { label: 'Paredes', value: `${round(wallArea)} m²`, helper: 'perímetro × altura' },
            { label: 'Área líquida', value: `${round(netArea)} m²`, helper: 'com descontos e extras' },
          ],
          [`Comprimento: ${round(length)} m`, `Largura: ${round(width)} m`, `Altura: ${round(height)} m`, `Área de paredes: ${round(wallArea)} m²`, `Descontos: ${round(discount)} m²`, `Área extra: ${round(extra)} m²`, `Área líquida: ${round(netArea)} m²`],
          'Use essa área líquida nos próximos cálculos. Coloque teto, muros ou detalhes no campo de área extra quando fizer sentido.',
          ['Perímetro do cômodo = 2 × (comprimento + largura)', 'Área das paredes = perímetro × altura', 'Área líquida = área das paredes + área extra - descontos'],
        );
      }

      if (activeRule.mode === 'paint-liters') {
        const area = n('measuredArea', 'área medida');
        const coats = n('coats', 'demãos');
        const yieldValue = n('paintYieldM2PerLiter', 'rendimento da tinta');
        const loss = optionalN('lossPercent', 'perda');
        const { liters, gallons36L, cans18L } = calculatePaintLiters({
          areaM2: area,
          coats,
          yieldM2PerLiter: yieldValue,
          lossPercent: loss,
        });
        return result(
          `Tinta estimada: ${round(liters)} L`,
          [
            { label: 'Litros', value: `${round(liters)} L`, helper: `${round(area)} m² · ${round(coats)} demão(s)` },
            { label: 'Galões 3,6 L', value: `${gallons36L}`, helper: 'arredondado para compra' },
            { label: 'Latas 18 L', value: `${cans18L}`, helper: 'arredondado para compra' },
          ],
          [`Área: ${round(area)} m²`, `Demãos: ${round(coats)}`, `Rendimento: ${round(yieldValue)} m²/L`, `Perda: ${round(loss)}%`, `Litros: ${round(liters)} L`, `Galões 3,6 L: ${gallons36L}`, `Latas 18 L: ${cans18L}`],
          'Rendimento muda conforme tinta, superfície, cor anterior e preparo. Use a embalagem do fabricante quando tiver o dado real.',
          ['Litros base = área × demãos ÷ rendimento da tinta', 'Litros com perda = litros base × (1 + perda ÷ 100)', 'Galões/latas são arredondados para cima para compra'],
        );
      }

      const area = n('measuredArea', 'área medida');
      const coats = n('coats', 'demãos');
      const yieldValue = n('paintYieldM2PerLiter', 'rendimento da tinta');
      const loss = optionalN('lossPercent', 'perda');
      const paintPrice = optionalN('paintLiterPrice', 'preço da tinta por litro');
      const laborPrice = optionalN('laborPricePerM2', 'mão de obra por m²');
      const prepCost = optionalN('prepCost', 'preparo/outros custos');
      const budget = calculatePaintingBudget({
        areaM2: area,
        coats,
        yieldM2PerLiter: yieldValue,
        paintPricePerLiter: paintPrice,
        laborPricePerM2: laborPrice,
        lossPercent: loss,
      });
      const { liters, material, labor } = budget;
      const total = budget.total + prepCost;
      return result(
        `Orçamento de pintura: ${money(total)}`,
        [
          { label: 'Material', value: money(material), helper: `${round(liters)} L estimados` },
          { label: 'Mão de obra', value: money(labor), helper: `${round(area)} m²` },
          { label: 'Total', value: money(total), helper: prepCost > 0 ? `inclui ${money(prepCost)} extras` : 'estimativa inicial' },
        ],
        [`Área: ${round(area)} m²`, `Litros estimados: ${round(liters)} L`, `Material: ${money(material)}`, `Mão de obra: ${money(labor)}`, `Preparo/outros: ${money(prepCost)}`, `Total: ${money(total)}`],
        'Use como base comercial rápida. Ajuste preparo, correção de parede, massa, lixamento, deslocamento e complexidade antes de enviar ao cliente.',
        ['Litros = área × demãos ÷ rendimento × (1 + perda ÷ 100)', 'Material = litros estimados × preço por litro', 'Mão de obra = área × valor por m²', 'Total = material + mão de obra + preparo/outros custos'],
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], orientation: '', formula: [], cards: [] };
    }
  }, [activeRule, values]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;

    const capture: CalculationCapture = {
      id: createId('painting-calc'),
      module: 'pintura',
      moduleLabel: 'Pintura e acabamento',
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: calculated.summary,
      details: [...calculated.details, ...calculated.formula.map((item) => `Fórmula: ${item}`), `Orientação: ${calculated.orientation}`],
    };

    onCaptureCalculation?.(capture);
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no atendimento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no atendimento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveMode(null);
    setAddedMessage(null);
    setShowAdvanced(false);
  }

  function openCalculator(mode: PaintingMode) {
    setActiveMode(mode);
    setAddedMessage(null);
    setShowAdvanced(false);
  }

  const showAdvancedFields = activeRule?.mode === 'paint-area' || activeRule?.mode === 'paint-liters' || activeRule?.mode === 'paint-budget';
  const showPaintConsumptionFields = activeRule?.mode === 'paint-liters' || activeRule?.mode === 'paint-budget';

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner">
        <div>
          <strong>Pintura e acabamento</strong>
          <span>Fluxo separado para medir área, estimar tinta e montar orçamento inicial.</span>
        </div>
        <em>{rules.length} cálculos</em>
      </div>

      <div className="general-picker-list">
        {rules.map((rule) => (
          <button className="general-picker-card" key={rule.mode} type="button" onClick={() => openCalculator(rule.mode)}>
            <span>
              <strong>{rule.label}</strong>
              <small>{rule.description}</small>
            </span>
            <em>LIVRE</em>
          </button>
        ))}
      </div>

      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeCalculator} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header">
              <button type="button" onClick={closeCalculator}>‹</button>
              <div>
                <span>Pintura e acabamento</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>LIVRE</em>
            </header>

            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.mode === 'paint-area' && (
                <>
                  <NumberField label="Comprimento do cômodo" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                  <NumberField label="Largura do cômodo" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Altura da parede" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                </>
              )}

              {showPaintConsumptionFields && (
                <>
                  <NumberField label="Área medida" value={values.measuredArea} suffix="m²" onChange={(value) => setValue('measuredArea', value)} />
                  <NumberField label="Demãos" value={values.coats} suffix="x" step={1} onChange={(value) => setValue('coats', value)} />
                  <NumberField label="Rendimento da tinta" value={values.paintYieldM2PerLiter} suffix="m²/L" onChange={(value) => setValue('paintYieldM2PerLiter', value)} />
                </>
              )}

              {activeRule.mode === 'paint-budget' && (
                <>
                  <NumberField label="Preço da tinta" value={values.paintLiterPrice} suffix="R$/L" onChange={(value) => setValue('paintLiterPrice', value)} />
                  <NumberField label="Mão de obra" value={values.laborPricePerM2} suffix="R$/m²" onChange={(value) => setValue('laborPricePerM2', value)} />
                </>
              )}

              {showAdvancedFields && (
                <div className="general-advanced-block">
                  <button type="button" onClick={() => setShowAdvanced((current) => !current)}>{showAdvanced ? 'Ocultar ajustes avançados' : 'Mostrar ajustes avançados'}</button>
                  {showAdvanced && (
                    <div className="general-advanced-grid">
                      {activeRule.mode === 'paint-area' && <NumberField label="Descontos" value={values.discountArea} suffix="m²" onChange={(value) => setValue('discountArea', value)} />}
                      {activeRule.mode === 'paint-area' && <NumberField label="Área extra/teto" value={values.extraArea} suffix="m²" onChange={(value) => setValue('extraArea', value)} />}
                      {showPaintConsumptionFields && <NumberField label="Perda" value={values.lossPercent} suffix="%" onChange={(value) => setValue('lossPercent', value)} />}
                      {activeRule.mode === 'paint-budget' && <NumberField label="Preparo/outros" value={values.prepCost} suffix="R$" onChange={(value) => setValue('prepCost', value)} />}
                    </div>
                  )}
                </div>
              )}
            </form>

            {calculated.error && <p className="general-error-message">{calculated.error}</p>}
            {calculated.cards.length > 0 && <div className="general-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {calculated.formula.length > 0 && <div className="general-formula-box"><strong>Como este cálculo é feito</strong>{calculated.formula.map((item) => <span key={item}>{item}</span>)}</div>}
            {calculated.orientation && <p className="general-helper-text">{calculated.orientation}</p>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}

            <div className="general-capture-actions">
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao atendimento</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="general-technical-note">Cálculo preliminar. Valide rendimento, estado da parede e complexidade antes de fechar o orçamento.</small>
          </section>
        </div>
      )}
    </div>
  );
}
