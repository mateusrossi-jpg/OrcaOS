import { useMemo, useState } from 'react';
import { createId } from '../../../app/utils/idHelpers';
import {
  convertPower,
  convertPressure,
  convertThermalPower,
  convertVolume,
  KW_PER_CV,
  KW_PER_HP,
  WATTS_PER_BTUH,
} from '../../../core/calculations/trade';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import './GeneralCalculatorWorkspace.css';

type ConverterMode = 'volume' | 'pressure' | 'power' | 'thermal';
type VolumeUnit = 'cubicMeters' | 'liters';
type PressureUnit = 'bar' | 'psi' | 'mca';
type PowerUnit = 'kw' | 'cv' | 'hp';
type ThermalUnit = 'btuh' | 'watts';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface ConverterRule {
  mode: ConverterMode;
  label: string;
  description: string;
  icon: string;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface ConverterResult {
  error: string | null;
  summary: string;
  details: string[];
  orientation: string;
  formula: string[];
  cards: ResultCardData[];
}

const rules: ConverterRule[] = [
  { mode: 'volume', label: 'm³ ↔ litros', description: 'Informe um valor e escolha a unidade de origem.', icon: '≋' },
  { mode: 'pressure', label: 'bar / psi / mca', description: 'Converta pressão sem preencher unidades equivalentes ao mesmo tempo.', icon: '↕' },
  { mode: 'power', label: 'CV / HP / kW', description: 'Converta potência de equipamentos técnicos por uma unidade de entrada.', icon: '⚙' },
  { mode: 'thermal', label: 'BTU/h ↔ W', description: 'Converta potência térmica para refrigeração e climatização.', icon: '❄' },
];

const defaultValues: Record<string, string> = {
  volumeValue: '1',
  pressureValue: '1',
  powerValue: '1',
  thermalValue: '12000',
};

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function ensureNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`);
  return value;
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function emptyResult(): ConverterResult {
  return { error: null, summary: '', details: [], orientation: '', formula: [], cards: [] };
}

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[]): ConverterResult {
  return { error: null, summary, cards, details, orientation, formula };
}

function powerUnitLabel(unit: PowerUnit): string {
  if (unit === 'kw') return 'kW';
  if (unit === 'cv') return 'CV';
  return 'HP';
}

function thermalUnitLabel(unit: ThermalUnit): string {
  return unit === 'btuh' ? 'BTU/h' : 'W';
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

export function ConvertersHumanWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<ConverterMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('cubicMeters');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('bar');
  const [powerUnit, setPowerUnit] = useState<PowerUnit>('kw');
  const [thermalUnit, setThermalUnit] = useState<ThermalUnit>('btuh');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string): number {
    return ensureNonNegative(parseNumber(values[key] ?? ''), label);
  }

  const calculated = useMemo<ConverterResult>(() => {
    if (!activeRule) return emptyResult();

    try {
      if (activeRule.mode === 'volume') {
        const input = n('volumeValue', 'volume');
        const { cubicMeters, liters } = convertVolume({ value: input, unit: volumeUnit });
        return result(
          `${round(cubicMeters, 3)} m³ · ${round(liters)} L`,
          [
            { label: 'Metros cúbicos', value: `${round(cubicMeters, 3)} m³`, helper: 'volume em m³' },
            { label: 'Litros', value: `${round(liters)} L`, helper: '1 m³ = 1000 L' },
          ],
          [`Entrada: ${round(input, 3)} ${volumeUnit === 'cubicMeters' ? 'm³' : 'L'}`, `Resultado: ${round(cubicMeters, 3)} m³`, `Resultado: ${round(liters)} L`],
          'Use para reservatórios, caixas d’água e volumes simples. Confira sempre se as medidas estão na mesma unidade.',
          volumeUnit === 'cubicMeters'
            ? ['Litros = m³ × 1000']
            : ['m³ = litros ÷ 1000', 'Litros = m³ × 1000'],
        );
      }

      if (activeRule.mode === 'pressure') {
        const input = n('pressureValue', 'pressão');
        const { bar, psi, mca } = convertPressure({ value: input, unit: pressureUnit });
        return result(
          `${round(bar, 3)} bar · ${round(psi, 2)} psi · ${round(mca, 2)} mca`,
          [
            { label: 'bar', value: `${round(bar, 3)} bar`, helper: 'pressão base' },
            { label: 'psi', value: `${round(psi, 2)} psi`, helper: 'aproximado' },
            { label: 'mca', value: `${round(mca, 2)} mca`, helper: 'metros de coluna d’água' },
          ],
          [`Entrada: ${round(input, 3)} ${pressureUnit}`, `bar: ${round(bar, 3)}`, `psi: ${round(psi, 2)}`, `mca: ${round(mca, 2)}`],
          'Use mca para leitura prática em hidráulica e bombas. Em sistemas críticos, valide curva da bomba, perdas e manômetro.',
          pressureUnit === 'psi'
            ? ['bar = psi ÷ 14,5038', 'psi = bar × 14,5038', 'mca = bar × 10,197']
            : pressureUnit === 'mca'
              ? ['bar = mca ÷ 10,197', 'psi = bar × 14,5038', 'mca = bar × 10,197']
              : ['psi = bar × 14,5038', 'mca = bar × 10,197'],
        );
      }

      if (activeRule.mode === 'power') {
        const input = n('powerValue', 'potência');
        const { kw, cv, hp } = convertPower({ value: input, unit: powerUnit });
        return result(
          `${round(kw, 3)} kW · ${round(cv, 2)} CV · ${round(hp, 2)} HP`,
          [
            { label: 'kW', value: `${round(kw, 3)} kW`, helper: 'potência em quilowatt' },
            { label: 'CV', value: `${round(cv, 2)} CV`, helper: 'cavalo-vapor' },
            { label: 'HP', value: `${round(hp, 2)} HP`, helper: 'horsepower' },
          ],
          [`Entrada: ${round(input, 3)} ${powerUnitLabel(powerUnit)}`, `kW: ${round(kw, 3)}`, `CV: ${round(cv, 2)}`, `HP: ${round(hp, 2)}`],
          'Use como conversão de referência. Para corrente de motor, use cálculo específico com tensão, rendimento e fator de potência.',
          powerUnit === 'cv'
            ? ['kW = CV × 0,7355', 'CV = kW ÷ 0,7355', 'HP = kW ÷ 0,7457']
            : powerUnit === 'hp'
              ? ['kW = HP × 0,7457', 'CV = kW ÷ 0,7355', 'HP = kW ÷ 0,7457']
              : ['CV = kW ÷ 0,7355', 'HP = kW ÷ 0,7457'],
        );
      }

      const input = n('thermalValue', 'potência térmica');
      const { watts, btuh } = convertThermalPower({ value: input, unit: thermalUnit });
      return result(
        `${round(btuh)} BTU/h · ${round(watts)} W`,
        [
          { label: 'BTU/h', value: `${round(btuh)} BTU/h`, helper: 'capacidade térmica' },
          { label: 'Watts', value: `${round(watts)} W`, helper: 'potência térmica aproximada' },
        ],
        [`Entrada: ${round(input, 2)} ${thermalUnitLabel(thermalUnit)}`, `BTU/h: ${round(btuh)}`, `Watts: ${round(watts)}`],
        'Use para conversão rápida em refrigeração. Dimensionamento de ar-condicionado deve considerar ambiente, insolação e ocupação.',
        thermalUnit === 'btuh'
          ? ['Watts = BTU/h × 0,293071', 'BTU/h = Watts ÷ 0,293071']
          : ['BTU/h = Watts ÷ 0,293071', 'Watts = BTU/h × 0,293071'],
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha o valor que deseja converter.', summary: '', details: [], orientation: '', formula: [], cards: [] };
    }
  }, [activeRule, values, volumeUnit, pressureUnit, powerUnit, thermalUnit]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;

    const capture: CalculationCapture = {
      id: createId('converter'),
      module: 'conversores',
      moduleLabel: 'Conversores rápidos',
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
  }

  function openCalculator(mode: ConverterMode) {
    setActiveMode(mode);
    setAddedMessage(null);
  }

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner">
        <div>
          <strong>Conversores rápidos</strong>
          <span>Conversões rápidas com uma única unidade de entrada, evitando campos equivalentes desnecessários.</span>
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
                <span>Conversores rápidos</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>LIVRE</em>
            </header>

            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.mode === 'volume' && (
                <>
                  <SelectField<VolumeUnit>
                    label="Unidade de entrada"
                    value={volumeUnit}
                    onChange={setVolumeUnit}
                    options={[
                      { value: 'cubicMeters', label: 'm³' },
                      { value: 'liters', label: 'litros' },
                    ]}
                  />
                  <NumberField label="Valor" value={values.volumeValue} suffix={volumeUnit === 'cubicMeters' ? 'm³' : 'L'} onChange={(value) => setValue('volumeValue', value)} />
                </>
              )}

              {activeRule.mode === 'pressure' && (
                <>
                  <SelectField<PressureUnit>
                    label="Unidade de entrada"
                    value={pressureUnit}
                    onChange={setPressureUnit}
                    options={[
                      { value: 'bar', label: 'bar' },
                      { value: 'psi', label: 'psi' },
                      { value: 'mca', label: 'mca' },
                    ]}
                  />
                  <NumberField label="Pressão" value={values.pressureValue} suffix={pressureUnit} onChange={(value) => setValue('pressureValue', value)} />
                </>
              )}

              {activeRule.mode === 'power' && (
                <>
                  <SelectField<PowerUnit>
                    label="Unidade de entrada"
                    value={powerUnit}
                    onChange={setPowerUnit}
                    options={[
                      { value: 'kw', label: 'kW' },
                      { value: 'cv', label: 'CV' },
                      { value: 'hp', label: 'HP' },
                    ]}
                  />
                  <NumberField label="Potência" value={values.powerValue} suffix={powerUnitLabel(powerUnit)} onChange={(value) => setValue('powerValue', value)} />
                </>
              )}

              {activeRule.mode === 'thermal' && (
                <>
                  <SelectField<ThermalUnit>
                    label="Unidade de entrada"
                    value={thermalUnit}
                    onChange={setThermalUnit}
                    options={[
                      { value: 'btuh', label: 'BTU/h' },
                      { value: 'watts', label: 'W' },
                    ]}
                  />
                  <NumberField label="Valor" value={values.thermalValue} suffix={thermalUnitLabel(thermalUnit)} step={1} onChange={(value) => setValue('thermalValue', value)} />
                </>
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

            <small className="general-technical-note">Conversão preliminar. Use como apoio técnico e valide unidades do equipamento ou projeto.</small>
          </section>
        </div>
      )}
    </div>
  );
}
