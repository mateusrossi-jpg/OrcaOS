import { useMemo, useState } from 'react';
import {
  calculateCylindricalReservoir,
  calculateDailyWaterConsumption,
  calculateFillTime,
  calculateRectangularReservoir,
  calculateReservoirAutonomy,
  convertFlow,
  convertPressure,
} from '../../../core/calculations/trade';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import './GeneralCalculatorWorkspace.css';

type HydraulicMode =
  | 'rectangular-reservoir'
  | 'cylindrical-reservoir'
  | 'daily-consumption'
  | 'reservoir-autonomy'
  | 'flow-rate'
  | 'fill-time'
  | 'pressure-head';

type FlowUnit = 'lmin' | 'm3h';
type PressureUnit = 'bar' | 'psi' | 'mca';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface Rule {
  mode: HydraulicMode;
  label: string;
  description: string;
  icon: string;
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
  orientation: string;
  formula: string[];
}

const defaultValues: Record<string, string> = {
  width: '1.2',
  length: '1.5',
  height: '1',
  diameter: '1',
  people: '4',
  consumptionPerPerson: '150',
  reservoirLiters: '1000',
  flowValue: '20',
  volumeLiters: '1000',
  pressureValue: '1',
};

const rules: Rule[] = [
  { mode: 'rectangular-reservoir', label: 'Reservatório retangular', description: 'Volume em m³ e litros para caixas e cisternas retangulares.', icon: '▭' },
  { mode: 'cylindrical-reservoir', label: 'Reservatório cilíndrico', description: 'Volume em m³ e litros para tanque cilíndrico.', icon: '◯' },
  { mode: 'daily-consumption', label: 'Consumo diário', description: 'Consumo diário estimado por quantidade de pessoas.', icon: '☰' },
  { mode: 'reservoir-autonomy', label: 'Autonomia da caixa', description: 'Quantos dias o reservatório atende pelo consumo informado.', icon: '◷' },
  { mode: 'flow-rate', label: 'Vazão', description: 'Converta uma vazão informada para L/min, L/h e m³/h.', icon: '≈' },
  { mode: 'fill-time', label: 'Tempo de enchimento', description: 'Tempo para encher reservatório pela vazão.', icon: '⏱' },
  { mode: 'pressure-head', label: 'Pressão / MCA', description: 'Converta uma pressão informada para bar, psi e mca.', icon: '↕' },
];

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function requirePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Informe um valor maior que zero para ${label}.`);
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

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[]): CalcResult {
  return { error: null, summary, cards, details, orientation, formula };
}

function emptyResult(): CalcResult {
  return { error: null, summary: '', details: [], cards: [], orientation: '', formula: [] };
}

function flowUnitLabel(unit: FlowUnit): string {
  return unit === 'm3h' ? 'm³/h' : 'L/min';
}

function NumberField({ label, value, suffix, step = 0.01, onChange }: { label: string; value: string; suffix?: string; step?: number; onChange: (value: string) => void }) {
  return (
    <label className="general-form-field">
      <span>{label}</span>
      <div>
        <input type="number" inputMode="decimal" min="0" step={step} value={value} onFocus={handleNumericInputFocus} onChange={(event) => onChange(event.target.value)} />
        {suffix && <small className="technical-unit">{suffix}</small>}
      </div>
    </label>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return (
    <label className="general-form-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="general-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function HydraulicsCalculatorWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<HydraulicMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [flowUnit, setFlowUnit] = useState<FlowUnit>('lmin');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('bar');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string): number {
    return requirePositive(parseNumber(values[key] ?? ''), label);
  }

  const calculated = useMemo<CalcResult>(() => {
    if (!activeRule) return emptyResult();

    try {
      if (activeRule.mode === 'rectangular-reservoir') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const height = n('height', 'altura útil');
        const { cubicMeters: volume, liters } = calculateRectangularReservoir({ widthM: width, lengthM: length, heightM: height });
        return result(
          `Reservatório retangular: ${round(liters)} L`,
          [card('Volume', `${round(volume, 3)} m³`, 'largura × comprimento × altura'), card('Capacidade', `${round(liters)} L`, 'volume útil estimado')],
          [`Largura: ${round(width)} m`, `Comprimento: ${round(length)} m`, `Altura útil: ${round(height)} m`, `Volume: ${round(volume, 3)} m³`, `Capacidade: ${round(liters)} L`],
          'Use a altura útil da água, não necessariamente a altura total da caixa. Reserve margem para extravasor, tampa e folga operacional.',
          ['Volume em m³ = largura × comprimento × altura útil', 'Capacidade em litros = volume em m³ × 1000'],
        );
      }

      if (activeRule.mode === 'cylindrical-reservoir') {
        const diameter = n('diameter', 'diâmetro');
        const height = n('height', 'altura útil');
        const { radiusM: radius, cubicMeters: volume, liters } = calculateCylindricalReservoir({ diameterM: diameter, heightM: height });
        return result(
          `Reservatório cilíndrico: ${round(liters)} L`,
          [card('Volume', `${round(volume, 3)} m³`, 'π × raio² × altura'), card('Capacidade', `${round(liters)} L`, 'volume útil estimado')],
          [`Diâmetro: ${round(diameter)} m`, `Raio: ${round(radius)} m`, `Altura útil: ${round(height)} m`, `Volume: ${round(volume, 3)} m³`, `Capacidade: ${round(liters)} L`],
          'Use altura útil quando o reservatório não trabalha totalmente cheio. Para tanque horizontal, este cálculo não representa volume parcial.',
          ['Raio = diâmetro ÷ 2', 'Volume em m³ = π × raio² × altura útil', 'Capacidade em litros = volume em m³ × 1000'],
        );
      }

      if (activeRule.mode === 'daily-consumption') {
        const people = n('people', 'pessoas');
        const consumption = n('consumptionPerPerson', 'consumo por pessoa');
        const { litersPerDay: total } = calculateDailyWaterConsumption({ people, litersPerPersonDay: consumption });
        return result(
          `Consumo diário: ${round(total)} L/dia`,
          [card('Consumo diário', `${round(total)} L`, `${round(people)} pessoa(s)`), card('Em m³', `${round(total / 1000, 3)} m³`, 'por dia')],
          [`Pessoas: ${round(people)}`, `Consumo por pessoa: ${round(consumption)} L/dia`, `Consumo diário: ${round(total)} L`],
          'Use como estimativa inicial. Em obra real, ajuste conforme perfil de uso, ocupação, comércio, horários e reserva desejada.',
          ['Consumo diário em litros = quantidade de pessoas × consumo por pessoa', 'Consumo em m³ = consumo em litros ÷ 1000'],
        );
      }

      if (activeRule.mode === 'reservoir-autonomy') {
        const reservoirLiters = n('reservoirLiters', 'reservatório');
        const people = n('people', 'pessoas');
        const consumption = n('consumptionPerPerson', 'consumo por pessoa');
        const { litersPerDay: daily, days } = calculateReservoirAutonomy({ reservoirLiters, people, litersPerPersonDay: consumption });
        return result(
          `Autonomia estimada: ${round(days)} dia(s)`,
          [card('Consumo diário', `${round(daily)} L`, `${round(people)} pessoa(s)`), card('Autonomia', `${round(days)} dia(s)`, `${round(reservoirLiters)} L disponíveis`) ],
          [`Reservatório: ${round(reservoirLiters)} L`, `Consumo diário: ${round(daily)} L`, `Autonomia: ${round(days)} dia(s)`],
          'Use para pré-dimensionamento. Para atendimento confiável, considere reserva, dias sem abastecimento e consumo de pico.',
          ['Consumo diário = pessoas × consumo por pessoa', 'Autonomia em dias = volume do reservatório ÷ consumo diário'],
        );
      }

      if (activeRule.mode === 'flow-rate') {
        const input = n('flowValue', 'vazão');
        const { litersPerMinute: lmin, litersPerHour: lh, cubicMetersPerHour: m3h } = convertFlow({ value: input, unit: flowUnit });
        return result(
          `Vazão: ${round(lmin, 2)} L/min`,
          [card('L/min', `${round(lmin, 2)} L/min`, 'litros por minuto'), card('L/h', `${round(lh)} L/h`, 'litros por hora'), card('m³/h', `${round(m3h, 3)} m³/h`, 'metros cúbicos por hora')],
          [`Entrada: ${round(input, 3)} ${flowUnitLabel(flowUnit)}`, `L/min: ${round(lmin, 2)}`, `L/h: ${round(lh)}`, `m³/h: ${round(m3h, 3)}`],
          'Use uma única unidade de entrada. Para bomba, valide também altura manométrica, perdas, curva da bomba e diâmetro da tubulação.',
          flowUnit === 'm3h'
            ? ['L/min = m³/h × 1000 ÷ 60', 'L/h = L/min × 60', 'm³/h = L/h ÷ 1000']
            : ['L/h = L/min × 60', 'm³/h = L/h ÷ 1000'],
        );
      }

      if (activeRule.mode === 'fill-time') {
        const volume = n('volumeLiters', 'volume');
        const flow = n('flowValue', 'vazão');
        const { litersPerMinute: lmin, minutes, hours } = calculateFillTime({ volumeLiters: volume, flowValue: flow, flowUnit });
        return result(
          `Tempo de enchimento: ${round(minutes)} min`,
          [card('Minutos', `${round(minutes)} min`, `${round(lmin, 2)} L/min`), card('Horas', `${round(hours, 2)} h`, 'tempo estimado')],
          [`Volume: ${round(volume)} L`, `Vazão: ${round(lmin, 2)} L/min`, `Tempo: ${round(minutes)} min`, `Tempo: ${round(hours, 2)} h`],
          'Use para estimativa. O tempo real pode variar com pressão da rede, boia, bomba, tubulação e perda de carga.',
          ['Vazão em L/min = vazão informada convertida para L/min', 'Tempo em minutos = volume em litros ÷ vazão em L/min', 'Tempo em horas = tempo em minutos ÷ 60'],
        );
      }

      const input = n('pressureValue', 'pressão');
      const { bar, psi, mca } = convertPressure({ value: input, unit: pressureUnit });
      return result(
        `Pressão: ${round(mca, 2)} mca`,
        [card('bar', `${round(bar, 3)} bar`, 'pressão base'), card('psi', `${round(psi, 2)} psi`, 'aproximado'), card('mca', `${round(mca, 2)} mca`, 'coluna d’água')],
        [`Entrada: ${round(input, 3)} ${pressureUnit}`, `bar: ${round(bar, 3)}`, `psi: ${round(psi, 2)}`, `mca: ${round(mca, 2)}`],
        'Use mca como referência prática em hidráulica. Para bomba e pressurizador, considere altura geométrica, perdas e curva do fabricante.',
        pressureUnit === 'psi'
          ? ['bar = psi ÷ 14,5038', 'psi = bar × 14,5038', 'mca = bar × 10,197']
          : pressureUnit === 'mca'
            ? ['bar = mca ÷ 10,197', 'psi = bar × 14,5038', 'mca = bar × 10,197']
            : ['psi = bar × 14,5038', 'mca = bar × 10,197'],
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], cards: [], orientation: '', formula: [] };
    }
  }, [activeRule, values, flowUnit, pressureUnit]);

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
      details: [...calculated.details, ...calculated.formula.map((item) => `Fórmula: ${item}`), `Orientação: ${calculated.orientation}`],
    };
    onCaptureCalculation?.(capture);
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no campo.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no campo e no orçamento.`);
  }

  function closeCalculator() {
    setActiveMode(null);
    setAddedMessage(null);
  }

  function openCalculator(mode: HydraulicMode) {
    setActiveMode(mode);
    setAddedMessage(null);
  }

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner"><div><strong>Hidráulica</strong><span>Cálculos estáveis para reservatórios, consumo, vazão, enchimento e pressão.</span></div><em>{rules.length} cálculos</em></div>
      <div className="general-picker-list">
        {rules.map((rule) => <button className="general-picker-card" key={rule.mode} type="button" onClick={() => openCalculator(rule.mode)}><span><strong>{rule.label}</strong><small>{rule.description}</small></span><em>LIVRE</em></button>)}
      </div>
      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeCalculator} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header"><button type="button" onClick={closeCalculator}>‹</button><div><span>Hidráulica</span><h2>{activeRule.label}</h2><p>{activeRule.description}</p></div><em>LIVRE</em></header>
            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.mode === 'rectangular-reservoir' && <><NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} /><NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} /><NumberField label="Altura útil" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} /></>}
              {activeRule.mode === 'cylindrical-reservoir' && <><NumberField label="Diâmetro" value={values.diameter} suffix="m" onChange={(value) => setValue('diameter', value)} /><NumberField label="Altura útil" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} /></>}
              {activeRule.mode === 'daily-consumption' && <><NumberField label="Pessoas" value={values.people} suffix="pessoas" step={1} onChange={(value) => setValue('people', value)} /><NumberField label="Consumo por pessoa" value={values.consumptionPerPerson} suffix="L/dia" onChange={(value) => setValue('consumptionPerPerson', value)} /></>}
              {activeRule.mode === 'reservoir-autonomy' && <><NumberField label="Reservatório" value={values.reservoirLiters} suffix="L" onChange={(value) => setValue('reservoirLiters', value)} /><NumberField label="Pessoas" value={values.people} suffix="pessoas" step={1} onChange={(value) => setValue('people', value)} /><NumberField label="Consumo por pessoa" value={values.consumptionPerPerson} suffix="L/dia" onChange={(value) => setValue('consumptionPerPerson', value)} /></>}
              {activeRule.mode === 'flow-rate' && <><SelectField<FlowUnit> label="Unidade de entrada" value={flowUnit} onChange={setFlowUnit} options={[{ value: 'lmin', label: 'L/min' }, { value: 'm3h', label: 'm³/h' }]} /><NumberField label="Vazão" value={values.flowValue} suffix={flowUnitLabel(flowUnit)} onChange={(value) => setValue('flowValue', value)} /></>}
              {activeRule.mode === 'fill-time' && <><NumberField label="Volume" value={values.volumeLiters} suffix="L" onChange={(value) => setValue('volumeLiters', value)} /><SelectField<FlowUnit> label="Unidade da vazão" value={flowUnit} onChange={setFlowUnit} options={[{ value: 'lmin', label: 'L/min' }, { value: 'm3h', label: 'm³/h' }]} /><NumberField label="Vazão" value={values.flowValue} suffix={flowUnitLabel(flowUnit)} onChange={(value) => setValue('flowValue', value)} /></>}
              {activeRule.mode === 'pressure-head' && <><SelectField<PressureUnit> label="Unidade de entrada" value={pressureUnit} onChange={setPressureUnit} options={[{ value: 'bar', label: 'bar' }, { value: 'psi', label: 'psi' }, { value: 'mca', label: 'mca' }]} /><NumberField label="Pressão" value={values.pressureValue} suffix={pressureUnit} onChange={(value) => setValue('pressureValue', value)} /></>}
            </form>
            {calculated.error && <p className="general-error-message">{calculated.error}</p>}
            {calculated.cards.length > 0 && <div className="general-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {calculated.formula.length > 0 && <div className="general-formula-box"><strong>Como este cálculo é feito</strong>{calculated.formula.map((item) => <span key={item}>{item}</span>)}</div>}
            {calculated.orientation && <p className="general-helper-text">{calculated.orientation}</p>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}
            <div className="general-capture-actions"><button type="button" onClick={() => includeResult('survey')}>Adicionar ao campo</button><button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button><button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button><button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button></div>
            <small className="general-technical-note">Cálculo preliminar. Valide as condições reais da instalação hidráulica.</small>
          </section>
        </div>
      )}
    </div>
  );
}
