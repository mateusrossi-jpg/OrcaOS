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
import { suggestNextBreaker } from '../../../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../../../data/electrical-tables/cableSections';
import './ElectricalCalculatorWorkspace.css';

interface ElectricalCalculatorWorkspaceProps {
  userPlan?: UserPlan;
  selectedModule?: CalculatorModule;
  onUpgradeRequest?: () => void;
}

interface NumberFieldProps {
  label: string;
  value: string;
  suffix?: string;
  min?: number;
  step?: number;
  onChange: (value: string) => void;
}

interface TextFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
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

function parseCalculatorNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  if (!normalizedValue) return Number.NaN;
  return Number(normalizedValue);
}

function NumberField({ label, value, suffix, min = 0, step = 0.01, onChange }: NumberFieldProps) {
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

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
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
      <small>Os cálculos fundamentais continuam 100% livres. Este recurso entra no pacote Pro.</small>
      <button type="button" onClick={onUpgradeRequest}>Ver pacote Pro</button>
    </div>
  );
}

function moduleName(module: CalculatorModule | undefined): string {
  if (module === 'fundamentals') return 'Fundamentos';
  if (module === 'installations') return 'Instalações';
  if (module === 'environments') return 'Ambientes';
  if (module === 'motors') return 'Motores';
  if (module === 'automation') return 'Automação';
  return 'Calculadoras';
}

function modeIcon(mode: CalculatorMode): string {
  if (mode.includes('motor') || mode === 'pulley-ratio') return '↻';
  if (mode.includes('analog')) return '≋';
  if (mode === 'lighting' || mode === 'air-conditioning') return '☀';
  if (mode.includes('drop') || mode === 'transformer-sizing' || mode === 'awg-conversion' || mode === 'conduit-fill') return '⌁';
  return 'ϟ';
}

export function ElectricalCalculatorWorkspace({ userPlan = 'free', selectedModule, onUpgradeRequest }: ElectricalCalculatorWorkspaceProps) {
  const availableCalculators = useMemo(
    () => calculatorAccessRules.filter((rule) => !selectedModule || rule.module === selectedModule),
    [selectedModule],
  );

  const [activeCalculator, setActiveCalculator] = useState<CalculatorMode | null>(null);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveCalculator(null);
    setAddedMessage(null);
  }, [selectedModule]);

  const [powerWatts, setPowerWatts] = useState('2200');
  const [apparentPowerVa, setApparentPowerVa] = useState('2200');
  const [voltageVolts, setVoltageVolts] = useState('220');
  const [currentAmps, setCurrentAmps] = useState('10');
  const [powerFactor, setPowerFactor] = useState('1');
  const [phase, setPhase] = useState<CircuitPhase>('single-phase');
  const [resistanceOhms, setResistanceOhms] = useState('22');
  const [resistorOneOhms, setResistorOneOhms] = useState('100');
  const [resistorTwoOhms, setResistorTwoOhms] = useState('220');
  const [resistorThreeOhms, setResistorThreeOhms] = useState('330');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [days, setDays] = useState('30');
  const [tariff, setTariff] = useState('0.95');
  const [distanceMeters, setDistanceMeters] = useState('25');
  const [sectionMm2, setSectionMm2] = useState('2.5');
  const [maxDropPercent, setMaxDropPercent] = useState('4');
  const [awgValue, setAwgValue] = useState('12');
  const [safetyMarginPercent, setSafetyMarginPercent] = useState('20');
  const [areaM2, setAreaM2] = useState('12');
  const [targetLux, setTargetLux] = useState('300');
  const [lampLumens, setLampLumens] = useState('800');
  const [people, setPeople] = useState('2');
  const [electronics, setElectronics] = useState('1');
  const [sunFactor, setSunFactor] = useState('1');
  const [motorPowerKw, setMotorPowerKw] = useState('1.5');
  const [efficiency, setEfficiency] = useState('0.85');
  const [frequencyHz, setFrequencyHz] = useState('60');
  const [poles, setPoles] = useState('4');
  const [measuredRpm, setMeasuredRpm] = useState('1720');
  const [motorPulleyDiameterMm, setMotorPulleyDiameterMm] = useState('80');
  const [drivenPulleyDiameterMm, setDrivenPulleyDiameterMm] = useState('160');
  const [analogInputValue, setAnalogInputValue] = useState('12');
  const [engineeringMin, setEngineeringMin] = useState('0');
  const [engineeringMax, setEngineeringMax] = useState('100');
  const [cableExternalDiameterMm, setCableExternalDiameterMm] = useState('4');
  const [cableCount, setCableCount] = useState('3');
  const [conduitInternalDiameterMm, setConduitInternalDiameterMm] = useState('16');

  const activeRule = activeCalculator ? getCalculatorAccessRule(activeCalculator) : null;
  const hasAccess = activeCalculator ? canUseCalculator(activeCalculator, userPlan) : false;

  const result = useMemo<CalculatorResult>(() => {
    if (!activeCalculator || !hasAccess) return { error: null, cards: [] };

    const powerWattsNumber = parseCalculatorNumber(powerWatts);
    const apparentPowerVaNumber = parseCalculatorNumber(apparentPowerVa);
    const voltageVoltsNumber = parseCalculatorNumber(voltageVolts);
    const currentAmpsNumber = parseCalculatorNumber(currentAmps);
    const powerFactorNumber = parseCalculatorNumber(powerFactor);
    const resistanceOhmsNumber = parseCalculatorNumber(resistanceOhms);
    const resistorValues = [resistorOneOhms, resistorTwoOhms, resistorThreeOhms].filter((value) => value.trim().length > 0).map(parseCalculatorNumber);
    const hoursPerDayNumber = parseCalculatorNumber(hoursPerDay);
    const daysNumber = parseCalculatorNumber(days);
    const tariffNumber = parseCalculatorNumber(tariff);
    const distanceMetersNumber = parseCalculatorNumber(distanceMeters);
    const sectionMm2Number = parseCalculatorNumber(sectionMm2);
    const maxDropPercentNumber = parseCalculatorNumber(maxDropPercent);
    const safetyMarginPercentNumber = parseCalculatorNumber(safetyMarginPercent);
    const areaM2Number = parseCalculatorNumber(areaM2);
    const targetLuxNumber = parseCalculatorNumber(targetLux);
    const lampLumensNumber = parseCalculatorNumber(lampLumens);
    const peopleNumber = parseCalculatorNumber(people);
    const electronicsNumber = parseCalculatorNumber(electronics);
    const sunFactorNumber = parseCalculatorNumber(sunFactor);
    const motorPowerKwNumber = parseCalculatorNumber(motorPowerKw);
    const efficiencyNumber = parseCalculatorNumber(efficiency);
    const frequencyHzNumber = parseCalculatorNumber(frequencyHz);
    const polesNumber = parseCalculatorNumber(poles);
    const measuredRpmNumber = parseCalculatorNumber(measuredRpm);
    const motorPulleyDiameterMmNumber = parseCalculatorNumber(motorPulleyDiameterMm);
    const drivenPulleyDiameterMmNumber = parseCalculatorNumber(drivenPulleyDiameterMm);
    const analogInputValueNumber = parseCalculatorNumber(analogInputValue);
    const engineeringMinNumber = parseCalculatorNumber(engineeringMin);
    const engineeringMaxNumber = parseCalculatorNumber(engineeringMax);
    const cableExternalDiameterMmNumber = parseCalculatorNumber(cableExternalDiameterMm);
    const cableCountNumber = parseCalculatorNumber(cableCount);
    const conduitInternalDiameterMmNumber = parseCalculatorNumber(conduitInternalDiameterMm);

    try {
      if (activeCalculator === 'current') {
        const current = calculateCurrentFromPower({ powerWatts: powerWattsNumber, voltageVolts: voltageVoltsNumber, powerFactor: powerFactorNumber, phase });
        const breaker = suggestNextBreaker(current);
        const cable = suggestMinimumCableSectionByCurrent(current);
        return { error: null, cards: [
          { label: 'Corrente calculada', value: `${roundTechnical(current)} A`, helper: 'Resultado base para análise do circuito.' },
          { label: 'Disjuntor comercial', value: breaker ? `${breaker} A` : 'Revisar', helper: 'Sugestão inicial. O disjuntor deve proteger o condutor.' },
          { label: 'Cabo preliminar', value: cable ? `${cable} mm²` : 'Revisar', helper: 'Pré-dimensionamento simplificado, ainda exige validação.' },
        ] };
      }

      if (activeCalculator === 'power') {
        const power = calculatePowerFromCurrent({ currentAmps: currentAmpsNumber, voltageVolts: voltageVoltsNumber, powerFactor: powerFactorNumber, phase });
        return { error: null, cards: [{ label: 'Potência estimada', value: `${roundTechnical(power)} W`, helper: `${roundTechnical(power / 1000)} kW` }] };
      }

      if (activeCalculator === 'ohms-law') {
        const resistance = calculateResistanceFromVoltageCurrent({ voltageVolts: voltageVoltsNumber, currentAmps: currentAmpsNumber });
        const power = calculatePowerFromCurrent({ currentAmps: currentAmpsNumber, voltageVolts: voltageVoltsNumber });
        return { error: null, cards: [
          { label: 'Resistência', value: `${roundTechnical(resistance)} Ω`, helper: 'R = V / I' },
          { label: 'Potência relacionada', value: `${roundTechnical(power)} W`, helper: 'P = V × I' },
        ] };
      }

      if (activeCalculator === 'power-resistance') {
        const byCurrent = calculatePowerByResistance({ currentAmps: currentAmpsNumber, resistanceOhms: resistanceOhmsNumber });
        const byVoltage = calculatePowerByResistance({ voltageVolts: voltageVoltsNumber, resistanceOhms: resistanceOhmsNumber });
        return { error: null, cards: [
          { label: 'Potência por corrente', value: `${roundTechnical(byCurrent)} W`, helper: 'P = I² × R' },
          { label: 'Potência por tensão', value: `${roundTechnical(byVoltage)} W`, helper: 'P = V² / R' },
        ] };
      }

      if (activeCalculator === 'resistor-network') {
        const series = calculateSeriesResistance({ resistorsOhms: resistorValues });
        const parallel = calculateParallelResistance({ resistorsOhms: resistorValues });
        return { error: null, cards: [
          { label: 'Equivalente em série', value: `${roundTechnical(series)} Ω`, helper: 'Soma direta das resistências informadas.' },
          { label: 'Equivalente em paralelo', value: `${roundTechnical(parallel)} Ω`, helper: 'Inverso da soma dos inversos.' },
        ] };
      }

      if (activeCalculator === 'conversion') {
        const apparentPower = calculateApparentPower({ powerWatts: powerWattsNumber, powerFactor: powerFactorNumber });
        const currentFromVa = calculateCurrentFromApparentPower({ apparentPowerVa: apparentPowerVaNumber, voltageVolts: voltageVoltsNumber, phase });
        return { error: null, cards: [
          { label: 'Potência aparente', value: `${roundTechnical(apparentPower)} VA`, helper: `Base: ${powerWatts || '-'} W com FP ${powerFactor || '-'}` },
          { label: 'Corrente por VA', value: `${roundTechnical(currentFromVa)} A`, helper: `Base: ${apparentPowerVa || '-'} VA em ${voltageVolts || '-'} V` },
        ] };
      }

      if (activeCalculator === 'consumption') {
        const consumption = calculateEnergyConsumption({ powerWatts: powerWattsNumber, hoursPerDay: hoursPerDayNumber, days: daysNumber, tariffPerKwh: tariffNumber });
        return { error: null, cards: [
          { label: 'Consumo no período', value: `${roundTechnical(consumption.kwh)} kWh`, helper: `${hoursPerDay || '-'} h/dia por ${days || '-'} dias` },
          { label: 'Custo estimado', value: `R$ ${roundTechnical(consumption.estimatedCost ?? 0)}`, helper: `Tarifa usada: R$ ${tariff || '-'}/kWh` },
        ] };
      }

      if (activeCalculator === 'voltage-drop') {
        const drop = calculateVoltageDrop({ currentAmps: currentAmpsNumber, distanceMeters: distanceMetersNumber, sectionMm2: sectionMm2Number, voltageVolts: voltageVoltsNumber, phase, material: 'copper' });
        return { error: null, cards: [
          { label: 'Queda de tensão', value: `${roundTechnical(drop.dropVolts)} V`, helper: 'Estimativa simplificada para condutor de cobre.' },
          { label: 'Percentual', value: `${roundTechnical(drop.dropPercent)}%`, helper: drop.dropPercent > 4 ? 'Atenção: resultado merece revisão.' : 'Dentro de uma faixa inicial aceitável.' },
        ] };
      }

      if (activeCalculator === 'cable-section-drop') {
        const section = calculateCableSectionFromVoltageDrop({ currentAmps: currentAmpsNumber, distanceMeters: distanceMetersNumber, voltageVolts: voltageVoltsNumber, maxDropPercent: maxDropPercentNumber, phase, material: 'copper' });
        return { error: null, cards: [
          { label: 'Queda máxima', value: `${roundTechnical(section.maxDropVolts)} V`, helper: `${maxDropPercent || '-'}% de ${voltageVolts || '-'} V` },
          { label: 'Seção mínima estimada', value: `${roundTechnical(section.requiredSectionMm2)} mm²`, helper: 'Resultado teórico antes de escolher seção comercial.' },
        ] };
      }

      if (activeCalculator === 'max-distance-drop') {
        const maxDistance = calculateMaxDistanceFromVoltageDrop({ currentAmps: currentAmpsNumber, sectionMm2: sectionMm2Number, voltageVolts: voltageVoltsNumber, maxDropPercent: maxDropPercentNumber, phase, material: 'copper' });
        return { error: null, cards: [
          { label: 'Queda máxima', value: `${roundTechnical(maxDistance.maxDropVolts)} V`, helper: `${maxDropPercent || '-'}% de ${voltageVolts || '-'} V` },
          { label: 'Distância máxima', value: `${roundTechnical(maxDistance.maxDistanceMeters)} m`, helper: 'Estimativa simplificada para condutor de cobre.' },
        ] };
      }

      if (activeCalculator === 'transformer-sizing') {
        const transformer = calculateTransformerSizing({ loadWatts: powerWattsNumber, powerFactor: powerFactorNumber, safetyMarginPercent: safetyMarginPercentNumber });
        return { error: null, cards: [
          { label: 'Potência aparente', value: `${roundTechnical(transformer.apparentPowerKva)} kVA`, helper: 'Sem margem de segurança.' },
          { label: 'Com margem', value: `${roundTechnical(transformer.apparentPowerWithMarginKva)} kVA`, helper: `Margem: ${safetyMarginPercent || '-'}%` },
          { label: 'Comercial sugerido', value: `${transformer.suggestedCommercialKva} kVA`, helper: 'Arredondado para capacidade comercial acima.' },
        ] };
      }

      if (activeCalculator === 'awg-conversion') {
        const awgResult = convertAwgToMm2(awgValue);
        const nearestAwg = suggestNearestAwg(sectionMm2Number);
        return { error: null, cards: [
          { label: 'AWG para mm²', value: awgResult ? `${awgResult.sectionMm2} mm²` : 'Não encontrado', helper: awgResult ? `AWG ${awgResult.awg}` : 'Use valores como 12, 10, 8, 1/0 etc.' },
          { label: 'mm² para AWG próximo', value: nearestAwg ? `AWG ${nearestAwg.awg}` : 'Não encontrado', helper: nearestAwg ? `${nearestAwg.sectionMm2} mm² ou superior` : 'Informe uma seção válida.' },
        ] };
      }

      if (activeCalculator === 'circuit-recommendation') {
        const recommendation = recommendCircuit({ powerWatts: powerWattsNumber, voltageVolts: voltageVoltsNumber, powerFactor: powerFactorNumber, phase });
        return { error: null, cards: [
          { label: 'Corrente de projeto', value: `${roundTechnical(recommendation.currentAmps)} A`, helper: 'Corrente calculada pela potência informada.' },
          { label: 'Disjuntor sugerido', value: recommendation.suggestedBreakerAmps ? `${recommendation.suggestedBreakerAmps} A` : 'Revisar', helper: 'Sugestão comercial inicial, não substitui dimensionamento normativo.' },
          { label: 'Cabo sugerido', value: recommendation.suggestedCableSectionMm2 ? `${recommendation.suggestedCableSectionMm2} mm²` : 'Revisar', helper: 'Tabela simplificada para triagem inicial.' },
        ] };
      }

      if (activeCalculator === 'lighting') {
        const lighting = calculateLighting({ areaM2: areaM2Number, targetLux: targetLuxNumber, lampLumens: lampLumensNumber });
        return { error: null, cards: [
          { label: 'Fluxo necessário', value: `${roundTechnical(lighting.requiredLumens)} lm`, helper: `${areaM2 || '-'} m² × ${targetLux || '-'} lux` },
          { label: 'Quantidade de luminárias', value: lighting.lampQuantity ? `${lighting.lampQuantity}` : 'Informe lúmens', helper: `Base: ${lampLumens || '-'} lm por luminária` },
        ] };
      }

      if (activeCalculator === 'air-conditioning') {
        const sizing = calculateAirConditioningSizing({ areaM2: areaM2Number, people: peopleNumber, electronics: electronicsNumber, sunFactor: sunFactorNumber });
        return { error: null, cards: [
          { label: 'Carga estimada', value: `${roundTechnical(sizing.estimatedBtus)} BTU/h`, helper: 'Estimativa inicial por área, pessoas e equipamentos.' },
          { label: 'Modelo comercial sugerido', value: `${sizing.suggestedCommercialBtus} BTU/h`, helper: 'Arredondado para capacidade comercial acima da estimativa.' },
        ] };
      }

      if (activeCalculator === 'motor-current') {
        const motorCurrent = calculateMotorCurrent({ mechanicalPowerKw: motorPowerKwNumber, voltageVolts: voltageVoltsNumber, efficiency: efficiencyNumber, powerFactor: powerFactorNumber, phase });
        return { error: null, cards: [
          { label: 'Corrente estimada', value: `${roundTechnical(motorCurrent)} A`, helper: 'Baseada em potência mecânica, rendimento e FP.' },
          { label: 'Potência mecânica', value: `${roundTechnical(motorPowerKwNumber)} kW`, helper: `Rendimento ${efficiency || '-'} · FP ${powerFactor || '-'}` },
        ] };
      }

      if (activeCalculator === 'motor-speed') {
        const speed = calculateMotorSpeed({ frequencyHz: frequencyHzNumber, poles: polesNumber, measuredRpm: measuredRpmNumber });
        return { error: null, cards: [
          { label: 'Rotação síncrona', value: `${roundTechnical(speed.synchronousRpm)} rpm`, helper: 'Ns = 120 × f / polos' },
          { label: 'Escorregamento', value: speed.slipPercent !== undefined ? `${roundTechnical(speed.slipPercent)}%` : 'Informe RPM', helper: 'Comparação entre rotação síncrona e medida.' },
        ] };
      }

      if (activeCalculator === 'pulley-ratio') {
        const pulley = calculatePulleyRatio({ motorRpm: measuredRpmNumber, motorPulleyDiameterMm: motorPulleyDiameterMmNumber, drivenPulleyDiameterMm: drivenPulleyDiameterMmNumber });
        return { error: null, cards: [
          { label: 'Rotação movida', value: `${roundTechnical(pulley.drivenRpm)} rpm`, helper: 'Estimativa por relação de diâmetros.' },
          { label: 'Relação', value: `${roundTechnical(pulley.ratio)}:1`, helper: 'Polia motora / polia movida.' },
        ] };
      }

      if (activeCalculator === 'analog-4-20ma' || activeCalculator === 'analog-0-10v') {
        const scaled = scaleAnalogSignal({
          inputValue: analogInputValueNumber,
          inputMin: activeCalculator === 'analog-4-20ma' ? 4 : 0,
          inputMax: activeCalculator === 'analog-4-20ma' ? 20 : 10,
          engineeringMin: engineeringMinNumber,
          engineeringMax: engineeringMaxNumber,
        });
        return { error: null, cards: [
          { label: 'Valor de engenharia', value: `${roundTechnical(scaled.engineeringValue)}`, helper: `Faixa: ${engineeringMin || '-'} até ${engineeringMax || '-'}` },
          { label: 'Percentual do sinal', value: `${roundTechnical(scaled.percent)}%`, helper: activeCalculator === 'analog-4-20ma' ? 'Escala 4–20 mA' : 'Escala 0–10 V' },
        ] };
      }

      const conduit = calculateConduitFill({ cableExternalDiameterMm: cableExternalDiameterMmNumber, cableCount: cableCountNumber, conduitInternalDiameterMm: conduitInternalDiameterMmNumber });
      return { error: null, cards: [
        { label: 'Área total dos cabos', value: `${roundTechnical(conduit.totalCableAreaMm2)} mm²`, helper: `${cableCount || '-'} cabos de ${cableExternalDiameterMm || '-'} mm externo` },
        { label: 'Ocupação do eletroduto', value: `${roundTechnical(conduit.fillPercent)}%`, helper: conduit.fillPercent > 40 ? 'Atenção: ocupação alta para triagem inicial.' : 'Triagem inicial abaixo de 40%.' },
      ] };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários para calcular.', cards: [] };
    }
  }, [
    activeCalculator,
    analogInputValue,
    apparentPowerVa,
    areaM2,
    awgValue,
    cableCount,
    cableExternalDiameterMm,
    conduitInternalDiameterMm,
    currentAmps,
    days,
    distanceMeters,
    drivenPulleyDiameterMm,
    efficiency,
    electronics,
    engineeringMax,
    engineeringMin,
    frequencyHz,
    hasAccess,
    hoursPerDay,
    lampLumens,
    maxDropPercent,
    measuredRpm,
    motorPowerKw,
    motorPulleyDiameterMm,
    people,
    phase,
    poles,
    powerFactor,
    powerWatts,
    resistanceOhms,
    resistorOneOhms,
    resistorThreeOhms,
    resistorTwoOhms,
    safetyMarginPercent,
    sectionMm2,
    sunFactor,
    targetLux,
    tariff,
    voltageVolts,
  ]);

  function includeInBudgetAndSurvey() {
    if (!activeRule) return;
    setAddedMessage(`${activeRule.label} foi enviado para o orçamento e levantamento técnico.`);
  }

  function closeCalculator() {
    setActiveCalculator(null);
    setAddedMessage(null);
  }

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
                  {(activeCalculator === 'current' || activeCalculator === 'consumption' || activeCalculator === 'conversion' || activeCalculator === 'circuit-recommendation' || activeCalculator === 'transformer-sizing') && <NumberField label="Potência" value={powerWatts} suffix="W" step={1} onChange={setPowerWatts} />}
                  {activeCalculator === 'conversion' && <NumberField label="Potência aparente" value={apparentPowerVa} suffix="VA" step={1} onChange={setApparentPowerVa} />}
                  {(activeCalculator === 'power' || activeCalculator === 'voltage-drop' || activeCalculator === 'ohms-law' || activeCalculator === 'power-resistance' || activeCalculator === 'cable-section-drop' || activeCalculator === 'max-distance-drop') && <NumberField label="Corrente" value={currentAmps} suffix="A" onChange={setCurrentAmps} />}
                  {activeCalculator !== 'consumption' && activeCalculator !== 'lighting' && activeCalculator !== 'air-conditioning' && activeCalculator !== 'conduit-fill' && activeCalculator !== 'resistor-network' && activeCalculator !== 'awg-conversion' && activeCalculator !== 'motor-speed' && activeCalculator !== 'pulley-ratio' && activeCalculator !== 'analog-4-20ma' && activeCalculator !== 'analog-0-10v' && <NumberField label="Tensão" value={voltageVolts} suffix="V" step={1} onChange={setVoltageVolts} />}
                  {(activeCalculator === 'current' || activeCalculator === 'power' || activeCalculator === 'conversion' || activeCalculator === 'circuit-recommendation' || activeCalculator === 'motor-current' || activeCalculator === 'transformer-sizing') && <NumberField label="Fator de potência" value={powerFactor} min={0.01} step={0.01} onChange={setPowerFactor} />}
                  {(activeCalculator === 'current' || activeCalculator === 'power' || activeCalculator === 'voltage-drop' || activeCalculator === 'conversion' || activeCalculator === 'circuit-recommendation' || activeCalculator === 'cable-section-drop' || activeCalculator === 'max-distance-drop' || activeCalculator === 'motor-current') && <PhaseSelector value={phase} onChange={setPhase} />}
                  {activeCalculator === 'power-resistance' && <NumberField label="Resistência" value={resistanceOhms} suffix="Ω" onChange={setResistanceOhms} />}
                  {activeCalculator === 'resistor-network' && <><NumberField label="Resistor 1" value={resistorOneOhms} suffix="Ω" onChange={setResistorOneOhms} /><NumberField label="Resistor 2" value={resistorTwoOhms} suffix="Ω" onChange={setResistorTwoOhms} /><NumberField label="Resistor 3" value={resistorThreeOhms} suffix="Ω" onChange={setResistorThreeOhms} /></>}
                  {activeCalculator === 'consumption' && <><NumberField label="Horas por dia" value={hoursPerDay} suffix="h" onChange={setHoursPerDay} /><NumberField label="Dias" value={days} suffix="dias" step={1} onChange={setDays} /><NumberField label="Tarifa" value={tariff} suffix="R$/kWh" onChange={setTariff} /></>}
                  {activeCalculator === 'voltage-drop' && <><NumberField label="Distância" value={distanceMeters} suffix="m" onChange={setDistanceMeters} /><NumberField label="Seção do cabo" value={sectionMm2} suffix="mm²" onChange={setSectionMm2} /></>}
                  {activeCalculator === 'cable-section-drop' && <><NumberField label="Distância" value={distanceMeters} suffix="m" onChange={setDistanceMeters} /><NumberField label="Queda máxima" value={maxDropPercent} suffix="%" onChange={setMaxDropPercent} /></>}
                  {activeCalculator === 'max-distance-drop' && <><NumberField label="Seção do cabo" value={sectionMm2} suffix="mm²" onChange={setSectionMm2} /><NumberField label="Queda máxima" value={maxDropPercent} suffix="%" onChange={setMaxDropPercent} /></>}
                  {activeCalculator === 'transformer-sizing' && <NumberField label="Margem" value={safetyMarginPercent} suffix="%" onChange={setSafetyMarginPercent} />}
                  {activeCalculator === 'awg-conversion' && <><TextField label="AWG" value={awgValue} placeholder="Ex.: 12 ou 1/0" onChange={setAwgValue} /><NumberField label="Seção desejada" value={sectionMm2} suffix="mm²" onChange={setSectionMm2} /></>}
                  {activeCalculator === 'lighting' && <><NumberField label="Área do ambiente" value={areaM2} suffix="m²" onChange={setAreaM2} /><NumberField label="Iluminância desejada" value={targetLux} suffix="lux" step={1} onChange={setTargetLux} /><NumberField label="Lúmens por luminária" value={lampLumens} suffix="lm" step={1} onChange={setLampLumens} /></>}
                  {activeCalculator === 'air-conditioning' && <><NumberField label="Área do ambiente" value={areaM2} suffix="m²" onChange={setAreaM2} /><NumberField label="Pessoas" value={people} suffix="pessoas" step={1} onChange={setPeople} /><NumberField label="Equipamentos" value={electronics} suffix="un." step={1} onChange={setElectronics} /><NumberField label="Fator sol/calor" value={sunFactor} min={0.1} step={0.05} onChange={setSunFactor} /></>}
                  {activeCalculator === 'motor-current' && <><NumberField label="Potência mecânica" value={motorPowerKw} suffix="kW" onChange={setMotorPowerKw} /><NumberField label="Rendimento" value={efficiency} min={0.01} step={0.01} onChange={setEfficiency} /></>}
                  {activeCalculator === 'motor-speed' && <><NumberField label="Frequência" value={frequencyHz} suffix="Hz" onChange={setFrequencyHz} /><NumberField label="Polos" value={poles} step={1} onChange={setPoles} /><NumberField label="RPM medido" value={measuredRpm} suffix="rpm" onChange={setMeasuredRpm} /></>}
                  {activeCalculator === 'pulley-ratio' && <><NumberField label="RPM do motor" value={measuredRpm} suffix="rpm" onChange={setMeasuredRpm} /><NumberField label="Polia motora" value={motorPulleyDiameterMm} suffix="mm" onChange={setMotorPulleyDiameterMm} /><NumberField label="Polia movida" value={drivenPulleyDiameterMm} suffix="mm" onChange={setDrivenPulleyDiameterMm} /></>}
                  {(activeCalculator === 'analog-4-20ma' || activeCalculator === 'analog-0-10v') && <><NumberField label="Entrada" value={analogInputValue} suffix={activeCalculator === 'analog-4-20ma' ? 'mA' : 'V'} onChange={setAnalogInputValue} /><NumberField label="Eng. mínimo" value={engineeringMin} onChange={setEngineeringMin} /><NumberField label="Eng. máximo" value={engineeringMax} onChange={setEngineeringMax} /></>}
                  {activeCalculator === 'conduit-fill' && <><NumberField label="Diâmetro externo do cabo" value={cableExternalDiameterMm} suffix="mm" onChange={setCableExternalDiameterMm} /><NumberField label="Quantidade de cabos" value={cableCount} suffix="cabos" step={1} onChange={setCableCount} /><NumberField label="Diâmetro interno do eletroduto" value={conduitInternalDiameterMm} suffix="mm" onChange={setConduitInternalDiameterMm} /></>}
                </form>

                <div className="calculator-results overlay-results">
                  {result.error && <div className="error-box">{result.error}</div>}
                  {result.cards.map((card) => <ResultCard key={card.label} label={card.label} value={card.value} helper={card.helper} />)}
                  <div className="technical-warning">Resultado para apoio técnico. Antes de executar instalação real, validar norma, método de instalação, agrupamento, temperatura, cabo, proteção e responsabilidade profissional.</div>
                </div>

                {result.cards.length > 0 && !result.error && (
                  <div className="calculation-next-step-card">
                    <strong>Deseja usar este resultado?</strong>
                    <p>Você pode incluir esse cálculo no orçamento e no levantamento técnico da OS, ou voltar para escolher outro cálculo.</p>
                    {addedMessage && <small>{addedMessage}</small>}
                    <div>
                      <button className="primary-action-button" type="button" onClick={includeInBudgetAndSurvey}>Incluir no orçamento e levantamento</button>
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
