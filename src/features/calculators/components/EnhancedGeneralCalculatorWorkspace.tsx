import { useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import './GeneralCalculatorWorkspace.css';

export type GeneralCalculatorModule = 'obras' | 'pintura' | 'conversores' | 'orcamentoTecnico';

type CalculatorMode =
  | 'wall-area'
  | 'floor-area'
  | 'concrete-volume'
  | 'blocks-quantity'
  | 'floor-tiles'
  | 'subfloor-volume'
  | 'mortar-render'
  | 'baseboard-length'
  | 'grout-quantity'
  | 'roof-tiles'
  | 'paint-area'
  | 'paint-liters'
  | 'paint-budget'
  | 'primer-sealer'
  | 'wall-putty'
  | 'painting-time'
  | 'room-paint-budget'
  | 'volume-converter'
  | 'pressure-converter'
  | 'power-converter'
  | 'btu-watts-converter'
  | 'length-converter'
  | 'temperature-converter'
  | 'flow-converter'
  | 'labor-budget'
  | 'final-price'
  | 'daily-budget'
  | 'hourly-budget'
  | 'installment-budget'
  | 'upfront-balance';

interface EnhancedGeneralCalculatorWorkspaceProps {
  selectedModule: GeneralCalculatorModule;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
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

interface FieldConfig {
  key: string;
  label: string;
  suffix?: string;
  min?: number;
  step?: number;
}

interface CalculatorRule {
  mode: CalculatorMode;
  module: GeneralCalculatorModule;
  label: string;
  description: string;
  icon: string;
  plan: 'free' | 'pro';
  fields: FieldConfig[];
  compute: (read: (key: string, label: string) => number) => GeneralResult;
}

const defaultValues: Record<string, string> = {
  width: '3',
  height: '2.8',
  length: '4',
  area: '12',
  discountArea: '2',
  discountLength: '1',
  lossPercent: '10',
  thicknessCm: '8',
  cementBagsPerM3: '7',
  bagKg: '20',
  mortarKgPerM2Cm: '17',
  groutKgPerM2: '0.35',
  pieceLength: '2.4',
  inclinePercent: '30',
  tilesPerM2: '16',
  blockWidthCm: '39',
  blockHeightCm: '19',
  tileWidthCm: '60',
  tileHeightCm: '60',
  piecesPerBox: '4',
  wallsQuantity: '4',
  coats: '2',
  paintYieldM2PerLiter: '10',
  sealerYieldM2PerLiter: '12',
  puttyKgPerM2: '0.8',
  paintLiterPrice: '35',
  sealerLiterPrice: '22',
  laborPricePerM2: '18',
  productivityM2PerHour: '12',
  cubicMeters: '1',
  liters: '1000',
  meters: '1',
  inches: '1',
  celsius: '25',
  fahrenheit: '77',
  literPerMinute: '10',
  cubicMeterPerHour: '0.6',
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
  days: '2',
  dailyRate: '250',
  helperDailyRate: '120',
  hours: '6',
  hourlyRate: '80',
  totalCost: '900',
  installments: '3',
  interestPercent: '0',
  downPaymentPercent: '30',
};

function parseNumber(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return normalized ? Number(normalized) : Number.NaN;
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
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function moduleLabel(module: GeneralCalculatorModule): string {
  if (module === 'obras') return 'Construção civil';
  if (module === 'pintura') return 'Pintura e acabamento';
  if (module === 'conversores') return 'Conversores';
  return 'Orçamento técnico';
}

function card(label: string, value: string, helper?: string): ResultCardData {
  return { label, value, helper };
}

function build(summary: string, cards: ResultCardData[], details: string[]): GeneralResult {
  return { error: null, cards, summary, details };
}

const constructionCommonFields: FieldConfig[] = [
  { key: 'width', label: 'Largura', suffix: 'm' },
  { key: 'length', label: 'Comprimento', suffix: 'm' },
  { key: 'lossPercent', label: 'Perda', suffix: '%' },
];

const wallCommonFields: FieldConfig[] = [
  { key: 'width', label: 'Largura', suffix: 'm' },
  { key: 'height', label: 'Altura', suffix: 'm' },
  { key: 'wallsQuantity', label: 'Paredes', suffix: 'un.', step: 1 },
  { key: 'discountArea', label: 'Descontos', suffix: 'm²' },
];

const paintCommonFields: FieldConfig[] = [
  ...wallCommonFields,
  { key: 'coats', label: 'Demãos', suffix: 'x', step: 1 },
  { key: 'lossPercent', label: 'Perda', suffix: '%' },
];

function wallArea(read: (key: string, label: string) => number): number {
  return Math.max(read('width', 'largura') * read('height', 'altura') * read('wallsQuantity', 'paredes') - read('discountArea', 'descontos'), 0);
}

const calculatorRules: CalculatorRule[] = [
  {
    mode: 'wall-area', module: 'obras', label: 'Área de parede', description: 'Área bruta e líquida com desconto de portas e janelas.', icon: '▥', plan: 'free', fields: wallCommonFields,
    compute: (n) => {
      const gross = n('width', 'largura') * n('height', 'altura') * n('wallsQuantity', 'paredes');
      const net = Math.max(gross - n('discountArea', 'descontos'), 0);
      return build(`Área líquida de parede: ${round(net)} m²`, [card('Área bruta', `${round(gross)} m²`), card('Área líquida', `${round(net)} m²`)], [`Área bruta: ${round(gross)} m²`, `Área líquida: ${round(net)} m²`]);
    },
  },
  {
    mode: 'floor-area', module: 'obras', label: 'Área de piso/teto', description: 'Área retangular com perda para compra e orçamento.', icon: '▦', plan: 'free', fields: constructionCommonFields,
    compute: (n) => {
      const area = n('width', 'largura') * n('length', 'comprimento');
      const withLoss = area * (1 + n('lossPercent', 'perda') / 100);
      return build(`Área com perda: ${round(withLoss)} m²`, [card('Área base', `${round(area)} m²`), card('Com perda', `${round(withLoss)} m²`)], [`Área base: ${round(area)} m²`, `Com perda: ${round(withLoss)} m²`]);
    },
  },
  {
    mode: 'concrete-volume', module: 'obras', label: 'Volume de concreto', description: 'Volume em m³ com perda e sacos estimados.', icon: '◧', plan: 'free', fields: [...constructionCommonFields, { key: 'thicknessCm', label: 'Espessura', suffix: 'cm' }, { key: 'cementBagsPerM3', label: 'Sacos por m³', suffix: 'sc/m³' }],
    compute: (n) => {
      const volume = n('width', 'largura') * n('length', 'comprimento') * (n('thicknessCm', 'espessura') / 100);
      const withLoss = volume * (1 + n('lossPercent', 'perda') / 100);
      const bags = Math.ceil(withLoss * n('cementBagsPerM3', 'sacos por m³'));
      return build(`Concreto estimado: ${round(withLoss, 3)} m³`, [card('Volume', `${round(volume, 3)} m³`), card('Com perda', `${round(withLoss, 3)} m³`), card('Sacos', `${bags}`)], [`Volume: ${round(volume, 3)} m³`, `Com perda: ${round(withLoss, 3)} m³`, `Sacos: ${bags}`]);
    },
  },
  {
    mode: 'blocks-quantity', module: 'obras', label: 'Tijolos/blocos', description: 'Quantidade aproximada de blocos por parede.', icon: '▧', plan: 'free', fields: [...wallCommonFields, { key: 'blockWidthCm', label: 'Largura bloco', suffix: 'cm' }, { key: 'blockHeightCm', label: 'Altura bloco', suffix: 'cm' }, { key: 'lossPercent', label: 'Perda', suffix: '%' }],
    compute: (n) => {
      const area = wallArea(n);
      const blockArea = (n('blockWidthCm', 'largura do bloco') / 100) * (n('blockHeightCm', 'altura do bloco') / 100);
      const blocks = blockArea > 0 ? Math.ceil((area / blockArea) * (1 + n('lossPercent', 'perda') / 100)) : 0;
      return build(`Blocos/tijolos estimados: ${blocks} un.`, [card('Área líquida', `${round(area)} m²`), card('Blocos', `${blocks}`)], [`Área líquida: ${round(area)} m²`, `Blocos: ${blocks}`]);
    },
  },
  {
    mode: 'floor-tiles', module: 'obras', label: 'Piso/revestimento', description: 'Peças, caixas e perda para piso ou parede.', icon: '◫', plan: 'free', fields: [...constructionCommonFields, { key: 'tileWidthCm', label: 'Largura peça', suffix: 'cm' }, { key: 'tileHeightCm', label: 'Altura peça', suffix: 'cm' }, { key: 'piecesPerBox', label: 'Peças por caixa', suffix: 'un.', step: 1 }],
    compute: (n) => {
      const area = n('width', 'largura') * n('length', 'comprimento');
      const tileArea = (n('tileWidthCm', 'largura da peça') / 100) * (n('tileHeightCm', 'altura da peça') / 100);
      const pieces = tileArea > 0 ? Math.ceil((area / tileArea) * (1 + n('lossPercent', 'perda') / 100)) : 0;
      const boxes = n('piecesPerBox', 'peças por caixa') > 0 ? Math.ceil(pieces / n('piecesPerBox', 'peças por caixa')) : 0;
      return build(`Revestimento: ${pieces} peças / ${boxes} caixas`, [card('Área', `${round(area)} m²`), card('Peças', `${pieces}`), card('Caixas', `${boxes}`)], [`Área: ${round(area)} m²`, `Peças: ${pieces}`, `Caixas: ${boxes}`]);
    },
  },
  {
    mode: 'subfloor-volume', module: 'obras', label: 'Contrapiso', description: 'Volume de contrapiso por área, espessura e perda.', icon: '▰', plan: 'free', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'thicknessCm', label: 'Espessura', suffix: 'cm' }, { key: 'lossPercent', label: 'Perda', suffix: '%' }, { key: 'cementBagsPerM3', label: 'Sacos por m³', suffix: 'sc/m³' }],
    compute: (n) => {
      const volume = n('area', 'área') * (n('thicknessCm', 'espessura') / 100);
      const withLoss = volume * (1 + n('lossPercent', 'perda') / 100);
      const bags = Math.ceil(withLoss * n('cementBagsPerM3', 'sacos por m³'));
      return build(`Contrapiso: ${round(withLoss, 3)} m³`, [card('Volume', `${round(volume, 3)} m³`), card('Com perda', `${round(withLoss, 3)} m³`), card('Sacos', `${bags}`)], [`Volume: ${round(volume, 3)} m³`, `Com perda: ${round(withLoss, 3)} m³`, `Sacos: ${bags}`]);
    },
  },
  {
    mode: 'mortar-render', module: 'obras', label: 'Reboco/argamassa', description: 'Consumo estimado de argamassa por área e espessura.', icon: '▤', plan: 'free', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'thicknessCm', label: 'Espessura', suffix: 'cm' }, { key: 'mortarKgPerM2Cm', label: 'Consumo', suffix: 'kg/m²/cm' }, { key: 'bagKg', label: 'Peso do saco', suffix: 'kg' }, { key: 'lossPercent', label: 'Perda', suffix: '%' }],
    compute: (n) => {
      const kg = n('area', 'área') * n('thicknessCm', 'espessura') * n('mortarKgPerM2Cm', 'consumo') * (1 + n('lossPercent', 'perda') / 100);
      const bags = Math.ceil(kg / n('bagKg', 'peso do saco'));
      return build(`Argamassa: ${round(kg)} kg / ${bags} sacos`, [card('Argamassa', `${round(kg)} kg`), card('Sacos', `${bags}`)], [`Argamassa: ${round(kg)} kg`, `Sacos: ${bags}`]);
    },
  },
  {
    mode: 'baseboard-length', module: 'obras', label: 'Rodapé', description: 'Metros lineares e peças de rodapé por ambiente.', icon: '▭', plan: 'pro', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'discountLength', label: 'Desconto linear', suffix: 'm' }, { key: 'pieceLength', label: 'Comprimento peça', suffix: 'm' }, { key: 'lossPercent', label: 'Perda', suffix: '%' }],
    compute: (n) => {
      const perimeter = Math.max(2 * (n('width', 'largura') + n('length', 'comprimento')) - n('discountLength', 'desconto linear'), 0);
      const withLoss = perimeter * (1 + n('lossPercent', 'perda') / 100);
      const pieces = Math.ceil(withLoss / n('pieceLength', 'comprimento da peça'));
      return build(`Rodapé: ${round(withLoss)} m / ${pieces} peças`, [card('Rodapé líquido', `${round(perimeter)} m`), card('Com perda', `${round(withLoss)} m`), card('Peças', `${pieces}`)], [`Rodapé: ${round(perimeter)} m`, `Com perda: ${round(withLoss)} m`, `Peças: ${pieces}`]);
    },
  },
  {
    mode: 'grout-quantity', module: 'obras', label: 'Rejunte', description: 'Consumo estimado de rejunte por área revestida.', icon: '▩', plan: 'pro', fields: [{ key: 'area', label: 'Área revestida', suffix: 'm²' }, { key: 'groutKgPerM2', label: 'Consumo', suffix: 'kg/m²' }, { key: 'bagKg', label: 'Peso embalagem', suffix: 'kg' }, { key: 'lossPercent', label: 'Perda', suffix: '%' }],
    compute: (n) => {
      const kg = n('area', 'área') * n('groutKgPerM2', 'consumo') * (1 + n('lossPercent', 'perda') / 100);
      const bags = Math.ceil(kg / n('bagKg', 'peso embalagem'));
      return build(`Rejunte: ${round(kg)} kg`, [card('Rejunte', `${round(kg)} kg`), card('Embalagens', `${bags}`)], [`Rejunte: ${round(kg)} kg`, `Embalagens: ${bags}`]);
    },
  },
  {
    mode: 'roof-tiles', module: 'obras', label: 'Telhado básico', description: 'Área inclinada e quantidade estimada de telhas.', icon: '⌂', plan: 'pro', fields: [{ key: 'width', label: 'Largura projeção', suffix: 'm' }, { key: 'length', label: 'Comprimento projeção', suffix: 'm' }, { key: 'inclinePercent', label: 'Inclinação', suffix: '%' }, { key: 'tilesPerM2', label: 'Telhas por m²', suffix: 'un./m²' }, { key: 'lossPercent', label: 'Perda', suffix: '%' }],
    compute: (n) => {
      const projected = n('width', 'largura') * n('length', 'comprimento');
      const roofArea = projected * Math.sqrt(1 + (n('inclinePercent', 'inclinação') / 100) ** 2);
      const withLoss = roofArea * (1 + n('lossPercent', 'perda') / 100);
      const tiles = Math.ceil(withLoss * n('tilesPerM2', 'telhas por m²'));
      return build(`Telhado: ${round(withLoss)} m² / ${tiles} telhas`, [card('Área inclinada', `${round(roofArea)} m²`), card('Com perda', `${round(withLoss)} m²`), card('Telhas', `${tiles}`)], [`Área projetada: ${round(projected)} m²`, `Área inclinada: ${round(roofArea)} m²`, `Telhas: ${tiles}`]);
    },
  },
  {
    mode: 'paint-area', module: 'pintura', label: 'Área a pintar', description: 'Área de paredes/teto com descontos e demãos.', icon: '▨', plan: 'free', fields: paintCommonFields,
    compute: (n) => {
      const area = wallArea(n);
      const paintedArea = area * n('coats', 'demãos');
      return build(`Área pintada: ${round(paintedArea)} m²`, [card('Área líquida', `${round(area)} m²`), card('Área pintada', `${round(paintedArea)} m²`)], [`Área líquida: ${round(area)} m²`, `Área pintada: ${round(paintedArea)} m²`]);
    },
  },
  {
    mode: 'paint-liters', module: 'pintura', label: 'Litros de tinta', description: 'Quantidade de tinta por área, rendimento e demãos.', icon: '◍', plan: 'free', fields: [...paintCommonFields, { key: 'paintYieldM2PerLiter', label: 'Rendimento', suffix: 'm²/L' }],
    compute: (n) => {
      const area = wallArea(n);
      const liters = area * n('coats', 'demãos') / n('paintYieldM2PerLiter', 'rendimento') * (1 + n('lossPercent', 'perda') / 100);
      return build(`Tinta estimada: ${round(liters)} L`, [card('Litros', `${round(liters)} L`), card('Galões 3,6 L', `${Math.ceil(liters / 3.6)}`), card('Latas 18 L', `${Math.ceil(liters / 18)}`)], [`Litros: ${round(liters)} L`, `Galões: ${Math.ceil(liters / 3.6)}`, `Latas: ${Math.ceil(liters / 18)}`]);
    },
  },
  {
    mode: 'paint-budget', module: 'pintura', label: 'Orçamento pintura', description: 'Material e mão de obra por m² para pintura.', icon: '▣', plan: 'free', fields: [...paintCommonFields, { key: 'paintYieldM2PerLiter', label: 'Rendimento', suffix: 'm²/L' }, { key: 'paintLiterPrice', label: 'Preço por litro', suffix: 'R$/L' }, { key: 'laborPricePerM2', label: 'Mão de obra', suffix: 'R$/m²' }],
    compute: (n) => {
      const area = wallArea(n);
      const liters = area * n('coats', 'demãos') / n('paintYieldM2PerLiter', 'rendimento') * (1 + n('lossPercent', 'perda') / 100);
      const material = liters * n('paintLiterPrice', 'preço por litro');
      const labor = area * n('laborPricePerM2', 'mão de obra por m²');
      const total = material + labor;
      return build(`Orçamento de pintura: ${money(total)}`, [card('Material', money(material), `${round(liters)} L`), card('Mão de obra', money(labor)), card('Total', money(total))], [`Área: ${round(area)} m²`, `Material: ${money(material)}`, `Mão de obra: ${money(labor)}`, `Total: ${money(total)}`]);
    },
  },
  {
    mode: 'primer-sealer', module: 'pintura', label: 'Selador/fundo', description: 'Quantidade de selador ou fundo preparador.', icon: '◌', plan: 'free', fields: [...paintCommonFields, { key: 'sealerYieldM2PerLiter', label: 'Rendimento', suffix: 'm²/L' }],
    compute: (n) => {
      const area = wallArea(n);
      const liters = area * n('coats', 'demãos') / n('sealerYieldM2PerLiter', 'rendimento') * (1 + n('lossPercent', 'perda') / 100);
      return build(`Selador/fundo: ${round(liters)} L`, [card('Litros', `${round(liters)} L`), card('Galões 3,6 L', `${Math.ceil(liters / 3.6)}`)], [`Área: ${round(area)} m²`, `Litros: ${round(liters)} L`]);
    },
  },
  {
    mode: 'wall-putty', module: 'pintura', label: 'Massa corrida', description: 'Consumo estimado de massa por área e demãos.', icon: '▢', plan: 'free', fields: [...paintCommonFields, { key: 'puttyKgPerM2', label: 'Consumo massa', suffix: 'kg/m²/demão' }],
    compute: (n) => {
      const area = wallArea(n);
      const kg = area * n('puttyKgPerM2', 'consumo') * n('coats', 'demãos') * (1 + n('lossPercent', 'perda') / 100);
      return build(`Massa corrida: ${round(kg)} kg`, [card('Massa', `${round(kg)} kg`), card('Baldes 25 kg', `${Math.ceil(kg / 25)}`)], [`Área: ${round(area)} m²`, `Massa: ${round(kg)} kg`]);
    },
  },
  {
    mode: 'painting-time', module: 'pintura', label: 'Tempo de pintura', description: 'Tempo estimado pela produtividade por hora.', icon: 'h', plan: 'free', fields: [...paintCommonFields, { key: 'productivityM2PerHour', label: 'Produtividade', suffix: 'm²/h' }],
    compute: (n) => {
      const paintedArea = wallArea(n) * n('coats', 'demãos');
      const hours = paintedArea / n('productivityM2PerHour', 'produtividade');
      return build(`Tempo de pintura: ${round(hours)} h`, [card('Tempo', `${round(hours)} h`), card('Dias de 8h', `${round(hours / 8)}`)], [`Área pintada: ${round(paintedArea)} m²`, `Tempo: ${round(hours)} h`]);
    },
  },
  {
    mode: 'room-paint-budget', module: 'pintura', label: 'Orçamento por cômodo', description: 'Pintura completa por cômodo com selador, tinta e mão de obra.', icon: 'R$', plan: 'free', fields: [...paintCommonFields, { key: 'paintYieldM2PerLiter', label: 'Rendimento tinta', suffix: 'm²/L' }, { key: 'sealerYieldM2PerLiter', label: 'Rendimento selador', suffix: 'm²/L' }, { key: 'paintLiterPrice', label: 'Preço tinta', suffix: 'R$/L' }, { key: 'sealerLiterPrice', label: 'Preço selador', suffix: 'R$/L' }, { key: 'laborPricePerM2', label: 'Mão de obra', suffix: 'R$/m²' }],
    compute: (n) => {
      const area = wallArea(n);
      const paintLiters = area * n('coats', 'demãos') / n('paintYieldM2PerLiter', 'rendimento tinta') * (1 + n('lossPercent', 'perda') / 100);
      const sealerLiters = area / n('sealerYieldM2PerLiter', 'rendimento selador');
      const material = paintLiters * n('paintLiterPrice', 'preço tinta') + sealerLiters * n('sealerLiterPrice', 'preço selador');
      const labor = area * n('laborPricePerM2', 'mão de obra');
      const total = material + labor;
      return build(`Orçamento por cômodo: ${money(total)}`, [card('Material', money(material)), card('Mão de obra', money(labor)), card('Total', money(total))], [`Área: ${round(area)} m²`, `Material: ${money(material)}`, `Mão de obra: ${money(labor)}`, `Total: ${money(total)}`]);
    },
  },
  {
    mode: 'volume-converter', module: 'conversores', label: 'm³ ↔ litros', description: 'Conversão rápida entre metros cúbicos e litros.', icon: '≋', plan: 'free', fields: [{ key: 'cubicMeters', label: 'Metros cúbicos', suffix: 'm³' }, { key: 'liters', label: 'Litros', suffix: 'L' }],
    compute: (n) => build(`${round(n('cubicMeters', 'm³') * 1000)} L`, [card('m³ para litros', `${round(n('cubicMeters', 'm³') * 1000)} L`), card('litros para m³', `${round(n('liters', 'litros') / 1000, 3)} m³`)], [`m³ para litros`, `litros para m³`]),
  },
  {
    mode: 'pressure-converter', module: 'conversores', label: 'bar / psi / mca', description: 'Conversão básica de pressão para hidráulica e bombas.', icon: '↕', plan: 'free', fields: [{ key: 'bar', label: 'Bar', suffix: 'bar' }, { key: 'psi', label: 'PSI', suffix: 'psi' }, { key: 'mca', label: 'MCA', suffix: 'mca' }],
    compute: (n) => build(`Pressão: ${round(n('bar', 'bar') * 14.5038)} psi`, [card('bar para psi', `${round(n('bar', 'bar') * 14.5038)} psi`), card('bar para mca', `${round(n('bar', 'bar') * 10.197)} mca`), card('psi para bar', `${round(n('psi', 'psi') / 14.5038)} bar`)], [`Conversão de pressão`]),
  },
  {
    mode: 'power-converter', module: 'conversores', label: 'CV / HP / kW', description: 'Conversão de potência para motores e equipamentos.', icon: '⚙', plan: 'free', fields: [{ key: 'kw', label: 'kW', suffix: 'kW' }, { key: 'cv', label: 'CV', suffix: 'CV' }, { key: 'hp', label: 'HP', suffix: 'HP' }],
    compute: (n) => build(`Potência: ${round(n('kw', 'kW') / 0.7355)} CV`, [card('kW para CV', `${round(n('kw', 'kW') / 0.7355)} CV`), card('CV para kW', `${round(n('cv', 'CV') * 0.7355)} kW`), card('HP para kW', `${round(n('hp', 'HP') * 0.7457)} kW`)], [`Conversão de potência`]),
  },
  {
    mode: 'btu-watts-converter', module: 'conversores', label: 'BTU/h ↔ W', description: 'Conversão para refrigeração e potência térmica.', icon: '❄', plan: 'free', fields: [{ key: 'btuh', label: 'BTU/h', suffix: 'BTU/h' }, { key: 'watts', label: 'Watts', suffix: 'W' }],
    compute: (n) => build(`${round(n('btuh', 'BTU/h'))} BTU/h ≈ ${round(n('btuh', 'BTU/h') * 0.293071)} W`, [card('BTU/h para W', `${round(n('btuh', 'BTU/h') * 0.293071)} W`), card('W para BTU/h', `${round(n('watts', 'watts') / 0.293071)} BTU/h`)], [`Conversão térmica`]),
  },
  {
    mode: 'length-converter', module: 'conversores', label: 'Medidas', description: 'Conversão entre metro, centímetro, milímetro e polegada.', icon: '↔', plan: 'free', fields: [{ key: 'meters', label: 'Metros', suffix: 'm' }, { key: 'inches', label: 'Polegadas', suffix: 'pol' }],
    compute: (n) => build(`${round(n('meters', 'metros'))} m = ${round(n('meters', 'metros') * 100)} cm`, [card('m para cm', `${round(n('meters', 'metros') * 100)} cm`), card('m para mm', `${round(n('meters', 'metros') * 1000)} mm`), card('pol para mm', `${round(n('inches', 'polegadas') * 25.4)} mm`)], [`Conversão de medidas`]),
  },
  {
    mode: 'temperature-converter', module: 'conversores', label: 'Temperatura', description: 'Conversão entre Celsius e Fahrenheit.', icon: '℃', plan: 'free', fields: [{ key: 'celsius', label: 'Celsius', suffix: '°C' }, { key: 'fahrenheit', label: 'Fahrenheit', suffix: '°F' }],
    compute: (n) => build(`${round(n('celsius', 'Celsius'))} °C = ${round(n('celsius', 'Celsius') * 9 / 5 + 32)} °F`, [card('°C para °F', `${round(n('celsius', 'Celsius') * 9 / 5 + 32)} °F`), card('°F para °C', `${round((n('fahrenheit', 'Fahrenheit') - 32) * 5 / 9)} °C`)], [`Conversão de temperatura`]),
  },
  {
    mode: 'flow-converter', module: 'conversores', label: 'Vazão', description: 'Conversão entre L/min, L/h e m³/h.', icon: '≈', plan: 'free', fields: [{ key: 'literPerMinute', label: 'Litros/min', suffix: 'L/min' }, { key: 'cubicMeterPerHour', label: 'm³/h', suffix: 'm³/h' }],
    compute: (n) => build(`${round(n('literPerMinute', 'L/min'))} L/min = ${round(n('literPerMinute', 'L/min') * 0.06)} m³/h`, [card('L/min para L/h', `${round(n('literPerMinute', 'L/min') * 60)} L/h`), card('L/min para m³/h', `${round(n('literPerMinute', 'L/min') * 0.06)} m³/h`), card('m³/h para L/min', `${round(n('cubicMeterPerHour', 'm³/h') * 1000 / 60)} L/min`)], [`Conversão de vazão`]),
  },
  {
    mode: 'labor-budget', module: 'orcamentoTecnico', label: 'Mão de obra', description: 'Preço por unidade, ponto, metro ou m².', icon: 'R$', plan: 'free', fields: [{ key: 'quantity', label: 'Quantidade', suffix: 'un.' }, { key: 'unitPrice', label: 'Valor unitário', suffix: 'R$' }, { key: 'travelCost', label: 'Deslocamento', suffix: 'R$' }],
    compute: (n) => {
      const subtotal = n('quantity', 'quantidade') * n('unitPrice', 'valor unitário');
      const total = subtotal + n('travelCost', 'deslocamento');
      return build(`Mão de obra estimada: ${money(total)}`, [card('Subtotal', money(subtotal)), card('Deslocamento', money(n('travelCost', 'deslocamento'))), card('Total', money(total))], [`Subtotal: ${money(subtotal)}`, `Total: ${money(total)}`]);
    },
  },
  {
    mode: 'final-price', module: 'orcamentoTecnico', label: 'Preço final', description: 'Material, mão de obra, lucro, impostos, desconto e deslocamento.', icon: 'Σ', plan: 'free', fields: [{ key: 'materialCost', label: 'Material', suffix: 'R$' }, { key: 'laborCost', label: 'Mão de obra', suffix: 'R$' }, { key: 'travelCost', label: 'Deslocamento', suffix: 'R$' }, { key: 'profitPercent', label: 'Lucro', suffix: '%' }, { key: 'taxPercent', label: 'Impostos', suffix: '%' }, { key: 'discountPercent', label: 'Desconto', suffix: '%' }],
    compute: (n) => {
      const base = n('materialCost', 'material') + n('laborCost', 'mão de obra') + n('travelCost', 'deslocamento');
      const profit = base * n('profitPercent', 'lucro') / 100;
      const tax = (base + profit) * n('taxPercent', 'impostos') / 100;
      const discount = (base + profit + tax) * n('discountPercent', 'desconto') / 100;
      const total = base + profit + tax - discount;
      return build(`Preço final estimado: ${money(total)}`, [card('Base', money(base)), card('Lucro/impostos', money(profit + tax)), card('Preço final', money(total))], [`Base: ${money(base)}`, `Lucro: ${money(profit)}`, `Impostos: ${money(tax)}`, `Desconto: ${money(discount)}`, `Total: ${money(total)}`]);
    },
  },
  {
    mode: 'daily-budget', module: 'orcamentoTecnico', label: 'Diária', description: 'Cálculo de preço por diária, ajudante e deslocamento.', icon: 'D', plan: 'free', fields: [{ key: 'days', label: 'Dias', suffix: 'd' }, { key: 'dailyRate', label: 'Diária profissional', suffix: 'R$' }, { key: 'helperDailyRate', label: 'Diária ajudante', suffix: 'R$' }, { key: 'travelCost', label: 'Deslocamento', suffix: 'R$' }],
    compute: (n) => {
      const labor = n('days', 'dias') * (n('dailyRate', 'diária') + n('helperDailyRate', 'diária ajudante'));
      const total = labor + n('travelCost', 'deslocamento');
      return build(`Orçamento por diária: ${money(total)}`, [card('Mão de obra', money(labor)), card('Total', money(total))], [`Mão de obra: ${money(labor)}`, `Total: ${money(total)}`]);
    },
  },
  {
    mode: 'hourly-budget', module: 'orcamentoTecnico', label: 'Hora técnica', description: 'Cálculo de preço por hora técnica.', icon: 'H', plan: 'free', fields: [{ key: 'hours', label: 'Horas', suffix: 'h' }, { key: 'hourlyRate', label: 'Valor hora', suffix: 'R$/h' }, { key: 'travelCost', label: 'Deslocamento', suffix: 'R$' }],
    compute: (n) => {
      const subtotal = n('hours', 'horas') * n('hourlyRate', 'valor hora');
      const total = subtotal + n('travelCost', 'deslocamento');
      return build(`Hora técnica: ${money(total)}`, [card('Horas', money(subtotal)), card('Total', money(total))], [`Subtotal: ${money(subtotal)}`, `Total: ${money(total)}`]);
    },
  },
  {
    mode: 'installment-budget', module: 'orcamentoTecnico', label: 'Parcelamento', description: 'Valor de parcela com juros simples opcional.', icon: '÷', plan: 'free', fields: [{ key: 'totalCost', label: 'Valor total', suffix: 'R$' }, { key: 'installments', label: 'Parcelas', suffix: 'x', step: 1 }, { key: 'interestPercent', label: 'Juros simples', suffix: '%' }],
    compute: (n) => {
      const total = n('totalCost', 'valor total');
      const totalWithInterest = total * (1 + n('interestPercent', 'juros') / 100);
      const installment = totalWithInterest / n('installments', 'parcelas');
      return build(`Parcelamento: ${round(n('installments', 'parcelas'))}x de ${money(installment)}`, [card('Total', money(totalWithInterest)), card('Parcela', money(installment))], [`Total: ${money(totalWithInterest)}`, `Parcela: ${money(installment)}`]);
    },
  },
  {
    mode: 'upfront-balance', module: 'orcamentoTecnico', label: 'Sinal e saldo', description: 'Cálculo de entrada/sinal e saldo restante.', icon: '⇆', plan: 'free', fields: [{ key: 'totalCost', label: 'Valor total', suffix: 'R$' }, { key: 'downPaymentPercent', label: 'Sinal', suffix: '%' }],
    compute: (n) => {
      const total = n('totalCost', 'valor total');
      const upfront = total * n('downPaymentPercent', 'sinal') / 100;
      const balance = total - upfront;
      return build(`Sinal: ${money(upfront)} · saldo: ${money(balance)}`, [card('Sinal', money(upfront)), card('Saldo', money(balance))], [`Sinal: ${money(upfront)}`, `Saldo: ${money(balance)}`]);
    },
  },
];

function ResultCard({ label, value, helper }: ResultCardData) {
  return (
    <article className="general-result-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

function NumberField({ label, value, suffix, min = 0, step = 0.01, onChange }: FieldConfig & { value: string; onChange: (value: string) => void }) {
  return (
    <label className="general-form-field">
      <span>{label}</span>
      <div>
        <input type="number" inputMode="decimal" min={min} step={step} value={value} placeholder="Digite o valor" onChange={(event) => onChange(event.target.value)} />
        {suffix && <small>{suffix}</small>}
      </div>
    </label>
  );
}

export function GeneralCalculatorWorkspace({ selectedModule, onCaptureCalculation }: EnhancedGeneralCalculatorWorkspaceProps) {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const availableCalculators = useMemo(() => calculatorRules.filter((rule) => rule.module === selectedModule), [selectedModule]);
  const activeRule = activeCalculator ? calculatorRules.find((rule) => rule.mode === activeCalculator) : null;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function readValue(key: string, label: string): number {
    return ensurePositive(parseNumber(values[key] ?? ''), label);
  }

  const result = useMemo<GeneralResult>(() => {
    if (!activeRule) return { error: null, cards: [], summary: '', details: [] };
    try {
      return activeRule.compute(readValue);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', cards: [], summary: '', details: [] };
    }
  }, [activeRule, values]);

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
          <span>Rodada expandida de cálculos para publicação inicial do OrçaOS.</span>
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
            <em>{calculator.plan === 'pro' ? 'PRO' : 'LIVRE'}</em>
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
                <span>{moduleLabel(activeRule.module)}</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>{activeRule.plan === 'pro' ? 'PRO' : 'LIVRE'}</em>
            </header>

            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.fields.map((field) => (
                <NumberField key={field.key} {...field} value={values[field.key] ?? ''} onChange={(value) => setValue(field.key, value)} />
              ))}
            </form>

            {result.error && <p className="general-error-message">{result.error}</p>}
            {result.cards.length > 0 && <div className="general-result-grid">{result.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}

            <div className="general-capture-actions">
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="general-technical-note">Cálculo preliminar para orçamento e levantamento. Valide medidas, perdas, materiais e condições reais antes de fechar a proposta.</small>
          </section>
        </div>
      )}
    </div>
  );
}
