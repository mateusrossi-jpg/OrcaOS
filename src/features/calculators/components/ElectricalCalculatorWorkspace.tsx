import { useEffect, useMemo, useState } from 'react';
import {
  calculateAirConditioningSizing,
  calculateApparentPower,
  calculateCableSectionFromVoltageDrop,
  calculateConduitFill,
  calculateCurrentFromApparentPower,
  calculateCurrentFromPower,
  calculateEnergyConsumption,
  calculateLighting,
  calculateMaxDistanceFromVoltageDrop,
  calculateMotorCurrent,
  calculateMotorSpeed,
  calculateParallelResistance,
  calculatePowerByResistance,
  calculatePowerFromCurrent,
  calculatePulleyRatio,
  calculateResistanceFromVoltageCurrent,
  calculateSeriesResistance,
  calculateTransformerSizing,
  calculateVoltageDrop,
  convertAwgToMm2,
  recommendCircuit,
  roundTechnical,
  scaleAnalogSignal,
  suggestNearestAwg,
} from '../../../core/calculations/electrical';
import {
  calculatorAccessRules,
  canUseCalculator,
  getCalculatorAccessRule,
  type CalculatorMode,
  type CalculatorModule,
  type UserPlan,
} from '../../../core/access/featureAccess';
import type { CircuitPhase } from '../../../core/types/electrical';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { suggestNextBreaker } from '../../../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../../../data/electrical-tables/cableSections';
import './ElectricalCalculatorWorkspace.css';

interface ElectricalCalculatorWorkspaceProps {
  userPlan?: UserPlan;
  selectedModule?: CalculatorModule;
  onUpgradeRequest?: () => void;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface CalculatorResult {
  error: string | null;
  cards: ResultCardData[];
}

const defaultValues: Record<string, string> = {
  powerWatts: '2200',
  apparentPowerVa: '2200',
  voltageVolts: '220',
  currentAmps: '10',
  powerFactor: '1',
  resistanceOhms: '22',
  resistorOneOhms: '100',
  resistorTwoOhms: '220',
  resistorThreeOhms: '330',
  hoursPerDay: '2',
  days: '30',
  tariff: '0.95',
  distanceMeters: '25',
  sectionMm2: '2.5',
  maxDropPercent: '4',
  awgValue: '12',
  safetyMarginPercent: '20',
  areaM2: '12',
  targetLux: '300',
  lampLumens: '800',
  people: '2',
  electronics: '1',
  sunFactor: '1',
  motorPowerKw: '1.5',
  efficiency: '0.85',
  frequencyHz: '60',
  poles: '4',
  measuredRpm: '1720',
  motorPulleyDiameterMm: '80',
  drivenPulleyDiameterMm: '160',
  analogInputValue: '12',
  engineeringMin: '0',
  engineeringMax: '100',
  cableExternalDiameterMm: '4',
  cableCount: '3',
  conduitInternalDiameterMm: '16',
};

function parseCalculatorNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function moduleName(module: CalculatorModule | undefined): string {
  if (module === 'fundamentals') return 'Fundamentos';
  if (module === 'installations') return 'Instalações elétricas';
  if (module === 'lighting') return 'Iluminação';
  if (module === 'refrigeration') return 'Refrigeração';
  if (module === 'motors') return 'Motores';
  if (module === 'rewinding') return 'Rebobinagem';
  if (module === 'industrialAutomation') return 'Automação industrial';
  return 'Calculadoras';
}

function modeIcon(mode: CalculatorMode): string {
  if (mode.includes('motor') || mode === 'pulley-ratio') return '↻';
  if (mode.includes('analog')) return '≋';
  if (mode === 'air-conditioning') return '❄';
  if (mode === 'lighting') return '☀';
  if (mode.includes('drop') || mode === 'transformer-sizing' || mode === 'awg-conversion' || mode === 'conduit-fill') return '⌁';
  return 'ϟ';
}

function NumberField({ label, value, suffix, min = 0, step = 0.01, onChange }: {
  label: string;
  value: string;
  suffix?: string;
  min?: number;
  step?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <div className="input-with-suffix">
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

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <div className="input-with-suffix">
        <input value={value} placeholder={placeholder ?? 'Digite o valor'} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function PhaseSelector({ value, onChange }: { value: CircuitPhase; onChange: (value: CircuitPhase) => void }) {
  return (
    <label className="form-field">
      <span>Tipo de circuito</span>
      <select value={value} onChange={(event) => onChange(event.target.value as CircuitPhase)}>
        <option value="single-phase">Monofásico / bifásico simplificado</option>
        <option value="three-phase">Trifásico</option>
      </select>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return (
    <article className="result-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

function LockedCalculator({ mode, onUpgradeRequest }: { mode: CalculatorMode; onUpgradeRequest?: () => void }) {
  const rule = getCalculatorAccessRule(mode);

  return (
    <div className="locked-calculator-card">
      <span className="lock-icon">🔒</span>
      <strong>{rule?.label ?? 'Cálculo Pro'}</strong>
      <p>{rule?.shortDescription ?? 'Este cálculo faz parte dos recursos profissionais do OrçaOS.'}</p>
      <small>Os cálculos fundamentais continuam livres. Este recurso entra no pacote Pro.</small>
      <button type="button" onClick={onUpgradeRequest}>Ver pacote Pro</button>
    </div>
  );
}

export function ElectricalCalculatorWorkspace({ userPlan = 'free', selectedModule, onUpgradeRequest, onCaptureCalculation }: ElectricalCalculatorWorkspaceProps) {
  const availableCalculators = useMemo(
    () => calculatorAccessRules.filter((rule) => !selectedModule || rule.module === selectedModule),
    [selectedModule],
  );

  const [activeCalculator, setActiveCalculator] = useState<CalculatorMode | null>(null);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [phase, setPhase] = useState<CircuitPhase>('single-phase');

  const activeRule = activeCalculator ? getCalculatorAccessRule(activeCalculator) : null;
  const hasAccess = activeCalculator ? canUseCalculator(activeCalculator, userPlan) : false;

  useEffect(() => {
    setActiveCalculator(null);
    setAddedMessage(null);
  }, [selectedModule]);

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string): number {
    return parseCalculatorNumber(values[key] ?? '');
  }

  const result = useMemo<CalculatorResult>(() => {
    if (!activeCalculator || !hasAccess) {
      return { error: null, cards: [] };
    }

    try {
      if (activeCalculator === 'current') {
        const current = calculateCurrentFromPower({ powerWatts: n('powerWatts'), voltageVolts: n('voltageVolts'), powerFactor: n('powerFactor'), phase });
        const breaker = suggestNextBreaker(current);
        const cable = suggestMinimumCableSectionByCurrent(current);
        return { error: null, cards: [
          { label: 'Corrente calculada', value: `${roundTechnical(current)} A`, helper: 'Resultado base para análise do circuito.' },
          { label: 'Disjuntor comercial', value: breaker ? `${breaker} A` : 'Revisar', helper: 'Sugestão inicial. O disjuntor deve proteger o condutor.' },
          { label: 'Cabo preliminar', value: cable ? `${cable} mm²` : 'Revisar', helper: 'Pré-dimensionamento simplificado, ainda exige validação.' },
        ] };
      }

      if (activeCalculator === 'power') {
        const power = calculatePowerFromCurrent({ currentAmps: n('currentAmps'), voltageVolts: n('voltageVolts'), powerFactor: n('powerFactor'), phase });
        return { error: null, cards: [{ label: 'Potência estimada', value: `${roundTechnical(power)} W`, helper: `${roundTechnical(power / 1000)} kW` }] };
      }

      if (activeCalculator === 'ohms-law') {
        const resistance = calculateResistanceFromVoltageCurrent({ voltageVolts: n('voltageVolts'), currentAmps: n('currentAmps') });
        const power = calculatePowerFromCurrent({ currentAmps: n('currentAmps'), voltageVolts: n('voltageVolts') });
        return { error: null, cards: [
          { label: 'Resistência', value: `${roundTechnical(resistance)} Ω`, helper: 'R = V / I' },
          { label: 'Potência relacionada', value: `${roundTechnical(power)} W`, helper: 'P = V × I' },
        ] };
      }

      if (activeCalculator === 'power-resistance') {
        return { error: null, cards: [
          { label: 'Potência por corrente', value: `${roundTechnical(calculatePowerByResistance({ currentAmps: n('currentAmps'), resistanceOhms: n('resistanceOhms') }))} W`, helper: 'P = I² × R' },
          { label: 'Potência por tensão', value: `${roundTechnical(calculatePowerByResistance({ voltageVolts: n('voltageVolts'), resistanceOhms: n('resistanceOhms') }))} W`, helper: 'P = V² / R' },
        ] };
      }

      if (activeCalculator === 'resistor-network') {
        const resistors = [n('resistorOneOhms'), n('resistorTwoOhms'), n('resistorThreeOhms')];
        return { error: null, cards: [
          { label: 'Equivalente em série', value: `${roundTechnical(calculateSeriesResistance({ resistorsOhms: resistors }))} Ω`, helper: 'Soma direta das resistências.' },
          { label: 'Equivalente em paralelo', value: `${roundTechnical(calculateParallelResistance({ resistorsOhms: resistors }))} Ω`, helper: 'Inverso da soma dos inversos.' },
        ] };
      }

      if (activeCalculator === 'conversion') {
        const apparentPower = calculateApparentPower({ powerWatts: n('powerWatts'), powerFactor: n('powerFactor') });
        const currentFromVa = calculateCurrentFromApparentPower({ apparentPowerVa: n('apparentPowerVa'), voltageVolts: n('voltageVolts'), phase });
        return { error: null, cards: [
          { label: 'Potência aparente', value: `${roundTechnical(apparentPower)} VA`, helper: 'Conversão W para VA.' },
          { label: 'Corrente por VA', value: `${roundTechnical(currentFromVa)} A`, helper: 'Conversão VA para corrente.' },
        ] };
      }

      if (activeCalculator === 'consumption') {
        const consumption = calculateEnergyConsumption({ powerWatts: n('powerWatts'), hoursPerDay: n('hoursPerDay'), days: n('days'), tariffPerKwh: n('tariff') });
        return { error: null, cards: [
          { label: 'Consumo no período', value: `${roundTechnical(consumption.kwh)} kWh`, helper: 'Estimativa de energia consumida.' },
          { label: 'Custo estimado', value: `R$ ${roundTechnical(consumption.estimatedCost ?? 0)}`, helper: 'Baseado na tarifa informada.' },
        ] };
      }

      if (activeCalculator === 'voltage-drop') {
        const drop = calculateVoltageDrop({ currentAmps: n('currentAmps'), distanceMeters: n('distanceMeters'), sectionMm2: n('sectionMm2'), voltageVolts: n('voltageVolts'), phase, material: 'copper' });
        return { error: null, cards: [
          { label: 'Queda de tensão', value: `${roundTechnical(drop.dropVolts)} V`, helper: 'Estimativa para condutor de cobre.' },
          { label: 'Percentual', value: `${roundTechnical(drop.dropPercent)}%`, helper: drop.dropPercent > 4 ? 'Atenção: resultado merece revisão.' : 'Dentro de uma faixa inicial aceitável.' },
        ] };
      }

      if (activeCalculator === 'cable-section-drop') {
        const section = calculateCableSectionFromVoltageDrop({ currentAmps: n('currentAmps'), distanceMeters: n('distanceMeters'), voltageVolts: n('voltageVolts'), maxDropPercent: n('maxDropPercent'), phase, material: 'copper' });
        return { error: null, cards: [
          { label: 'Queda máxima', value: `${roundTechnical(section.maxDropVolts)} V`, helper: 'Limite configurado.' },
          { label: 'Seção mínima estimada', value: `${roundTechnical(section.requiredSectionMm2)} mm²`, helper: 'Escolha seção comercial superior.' },
        ] };
      }

      if (activeCalculator === 'max-distance-drop') {
        const distance = calculateMaxDistanceFromVoltageDrop({ currentAmps: n('currentAmps'), sectionMm2: n('sectionMm2'), voltageVolts: n('voltageVolts'), maxDropPercent: n('maxDropPercent'), phase, material: 'copper' });
        return { error: null, cards: [
          { label: 'Queda máxima', value: `${roundTechnical(distance.maxDropVolts)} V`, helper: 'Limite configurado.' },
          { label: 'Distância máxima', value: `${roundTechnical(distance.maxDistanceMeters)} m`, helper: 'Estimativa para condutor de cobre.' },
        ] };
      }

      if (activeCalculator === 'transformer-sizing') {
        const transformer = calculateTransformerSizing({ loadWatts: n('powerWatts'), powerFactor: n('powerFactor'), safetyMarginPercent: n('safetyMarginPercent') });
        return { error: null, cards: [
          { label: 'Potência aparente', value: `${roundTechnical(transformer.apparentPowerKva)} kVA`, helper: 'Sem margem.' },
          { label: 'Com margem', value: `${roundTechnical(transformer.apparentPowerWithMarginKva)} kVA`, helper: 'Com margem configurada.' },
          { label: 'Comercial sugerido', value: `${transformer.suggestedCommercialKva} kVA`, helper: 'Capacidade comercial acima.' },
        ] };
      }

      if (activeCalculator === 'awg-conversion') {
        const awgResult = convertAwgToMm2(values.awgValue ?? '');
        const nearestAwg = suggestNearestAwg(n('sectionMm2'));
        return { error: null, cards: [
          { label: 'AWG para mm²', value: awgResult ? `${awgResult.sectionMm2} mm²` : 'Não encontrado', helper: awgResult ? `AWG ${awgResult.awg}` : 'Use valores como 12, 10, 8, 1/0.' },
          { label: 'mm² para AWG próximo', value: nearestAwg ? `AWG ${nearestAwg.awg}` : 'Não encontrado', helper: nearestAwg ? `${nearestAwg.sectionMm2} mm² ou superior` : 'Informe uma seção válida.' },
        ] };
      }

      if (activeCalculator === 'circuit-recommendation') {
        const recommendation = recommendCircuit({ powerWatts: n('powerWatts'), voltageVolts: n('voltageVolts'), powerFactor: n('powerFactor'), phase });
        return { error: null, cards: [
          { label: 'Corrente de projeto', value: `${roundTechnical(recommendation.currentAmps)} A`, helper: 'Corrente calculada.' },
          { label: 'Disjuntor sugerido', value: recommendation.suggestedBreakerAmps ? `${recommendation.suggestedBreakerAmps} A` : 'Revisar', helper: 'Sugestão comercial inicial.' },
          { label: 'Cabo sugerido', value: recommendation.suggestedCableSectionMm2 ? `${recommendation.suggestedCableSectionMm2} mm²` : 'Revisar', helper: 'Tabela simplificada para triagem.' },
        ] };
      }

      if (activeCalculator === 'lighting') {
        const lighting = calculateLighting({ areaM2: n('areaM2'), targetLux: n('targetLux'), lampLumens: n('lampLumens') });
        return { error: null, cards: [
          { label: 'Fluxo necessário', value: `${roundTechnical(lighting.requiredLumens)} lm`, helper: 'Área × iluminância.' },
          { label: 'Quantidade de luminárias', value: lighting.lampQuantity ? `${lighting.lampQuantity}` : 'Informe lúmens', helper: 'Baseado no fluxo por luminária.' },
        ] };
      }

      if (activeCalculator === 'air-conditioning') {
        const sizing = calculateAirConditioningSizing({ areaM2: n('areaM2'), people: n('people'), electronics: n('electronics'), sunFactor: n('sunFactor') });
        return { error: null, cards: [
          { label: 'Carga estimada', value: `${roundTechnical(sizing.estimatedBtus)} BTU/h`, helper: 'Estimativa inicial para refrigeração.' },
          { label: 'Modelo comercial sugerido', value: `${sizing.suggestedCommercialBtus} BTU/h`, helper: 'Capacidade comercial acima.' },
        ] };
      }

      if (activeCalculator === 'motor-current') {
        const motorCurrent = calculateMotorCurrent({ mechanicalPowerKw: n('motorPowerKw'), voltageVolts: n('voltageVolts'), efficiency: n('efficiency'), powerFactor: n('powerFactor'), phase });
        return { error: null, cards: [
          { label: 'Corrente estimada', value: `${roundTechnical(motorCurrent)} A`, helper: 'Baseada em potência mecânica, rendimento e FP.' },
          { label: 'Potência mecânica', value: `${roundTechnical(n('motorPowerKw'))} kW`, helper: 'Valor informado.' },
        ] };
      }

      if (activeCalculator === 'motor-speed') {
        const speed = calculateMotorSpeed({ frequencyHz: n('frequencyHz'), poles: n('poles'), measuredRpm: n('measuredRpm') });
        return { error: null, cards: [
          { label: 'Rotação síncrona', value: `${roundTechnical(speed.synchronousRpm)} rpm`, helper: 'Ns = 120 × f / polos.' },
          { label: 'Escorregamento', value: speed.slipPercent !== undefined ? `${roundTechnical(speed.slipPercent)}%` : 'Informe RPM', helper: 'Comparação entre rotação síncrona e medida.' },
        ] };
      }

      if (activeCalculator === 'pulley-ratio') {
        const pulley = calculatePulleyRatio({ motorRpm: n('measuredRpm'), motorPulleyDiameterMm: n('motorPulleyDiameterMm'), drivenPulleyDiameterMm: n('drivenPulleyDiameterMm') });
        return { error: null, cards: [
          { label: 'Rotação movida', value: `${roundTechnical(pulley.drivenRpm)} rpm`, helper: 'Estimativa por relação de diâmetros.' },
          { label: 'Relação', value: `${roundTechnical(pulley.ratio)}:1`, helper: 'Polia motora / polia movida.' },
        ] };
      }

      if (activeCalculator === 'analog-4-20ma' || activeCalculator === 'analog-0-10v') {
        const scaled = scaleAnalogSignal({
          inputValue: n('analogInputValue'),
          inputMin: activeCalculator === 'analog-4-20ma' ? 4 : 0,
          inputMax: activeCalculator === 'analog-4-20ma' ? 20 : 10,
          engineeringMin: n('engineeringMin'),
          engineeringMax: n('engineeringMax'),
        });
        return { error: null, cards: [
          { label: 'Valor de engenharia', value: `${roundTechnical(scaled.engineeringValue)}`, helper: 'Valor escalonado.' },
          { label: 'Percentual do sinal', value: `${roundTechnical(scaled.percent)}%`, helper: activeCalculator === 'analog-4-20ma' ? 'Escala 4–20 mA.' : 'Escala 0–10 V.' },
        ] };
      }

      const conduit = calculateConduitFill({ cableExternalDiameterMm: n('cableExternalDiameterMm'), cableCount: n('cableCount'), conduitInternalDiameterMm: n('conduitInternalDiameterMm') });
      return { error: null, cards: [
        { label: 'Área total dos cabos', value: `${roundTechnical(conduit.totalCableAreaMm2)} mm²`, helper: 'Soma das áreas externas estimadas.' },
        { label: 'Ocupação do eletroduto', value: `${roundTechnical(conduit.fillPercent)}%`, helper: conduit.fillPercent > 40 ? 'Atenção: ocupação alta.' : 'Triagem inicial abaixo de 40%.' },
      ] };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários para calcular.', cards: [] };
    }
  }, [activeCalculator, hasAccess, phase, values]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || result.cards.length === 0 || result.error) {
      return;
    }

    const capture: CalculationCapture = {
      id: createId('calc'),
      module: activeRule.module,
      moduleLabel: moduleName(activeRule.module),
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: result.cards[0] ? `${result.cards[0].label}: ${result.cards[0].value}` : activeRule.label,
      details: result.cards.map((card) => `${card.label}: ${card.value}${card.helper ? ` — ${card.helper}` : ''}`),
    };

    onCaptureCalculation?.(capture);

    if (destination === 'survey') {
      setAddedMessage(`${activeRule.label} foi incluído no levantamento técnico.`);
    } else if (destination === 'budget') {
      setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    } else {
      setAddedMessage(`${activeRule.label} foi incluído no levantamento e no orçamento.`);
    }
  }

  function closeCalculator() {
    setActiveCalculator(null);
    setAddedMessage(null);
  }

  const commonVoltageField = activeCalculator !== 'consumption' && activeCalculator !== 'lighting' && activeCalculator !== 'air-conditioning' && activeCalculator !== 'conduit-fill' && activeCalculator !== 'resistor-network' && activeCalculator !== 'awg-conversion' && activeCalculator !== 'motor-speed' && activeCalculator !== 'pulley-ratio' && activeCalculator !== 'analog-4-20ma' && activeCalculator !== 'analog-0-10v';

  return (
    <div className="calculator-workspace">
      <div className="calculator-plan-banner">
        <div>
          <strong>{moduleName(selectedModule)}</strong>
          <span>Escolha um cálculo abaixo. Ele abrirá em uma tela dedicada para uso em campo.</span>
        </div>
        <em>{userPlan === 'pro' ? 'PRO ativo' : 'Plano grátis'}</em>
      </div>

      <div className="calculator-picker-list" aria-label="Cálculos disponíveis">
        {availableCalculators.map((calculator) => {
          const isLocked = !canUseCalculator(calculator.mode, userPlan);
          return (
            <button className="calculator-picker-card" key={calculator.mode} type="button" onClick={() => setActiveCalculator(calculator.mode)}>
              <span className="app-icon tone-blue">{modeIcon(calculator.mode)}</span>
              <span>
                <strong>{calculator.label}</strong>
                <small>{calculator.shortDescription}</small>
              </span>
              <em className={isLocked ? 'badge-pro' : 'badge-free'}>{isLocked ? 'PRO' : 'LIVRE'}</em>
              <span className="chevron">›</span>
            </button>
          );
        })}
      </div>

      {activeCalculator && activeRule && (
        <div className="calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="calculator-overlay-backdrop" onClick={closeCalculator} />
          <section className="calculator-overlay-panel">
            <header className="calculator-overlay-header">
              <button className="modal-back-button" type="button" onClick={closeCalculator}>‹</button>
              <div>
                <span>{moduleName(activeRule.module)}</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.shortDescription}</p>
              </div>
              <em className={!hasAccess ? 'badge-pro' : 'badge-free'}>{!hasAccess ? 'PRO' : 'LIVRE'}</em>
            </header>

            {!hasAccess ? (
              <LockedCalculator mode={activeCalculator} onUpgradeRequest={onUpgradeRequest} />
            ) : (
              <>
                <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
                  {(activeCalculator === 'current' || activeCalculator === 'consumption' || activeCalculator === 'conversion' || activeCalculator === 'circuit-recommendation' || activeCalculator === 'transformer-sizing') && <NumberField label="Potência" value={values.powerWatts} suffix="W" step={1} onChange={(value) => setValue('powerWatts', value)} />}
                  {activeCalculator === 'conversion' && <NumberField label="Potência aparente" value={values.apparentPowerVa} suffix="VA" step={1} onChange={(value) => setValue('apparentPowerVa', value)} />}
                  {(activeCalculator === 'power' || activeCalculator === 'voltage-drop' || activeCalculator === 'ohms-law' || activeCalculator === 'power-resistance' || activeCalculator === 'cable-section-drop' || activeCalculator === 'max-distance-drop') && <NumberField label="Corrente" value={values.currentAmps} suffix="A" onChange={(value) => setValue('currentAmps', value)} />}
                  {commonVoltageField && <NumberField label="Tensão" value={values.voltageVolts} suffix="V" step={1} onChange={(value) => setValue('voltageVolts', value)} />}
                  {(activeCalculator === 'current' || activeCalculator === 'power' || activeCalculator === 'conversion' || activeCalculator === 'circuit-recommendation' || activeCalculator === 'motor-current' || activeCalculator === 'transformer-sizing') && <NumberField label="Fator de potência" value={values.powerFactor} min={0.01} step={0.01} onChange={(value) => setValue('powerFactor', value)} />}
                  {(activeCalculator === 'current' || activeCalculator === 'power' || activeCalculator === 'voltage-drop' || activeCalculator === 'conversion' || activeCalculator === 'circuit-recommendation' || activeCalculator === 'cable-section-drop' || activeCalculator === 'max-distance-drop' || activeCalculator === 'motor-current') && <PhaseSelector value={phase} onChange={setPhase} />}
                  {activeCalculator === 'power-resistance' && <NumberField label="Resistência" value={values.resistanceOhms} suffix="Ω" onChange={(value) => setValue('resistanceOhms', value)} />}
                  {activeCalculator === 'resistor-network' && <><NumberField label="Resistor 1" value={values.resistorOneOhms} suffix="Ω" onChange={(value) => setValue('resistorOneOhms', value)} /><NumberField label="Resistor 2" value={values.resistorTwoOhms} suffix="Ω" onChange={(value) => setValue('resistorTwoOhms', value)} /><NumberField label="Resistor 3" value={values.resistorThreeOhms} suffix="Ω" onChange={(value) => setValue('resistorThreeOhms', value)} /></>}
                  {activeCalculator === 'consumption' && <><NumberField label="Horas por dia" value={values.hoursPerDay} suffix="h" onChange={(value) => setValue('hoursPerDay', value)} /><NumberField label="Dias" value={values.days} suffix="dias" step={1} onChange={(value) => setValue('days', value)} /><NumberField label="Tarifa" value={values.tariff} suffix="R$/kWh" onChange={(value) => setValue('tariff', value)} /></>}
                  {activeCalculator === 'voltage-drop' && <><NumberField label="Distância" value={values.distanceMeters} suffix="m" onChange={(value) => setValue('distanceMeters', value)} /><NumberField label="Seção do cabo" value={values.sectionMm2} suffix="mm²" onChange={(value) => setValue('sectionMm2', value)} /></>}
                  {activeCalculator === 'cable-section-drop' && <><NumberField label="Distância" value={values.distanceMeters} suffix="m" onChange={(value) => setValue('distanceMeters', value)} /><NumberField label="Queda máxima" value={values.maxDropPercent} suffix="%" onChange={(value) => setValue('maxDropPercent', value)} /></>}
                  {activeCalculator === 'max-distance-drop' && <><NumberField label="Seção do cabo" value={values.sectionMm2} suffix="mm²" onChange={(value) => setValue('sectionMm2', value)} /><NumberField label="Queda máxima" value={values.maxDropPercent} suffix="%" onChange={(value) => setValue('maxDropPercent', value)} /></>}
                  {activeCalculator === 'transformer-sizing' && <NumberField label="Margem" value={values.safetyMarginPercent} suffix="%" onChange={(value) => setValue('safetyMarginPercent', value)} />}
                  {activeCalculator === 'awg-conversion' && <><TextField label="AWG" value={values.awgValue} placeholder="Ex.: 12 ou 1/0" onChange={(value) => setValue('awgValue', value)} /><NumberField label="Seção desejada" value={values.sectionMm2} suffix="mm²" onChange={(value) => setValue('sectionMm2', value)} /></>}
                  {activeCalculator === 'lighting' && <><NumberField label="Área do ambiente" value={values.areaM2} suffix="m²" onChange={(value) => setValue('areaM2', value)} /><NumberField label="Iluminância desejada" value={values.targetLux} suffix="lux" step={1} onChange={(value) => setValue('targetLux', value)} /><NumberField label="Lúmens por luminária" value={values.lampLumens} suffix="lm" step={1} onChange={(value) => setValue('lampLumens', value)} /></>}
                  {activeCalculator === 'air-conditioning' && <><NumberField label="Área do ambiente" value={values.areaM2} suffix="m²" onChange={(value) => setValue('areaM2', value)} /><NumberField label="Pessoas" value={values.people} suffix="pessoas" step={1} onChange={(value) => setValue('people', value)} /><NumberField label="Equipamentos" value={values.electronics} suffix="un." step={1} onChange={(value) => setValue('electronics', value)} /><NumberField label="Fator sol/calor" value={values.sunFactor} min={0.1} step={0.05} onChange={(value) => setValue('sunFactor', value)} /></>}
                  {activeCalculator === 'motor-current' && <><NumberField label="Potência mecânica" value={values.motorPowerKw} suffix="kW" onChange={(value) => setValue('motorPowerKw', value)} /><NumberField label="Rendimento" value={values.efficiency} min={0.01} step={0.01} onChange={(value) => setValue('efficiency', value)} /></>}
                  {activeCalculator === 'motor-speed' && <><NumberField label="Frequência" value={values.frequencyHz} suffix="Hz" onChange={(value) => setValue('frequencyHz', value)} /><NumberField label="Polos" value={values.poles} step={1} onChange={(value) => setValue('poles', value)} /><NumberField label="RPM medido" value={values.measuredRpm} suffix="rpm" onChange={(value) => setValue('measuredRpm', value)} /></>}
                  {activeCalculator === 'pulley-ratio' && <><NumberField label="RPM do motor" value={values.measuredRpm} suffix="rpm" onChange={(value) => setValue('measuredRpm', value)} /><NumberField label="Polia motora" value={values.motorPulleyDiameterMm} suffix="mm" onChange={(value) => setValue('motorPulleyDiameterMm', value)} /><NumberField label="Polia movida" value={values.drivenPulleyDiameterMm} suffix="mm" onChange={(value) => setValue('drivenPulleyDiameterMm', value)} /></>}
                  {(activeCalculator === 'analog-4-20ma' || activeCalculator === 'analog-0-10v') && <><NumberField label="Entrada" value={values.analogInputValue} suffix={activeCalculator === 'analog-4-20ma' ? 'mA' : 'V'} onChange={(value) => setValue('analogInputValue', value)} /><NumberField label="Eng. mínimo" value={values.engineeringMin} onChange={(value) => setValue('engineeringMin', value)} /><NumberField label="Eng. máximo" value={values.engineeringMax} onChange={(value) => setValue('engineeringMax', value)} /></>}
                  {activeCalculator === 'conduit-fill' && <><NumberField label="Diâmetro externo do cabo" value={values.cableExternalDiameterMm} suffix="mm" onChange={(value) => setValue('cableExternalDiameterMm', value)} /><NumberField label="Quantidade de cabos" value={values.cableCount} suffix="cabos" step={1} onChange={(value) => setValue('cableCount', value)} /><NumberField label="Diâmetro interno do eletroduto" value={values.conduitInternalDiameterMm} suffix="mm" onChange={(value) => setValue('conduitInternalDiameterMm', value)} /></>}
                </form>

                <div className="calculator-results overlay-results">
                  {result.error && <div className="error-box">{result.error}</div>}
                  {result.cards.map((card) => <ResultCard key={card.label} label={card.label} value={card.value} helper={card.helper} />)}
                  <div className="technical-warning">Resultado para apoio técnico. Antes de executar instalação real, validar norma, método de instalação, agrupamento, temperatura, cabo, proteção e responsabilidade profissional.</div>
                </div>

                {result.cards.length > 0 && !result.error && (
                  <div className="calculation-next-step-card">
                    <strong>Deseja usar este resultado?</strong>
                    <p>Envie para levantamento técnico, orçamento comercial ou para os dois fluxos da OS.</p>
                    {addedMessage && <small>{addedMessage}</small>}
                    <div>
                      <button className="primary-action-button" type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button>
                      <button className="primary-action-button" type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
                      <button className="primary-action-button" type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
                      <button className="secondary-action-button" type="button" onClick={closeCalculator}>Voltar ao menu anterior</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
