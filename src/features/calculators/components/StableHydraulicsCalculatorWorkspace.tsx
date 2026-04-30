import { useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import './GeneralCalculatorWorkspace.css';

type HydraulicMode =
  | 'rectangular-reservoir'
  | 'cylindrical-reservoir'
  | 'daily-consumption'
  | 'reservoir-autonomy'
  | 'flow-rate'
  | 'fill-time'
  | 'pressure-head';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface FieldConfig {
  key: string;
  label: string;
  suffix?: string;
  min?: number;
  step?: number;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface CalcResult {
  error: string | null;
  summary: string;
  details: string[];
  cards: ResultCardData[];
}

interface Rule {
  mode: HydraulicMode;
  label: string;
  description: string;
  icon: string;
  fields: FieldConfig[];
  compute: (n: (key: string, label: string) => number) => CalcResult;
}

const defaultValues: Record<string, string> = {
  width: '1.2',
  length: '1.5',
  height: '1',
  diameter: '1',
  people: '4',
  consumptionPerPerson: '150',
  reservoirLiters: '1000',
  flowLiterPerMinute: '20',
  flowCubicMeterPerHour: '1.2',
  volumeLiters: '1000',
  pressureBar: '1',
  pressurePsi: '14.5',
  headMca: '10.2',
};

function parseNumber(value: string): number {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function requireNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`);
  return value;
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function card(label: string, value: string, helper?: string): ResultCardData {
  return { label, value, helper };
}

function result(summary: string, cards: ResultCardData[], details: string[]): CalcResult {
  return { error: null, summary, cards, details };
}

const rules: Rule[] = [
  {
    mode: 'rectangular-reservoir',
    label: 'Reservatório retangular',
    description: 'Volume em m³ e litros para caixas e cisternas retangulares.',
    icon: '▭',
    fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'height', label: 'Altura útil', suffix: 'm' }],
    compute: (n) => {
      const volume = n('width', 'largura') * n('length', 'comprimento') * n('height', 'altura');
      const liters = volume * 1000;
      return result(`Reservatório retangular: ${round(liters)} L`, [card('Volume', `${round(volume, 3)} m³`), card('Capacidade', `${round(liters)} L`)], [`Volume: ${round(volume, 3)} m³`, `Capacidade: ${round(liters)} L`]);
    },
  },
  {
    mode: 'cylindrical-reservoir',
    label: 'Reservatório cilíndrico',
    description: 'Volume em m³ e litros para tanque cilíndrico.',
    icon: '◯',
    fields: [{ key: 'diameter', label: 'Diâmetro', suffix: 'm' }, { key: 'height', label: 'Altura útil', suffix: 'm' }],
    compute: (n) => {
      const radius = n('diameter', 'diâmetro') / 2;
      const volume = Math.PI * radius ** 2 * n('height', 'altura');
      const liters = volume * 1000;
      return result(`Reservatório cilíndrico: ${round(liters)} L`, [card('Volume', `${round(volume, 3)} m³`), card('Capacidade', `${round(liters)} L`)], [`Volume: ${round(volume, 3)} m³`, `Capacidade: ${round(liters)} L`]);
    },
  },
  {
    mode: 'daily-consumption',
    label: 'Consumo diário',
    description: 'Consumo diário estimado por quantidade de pessoas.',
    icon: '☰',
    fields: [{ key: 'people', label: 'Pessoas', suffix: 'pessoas', step: 1 }, { key: 'consumptionPerPerson', label: 'Consumo por pessoa', suffix: 'L/dia' }],
    compute: (n) => {
      const total = n('people', 'pessoas') * n('consumptionPerPerson', 'consumo');
      return result(`Consumo diário: ${round(total)} L/dia`, [card('Consumo diário', `${round(total)} L`), card('Em m³', `${round(total / 1000, 3)} m³`)], [`Consumo diário: ${round(total)} L`]);
    },
  },
  {
    mode: 'reservoir-autonomy',
    label: 'Autonomia da caixa',
    description: 'Quantos dias o reservatório atende pelo consumo informado.',
    icon: '◷',
    fields: [{ key: 'reservoirLiters', label: 'Reservatório', suffix: 'L' }, { key: 'people', label: 'Pessoas', suffix: 'pessoas', step: 1 }, { key: 'consumptionPerPerson', label: 'Consumo por pessoa', suffix: 'L/dia' }],
    compute: (n) => {
      const daily = n('people', 'pessoas') * n('consumptionPerPerson', 'consumo');
      const days = daily > 0 ? n('reservoirLiters', 'reservatório') / daily : 0;
      return result(`Autonomia estimada: ${round(days)} dia(s)`, [card('Consumo diário', `${round(daily)} L`), card('Autonomia', `${round(days)} dia(s)`)], [`Consumo diário: ${round(daily)} L`, `Autonomia: ${round(days)} dia(s)`]);
    },
  },
  {
    mode: 'flow-rate',
    label: 'Vazão',
    description: 'Conversão entre L/min, L/h e m³/h.',
    icon: '≈',
    fields: [{ key: 'flowLiterPerMinute', label: 'Vazão', suffix: 'L/min' }, { key: 'flowCubicMeterPerHour', label: 'Vazão', suffix: 'm³/h' }],
    compute: (n) => {
      const lmin = n('flowLiterPerMinute', 'vazão L/min');
      const m3h = n('flowCubicMeterPerHour', 'vazão m³/h');
      return result(`${round(lmin)} L/min = ${round(lmin * 0.06)} m³/h`, [card('L/min → L/h', `${round(lmin * 60)} L/h`), card('L/min → m³/h', `${round(lmin * 0.06)} m³/h`), card('m³/h → L/min', `${round(m3h * 1000 / 60)} L/min`)], [`${round(lmin)} L/min = ${round(lmin * 0.06)} m³/h`]);
    },
  },
  {
    mode: 'fill-time',
    label: 'Tempo de enchimento',
    description: 'Tempo para encher reservatório pela vazão.',
    icon: '⏱',
    fields: [{ key: 'volumeLiters', label: 'Volume', suffix: 'L' }, { key: 'flowLiterPerMinute', label: 'Vazão', suffix: 'L/min' }],
    compute: (n) => {
      const minutes = n('volumeLiters', 'volume') / n('flowLiterPerMinute', 'vazão');
      return result(`Tempo de enchimento: ${round(minutes)} min`, [card('Minutos', `${round(minutes)} min`), card('Horas', `${round(minutes / 60)} h`)], [`Tempo: ${round(minutes)} min`]);
    },
  },
  {
    mode: 'pressure-head',
    label: 'Pressão / MCA',
    description: 'Conversão entre bar, psi e metros de coluna d’água.',
    icon: '↕',
    fields: [{ key: 'pressureBar', label: 'Pressão', suffix: 'bar' }, { key: 'pressurePsi', label: 'Pressão', suffix: 'psi' }, { key: 'headMca', label: 'Altura', suffix: 'mca' }],
    compute: (n) => {
      const bar = n('pressureBar', 'bar');
      const psi = n('pressurePsi', 'psi');
      const mca = n('headMca', 'mca');
      return result(`Pressão: ${round(bar * 10.197)} mca`, [card('bar → mca', `${round(bar * 10.197)} mca`), card('bar → psi', `${round(bar * 14.5038)} psi`), card('psi → bar', `${round(psi / 14.5038)} bar`), card('mca → bar', `${round(mca / 10.197)} bar`)], ['Conversão de pressão']);
    },
  },
];

function NumberField({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (value: string) => void }) {
  return (
    <label className="general-form-field">
      <span>{field.label}</span>
      <div>
        <input type="number" inputMode="decimal" min={field.min ?? 0} step={field.step ?? 0.01} value={value} onChange={(event) => onChange(event.target.value)} />
        {field.suffix && <small>{field.suffix}</small>}
      </div>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="general-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function HydraulicsCalculatorWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<HydraulicMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  const read = (key: string, label: string) => requireNumber(parseNumber(values[key] ?? ''), label);

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function calculate(): CalcResult {
    if (!activeRule) return { error: null, summary: '', details: [], cards: [] };
    try {
      return activeRule.compute(read);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], cards: [] };
    }
  }

  const calculated = calculate();

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;
    const capture: CalculationCapture = {
      id: createId('hydraulic-calc'),
      module: 'hidraulica',
      moduleLabel: 'Hidráulica',
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: calculated.summary,
      details: calculated.details,
    };
    onCaptureCalculation?.(capture);
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no levantamento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no levantamento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveMode(null);
    setAddedMessage(null);
  }

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner"><div><strong>Hidráulica</strong><span>Cálculos estáveis para reservatórios, consumo, vazão, enchimento e pressão.</span></div><em>{rules.length} cálculos</em></div>
      <div className="general-picker-list">
        {rules.map((rule) => <button className="general-picker-card" key={rule.mode} type="button" onClick={() => setActiveMode(rule.mode)}><span className="app-icon tone-green">{rule.icon}</span><span><strong>{rule.label}</strong><small>{rule.description}</small></span><em>LIVRE</em><span className="chevron">›</span></button>)}
      </div>
      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeCalculator} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header"><button type="button" onClick={closeCalculator}>‹</button><div><span>Hidráulica</span><h2>{activeRule.label}</h2><p>{activeRule.description}</p></div><em>LIVRE</em></header>
            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>{activeRule.fields.map((field) => <NumberField key={field.key} field={field} value={values[field.key] ?? ''} onChange={(value) => setValue(field.key, value)} />)}</form>
            {calculated.error && <p className="general-error-message">{calculated.error}</p>}
            {calculated.cards.length > 0 && <div className="general-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}
            <div className="general-capture-actions"><button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button><button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button><button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button><button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button></div>
            <small className="general-technical-note">Cálculo preliminar. Valide as condições reais da instalação hidráulica.</small>
          </section>
        </div>
      )}
    </div>
  );
}
