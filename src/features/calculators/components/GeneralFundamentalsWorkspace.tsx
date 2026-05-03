import { useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import './GeneralFundamentalsWorkspace.css';

export type FundamentalMode =
  | 'rule-of-three'
  | 'percentage'
  | 'increase-percent'
  | 'discount-percent'
  | 'difference-percent'
  | 'profit-margin'
  | 'markup'
  | 'rectangle-area'
  | 'triangle-area'
  | 'circle-area'
  | 'rectangle-perimeter'
  | 'simple-volume'
  | 'loss-percent'
  | 'cost-per-area'
  | 'cost-per-unit'
  | 'cost-per-meter'
  | 'productivity-time';

interface GeneralFundamentalsWorkspaceProps {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
  modes?: FundamentalMode[];
  title?: string;
  description?: string;
  moduleLabel?: string;
  note?: string;
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
  { mode: 'difference-percent', label: 'Diferença %', description: 'Veja a variação percentual entre dois valores.', icon: '∆' },
  { mode: 'profit-margin', label: 'Margem de lucro', description: 'Calcule lucro e margem real entre custo e venda.', icon: '₿' },
  { mode: 'markup', label: 'Markup', description: 'Forme preço de venda a partir de custo e margem desejada.', icon: '×' },
  { mode: 'rectangle-area', label: 'Área retangular', description: 'Calcule área em m² para parede, piso, teto, pintura e revestimento.', icon: '▭' },
  { mode: 'triangle-area', label: 'Área triangular', description: 'Calcule área triangular para recortes, telhados e medições.', icon: '△' },
  { mode: 'circle-area', label: 'Área circular', description: 'Calcule área circular para bases, reservatórios e peças.', icon: '○' },
  { mode: 'rectangle-perimeter', label: 'Perímetro', description: 'Calcule perímetro retangular para rodapé, canaleta, moldura ou contorno.', icon: '□' },
  { mode: 'simple-volume', label: 'Volume simples', description: 'Calcule volume de caixa/prisma para concreto, reservatórios e materiais.', icon: '◧' },
  { mode: 'loss-percent', label: 'Perda de material', description: 'Adicione perda percentual para compra de material.', icon: '↗' },
  { mode: 'cost-per-area', label: 'Custo por m²', description: 'Calcule custo total ou unitário por metro quadrado.', icon: 'm²' },
  { mode: 'cost-per-unit', label: 'Custo por unidade', description: 'Calcule valor unitário ou total por quantidade.', icon: 'un' },
  { mode: 'cost-per-meter', label: 'Custo por metro', description: 'Calcule valor por metro linear para cabos, tubos, perfis e canaletas.', icon: 'm' },
  { mode: 'productivity-time', label: 'Tempo por produção', description: 'Estime tempo de execução por produtividade horária.', icon: 'h' },
];

const defaultValues: Record<string, string> = {
  baseA: '10',
  baseB: '100',
  targetA: '25',
  value: '100',
  previousValue: '80',
  newValue: '100',
  percent: '10',
  cost: '100',
  salePrice: '150',
  desiredMarginPercent: '30',
  width: '3',
  height: '2.8',
  length: '4',
  radius: '1',
  area: '12',
  totalCost: '600',
  unitCost: '50',
  quantity: '10',
  totalMeters: '30',
  meterCost: '8',
  totalWork: '120',
  productivityPerHour: '15',
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
          onFocus={handleNumericInputFocus}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <small className="technical-unit">{suffix}</small>}
      </div>
    </label>
  );
}

export function GeneralFundamentalsWorkspace({
  onCaptureCalculation,
  modes,
  title = 'Cálculos de apoio',
  description = 'Base gratuita transversal para elétrica, construção civil, hidráulica, pintura, orçamento e demais serviços.',
  moduleLabel = 'Cálculos de apoio',
  note = 'Cálculo geral de apoio. Use para estimativas, conferências rápidas, campo e formação de orçamento.',
}: GeneralFundamentalsWorkspaceProps) {
  const [activeCalculator, setActiveCalculator] = useState<FundamentalMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const visibleRules = useMemo(
    () => (modes ? fundamentalRules.filter((rule) => modes.includes(rule.mode)) : fundamentalRules),
    [modes],
  );
  const activeRule = activeCalculator ? visibleRules.find((rule) => rule.mode === activeCalculator) : null;

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

      if (activeCalculator === 'difference-percent') {
        const previousValue = n('previousValue', 'valor anterior');
        const newValue = n('newValue', 'novo valor');
        if (previousValue === 0) throw new Error('O valor anterior não pode ser zero.');
        const difference = newValue - previousValue;
        const variation = difference / previousValue * 100;
        return {
          error: null,
          cards: [
            { label: 'Diferença', value: `${round(difference)}`, helper: `${round(newValue)} - ${round(previousValue)}` },
            { label: 'Variação', value: `${round(variation)}%`, helper: variation >= 0 ? 'aumento' : 'redução' },
          ],
          summary: `Variação percentual: ${round(variation)}%`,
          details: [`Valor anterior: ${round(previousValue)}`, `Novo valor: ${round(newValue)}`, `Diferença: ${round(difference)}`, `Variação: ${round(variation)}%`],
        };
      }

      if (activeCalculator === 'profit-margin') {
        const cost = n('cost', 'custo');
        const salePrice = n('salePrice', 'preço de venda');
        if (salePrice === 0) throw new Error('O preço de venda não pode ser zero.');
        const profit = salePrice - cost;
        const margin = profit / salePrice * 100;
        const markup = cost > 0 ? profit / cost * 100 : 0;
        return {
          error: null,
          cards: [
            { label: 'Lucro', value: money(profit), helper: 'venda - custo' },
            { label: 'Margem', value: `${round(margin)}%`, helper: 'lucro sobre venda' },
            { label: 'Markup real', value: `${round(markup)}%`, helper: 'lucro sobre custo' },
          ],
          summary: `Margem de lucro: ${round(margin)}%`,
          details: [`Custo: ${money(cost)}`, `Venda: ${money(salePrice)}`, `Lucro: ${money(profit)}`, `Margem: ${round(margin)}%`, `Markup: ${round(markup)}%`],
        };
      }

      if (activeCalculator === 'markup') {
        const cost = n('cost', 'custo');
        const margin = n('desiredMarginPercent', 'margem desejada', false);
        if (margin >= 100) throw new Error('A margem desejada deve ser menor que 100%.');
        const salePrice = margin <= -100 ? 0 : cost / (1 - margin / 100);
        const profit = salePrice - cost;
        return {
          error: null,
          cards: [
            { label: 'Preço de venda', value: money(salePrice), helper: `${round(margin)}% de margem desejada` },
            { label: 'Lucro', value: money(profit), helper: 'preço - custo' },
          ],
          summary: `Preço sugerido por markup: ${money(salePrice)}`,
          details: [`Custo: ${money(cost)}`, `Margem desejada: ${round(margin)}%`, `Preço de venda: ${money(salePrice)}`, `Lucro: ${money(profit)}`],
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

      if (activeCalculator === 'triangle-area') {
        const width = n('width', 'base');
        const height = n('height', 'altura');
        const area = width * height / 2;
        return {
          error: null,
          cards: [{ label: 'Área triangular', value: `${round(area)} m²`, helper: '(base × altura) ÷ 2' }],
          summary: `Área triangular: ${round(area)} m²`,
          details: [`Base: ${round(width)} m`, `Altura: ${round(height)} m`, `Área: ${round(area)} m²`],
        };
      }

      if (activeCalculator === 'circle-area') {
        const radius = n('radius', 'raio');
        const area = Math.PI * radius ** 2;
        const diameter = radius * 2;
        return {
          error: null,
          cards: [
            { label: 'Área circular', value: `${round(area)} m²`, helper: 'π × raio²' },
            { label: 'Diâmetro', value: `${round(diameter)} m`, helper: '2 × raio' },
          ],
          summary: `Área circular: ${round(area)} m²`,
          details: [`Raio: ${round(radius)} m`, `Diâmetro: ${round(diameter)} m`, `Área: ${round(area)} m²`],
        };
      }

      if (activeCalculator === 'rectangle-perimeter') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const perimeter = 2 * (width + length);
        return {
          error: null,
          cards: [{ label: 'Perímetro', value: `${round(perimeter)} m`, helper: '2 × (largura + comprimento)' }],
          summary: `Perímetro retangular: ${round(perimeter)} m`,
          details: [`Largura: ${round(width)} m`, `Comprimento: ${round(length)} m`, `Perímetro: ${round(perimeter)} m`],
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

      if (activeCalculator === 'loss-percent') {
        const quantity = n('quantity', 'quantidade base');
        const percent = n('percent', 'perda', false);
        const loss = quantity * percent / 100;
        const purchaseQuantity = quantity + loss;
        return {
          error: null,
          cards: [
            { label: 'Perda', value: `${round(loss)}`, helper: `${round(percent)}% sobre ${round(quantity)}` },
            { label: 'Comprar/considerar', value: `${round(purchaseQuantity)}`, helper: 'quantidade com perda' },
          ],
          summary: `Quantidade com perda: ${round(purchaseQuantity)}`,
          details: [`Quantidade base: ${round(quantity)}`, `Perda: ${round(percent)}%`, `Adicional: ${round(loss)}`, `Total com perda: ${round(purchaseQuantity)}`],
        };
      }

      if (activeCalculator === 'cost-per-area') {
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
      }

      if (activeCalculator === 'cost-per-unit') {
        const quantity = n('quantity', 'quantidade');
        const totalCost = n('totalCost', 'custo total');
        const unitCost = quantity > 0 ? totalCost / quantity : 0;
        const totalFromUnit = quantity * n('unitCost', 'valor unitário');
        return {
          error: null,
          cards: [
            { label: 'Custo unitário', value: money(unitCost), helper: `${money(totalCost)} ÷ ${round(quantity)} un.` },
            { label: 'Total pelo unitário', value: money(totalFromUnit), helper: `${round(quantity)} × ${money(n('unitCost', 'valor unitário'))}` },
          ],
          summary: `Custo unitário: ${money(unitCost)}`,
          details: [`Quantidade: ${round(quantity)}`, `Custo total: ${money(totalCost)}`, `Custo unitário calculado: ${money(unitCost)}`, `Total pelo unitário: ${money(totalFromUnit)}`],
        };
      }

      if (activeCalculator === 'cost-per-meter') {
        const meters = n('totalMeters', 'metros');
        const totalCost = n('totalCost', 'custo total');
        const meterCost = meters > 0 ? totalCost / meters : 0;
        const totalFromMeter = meters * n('meterCost', 'valor por metro');
        return {
          error: null,
          cards: [
            { label: 'Custo por metro', value: money(meterCost), helper: `${money(totalCost)} ÷ ${round(meters)} m` },
            { label: 'Total pelo metro', value: money(totalFromMeter), helper: `${round(meters)} m × ${money(n('meterCost', 'valor por metro'))}` },
          ],
          summary: `Custo por metro: ${money(meterCost)}`,
          details: [`Metros: ${round(meters)} m`, `Custo total: ${money(totalCost)}`, `Custo por metro calculado: ${money(meterCost)}`, `Total pelo valor/m: ${money(totalFromMeter)}`],
        };
      }

      const totalWork = n('totalWork', 'quantidade total');
      const productivity = n('productivityPerHour', 'produtividade por hora');
      if (productivity === 0) throw new Error('A produtividade por hora não pode ser zero.');
      const hours = totalWork / productivity;
      const days = hours / 8;
      return {
        error: null,
        cards: [
          { label: 'Tempo estimado', value: `${round(hours)} h`, helper: `${round(totalWork)} ÷ ${round(productivity)}/h` },
          { label: 'Dias de 8h', value: `${round(days)} dia(s)`, helper: 'estimativa de jornada' },
        ],
        summary: `Tempo estimado: ${round(hours)} h`,
        details: [`Quantidade total: ${round(totalWork)}`, `Produtividade: ${round(productivity)} por hora`, `Horas estimadas: ${round(hours)} h`, `Dias de 8h: ${round(days)}`],
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
      moduleLabel,
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: result.summary,
      details: result.details,
    };

    onCaptureCalculation?.(capture);

    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no campo.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no campo e no orçamento.`);
  }

  function closeCalculator() {
    setActiveCalculator(null);
    setAddedMessage(null);
  }

  return (
    <div className="fundamental-workspace">
      <div className="fundamental-plan-banner">
        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
        <em>{visibleRules.length} grátis</em>
      </div>

      <div className="fundamental-picker-list">
        {visibleRules.map((calculator) => (
          <button className="fundamental-picker-card" key={calculator.mode} type="button" onClick={() => setActiveCalculator(calculator.mode)}>
            <span>
              <strong>{calculator.label}</strong>
              <small>{calculator.description}</small>
            </span>
            <em>LIVRE</em>
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
                <span>{title}</span>
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

              {activeCalculator === 'difference-percent' && (
                <>
                  <NumberField label="Valor anterior" value={values.previousValue} onChange={(value) => setValue('previousValue', value)} />
                  <NumberField label="Novo valor" value={values.newValue} onChange={(value) => setValue('newValue', value)} />
                </>
              )}

              {activeCalculator === 'profit-margin' && (
                <>
                  <NumberField label="Custo" value={values.cost} suffix="R$" onChange={(value) => setValue('cost', value)} />
                  <NumberField label="Preço de venda" value={values.salePrice} suffix="R$" onChange={(value) => setValue('salePrice', value)} />
                </>
              )}

              {activeCalculator === 'markup' && (
                <>
                  <NumberField label="Custo" value={values.cost} suffix="R$" onChange={(value) => setValue('cost', value)} />
                  <NumberField label="Margem desejada" value={values.desiredMarginPercent} suffix="%" min={-100} onChange={(value) => setValue('desiredMarginPercent', value)} />
                </>
              )}

              {['rectangle-area', 'triangle-area'].includes(activeCalculator) && (
                <>
                  <NumberField label={activeCalculator === 'triangle-area' ? 'Base' : 'Largura'} value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label={activeCalculator === 'triangle-area' ? 'Altura' : 'Altura/comprimento'} value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                </>
              )}

              {activeCalculator === 'circle-area' && <NumberField label="Raio" value={values.radius} suffix="m" onChange={(value) => setValue('radius', value)} />}

              {activeCalculator === 'rectangle-perimeter' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                </>
              )}

              {activeCalculator === 'simple-volume' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                  <NumberField label="Altura" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                </>
              )}

              {activeCalculator === 'loss-percent' && (
                <>
                  <NumberField label="Quantidade base" value={values.quantity} onChange={(value) => setValue('quantity', value)} />
                  <NumberField label="Perda" value={values.percent} suffix="%" min={0} onChange={(value) => setValue('percent', value)} />
                </>
              )}

              {activeCalculator === 'cost-per-area' && (
                <>
                  <NumberField label="Área" value={values.area} suffix="m²" onChange={(value) => setValue('area', value)} />
                  <NumberField label="Custo total" value={values.totalCost} suffix="R$" onChange={(value) => setValue('totalCost', value)} />
                  <NumberField label="Custo por m²" value={values.unitCost} suffix="R$/m²" onChange={(value) => setValue('unitCost', value)} />
                </>
              )}

              {activeCalculator === 'cost-per-unit' && (
                <>
                  <NumberField label="Quantidade" value={values.quantity} suffix="un." onChange={(value) => setValue('quantity', value)} />
                  <NumberField label="Custo total" value={values.totalCost} suffix="R$" onChange={(value) => setValue('totalCost', value)} />
                  <NumberField label="Valor unitário" value={values.unitCost} suffix="R$/un." onChange={(value) => setValue('unitCost', value)} />
                </>
              )}

              {activeCalculator === 'cost-per-meter' && (
                <>
                  <NumberField label="Metros" value={values.totalMeters} suffix="m" onChange={(value) => setValue('totalMeters', value)} />
                  <NumberField label="Custo total" value={values.totalCost} suffix="R$" onChange={(value) => setValue('totalCost', value)} />
                  <NumberField label="Valor por metro" value={values.meterCost} suffix="R$/m" onChange={(value) => setValue('meterCost', value)} />
                </>
              )}

              {activeCalculator === 'productivity-time' && (
                <>
                  <NumberField label="Quantidade total" value={values.totalWork} onChange={(value) => setValue('totalWork', value)} />
                  <NumberField label="Produtividade por hora" value={values.productivityPerHour} suffix="/h" onChange={(value) => setValue('productivityPerHour', value)} />
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
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao campo</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="fundamental-note">{note}</small>
          </section>
        </div>
      )}
    </div>
  );
}
