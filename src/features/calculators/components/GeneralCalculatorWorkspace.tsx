import { useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import './GeneralCalculatorWorkspace.css';

export type GeneralCalculatorModule = 'obras' | 'pintura' | 'conversores' | 'orcamentoTecnico';

type GeneralCalculatorMode =
  | 'wall-area'
  | 'floor-area'
  | 'concrete-volume'
  | 'blocks-quantity'
  | 'floor-tiles'
  | 'paint-area'
  | 'paint-liters'
  | 'paint-budget'
  | 'volume-converter'
  | 'pressure-converter'
  | 'power-converter'
  | 'btu-watts-converter'
  | 'labor-budget'
  | 'final-price';

interface GeneralCalculatorWorkspaceProps {
  selectedModule: GeneralCalculatorModule;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface GeneralCalculatorRule {
  mode: GeneralCalculatorMode;
  module: GeneralCalculatorModule;
  label: string;
  description: string;
  icon: string;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface GeneralResult {
  error: string | null;
  cards: ResultCardData[];
  summary: string;
  details: string[];
}

const generalCalculatorRules: GeneralCalculatorRule[] = [
  { mode: 'wall-area', module: 'obras', label: 'Área de parede', description: 'Área líquida de parede com desconto de portas e janelas.', icon: '▥' },
  { mode: 'floor-area', module: 'obras', label: 'Área de piso/teto', description: 'Área retangular com perda para compra e orçamento.', icon: '▦' },
  { mode: 'concrete-volume', module: 'obras', label: 'Volume de concreto', description: 'Volume em m³ com perda e sacos de cimento estimados.', icon: '◧' },
  { mode: 'blocks-quantity', module: 'obras', label: 'Tijolos/blocos', description: 'Quantidade aproximada de blocos por parede.', icon: '▧' },
  { mode: 'floor-tiles', module: 'obras', label: 'Piso/revestimento', description: 'Peças, caixas e perda para piso ou parede.', icon: '◫' },
  { mode: 'paint-area', module: 'pintura', label: 'Área a pintar', description: 'Área de paredes/teto com descontos e demãos.', icon: '▨' },
  { mode: 'paint-liters', module: 'pintura', label: 'Litros de tinta', description: 'Quantidade de tinta por área, rendimento e demãos.', icon: '◍' },
  { mode: 'paint-budget', module: 'pintura', label: 'Orçamento pintura', description: 'Material e mão de obra por m² para pintura.', icon: '▣' },
  { mode: 'volume-converter', module: 'conversores', label: 'm³ ↔ litros', description: 'Conversão rápida entre metros cúbicos e litros.', icon: '≋' },
  { mode: 'pressure-converter', module: 'conversores', label: 'bar / psi / mca', description: 'Conversão básica de pressão para hidráulica e bombas.', icon: '↕' },
  { mode: 'power-converter', module: 'conversores', label: 'CV / HP / kW', description: 'Conversão de potência para motores e equipamentos.', icon: '⚙' },
  { mode: 'btu-watts-converter', module: 'conversores', label: 'BTU/h ↔ W', description: 'Conversão para refrigeração e potência térmica.', icon: '❄' },
  { mode: 'labor-budget', module: 'orcamentoTecnico', label: 'Mão de obra', description: 'Preço por unidade, ponto, metro ou m².', icon: 'R$' },
  { mode: 'final-price', module: 'orcamentoTecnico', label: 'Preço final', description: 'Material, mão de obra, lucro, desconto e deslocamento.', icon: 'Σ' },
];

const defaultValues: Record<string, string> = {
  width: '3',
  height: '2.8',
  length: '4',
  discountArea: '2',
  lossPercent: '10',
  thicknessCm: '8',
  cementBagsPerM3: '7',
  blockWidthCm: '39',
  blockHeightCm: '19',
  tileWidthCm: '60',
  tileHeightCm: '60',
  piecesPerBox: '4',
  wallsQuantity: '4',
  coats: '2',
  paintYieldM2PerLiter: '10',
  paintLiterPrice: '35',
  laborPricePerM2: '18',
  cubicMeters: '1',
  liters: '1000',
  bar: '1',
  psi: '14.5',
  mca: '10.2',
  kw: '1',
  cv: '1',
  hp: '1',
  btuh: '12000',
  watts: '3517',
  quantity: '10',
  unitPrice: '45',
  materialCost: '300',
  laborCost: '500',
  profitPercent: '25',
  discountPercent: '0',
  travelCost: '50',
  taxPercent: '0',
};

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
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

function moduleLabel(module: GeneralCalculatorModule): string {
  if (module === 'obras') return 'Obras';
  if (module === 'pintura') return 'Pintura';
  if (module === 'conversores') return 'Conversores';
  return 'Orçamento técnico';
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return (
    <article className="general-result-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
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
    <label className="general-form-field">
      <span>{label}</span>
      <div>
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

export function GeneralCalculatorWorkspace({ selectedModule, onCaptureCalculation }: GeneralCalculatorWorkspaceProps) {
  const [activeCalculator, setActiveCalculator] = useState<GeneralCalculatorMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const availableCalculators = useMemo(
    () => generalCalculatorRules.filter((rule) => rule.module === selectedModule),
    [selectedModule],
  );

  const activeRule = activeCalculator ? generalCalculatorRules.find((rule) => rule.mode === activeCalculator) : null;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string): number {
    return ensurePositive(parseNumber(values[key] ?? ''), label);
  }

  const result = useMemo<GeneralResult>(() => {
    if (!activeCalculator) return { error: null, cards: [], summary: '', details: [] };

    try {
      if (activeCalculator === 'wall-area') {
        const width = n('width', 'largura');
        const height = n('height', 'altura');
        const walls = n('wallsQuantity', 'quantidade de paredes');
        const discount = n('discountArea', 'descontos');
        const grossArea = width * height * walls;
        const netArea = Math.max(grossArea - discount, 0);
        return {
          error: null,
          cards: [
            { label: 'Área bruta', value: `${round(grossArea)} m²`, helper: 'largura × altura × paredes' },
            { label: 'Área líquida', value: `${round(netArea)} m²`, helper: 'descontando portas/janelas' },
          ],
          summary: `Área líquida de parede: ${round(netArea)} m²`,
          details: [`Área bruta: ${round(grossArea)} m²`, `Descontos: ${round(discount)} m²`, `Área líquida: ${round(netArea)} m²`],
        };
      }

      if (activeCalculator === 'floor-area') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const loss = n('lossPercent', 'perda');
        const area = width * length;
        const purchaseArea = area * (1 + loss / 100);
        return {
          error: null,
          cards: [
            { label: 'Área base', value: `${round(area)} m²`, helper: 'largura × comprimento' },
            { label: 'Com perda', value: `${round(purchaseArea)} m²`, helper: `perda de ${round(loss)}%` },
          ],
          summary: `Área com perda: ${round(purchaseArea)} m²`,
          details: [`Área base: ${round(area)} m²`, `Perda: ${round(loss)}%`, `Área para compra/orçamento: ${round(purchaseArea)} m²`],
        };
      }

      if (activeCalculator === 'concrete-volume') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const thicknessMeters = n('thicknessCm', 'espessura') / 100;
        const loss = n('lossPercent', 'perda');
        const bagsPerM3 = n('cementBagsPerM3', 'sacos por m³');
        const volume = width * length * thicknessMeters;
        const volumeWithLoss = volume * (1 + loss / 100);
        const bags = Math.ceil(volumeWithLoss * bagsPerM3);
        return {
          error: null,
          cards: [
            { label: 'Volume', value: `${round(volume, 3)} m³`, helper: 'sem perda' },
            { label: 'Volume com perda', value: `${round(volumeWithLoss, 3)} m³`, helper: `perda de ${round(loss)}%` },
            { label: 'Sacos estimados', value: `${bags}`, helper: `${round(bagsPerM3)} sacos/m³` },
          ],
          summary: `Concreto estimado: ${round(volumeWithLoss, 3)} m³`,
          details: [`Volume base: ${round(volume, 3)} m³`, `Volume com perda: ${round(volumeWithLoss, 3)} m³`, `Sacos estimados: ${bags}`],
        };
      }

      if (activeCalculator === 'blocks-quantity') {
        const width = n('width', 'largura da parede');
        const height = n('height', 'altura da parede');
        const discount = n('discountArea', 'descontos');
        const blockArea = (n('blockWidthCm', 'largura do bloco') / 100) * (n('blockHeightCm', 'altura do bloco') / 100);
        const loss = n('lossPercent', 'perda');
        const area = Math.max(width * height - discount, 0);
        const blocks = blockArea > 0 ? Math.ceil((area / blockArea) * (1 + loss / 100)) : 0;
        return {
          error: null,
          cards: [
            { label: 'Área líquida', value: `${round(area)} m²`, helper: 'parede com descontos' },
            { label: 'Blocos estimados', value: `${blocks}`, helper: `inclui ${round(loss)}% de perda` },
          ],
          summary: `Blocos/tijolos estimados: ${blocks} un.`,
          details: [`Área líquida: ${round(area)} m²`, `Área do bloco: ${round(blockArea, 4)} m²`, `Quantidade com perda: ${blocks}`],
        };
      }

      if (activeCalculator === 'floor-tiles') {
        const area = n('width', 'largura') * n('length', 'comprimento');
        const tileArea = (n('tileWidthCm', 'largura da peça') / 100) * (n('tileHeightCm', 'altura da peça') / 100);
        const loss = n('lossPercent', 'perda');
        const piecesPerBox = n('piecesPerBox', 'peças por caixa');
        const pieces = tileArea > 0 ? Math.ceil((area / tileArea) * (1 + loss / 100)) : 0;
        const boxes = piecesPerBox > 0 ? Math.ceil(pieces / piecesPerBox) : 0;
        return {
          error: null,
          cards: [
            { label: 'Área', value: `${round(area)} m²`, helper: 'base do ambiente' },
            { label: 'Peças', value: `${pieces}`, helper: `inclui ${round(loss)}% de perda` },
            { label: 'Caixas', value: `${boxes}`, helper: `${round(piecesPerBox)} peças por caixa` },
          ],
          summary: `Revestimento estimado: ${pieces} peças / ${boxes} caixas`,
          details: [`Área: ${round(area)} m²`, `Peças: ${pieces}`, `Caixas: ${boxes}`],
        };
      }

      if (activeCalculator === 'paint-area') {
        const wallArea = n('width', 'largura') * n('height', 'altura') * n('wallsQuantity', 'paredes');
        const discount = n('discountArea', 'descontos');
        const coats = n('coats', 'demãos');
        const area = Math.max(wallArea - discount, 0);
        const paintedArea = area * coats;
        return {
          error: null,
          cards: [
            { label: 'Área líquida', value: `${round(area)} m²`, helper: 'sem multiplicar demãos' },
            { label: 'Área pintada', value: `${round(paintedArea)} m²`, helper: `${round(coats)} demão(s)` },
          ],
          summary: `Área pintada: ${round(paintedArea)} m²`,
          details: [`Área líquida: ${round(area)} m²`, `Demãos: ${round(coats)}`, `Área pintada: ${round(paintedArea)} m²`],
        };
      }

      if (activeCalculator === 'paint-liters') {
        const area = n('width', 'largura') * n('height', 'altura') * n('wallsQuantity', 'paredes') - n('discountArea', 'descontos');
        const coats = n('coats', 'demãos');
        const yieldValue = n('paintYieldM2PerLiter', 'rendimento');
        const loss = n('lossPercent', 'perda');
        const liters = yieldValue > 0 ? Math.max(area, 0) * coats / yieldValue * (1 + loss / 100) : 0;
        return {
          error: null,
          cards: [
            { label: 'Litros necessários', value: `${round(liters)} L`, helper: `rendimento ${round(yieldValue)} m²/L` },
            { label: 'Galões de 3,6 L', value: `${Math.ceil(liters / 3.6)}`, helper: 'arredondado para cima' },
            { label: 'Latas de 18 L', value: `${Math.ceil(liters / 18)}`, helper: 'arredondado para cima' },
          ],
          summary: `Tinta estimada: ${round(liters)} L`,
          details: [`Litros: ${round(liters)} L`, `Galões 3,6 L: ${Math.ceil(liters / 3.6)}`, `Latas 18 L: ${Math.ceil(liters / 18)}`],
        };
      }

      if (activeCalculator === 'paint-budget') {
        const area = Math.max(n('width', 'largura') * n('height', 'altura') * n('wallsQuantity', 'paredes') - n('discountArea', 'descontos'), 0);
        const coats = n('coats', 'demãos');
        const yieldValue = n('paintYieldM2PerLiter', 'rendimento');
        const liters = yieldValue > 0 ? area * coats / yieldValue * (1 + n('lossPercent', 'perda') / 100) : 0;
        const material = liters * n('paintLiterPrice', 'preço por litro');
        const labor = area * n('laborPricePerM2', 'mão de obra por m²');
        const total = material + labor;
        return {
          error: null,
          cards: [
            { label: 'Material', value: money(material), helper: `${round(liters)} L estimados` },
            { label: 'Mão de obra', value: money(labor), helper: `${round(area)} m²` },
            { label: 'Total', value: money(total), helper: 'estimativa inicial' },
          ],
          summary: `Orçamento de pintura: ${money(total)}`,
          details: [`Área: ${round(area)} m²`, `Material: ${money(material)}`, `Mão de obra: ${money(labor)}`, `Total: ${money(total)}`],
        };
      }

      if (activeCalculator === 'volume-converter') {
        const cubicMeters = n('cubicMeters', 'metros cúbicos');
        const liters = n('liters', 'litros');
        return {
          error: null,
          cards: [
            { label: 'm³ para litros', value: `${round(cubicMeters * 1000)} L`, helper: '1 m³ = 1000 L' },
            { label: 'litros para m³', value: `${round(liters / 1000, 3)} m³`, helper: '1000 L = 1 m³' },
          ],
          summary: `${round(cubicMeters * 1000)} L / ${round(liters / 1000, 3)} m³`,
          details: [`${round(cubicMeters)} m³ = ${round(cubicMeters * 1000)} L`, `${round(liters)} L = ${round(liters / 1000, 3)} m³`],
        };
      }

      if (activeCalculator === 'pressure-converter') {
        const bar = n('bar', 'bar');
        const psi = n('psi', 'psi');
        const mca = n('mca', 'mca');
        return {
          error: null,
          cards: [
            { label: 'bar para psi/mca', value: `${round(bar * 14.5038)} psi`, helper: `${round(bar * 10.197)} mca` },
            { label: 'psi para bar', value: `${round(psi / 14.5038)} bar`, helper: 'conversão aproximada' },
            { label: 'mca para bar', value: `${round(mca / 10.197)} bar`, helper: 'conversão aproximada' },
          ],
          summary: `Pressão convertida: ${round(bar * 14.5038)} psi`,
          details: [`${round(bar)} bar = ${round(bar * 14.5038)} psi`, `${round(bar)} bar = ${round(bar * 10.197)} mca`, `${round(psi)} psi = ${round(psi / 14.5038)} bar`, `${round(mca)} mca = ${round(mca / 10.197)} bar`],
        };
      }

      if (activeCalculator === 'power-converter') {
        const kw = n('kw', 'kW');
        const cv = n('cv', 'CV');
        const hp = n('hp', 'HP');
        return {
          error: null,
          cards: [
            { label: 'kW para CV/HP', value: `${round(kw / 0.7355)} CV`, helper: `${round(kw / 0.7457)} HP` },
            { label: 'CV para kW', value: `${round(cv * 0.7355)} kW`, helper: '1 CV ≈ 0,7355 kW' },
            { label: 'HP para kW', value: `${round(hp * 0.7457)} kW`, helper: '1 HP ≈ 0,7457 kW' },
          ],
          summary: `Potência: ${round(kw / 0.7355)} CV`,
          details: [`${round(kw)} kW = ${round(kw / 0.7355)} CV`, `${round(cv)} CV = ${round(cv * 0.7355)} kW`, `${round(hp)} HP = ${round(hp * 0.7457)} kW`],
        };
      }

      if (activeCalculator === 'btu-watts-converter') {
        const btuh = n('btuh', 'BTU/h');
        const watts = n('watts', 'watts');
        return {
          error: null,
          cards: [
            { label: 'BTU/h para W', value: `${round(btuh * 0.293071)} W`, helper: 'conversão térmica aproximada' },
            { label: 'W para BTU/h', value: `${round(watts / 0.293071)} BTU/h`, helper: 'conversão térmica aproximada' },
          ],
          summary: `${round(btuh)} BTU/h ≈ ${round(btuh * 0.293071)} W`,
          details: [`${round(btuh)} BTU/h = ${round(btuh * 0.293071)} W`, `${round(watts)} W = ${round(watts / 0.293071)} BTU/h`],
        };
      }

      if (activeCalculator === 'labor-budget') {
        const quantity = n('quantity', 'quantidade');
        const unitPrice = n('unitPrice', 'valor unitário');
        const subtotal = quantity * unitPrice;
        const travel = n('travelCost', 'deslocamento');
        const total = subtotal + travel;
        return {
          error: null,
          cards: [
            { label: 'Subtotal', value: money(subtotal), helper: `${round(quantity)} × ${money(unitPrice)}` },
            { label: 'Deslocamento', value: money(travel), helper: 'custo adicional' },
            { label: 'Total', value: money(total), helper: 'mão de obra estimada' },
          ],
          summary: `Mão de obra estimada: ${money(total)}`,
          details: [`Quantidade: ${round(quantity)}`, `Valor unitário: ${money(unitPrice)}`, `Deslocamento: ${money(travel)}`, `Total: ${money(total)}`],
        };
      }

      const material = n('materialCost', 'material');
      const labor = n('laborCost', 'mão de obra');
      const travel = n('travelCost', 'deslocamento');
      const profitPercent = n('profitPercent', 'lucro');
      const discountPercent = n('discountPercent', 'desconto');
      const taxPercent = n('taxPercent', 'impostos');
      const base = material + labor + travel;
      const profit = base * profitPercent / 100;
      const tax = (base + profit) * taxPercent / 100;
      const discount = (base + profit + tax) * discountPercent / 100;
      const total = base + profit + tax - discount;
      return {
        error: null,
        cards: [
          { label: 'Base', value: money(base), helper: 'material + mão de obra + deslocamento' },
          { label: 'Lucro/impostos', value: money(profit + tax), helper: `${round(profitPercent)}% lucro · ${round(taxPercent)}% impostos` },
          { label: 'Preço final', value: money(total), helper: discount > 0 ? `desconto ${money(discount)}` : 'sem desconto' },
        ],
        summary: `Preço final estimado: ${money(total)}`,
        details: [`Base: ${money(base)}`, `Lucro: ${money(profit)}`, `Impostos: ${money(tax)}`, `Desconto: ${money(discount)}`, `Total: ${money(total)}`],
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', cards: [], summary: '', details: [] };
    }
  }, [activeCalculator, values]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || result.cards.length === 0 || result.error) return;

    const capture: CalculationCapture = {
      id: createId('general-calc'),
      module: activeRule.module,
      moduleLabel: moduleLabel(activeRule.module),
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: result.summary,
      details: result.details,
    };

    onCaptureCalculation?.(capture);

    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no levantamento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no levantamento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveCalculator(null);
    setAddedMessage(null);
  }

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner">
        <div>
          <strong>{moduleLabel(selectedModule)}</strong>
          <span>Calculadoras iniciais para ampliar o OrçaOS além da elétrica.</span>
        </div>
        <em>{availableCalculators.length} cálculos</em>
      </div>

      <div className="general-picker-list">
        {availableCalculators.map((calculator) => (
          <button className="general-picker-card" key={calculator.mode} type="button" onClick={() => setActiveCalculator(calculator.mode)}>
            <span>
              <strong>{calculator.label}</strong>
              <small>{calculator.description}</small>
            </span>
            <em>LIVRE</em>
          </button>
        ))}
      </div>

      {activeCalculator && activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeCalculator} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header">
              <button type="button" onClick={closeCalculator}>‹</button>
              <div>
                <span>{moduleLabel(activeRule.module)}</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>LIVRE</em>
            </header>

            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {['wall-area', 'floor-area', 'concrete-volume', 'blocks-quantity', 'floor-tiles', 'paint-area', 'paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />}
              {['floor-area', 'concrete-volume', 'floor-tiles'].includes(activeCalculator) && <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />}
              {['wall-area', 'blocks-quantity', 'paint-area', 'paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Altura" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />}
              {['wall-area', 'paint-area', 'paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Quantidade de paredes" value={values.wallsQuantity} suffix="un." step={1} onChange={(value) => setValue('wallsQuantity', value)} />}
              {['wall-area', 'blocks-quantity', 'paint-area', 'paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Descontos" value={values.discountArea} suffix="m²" onChange={(value) => setValue('discountArea', value)} />}
              {['floor-area', 'concrete-volume', 'blocks-quantity', 'floor-tiles', 'paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Perda" value={values.lossPercent} suffix="%" onChange={(value) => setValue('lossPercent', value)} />}
              {activeCalculator === 'concrete-volume' && <><NumberField label="Espessura" value={values.thicknessCm} suffix="cm" onChange={(value) => setValue('thicknessCm', value)} /><NumberField label="Sacos de cimento por m³" value={values.cementBagsPerM3} suffix="sc/m³" onChange={(value) => setValue('cementBagsPerM3', value)} /></>}
              {activeCalculator === 'blocks-quantity' && <><NumberField label="Largura do bloco" value={values.blockWidthCm} suffix="cm" onChange={(value) => setValue('blockWidthCm', value)} /><NumberField label="Altura do bloco" value={values.blockHeightCm} suffix="cm" onChange={(value) => setValue('blockHeightCm', value)} /></>}
              {activeCalculator === 'floor-tiles' && <><NumberField label="Largura da peça" value={values.tileWidthCm} suffix="cm" onChange={(value) => setValue('tileWidthCm', value)} /><NumberField label="Altura da peça" value={values.tileHeightCm} suffix="cm" onChange={(value) => setValue('tileHeightCm', value)} /><NumberField label="Peças por caixa" value={values.piecesPerBox} suffix="un." step={1} onChange={(value) => setValue('piecesPerBox', value)} /></>}
              {['paint-area', 'paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Demãos" value={values.coats} suffix="x" step={1} onChange={(value) => setValue('coats', value)} />}
              {['paint-liters', 'paint-budget'].includes(activeCalculator) && <NumberField label="Rendimento da tinta" value={values.paintYieldM2PerLiter} suffix="m²/L" onChange={(value) => setValue('paintYieldM2PerLiter', value)} />}
              {activeCalculator === 'paint-budget' && <><NumberField label="Preço por litro" value={values.paintLiterPrice} suffix="R$/L" onChange={(value) => setValue('paintLiterPrice', value)} /><NumberField label="Mão de obra" value={values.laborPricePerM2} suffix="R$/m²" onChange={(value) => setValue('laborPricePerM2', value)} /></>}
              {activeCalculator === 'volume-converter' && <><NumberField label="Metros cúbicos" value={values.cubicMeters} suffix="m³" onChange={(value) => setValue('cubicMeters', value)} /><NumberField label="Litros" value={values.liters} suffix="L" onChange={(value) => setValue('liters', value)} /></>}
              {activeCalculator === 'pressure-converter' && <><NumberField label="Bar" value={values.bar} suffix="bar" onChange={(value) => setValue('bar', value)} /><NumberField label="PSI" value={values.psi} suffix="psi" onChange={(value) => setValue('psi', value)} /><NumberField label="MCA" value={values.mca} suffix="mca" onChange={(value) => setValue('mca', value)} /></>}
              {activeCalculator === 'power-converter' && <><NumberField label="kW" value={values.kw} suffix="kW" onChange={(value) => setValue('kw', value)} /><NumberField label="CV" value={values.cv} suffix="CV" onChange={(value) => setValue('cv', value)} /><NumberField label="HP" value={values.hp} suffix="HP" onChange={(value) => setValue('hp', value)} /></>}
              {activeCalculator === 'btu-watts-converter' && <><NumberField label="BTU/h" value={values.btuh} suffix="BTU/h" onChange={(value) => setValue('btuh', value)} /><NumberField label="Watts" value={values.watts} suffix="W" onChange={(value) => setValue('watts', value)} /></>}
              {activeCalculator === 'labor-budget' && <><NumberField label="Quantidade" value={values.quantity} suffix="un." onChange={(value) => setValue('quantity', value)} /><NumberField label="Valor unitário" value={values.unitPrice} suffix="R$" onChange={(value) => setValue('unitPrice', value)} /><NumberField label="Deslocamento" value={values.travelCost} suffix="R$" onChange={(value) => setValue('travelCost', value)} /></>}
              {activeCalculator === 'final-price' && <><NumberField label="Material" value={values.materialCost} suffix="R$" onChange={(value) => setValue('materialCost', value)} /><NumberField label="Mão de obra" value={values.laborCost} suffix="R$" onChange={(value) => setValue('laborCost', value)} /><NumberField label="Deslocamento" value={values.travelCost} suffix="R$" onChange={(value) => setValue('travelCost', value)} /><NumberField label="Lucro" value={values.profitPercent} suffix="%" onChange={(value) => setValue('profitPercent', value)} /><NumberField label="Impostos" value={values.taxPercent} suffix="%" onChange={(value) => setValue('taxPercent', value)} /><NumberField label="Desconto" value={values.discountPercent} suffix="%" onChange={(value) => setValue('discountPercent', value)} /></>}
            </form>

            {result.error && <p className="general-error-message">{result.error}</p>}

            {result.cards.length > 0 && (
              <div className="general-result-grid">
                {result.cards.map((card) => <ResultCard key={card.label} {...card} />)}
              </div>
            )}

            {addedMessage && <p className="general-added-message">{addedMessage}</p>}

            <div className="general-capture-actions">
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="general-technical-note">Cálculo preliminar para orçamento e levantamento. Valide medidas, perdas, materiais e condições reais da obra antes de fechar a proposta.</small>
          </section>
        </div>
      )}
    </div>
  );
}
