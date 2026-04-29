import { useMemo, useState } from 'react';
import {
  calculateCurrentFromPower,
  calculateEnergyConsumption,
  calculatePowerFromCurrent,
  calculateVoltageDrop,
  roundTechnical,
} from '../../../core/calculations/electrical';
import type { CircuitPhase } from '../../../core/types/electrical';
import { suggestNextBreaker } from '../../../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../../../data/electrical-tables/cableSections';

type CalculatorMode = 'current' | 'power' | 'consumption' | 'voltage-drop';

interface NumberFieldProps {
  label: string;
  value: number;
  suffix?: string;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
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
          onChange={(event) => onChange(Number(event.target.value))}
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

export function ElectricalCalculatorWorkspace() {
  const [mode, setMode] = useState<CalculatorMode>('current');

  const [powerWatts, setPowerWatts] = useState(2200);
  const [voltageVolts, setVoltageVolts] = useState(220);
  const [currentAmps, setCurrentAmps] = useState(10);
  const [powerFactor, setPowerFactor] = useState(1);
  const [phase, setPhase] = useState<CircuitPhase>('single-phase');

  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [days, setDays] = useState(30);
  const [tariff, setTariff] = useState(0.95);

  const [distanceMeters, setDistanceMeters] = useState(25);
  const [sectionMm2, setSectionMm2] = useState(2.5);

  const result = useMemo(() => {
    try {
      if (mode === 'current') {
        const current = calculateCurrentFromPower({ powerWatts, voltageVolts, powerFactor, phase });
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
        const power = calculatePowerFromCurrent({ currentAmps, voltageVolts, powerFactor, phase });

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

      if (mode === 'consumption') {
        const consumption = calculateEnergyConsumption({
          powerWatts,
          hoursPerDay,
          days,
          tariffPerKwh: tariff,
        });

        return {
          error: null,
          cards: [
            {
              label: 'Consumo no período',
              value: `${roundTechnical(consumption.kwh)} kWh`,
              helper: `${hoursPerDay} h/dia por ${days} dias`,
            },
            {
              label: 'Custo estimado',
              value: `R$ ${roundTechnical(consumption.estimatedCost ?? 0)}`,
              helper: `Tarifa usada: R$ ${tariff}/kWh`,
            },
          ],
        };
      }

      const drop = calculateVoltageDrop({
        currentAmps,
        distanceMeters,
        sectionMm2,
        voltageVolts,
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
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Não foi possível calcular com os valores informados.',
        cards: [],
      };
    }
  }, [currentAmps, days, distanceMeters, hoursPerDay, mode, phase, powerFactor, powerWatts, sectionMm2, tariff, voltageVolts]);

  return (
    <div className="calculator-workspace">
      <div className="calculator-tabs" role="tablist" aria-label="Calculadoras elétricas">
        <button className={mode === 'current' ? 'active' : ''} type="button" onClick={() => setMode('current')}>
          Corrente
        </button>
        <button className={mode === 'power' ? 'active' : ''} type="button" onClick={() => setMode('power')}>
          Potência
        </button>
        <button className={mode === 'consumption' ? 'active' : ''} type="button" onClick={() => setMode('consumption')}>
          Consumo
        </button>
        <button className={mode === 'voltage-drop' ? 'active' : ''} type="button" onClick={() => setMode('voltage-drop')}>
          Queda de tensão
        </button>
      </div>

      <div className="calculator-layout">
        <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
          {(mode === 'current' || mode === 'consumption') && (
            <NumberField label="Potência" value={powerWatts} suffix="W" step={1} onChange={setPowerWatts} />
          )}

          {(mode === 'power' || mode === 'voltage-drop') && (
            <NumberField label="Corrente" value={currentAmps} suffix="A" onChange={setCurrentAmps} />
          )}

          {mode !== 'consumption' && (
            <NumberField label="Tensão" value={voltageVolts} suffix="V" step={1} onChange={setVoltageVolts} />
          )}

          {(mode === 'current' || mode === 'power') && (
            <NumberField label="Fator de potência" value={powerFactor} min={0.01} step={0.01} onChange={setPowerFactor} />
          )}

          {(mode === 'current' || mode === 'power' || mode === 'voltage-drop') && (
            <PhaseSelector value={phase} onChange={setPhase} />
          )}

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
    </div>
  );
}
