import { useMemo, useState } from 'react';
import {
  calculateAirConditioningSizing,
  calculateApparentPower,
  calculateConduitFill,
  calculateCurrentFromApparentPower,
  calculateCurrentFromPower,
  calculateEnergyConsumption,
  calculateLighting,
  calculatePowerFromCurrent,
  calculateVoltageDrop,
  recommendCircuit,
  roundTechnical,
} from '../../../core/calculations/electrical';
import {
  calculatorAccessRules,
  canUseCalculator,
  getCalculatorAccessRule,
  type CalculatorMode,
  type UserPlan,
} from '../../../core/access/featureAccess';
import type { CircuitPhase } from '../../../core/types/electrical';
import { suggestNextBreaker } from '../../../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../../../data/electrical-tables/cableSections';
import './ElectricalCalculatorWorkspace.css';

interface ElectricalCalculatorWorkspaceProps {
  userPlan?: UserPlan;
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

function parseCalculatorNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');

  if (!normalizedValue) {
    return Number.NaN;
  }

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

function ResultCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
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
      <button type="button" onClick={onUpgradeRequest}>
        Ver pacote Pro
      </button>
    </div>
  );
}

export function ElectricalCalculatorWorkspace({ userPlan = 'free', onUpgradeRequest }: ElectricalCalculatorWorkspaceProps) {
  const [mode, setMode] = useState<CalculatorMode>('current');

  const [powerWatts, setPowerWatts] = useState('2200');
  const [apparentPowerVa, setApparentPowerVa] = useState('2200');
  const [voltageVolts, setVoltageVolts] = useState('220');
  const [currentAmps, setCurrentAmps] = useState('10');
  const [powerFactor, setPowerFactor] = useState('1');
  const [phase, setPhase] = useState<CircuitPhase>('single-phase');

  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [days, setDays] = useState('30');
  const [tariff, setTariff] = useState('0.95');

  const [distanceMeters, setDistanceMeters] = useState('25');
  const [sectionMm2, setSectionMm2] = useState('2.5');

  const [areaM2, setAreaM2] = useState('12');
  const [targetLux, setTargetLux] = useState('300');
  const [lampLumens, setLampLumens] = useState('800');

  const [people, setPeople] = useState('2');
  const [electronics, setElectronics] = useState('1');
  const [sunFactor, setSunFactor] = useState('1');

  const [cableExternalDiameterMm, setCableExternalDiameterMm] = useState('4');
  const [cableCount, setCableCount] = useState('3');
  const [conduitInternalDiameterMm, setConduitInternalDiameterMm] = useState('16');

  const hasAccess = canUseCalculator(mode, userPlan);

  const result = useMemo(() => {
    if (!hasAccess) {
      return { error: null, cards: [] };
    }

    const powerWattsNumber = parseCalculatorNumber(powerWatts);
    const apparentPowerVaNumber = parseCalculatorNumber(apparentPowerVa);
    const voltageVoltsNumber = parseCalculatorNumber(voltageVolts);
    const currentAmpsNumber = parseCalculatorNumber(currentAmps);
    const powerFactorNumber = parseCalculatorNumber(powerFactor);
    const hoursPerDayNumber = parseCalculatorNumber(hoursPerDay);
    const daysNumber = parseCalculatorNumber(days);
    const tariffNumber = parseCalculatorNumber(tariff);
    const distanceMetersNumber = parseCalculatorNumber(distanceMeters);
    const sectionMm2Number = parseCalculatorNumber(sectionMm2);
    const areaM2Number = parseCalculatorNumber(areaM2);
    const targetLuxNumber = parseCalculatorNumber(targetLux);
    const lampLumensNumber = parseCalculatorNumber(lampLumens);
    const peopleNumber = parseCalculatorNumber(people);
    const electronicsNumber = parseCalculatorNumber(electronics);
    const sunFactorNumber = parseCalculatorNumber(sunFactor);
    const cableExternalDiameterMmNumber = parseCalculatorNumber(cableExternalDiameterMm);
    const cableCountNumber = parseCalculatorNumber(cableCount);
    const conduitInternalDiameterMmNumber = parseCalculatorNumber(conduitInternalDiameterMm);

    try {
      if (mode === 'current') {
        const current = calculateCurrentFromPower({
          powerWatts: powerWattsNumber,
          voltageVolts: voltageVoltsNumber,
          powerFactor: powerFactorNumber,
          phase,
        });
        const breaker = suggestNextBreaker(current);
        const cable = suggestMinimumCableSectionByCurrent(current);

        return {
          error: null,
          cards: [
            {
              label: 'Corrente calculada',
              value: `${roundTechnical(current)} A`,
              helper: 'Resultado base para análise do circuito.',
            },
            {
              label: 'Disjuntor comercial',
              value: breaker ? `${breaker} A` : 'Revisar',
              helper: 'Sugestão inicial. O disjuntor deve proteger o condutor.',
            },
            {
              label: 'Cabo preliminar',
              value: cable ? `${cable} mm²` : 'Revisar',
              helper: 'Pré-dimensionamento simplificado, ainda exige validação.',
            },
          ],
        };
      }

      if (mode === 'power') {
        const power = calculatePowerFromCurrent({
          currentAmps: currentAmpsNumber,
          voltageVolts: voltageVoltsNumber,
          powerFactor: powerFactorNumber,
          phase,
        });

        return {
          error: null,
          cards: [
            {
              label: 'Potência estimada',
              value: `${roundTechnical(power)} W`,
              helper: `${roundTechnical(power / 1000)} kW`,
            },
          ],
        };
      }

      if (mode === 'conversion') {
        const apparentPower = calculateApparentPower({ powerWatts: powerWattsNumber, powerFactor: powerFactorNumber });
        const currentFromVa = calculateCurrentFromApparentPower({
          apparentPowerVa: apparentPowerVaNumber,
          voltageVolts: voltageVoltsNumber,
          phase,
        });

        return {
          error: null,
          cards: [
            {
              label: 'Potência aparente',
              value: `${roundTechnical(apparentPower)} VA`,
              helper: `Base: ${powerWatts || '-'} W com FP ${powerFactor || '-'}`,
            },
            {
              label: 'Corrente por VA',
              value: `${roundTechnical(currentFromVa)} A`,
              helper: `Base: ${apparentPowerVa || '-'} VA em ${voltageVolts || '-'} V`,
            },
          ],
        };
      }

      if (mode === 'consumption') {
        const consumption = calculateEnergyConsumption({
          powerWatts: powerWattsNumber,
          hoursPerDay: hoursPerDayNumber,
          days: daysNumber,
          tariffPerKwh: tariffNumber,
        });

        return {
          error: null,
          cards: [
            {
              label: 'Consumo no período',
              value: `${roundTechnical(consumption.kwh)} kWh`,
              helper: `${hoursPerDay || '-'} h/dia por ${days || '-'} dias`,
            },
            {
              label: 'Custo estimado',
              value: `R$ ${roundTechnical(consumption.estimatedCost ?? 0)}`,
              helper: `Tarifa usada: R$ ${tariff || '-'}/kWh`,
            },
          ],
        };
      }

      if (mode === 'voltage-drop') {
        const drop = calculateVoltageDrop({
          currentAmps: currentAmpsNumber,
          distanceMeters: distanceMetersNumber,
          sectionMm2: sectionMm2Number,
          voltageVolts: voltageVoltsNumber,
          phase,
          material: 'copper',
        });

        return {
          error: null,
          cards: [
            {
              label: 'Queda de tensão',
              value: `${roundTechnical(drop.dropVolts)} V`,
              helper: 'Estimativa simplificada para condutor de cobre.',
            },
            {
              label: 'Percentual',
              value: `${roundTechnical(drop.dropPercent)}%`,
              helper: drop.dropPercent > 4 ? 'Atenção: resultado merece revisão.' : 'Dentro de uma faixa inicial aceitável.',
            },
          ],
        };
      }

      if (mode === 'circuit-recommendation') {
        const recommendation = recommendCircuit({
          powerWatts: powerWattsNumber,
          voltageVolts: voltageVoltsNumber,
          powerFactor: powerFactorNumber,
          phase,
        });

        return {
          error: null,
          cards: [
            {
              label: 'Corrente de projeto',
              value: `${roundTechnical(recommendation.currentAmps)} A`,
              helper: 'Corrente calculada pela potência informada.',
            },
            {
              label: 'Disjuntor sugerido',
              value: recommendation.suggestedBreakerAmps ? `${recommendation.suggestedBreakerAmps} A` : 'Revisar',
              helper: 'Sugestão comercial inicial, não substitui dimensionamento normativo.',
            },
            {
              label: 'Cabo sugerido',
              value: recommendation.suggestedCableSectionMm2 ? `${recommendation.suggestedCableSectionMm2} mm²` : 'Revisar',
              helper: 'Tabela simplificada para triagem inicial.',
            },
          ],
        };
      }

      if (mode === 'lighting') {
        const lighting = calculateLighting({ areaM2: areaM2Number, targetLux: targetLuxNumber, lampLumens: lampLumensNumber });

        return {
          error: null,
          cards: [
            {
              label: 'Fluxo necessário',
              value: `${roundTechnical(lighting.requiredLumens)} lm`,
              helper: `${areaM2 || '-'} m² × ${targetLux || '-'} lux`,
            },
            {
              label: 'Quantidade de luminárias',
              value: lighting.lampQuantity ? `${lighting.lampQuantity}` : 'Informe lúmens',
              helper: `Base: ${lampLumens || '-'} lm por luminária`,
            },
          ],
        };
      }

      if (mode === 'air-conditioning') {
        const sizing = calculateAirConditioningSizing({
          areaM2: areaM2Number,
          people: peopleNumber,
          electronics: electronicsNumber,
          sunFactor: sunFactorNumber,
        });

        return {
          error: null,
          cards: [
            {
              label: 'Carga estimada',
              value: `${roundTechnical(sizing.estimatedBtus)} BTU/h`,
              helper: 'Estimativa inicial por área, pessoas e equipamentos.',
            },
            {
              label: 'Modelo comercial sugerido',
              value: `${sizing.suggestedCommercialBtus} BTU/h`,
              helper: 'Arredondado para capacidade comercial acima da estimativa.',
            },
          ],
        };
      }

      const conduit = calculateConduitFill({
        cableExternalDiameterMm: cableExternalDiameterMmNumber,
        cableCount: cableCountNumber,
        conduitInternalDiameterMm: conduitInternalDiameterMmNumber,
      });

      return {
        error: null,
        cards: [
          {
            label: 'Área total dos cabos',
            value: `${roundTechnical(conduit.totalCableAreaMm2)} mm²`,
            helper: `${cableCount || '-'} cabos de ${cableExternalDiameterMm || '-'} mm externo`,
          },
          {
            label: 'Ocupação do eletroduto',
            value: `${roundTechnical(conduit.fillPercent)}%`,
            helper: conduit.fillPercent > 40 ? 'Atenção: ocupação alta para triagem inicial.' : 'Triagem inicial abaixo de 40%.',
          },
        ],
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Preencha os campos necessários para calcular.',
        cards: [],
      };
    }
  }, [
    apparentPowerVa,
    areaM2,
    cableCount,
    cableExternalDiameterMm,
    conduitInternalDiameterMm,
    currentAmps,
    days,
    distanceMeters,
    electronics,
    hasAccess,
    hoursPerDay,
    lampLumens,
    mode,
    people,
    phase,
    powerFactor,
    powerWatts,
    sectionMm2,
    sunFactor,
    targetLux,
    tariff,
    voltageVolts,
  ]);

  return (
    <div className="calculator-workspace">
      <div className="calculator-plan-banner">
        <div>
          <strong>Fundamentos livres</strong>
          <span>Corrente, potência, W/VA/A e consumo ficam liberados para todos.</span>
        </div>
        <em>{userPlan === 'pro' ? 'PRO ativo' : 'Plano grátis'}</em>
      </div>

      <div className="calculator-tabs" role="tablist" aria-label="Calculadoras elétricas">
        {calculatorAccessRules.map((tab) => {
          const isLocked = !canUseCalculator(tab.mode, userPlan);

          return (
            <button
              className={mode === tab.mode ? 'active' : ''}
              key={tab.mode}
              type="button"
              onClick={() => setMode(tab.mode)}
            >
              {tab.label}
              <small className={isLocked ? 'tab-plan pro' : 'tab-plan free'}>{isLocked ? 'PRO' : 'LIVRE'}</small>
            </button>
          );
        })}
      </div>

      {!hasAccess ? (
        <LockedCalculator mode={mode} onUpgradeRequest={onUpgradeRequest} />
      ) : (
        <div className="calculator-layout">
          <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
            {(mode === 'current' ||
              mode === 'consumption' ||
              mode === 'conversion' ||
              mode === 'circuit-recommendation') && (
              <NumberField label="Potência" value={powerWatts} suffix="W" step={1} onChange={setPowerWatts} />
            )}

            {mode === 'conversion' && (
              <NumberField label="Potência aparente" value={apparentPowerVa} suffix="VA" step={1} onChange={setApparentPowerVa} />
            )}

            {(mode === 'power' || mode === 'voltage-drop') && (
              <NumberField label="Corrente" value={currentAmps} suffix="A" onChange={setCurrentAmps} />
            )}

            {mode !== 'consumption' && mode !== 'lighting' && mode !== 'air-conditioning' && mode !== 'conduit-fill' && (
              <NumberField label="Tensão" value={voltageVolts} suffix="V" step={1} onChange={setVoltageVolts} />
            )}

            {(mode === 'current' || mode === 'power' || mode === 'conversion' || mode === 'circuit-recommendation') && (
              <NumberField label="Fator de potência" value={powerFactor} min={0.01} step={0.01} onChange={setPowerFactor} />
            )}

            {(mode === 'current' ||
              mode === 'power' ||
              mode === 'voltage-drop' ||
              mode === 'conversion' ||
              mode === 'circuit-recommendation') && <PhaseSelector value={phase} onChange={setPhase} />}

            {mode === 'consumption' && (
              <>
                <NumberField label="Horas por dia" value={hoursPerDay} suffix="h" onChange={setHoursPerDay} />
                <NumberField label="Dias" value={days} suffix="dias" step={1} onChange={setDays} />
                <NumberField label="Tarifa" value={tariff} suffix="R$/kWh" onChange={setTariff} />
              </>
            )}

            {mode === 'voltage-drop' && (
              <>
                <NumberField label="Distância" value={distanceMeters} suffix="m" onChange={setDistanceMeters} />
                <NumberField label="Seção do cabo" value={sectionMm2} suffix="mm²" onChange={setSectionMm2} />
              </>
            )}

            {mode === 'lighting' && (
              <>
                <NumberField label="Área do ambiente" value={areaM2} suffix="m²" onChange={setAreaM2} />
                <NumberField label="Iluminância desejada" value={targetLux} suffix="lux" step={1} onChange={setTargetLux} />
                <NumberField label="Lúmens por luminária" value={lampLumens} suffix="lm" step={1} onChange={setLampLumens} />
              </>
            )}

            {mode === 'air-conditioning' && (
              <>
                <NumberField label="Área do ambiente" value={areaM2} suffix="m²" onChange={setAreaM2} />
                <NumberField label="Pessoas" value={people} suffix="pessoas" step={1} onChange={setPeople} />
                <NumberField label="Equipamentos" value={electronics} suffix="un." step={1} onChange={setElectronics} />
                <NumberField label="Fator sol/calor" value={sunFactor} min={0.1} step={0.05} onChange={setSunFactor} />
              </>
            )}

            {mode === 'conduit-fill' && (
              <>
                <NumberField label="Diâmetro externo do cabo" value={cableExternalDiameterMm} suffix="mm" onChange={setCableExternalDiameterMm} />
                <NumberField label="Quantidade de cabos" value={cableCount} suffix="cabos" step={1} onChange={setCableCount} />
                <NumberField
                  label="Diâmetro interno do eletroduto"
                  value={conduitInternalDiameterMm}
                  suffix="mm"
                  onChange={setConduitInternalDiameterMm}
                />
              </>
            )}
          </form>

          <div className="calculator-results">
            {result.error && <div className="error-box">{result.error}</div>}
            {result.cards.map((card) => (
              <ResultCard key={card.label} label={card.label} value={card.value} helper={card.helper} />
            ))}
            <div className="technical-warning">
              Resultado para apoio técnico. Antes de executar instalação real, validar norma, método de instalação,
              agrupamento, temperatura, cabo, proteção e responsabilidade profissional.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
