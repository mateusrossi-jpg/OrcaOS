import { useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import './ElectricalFundamentalsHumanWorkspace.css';

type FundamentalMode =
  | 'current-from-power'
  | 'power-from-current'
  | 'voltage-from-power-current'
  | 'ohms-law'
  | 'power-resistance'
  | 'apparent-power'
  | 'resistor-network'
  | 'consumption';

type PhaseMode = 'single' | 'three';
type OhmsTarget = 'resistance' | 'current' | 'voltage';
type PowerResistanceTarget = 'voltage-resistance' | 'current-resistance';
type ApparentTarget = 'va-from-watts' | 'current-from-va';

interface Props {
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

interface CalcResult {
  error: string | null;
  summary: string;
  details: string[];
  cards: ResultCardData[];
  orientation: string;
  formula: string[];
}

const rules: FundamentalRule[] = [
  { mode: 'current-from-power', label: 'Corrente por potência', description: 'Informe potência e tensão para descobrir a corrente da carga.', icon: 'A' },
  { mode: 'power-from-current', label: 'Potência por corrente', description: 'Informe tensão e corrente para descobrir a potência elétrica.', icon: 'W' },
  { mode: 'voltage-from-power-current', label: 'Tensão por potência/corrente', description: 'Informe potência e corrente para descobrir a tensão aproximada.', icon: 'V' },
  { mode: 'ohms-law', label: 'Lei de Ohm', description: 'Escolha se quer calcular resistência, corrente ou tensão.', icon: 'Ω' },
  { mode: 'power-resistance', label: 'Potência em resistência', description: 'Calcule potência dissipada usando tensão ou corrente com resistência.', icon: 'P' },
  { mode: 'apparent-power', label: 'Potência aparente / VA', description: 'Calcule VA ou corrente a partir de VA e tensão.', icon: 'VA' },
  { mode: 'resistor-network', label: 'Resistores série/paralelo', description: 'Associe até três resistores para obter a resistência equivalente.', icon: 'R' },
  { mode: 'consumption', label: 'Consumo em kWh', description: 'Estime consumo e custo de energia por período.', icon: 'kWh' },
];

const defaultValues: Record<string, string> = {
  powerWatts: '2200',
  voltageVolts: '220',
  currentAmps: '10',
  resistanceOhms: '22',
  powerFactor: '1',
  apparentPowerVa: '2200',
  resistorOneOhms: '100',
  resistorTwoOhms: '220',
  resistorThreeOhms: '330',
  hoursPerDay: '2',
  days: '30',
  tariff: '0.95',
};

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function ensurePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Informe um valor válido para ${label}.`);
  return value;
}

function ensureNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`);
  return value;
}

function ensurePowerFactor(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > 1) throw new Error('Informe um fator de potência entre 0,01 e 1.');
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

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[]): CalcResult {
  return { error: null, summary, cards, details, orientation, formula };
}

function phaseMultiplier(phase: PhaseMode): number {
  return phase === 'three' ? Math.sqrt(3) : 1;
}

function phaseLabel(phase: PhaseMode): string {
  return phase === 'three' ? 'trifásico' : 'monofásico/bifásico simplificado';
}

function emptyResult(): CalcResult {
  return { error: null, summary: '', details: [], cards: [], orientation: '', formula: [] };
}

function phaseFormula(phaseMode: PhaseMode, currentSymbol = 'I'): string {
  return phaseMode === 'three' ? `${currentSymbol}: usa fator √3 para circuito trifásico` : `${currentSymbol}: usa fator 1 para monofásico/bifásico simplificado`;
}

function NumberField({ label, value, suffix, step = 0.01, onChange }: { label: string; value: string; suffix?: string; step?: number; onChange: (value: string) => void }) {
  return (
    <label className="human-field">
      <span>{label}</span>
      <div>
        <input type="number" inputMode="decimal" min="0" step={step} value={value} onChange={(event) => onChange(event.target.value)} />
        {suffix && <small>{suffix}</small>}
      </div>
    </label>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return (
    <label className="human-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="human-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function ElectricalFundamentalsHumanWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<FundamentalMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [phase, setPhase] = useState<PhaseMode>('single');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ohmsTarget, setOhmsTarget] = useState<OhmsTarget>('resistance');
  const [powerResistanceTarget, setPowerResistanceTarget] = useState<PowerResistanceTarget>('voltage-resistance');
  const [apparentTarget, setApparentTarget] = useState<ApparentTarget>('va-from-watts');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string): number {
    return ensurePositive(parseNumber(values[key] ?? ''), label);
  }

  function optionalN(key: string, label: string): number {
    const rawValue = values[key] ?? '';
    if (!rawValue.trim()) return 0;
    return ensureNonNegative(parseNumber(rawValue), label);
  }

  function fp(): number {
    return ensurePowerFactor(parseNumber(values.powerFactor ?? '1'));
  }

  function resistorValues(): number[] {
    return ['resistorOneOhms', 'resistorTwoOhms', 'resistorThreeOhms'].reduce<number[]>((items, key, index) => {
      const rawValue = values[key] ?? '';
      if (!rawValue.trim()) return items;
      items.push(ensurePositive(parseNumber(rawValue), `resistor ${index + 1}`));
      return items;
    }, []);
  }

  const calculated = useMemo<CalcResult>(() => {
    if (!activeRule) return emptyResult();

    try {
      if (activeRule.mode === 'current-from-power') {
        const power = n('powerWatts', 'potência');
        const voltage = n('voltageVolts', 'tensão');
        const factor = fp();
        const multiplier = phaseMultiplier(phase);
        const current = power / (multiplier * voltage * factor);
        return result(
          `Corrente calculada: ${round(current)} A`,
          [
            { label: 'Corrente', value: `${round(current)} A`, helper: 'base para disjuntor e cabo' },
            { label: 'Dados usados', value: `${round(power)} W / ${round(voltage)} V`, helper: showAdvanced ? `FP ${round(factor, 2)} · ${phaseLabel(phase)}` : 'modo simples' },
          ],
          [`Potência: ${round(power)} W`, `Tensão: ${round(voltage)} V`, `Fator de potência: ${round(factor, 2)}`, `Circuito: ${phaseLabel(phase)}`, `Corrente: ${round(current)} A`],
          'Use a corrente como ponto de partida. Para escolher cabo/disjuntor, valide método de instalação, distância, queda de tensão e norma aplicável.',
          ['Corrente = potência ÷ (fator do circuito × tensão × fator de potência)', phaseFormula(phase, 'Fator do circuito')],
        );
      }

      if (activeRule.mode === 'power-from-current') {
        const voltage = n('voltageVolts', 'tensão');
        const current = n('currentAmps', 'corrente');
        const factor = fp();
        const multiplier = phaseMultiplier(phase);
        const power = multiplier * voltage * current * factor;
        return result(
          `Potência calculada: ${round(power)} W`,
          [
            { label: 'Potência', value: `${round(power)} W`, helper: `${round(power / 1000)} kW` },
            { label: 'Dados usados', value: `${round(voltage)} V × ${round(current)} A`, helper: showAdvanced ? `FP ${round(factor, 2)} · ${phaseLabel(phase)}` : 'modo simples' },
          ],
          [`Tensão: ${round(voltage)} V`, `Corrente: ${round(current)} A`, `Fator de potência: ${round(factor, 2)}`, `Circuito: ${phaseLabel(phase)}`, `Potência: ${round(power)} W`],
          'Use para estimar potência de uma carga conhecida. Para motores e cargas indutivas, ajuste o fator de potência em avançado.',
          ['Potência = fator do circuito × tensão × corrente × fator de potência', phaseFormula(phase, 'Fator do circuito')],
        );
      }

      if (activeRule.mode === 'voltage-from-power-current') {
        const power = n('powerWatts', 'potência');
        const current = n('currentAmps', 'corrente');
        const factor = fp();
        const multiplier = phaseMultiplier(phase);
        const voltage = power / (multiplier * current * factor);
        return result(
          `Tensão calculada: ${round(voltage)} V`,
          [
            { label: 'Tensão', value: `${round(voltage)} V`, helper: 'estimativa pela potência e corrente' },
            { label: 'Dados usados', value: `${round(power)} W / ${round(current)} A`, helper: showAdvanced ? `FP ${round(factor, 2)} · ${phaseLabel(phase)}` : 'modo simples' },
          ],
          [`Potência: ${round(power)} W`, `Corrente: ${round(current)} A`, `Fator de potência: ${round(factor, 2)}`, `Circuito: ${phaseLabel(phase)}`, `Tensão: ${round(voltage)} V`],
          'Use como conferência rápida. Em campo, confirme a tensão real com instrumento adequado.',
          ['Tensão = potência ÷ (fator do circuito × corrente × fator de potência)', phaseFormula(phase, 'Fator do circuito')],
        );
      }

      if (activeRule.mode === 'ohms-law') {
        if (ohmsTarget === 'resistance') {
          const voltage = n('voltageVolts', 'tensão');
          const current = n('currentAmps', 'corrente');
          const calculatedResistance = voltage / current;
          return result(
            `Resistência: ${round(calculatedResistance)} Ω`,
            [{ label: 'Resistência', value: `${round(calculatedResistance)} Ω`, helper: 'R = V / I' }],
            [`Tensão: ${round(voltage)} V`, `Corrente: ${round(current)} A`, `Resistência: ${round(calculatedResistance)} Ω`],
            'Use para cargas resistivas e conferências básicas. Em circuitos reais, considere temperatura e características do equipamento.',
            ['Resistência = tensão ÷ corrente'],
          );
        }

        if (ohmsTarget === 'current') {
          const voltage = n('voltageVolts', 'tensão');
          const resistance = n('resistanceOhms', 'resistência');
          const calculatedCurrent = voltage / resistance;
          return result(
            `Corrente: ${round(calculatedCurrent)} A`,
            [{ label: 'Corrente', value: `${round(calculatedCurrent)} A`, helper: 'I = V / R' }],
            [`Tensão: ${round(voltage)} V`, `Resistência: ${round(resistance)} Ω`, `Corrente: ${round(calculatedCurrent)} A`],
            'Use para estimativa em carga resistiva. Não substitui medição em circuito energizado.',
            ['Corrente = tensão ÷ resistência'],
          );
        }

        const resistance = n('resistanceOhms', 'resistência');
        const current = n('currentAmps', 'corrente');
        const calculatedVoltage = resistance * current;
        return result(
          `Tensão: ${round(calculatedVoltage)} V`,
          [{ label: 'Tensão', value: `${round(calculatedVoltage)} V`, helper: 'V = R × I' }],
          [`Resistência: ${round(resistance)} Ω`, `Corrente: ${round(current)} A`, `Tensão: ${round(calculatedVoltage)} V`],
          'Use para estimativa de tensão em carga resistiva. Valide sempre com medição adequada.',
          ['Tensão = resistência × corrente'],
        );
      }

      if (activeRule.mode === 'power-resistance') {
        const resistance = n('resistanceOhms', 'resistência');
        if (powerResistanceTarget === 'voltage-resistance') {
          const voltage = n('voltageVolts', 'tensão');
          const power = voltage ** 2 / resistance;
          return result(
            `Potência dissipada: ${round(power)} W`,
            [{ label: 'Potência', value: `${round(power)} W`, helper: 'P = V² / R' }],
            [`Tensão: ${round(voltage)} V`, `Resistência: ${round(resistance)} Ω`, `Potência: ${round(power)} W`],
            'Escolha componente/carga com potência suportada acima do resultado e margem de segurança.',
            ['Potência = tensão² ÷ resistência'],
          );
        }

        const current = n('currentAmps', 'corrente');
        const power = current ** 2 * resistance;
        return result(
          `Potência dissipada: ${round(power)} W`,
          [{ label: 'Potência', value: `${round(power)} W`, helper: 'P = I² × R' }],
          [`Corrente: ${round(current)} A`, `Resistência: ${round(resistance)} Ω`, `Potência: ${round(power)} W`],
          'Escolha componente/carga com potência suportada acima do resultado e margem de segurança.',
          ['Potência = corrente² × resistência'],
        );
      }

      if (activeRule.mode === 'apparent-power') {
        if (apparentTarget === 'va-from-watts') {
          const power = n('powerWatts', 'potência');
          const factor = fp();
          const va = power / factor;
          return result(
            `Potência aparente: ${round(va)} VA`,
            [{ label: 'Potência aparente', value: `${round(va)} VA`, helper: `FP ${round(factor, 2)}` }],
            [`Potência ativa: ${round(power)} W`, `Fator de potência: ${round(factor, 2)}`, `Potência aparente: ${round(va)} VA`],
            'Use para dimensionar nobreak, transformador e equipamentos especificados em VA. Ajuste o FP quando a carga não for resistiva.',
            ['Potência aparente em VA = potência ativa em W ÷ fator de potência'],
          );
        }

        const va = n('apparentPowerVa', 'potência aparente');
        const voltage = n('voltageVolts', 'tensão');
        const multiplier = phaseMultiplier(phase);
        const current = va / (multiplier * voltage);
        return result(
          `Corrente por VA: ${round(current)} A`,
          [{ label: 'Corrente', value: `${round(current)} A`, helper: `${round(va)} VA / ${round(voltage)} V` }],
          [`Potência aparente: ${round(va)} VA`, `Tensão: ${round(voltage)} V`, `Circuito: ${phaseLabel(phase)}`, `Corrente: ${round(current)} A`],
          'Use para equipamentos informados em VA. Para circuito final, valide cabo, proteção e queda de tensão.',
          ['Corrente = VA ÷ (fator do circuito × tensão)', phaseFormula(phase, 'Fator do circuito')],
        );
      }

      if (activeRule.mode === 'resistor-network') {
        const resistors = resistorValues();
        if (resistors.length === 0) throw new Error('Informe pelo menos um resistor válido.');
        const series = resistors.reduce((sum, item) => sum + item, 0);
        const parallel = 1 / resistors.reduce((sum, item) => sum + 1 / item, 0);
        return result(
          `Série: ${round(series)} Ω · Paralelo: ${round(parallel)} Ω`,
          [
            { label: 'Em série', value: `${round(series)} Ω`, helper: 'soma direta' },
            { label: 'Em paralelo', value: `${round(parallel)} Ω`, helper: 'inverso da soma dos inversos' },
          ],
          [`Resistores: ${resistors.map((item) => `${round(item)} Ω`).join(', ')}`, `Série: ${round(series)} Ω`, `Paralelo: ${round(parallel)} Ω`],
          'Use para associação básica. Para potência dos resistores, use o cálculo de potência em resistência.',
          ['Resistência em série = R1 + R2 + R3', 'Resistência em paralelo = 1 ÷ (1/R1 + 1/R2 + 1/R3)'],
        );
      }

      const power = n('powerWatts', 'potência');
      const hours = n('hoursPerDay', 'horas por dia');
      const days = n('days', 'dias');
      const tariff = optionalN('tariff', 'tarifa');
      const kwh = power * hours * days / 1000;
      const cost = kwh * tariff;
      return result(
        `Consumo: ${round(kwh)} kWh`,
        [
          { label: 'Consumo', value: `${round(kwh)} kWh`, helper: `${round(hours)} h/dia por ${round(days)} dia(s)` },
          { label: 'Custo estimado', value: money(cost), helper: `tarifa ${money(tariff)}/kWh` },
        ],
        [`Potência: ${round(power)} W`, `Horas por dia: ${round(hours)} h`, `Dias: ${round(days)}`, `Consumo: ${round(kwh)} kWh`, `Custo: ${money(cost)}`],
        'Use como estimativa de consumo. O valor final depende da tarifa, impostos, bandeira e perfil real de uso.',
        ['Consumo em kWh = potência em W × horas por dia × dias ÷ 1000', 'Custo estimado = consumo em kWh × tarifa'],
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], cards: [], orientation: '', formula: [] };
    }
  }, [activeRule, values, phase, showAdvanced, ohmsTarget, powerResistanceTarget, apparentTarget]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;
    const capture: CalculationCapture = {
      id: createId('electrical-foundation'),
      module: 'fundamentals',
      moduleLabel: 'Fundamentos elétricos',
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: calculated.summary,
      details: [...calculated.details, ...calculated.formula.map((item) => `Fórmula: ${item}`), `Orientação: ${calculated.orientation}`],
    };
    onCaptureCalculation?.(capture);
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no levantamento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no levantamento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveMode(null);
    setAddedMessage(null);
    setShowAdvanced(false);
  }

  function openCalculator(mode: FundamentalMode) {
    setActiveMode(mode);
    setAddedMessage(null);
    setShowAdvanced(false);
  }

  const showAdvancedControls = activeRule ? ['current-from-power', 'power-from-current', 'voltage-from-power-current', 'apparent-power'].includes(activeRule.mode) : false;
  const showPowerFactorField = activeRule?.mode !== 'apparent-power' || apparentTarget === 'va-from-watts';
  const showPhaseField = activeRule?.mode !== 'apparent-power' || apparentTarget === 'current-from-va';

  return (
    <div className="human-fundamentals-workspace">
      <div className="human-fundamentals-banner">
        <div>
          <strong>Fundamentos elétricos V1</strong>
          <span>Cálculos reorganizados para uso humano em campo: poucos campos, resultado direto e ajustes avançados recolhidos.</span>
        </div>
        <em>{rules.length} cálculos livres</em>
      </div>

      <div className="human-picker-list">
        {rules.map((rule) => (
          <button className="human-picker-card" key={rule.mode} type="button" onClick={() => openCalculator(rule.mode)}>
            <span className="human-icon">{rule.icon}</span>
            <span>
              <strong>{rule.label}</strong>
              <small>{rule.description}</small>
            </span>
            <em>LIVRE</em>
            <span className="chevron">›</span>
          </button>
        ))}
      </div>

      {activeRule && (
        <div className="human-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="human-overlay-backdrop" onClick={closeCalculator} />
          <section className="human-overlay-panel">
            <header className="human-overlay-header">
              <button type="button" onClick={closeCalculator}>‹</button>
              <div>
                <span>Fundamentos elétricos</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>LIVRE</em>
            </header>

            <form className="human-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.mode === 'current-from-power' && (
                <>
                  <NumberField label="Potência do equipamento" value={values.powerWatts} suffix="W" step={1} onChange={(value) => setValue('powerWatts', value)} />
                  <NumberField label="Tensão disponível" value={values.voltageVolts} suffix="V" step={1} onChange={(value) => setValue('voltageVolts', value)} />
                </>
              )}

              {activeRule.mode === 'power-from-current' && (
                <>
                  <NumberField label="Tensão" value={values.voltageVolts} suffix="V" step={1} onChange={(value) => setValue('voltageVolts', value)} />
                  <NumberField label="Corrente" value={values.currentAmps} suffix="A" onChange={(value) => setValue('currentAmps', value)} />
                </>
              )}

              {activeRule.mode === 'voltage-from-power-current' && (
                <>
                  <NumberField label="Potência" value={values.powerWatts} suffix="W" step={1} onChange={(value) => setValue('powerWatts', value)} />
                  <NumberField label="Corrente" value={values.currentAmps} suffix="A" onChange={(value) => setValue('currentAmps', value)} />
                </>
              )}

              {activeRule.mode === 'ohms-law' && (
                <>
                  <SelectField<OhmsTarget>
                    label="Quero calcular"
                    value={ohmsTarget}
                    onChange={setOhmsTarget}
                    options={[
                      { value: 'resistance', label: 'Resistência (tenho tensão e corrente)' },
                      { value: 'current', label: 'Corrente (tenho tensão e resistência)' },
                      { value: 'voltage', label: 'Tensão (tenho resistência e corrente)' },
                    ]}
                  />
                  {(ohmsTarget === 'resistance' || ohmsTarget === 'current') && <NumberField label="Tensão" value={values.voltageVolts} suffix="V" step={1} onChange={(value) => setValue('voltageVolts', value)} />}
                  {(ohmsTarget === 'resistance' || ohmsTarget === 'voltage') && <NumberField label="Corrente" value={values.currentAmps} suffix="A" onChange={(value) => setValue('currentAmps', value)} />}
                  {(ohmsTarget === 'current' || ohmsTarget === 'voltage') && <NumberField label="Resistência" value={values.resistanceOhms} suffix="Ω" onChange={(value) => setValue('resistanceOhms', value)} />}
                </>
              )}

              {activeRule.mode === 'power-resistance' && (
                <>
                  <SelectField<PowerResistanceTarget>
                    label="Quero calcular usando"
                    value={powerResistanceTarget}
                    onChange={setPowerResistanceTarget}
                    options={[
                      { value: 'voltage-resistance', label: 'Tensão e resistência' },
                      { value: 'current-resistance', label: 'Corrente e resistência' },
                    ]}
                  />
                  {powerResistanceTarget === 'voltage-resistance' && <NumberField label="Tensão" value={values.voltageVolts} suffix="V" step={1} onChange={(value) => setValue('voltageVolts', value)} />}
                  {powerResistanceTarget === 'current-resistance' && <NumberField label="Corrente" value={values.currentAmps} suffix="A" onChange={(value) => setValue('currentAmps', value)} />}
                  <NumberField label="Resistência" value={values.resistanceOhms} suffix="Ω" onChange={(value) => setValue('resistanceOhms', value)} />
                </>
              )}

              {activeRule.mode === 'apparent-power' && (
                <>
                  <SelectField<ApparentTarget>
                    label="Quero calcular"
                    value={apparentTarget}
                    onChange={setApparentTarget}
                    options={[
                      { value: 'va-from-watts', label: 'VA a partir de W e fator de potência' },
                      { value: 'current-from-va', label: 'Corrente a partir de VA e tensão' },
                    ]}
                  />
                  {apparentTarget === 'va-from-watts' && <NumberField label="Potência ativa" value={values.powerWatts} suffix="W" step={1} onChange={(value) => setValue('powerWatts', value)} />}
                  {apparentTarget === 'current-from-va' && <NumberField label="Potência aparente" value={values.apparentPowerVa} suffix="VA" step={1} onChange={(value) => setValue('apparentPowerVa', value)} />}
                  {apparentTarget === 'current-from-va' && <NumberField label="Tensão" value={values.voltageVolts} suffix="V" step={1} onChange={(value) => setValue('voltageVolts', value)} />}
                </>
              )}

              {activeRule.mode === 'resistor-network' && (
                <>
                  <NumberField label="Resistor 1" value={values.resistorOneOhms} suffix="Ω" onChange={(value) => setValue('resistorOneOhms', value)} />
                  <NumberField label="Resistor 2" value={values.resistorTwoOhms} suffix="Ω" onChange={(value) => setValue('resistorTwoOhms', value)} />
                  <NumberField label="Resistor 3 (opcional)" value={values.resistorThreeOhms} suffix="Ω" onChange={(value) => setValue('resistorThreeOhms', value)} />
                </>
              )}

              {activeRule.mode === 'consumption' && (
                <>
                  <NumberField label="Potência do equipamento" value={values.powerWatts} suffix="W" step={1} onChange={(value) => setValue('powerWatts', value)} />
                  <NumberField label="Horas por dia" value={values.hoursPerDay} suffix="h" onChange={(value) => setValue('hoursPerDay', value)} />
                  <NumberField label="Dias de uso" value={values.days} suffix="dias" step={1} onChange={(value) => setValue('days', value)} />
                  <NumberField label="Tarifa de energia" value={values.tariff} suffix="R$/kWh" onChange={(value) => setValue('tariff', value)} />
                </>
              )}

              {showAdvancedControls && (
                <div className="human-advanced-block">
                  <button type="button" onClick={() => setShowAdvanced((current) => !current)}>{showAdvanced ? 'Ocultar ajustes avançados' : 'Mostrar ajustes avançados'}</button>
                  {showAdvanced && (
                    <div className="human-advanced-grid">
                      {showPowerFactorField && <NumberField label="Fator de potência" value={values.powerFactor} suffix="FP" onChange={(value) => setValue('powerFactor', value)} />}
                      {showPhaseField && (
                        <SelectField<PhaseMode>
                          label="Tipo de circuito"
                          value={phase}
                          onChange={setPhase}
                          options={[
                            { value: 'single', label: 'Monofásico / bifásico simplificado' },
                            { value: 'three', label: 'Trifásico' },
                          ]}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </form>

            {calculated.error && <p className="human-error-message">{calculated.error}</p>}
            {calculated.cards.length > 0 && <div className="human-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {calculated.formula.length > 0 && <div className="human-formula-box"><strong>Como este cálculo é feito</strong>{calculated.formula.map((item) => <span key={item}>{item}</span>)}</div>}
            {calculated.orientation && <p className="human-orientation">{calculated.orientation}</p>}
            {addedMessage && <p className="human-added-message">{addedMessage}</p>}

            <div className="human-capture-actions">
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="human-technical-note">Cálculo preliminar. Use como apoio e valide em campo conforme a instalação real e normas aplicáveis.</small>
          </section>
        </div>
      )}
    </div>
  );
}
