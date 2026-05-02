import { useState } from 'react';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import './GeneralCalculatorWorkspace.css';

export type GeneralCalculatorModule = 'obras' | 'pintura' | 'conversores' | 'orcamentoTecnico';

type RuleMode =
  | 'wall-area'
  | 'floor-area'
  | 'concrete-volume'
  | 'blocks'
  | 'tiles'
  | 'subfloor'
  | 'mortar'
  | 'baseboard'
  | 'grout'
  | 'roof'
  | 'paint-area'
  | 'paint-liters'
  | 'paint-budget'
  | 'sealer'
  | 'putty'
  | 'paint-time'
  | 'room-paint'
  | 'volume'
  | 'pressure'
  | 'power'
  | 'btu'
  | 'length'
  | 'temperature'
  | 'flow'
  | 'labor'
  | 'final-price'
  | 'daily'
  | 'hourly'
  | 'installments'
  | 'upfront';

interface Props {
  selectedModule: GeneralCalculatorModule;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface FieldConfig {
  key: string;
  label: string;
  suffix?: string;
  min?: number;
  step?: number;
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
}

interface Rule {
  mode: RuleMode;
  module: GeneralCalculatorModule;
  label: string;
  description: string;
  icon: string;
  plan: 'free' | 'pro';
  fields: FieldConfig[];
  compute: (n: (key: string, label: string) => number) => CalcResult;
}

const defaultValues: Record<string, string> = {
  width: '3',
  length: '4',
  height: '2.8',
  area: '12',
  walls: '4',
  discountArea: '2',
  loss: '10',
  thickness: '8',
  bagsPerM3: '7',
  bagKg: '20',
  blockWidth: '39',
  blockHeight: '19',
  tileWidth: '60',
  tileHeight: '60',
  piecesPerBox: '4',
  kgPerM2Cm: '17',
  groutKgM2: '0.35',
  pieceLength: '2.4',
  discountLength: '1',
  roofSlope: '30',
  tilesPerM2: '16',
  coats: '2',
  paintYield: '10',
  sealerYield: '12',
  puttyKgM2: '0.8',
  paintPrice: '35',
  sealerPrice: '22',
  laborM2: '18',
  productivity: '12',
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
  meters: '1',
  inches: '1',
  celsius: '25',
  fahrenheit: '77',
  literMinute: '10',
  m3Hour: '0.6',
  quantity: '10',
  unitValue: '45',
  material: '300',
  labor: '500',
  travel: '50',
  profit: '25',
  tax: '0',
  discount: '0',
  days: '2',
  daily: '250',
  helperDaily: '120',
  hours: '6',
  hourly: '80',
  total: '900',
  installments: '3',
  interest: '0',
  upfront: '30',
};

function parseNumber(value: string): number {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function requireNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`);
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

function result(summary: string, cards: ResultCardData[], details: string[]): CalcResult {
  return { error: null, summary, cards, details };
}

function card(label: string, value: string, helper?: string): ResultCardData {
  return { label, value, helper };
}

function moduleLabel(module: GeneralCalculatorModule): string {
  if (module === 'obras') return 'Construção civil';
  if (module === 'pintura') return 'Pintura e acabamento';
  if (module === 'conversores') return 'Conversores';
  return 'Orçamento técnico';
}

function wallArea(n: (key: string, label: string) => number): number {
  return Math.max(n('width', 'largura') * n('height', 'altura') * n('walls', 'paredes') - n('discountArea', 'descontos'), 0);
}

const wallFields: FieldConfig[] = [
  { key: 'width', label: 'Largura', suffix: 'm' },
  { key: 'height', label: 'Altura', suffix: 'm' },
  { key: 'walls', label: 'Paredes', suffix: 'un.', step: 1 },
  { key: 'discountArea', label: 'Descontos', suffix: 'm²' },
];

const rules: Rule[] = [
  { mode: 'wall-area', module: 'obras', label: 'Área de parede', description: 'Área bruta e líquida com descontos.', icon: '▥', plan: 'free', fields: wallFields, compute: (n) => { const gross = n('width','largura') * n('height','altura') * n('walls','paredes'); const net = wallArea(n); return result(`Área líquida: ${round(net)} m²`, [card('Área bruta', `${round(gross)} m²`), card('Área líquida', `${round(net)} m²`)], [`Área bruta: ${round(gross)} m²`, `Área líquida: ${round(net)} m²`]); } },
  { mode: 'floor-area', module: 'obras', label: 'Área de piso/teto', description: 'Área retangular com perda.', icon: '▦', plan: 'free', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const area = n('width','largura') * n('length','comprimento'); const total = area * (1 + n('loss','perda') / 100); return result(`Área com perda: ${round(total)} m²`, [card('Área', `${round(area)} m²`), card('Com perda', `${round(total)} m²`)], [`Área: ${round(area)} m²`, `Com perda: ${round(total)} m²`]); } },
  { mode: 'concrete-volume', module: 'obras', label: 'Volume de concreto', description: 'Volume, perda e sacos estimados.', icon: '◧', plan: 'free', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'thickness', label: 'Espessura', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }, { key: 'bagsPerM3', label: 'Sacos por m³', suffix: 'sc/m³' }], compute: (n) => { const volume = n('width','largura') * n('length','comprimento') * n('thickness','espessura') / 100; const total = volume * (1 + n('loss','perda') / 100); const bags = Math.ceil(total * n('bagsPerM3','sacos')); return result(`Concreto: ${round(total, 3)} m³`, [card('Volume', `${round(volume, 3)} m³`), card('Com perda', `${round(total, 3)} m³`), card('Sacos', `${bags}`)], [`Volume: ${round(volume, 3)} m³`, `Com perda: ${round(total, 3)} m³`, `Sacos: ${bags}`]); } },
  { mode: 'blocks', module: 'obras', label: 'Tijolos/blocos', description: 'Quantidade por área de parede.', icon: '▧', plan: 'free', fields: [...wallFields, { key: 'blockWidth', label: 'Largura bloco', suffix: 'cm' }, { key: 'blockHeight', label: 'Altura bloco', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const area = wallArea(n); const blockArea = n('blockWidth','largura bloco') / 100 * n('blockHeight','altura bloco') / 100; const blocks = blockArea > 0 ? Math.ceil(area / blockArea * (1 + n('loss','perda') / 100)) : 0; return result(`Blocos: ${blocks} un.`, [card('Área líquida', `${round(area)} m²`), card('Blocos', `${blocks}`)], [`Área: ${round(area)} m²`, `Blocos: ${blocks}`]); } },
  { mode: 'tiles', module: 'obras', label: 'Piso/revestimento', description: 'Peças e caixas com perda.', icon: '◫', plan: 'free', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'tileWidth', label: 'Largura peça', suffix: 'cm' }, { key: 'tileHeight', label: 'Altura peça', suffix: 'cm' }, { key: 'piecesPerBox', label: 'Peças/caixa', suffix: 'un.' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const area = n('width','largura') * n('length','comprimento'); const tileArea = n('tileWidth','largura peça') / 100 * n('tileHeight','altura peça') / 100; const pieces = tileArea > 0 ? Math.ceil(area / tileArea * (1 + n('loss','perda') / 100)) : 0; const boxes = Math.ceil(pieces / n('piecesPerBox','peças/caixa')); return result(`Revestimento: ${pieces} peças / ${boxes} caixas`, [card('Área', `${round(area)} m²`), card('Peças', `${pieces}`), card('Caixas', `${boxes}`)], [`Área: ${round(area)} m²`, `Peças: ${pieces}`, `Caixas: ${boxes}`]); } },
  { mode: 'subfloor', module: 'obras', label: 'Contrapiso', description: 'Volume por área e espessura.', icon: '▰', plan: 'free', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'thickness', label: 'Espessura', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const volume = n('area','área') * n('thickness','espessura') / 100; const total = volume * (1 + n('loss','perda') / 100); return result(`Contrapiso: ${round(total, 3)} m³`, [card('Volume', `${round(volume, 3)} m³`), card('Com perda', `${round(total, 3)} m³`)], [`Volume: ${round(volume, 3)} m³`, `Com perda: ${round(total, 3)} m³`]); } },
  { mode: 'mortar', module: 'obras', label: 'Reboco/argamassa', description: 'Consumo de argamassa.', icon: '▤', plan: 'free', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'thickness', label: 'Espessura', suffix: 'cm' }, { key: 'kgPerM2Cm', label: 'Consumo', suffix: 'kg/m²/cm' }, { key: 'bagKg', label: 'Peso saco', suffix: 'kg' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const kg = n('area','área') * n('thickness','espessura') * n('kgPerM2Cm','consumo') * (1 + n('loss','perda') / 100); const bags = Math.ceil(kg / n('bagKg','peso saco')); return result(`Argamassa: ${round(kg)} kg`, [card('Kg', `${round(kg)} kg`), card('Sacos', `${bags}`)], [`Argamassa: ${round(kg)} kg`, `Sacos: ${bags}`]); } },
  { mode: 'baseboard', module: 'obras', label: 'Rodapé', description: 'Metros e peças de rodapé.', icon: '▭', plan: 'pro', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'discountLength', label: 'Desconto', suffix: 'm' }, { key: 'pieceLength', label: 'Peça', suffix: 'm' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const meters = Math.max(2 * (n('width','largura') + n('length','comprimento')) - n('discountLength','desconto'), 0); const total = meters * (1 + n('loss','perda') / 100); const pieces = Math.ceil(total / n('pieceLength','peça')); return result(`Rodapé: ${round(total)} m`, [card('Metros', `${round(total)} m`), card('Peças', `${pieces}`)], [`Metros: ${round(total)} m`, `Peças: ${pieces}`]); } },
  { mode: 'grout', module: 'obras', label: 'Rejunte', description: 'Consumo de rejunte por área.', icon: '▩', plan: 'pro', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'groutKgM2', label: 'Consumo', suffix: 'kg/m²' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const kg = n('area','área') * n('groutKgM2','consumo') * (1 + n('loss','perda') / 100); return result(`Rejunte: ${round(kg)} kg`, [card('Rejunte', `${round(kg)} kg`)], [`Rejunte: ${round(kg)} kg`]); } },
  { mode: 'roof', module: 'obras', label: 'Telhado básico', description: 'Área inclinada e telhas.', icon: '⌂', plan: 'pro', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'roofSlope', label: 'Inclinação', suffix: '%' }, { key: 'tilesPerM2', label: 'Telhas/m²', suffix: 'un.' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const projected = n('width','largura') * n('length','comprimento'); const roof = projected * Math.sqrt(1 + (n('roofSlope','inclinação') / 100) ** 2); const total = roof * (1 + n('loss','perda') / 100); const tiles = Math.ceil(total * n('tilesPerM2','telhas/m²')); return result(`Telhado: ${round(total)} m² / ${tiles} telhas`, [card('Área', `${round(total)} m²`), card('Telhas', `${tiles}`)], [`Área: ${round(total)} m²`, `Telhas: ${tiles}`]); } },
  { mode: 'paint-area', module: 'pintura', label: 'Área a pintar', description: 'Área com demãos.', icon: '▨', plan: 'free', fields: [...wallFields, { key: 'coats', label: 'Demãos', suffix: 'x' }], compute: (n) => { const area = wallArea(n); const total = area * n('coats','demãos'); return result(`Área pintada: ${round(total)} m²`, [card('Área líquida', `${round(area)} m²`), card('Com demãos', `${round(total)} m²`)], [`Área: ${round(area)} m²`, `Com demãos: ${round(total)} m²`]); } },
  { mode: 'paint-liters', module: 'pintura', label: 'Litros de tinta', description: 'Tinta por rendimento.', icon: '◍', plan: 'free', fields: [...wallFields, { key: 'coats', label: 'Demãos', suffix: 'x' }, { key: 'paintYield', label: 'Rendimento', suffix: 'm²/L' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const liters = wallArea(n) * n('coats','demãos') / n('paintYield','rendimento') * (1 + n('loss','perda') / 100); return result(`Tinta: ${round(liters)} L`, [card('Litros', `${round(liters)} L`), card('Galões 3,6 L', `${Math.ceil(liters / 3.6)}`), card('Latas 18 L', `${Math.ceil(liters / 18)}`)], [`Litros: ${round(liters)} L`]); } },
  { mode: 'paint-budget', module: 'pintura', label: 'Orçamento pintura', description: 'Tinta e mão de obra.', icon: '▣', plan: 'free', fields: [...wallFields, { key: 'coats', label: 'Demãos', suffix: 'x' }, { key: 'paintYield', label: 'Rendimento', suffix: 'm²/L' }, { key: 'paintPrice', label: 'Preço tinta', suffix: 'R$/L' }, { key: 'laborM2', label: 'Mão de obra', suffix: 'R$/m²' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const area = wallArea(n); const liters = area * n('coats','demãos') / n('paintYield','rendimento') * (1 + n('loss','perda') / 100); const material = liters * n('paintPrice','preço'); const labor = area * n('laborM2','mão de obra'); const total = material + labor; return result(`Orçamento pintura: ${money(total)}`, [card('Material', money(material)), card('Mão de obra', money(labor)), card('Total', money(total))], [`Material: ${money(material)}`, `Mão de obra: ${money(labor)}`, `Total: ${money(total)}`]); } },
  { mode: 'sealer', module: 'pintura', label: 'Selador/fundo', description: 'Litros de selador.', icon: '◌', plan: 'free', fields: [...wallFields, { key: 'sealerYield', label: 'Rendimento', suffix: 'm²/L' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const liters = wallArea(n) / n('sealerYield','rendimento') * (1 + n('loss','perda') / 100); return result(`Selador: ${round(liters)} L`, [card('Litros', `${round(liters)} L`)], [`Litros: ${round(liters)} L`]); } },
  { mode: 'putty', module: 'pintura', label: 'Massa corrida', description: 'Kg de massa.', icon: '▢', plan: 'free', fields: [...wallFields, { key: 'coats', label: 'Demãos', suffix: 'x' }, { key: 'puttyKgM2', label: 'Consumo', suffix: 'kg/m²' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: (n) => { const kg = wallArea(n) * n('coats','demãos') * n('puttyKgM2','consumo') * (1 + n('loss','perda') / 100); return result(`Massa: ${round(kg)} kg`, [card('Kg', `${round(kg)} kg`), card('Baldes 25 kg', `${Math.ceil(kg / 25)}`)], [`Massa: ${round(kg)} kg`]); } },
  { mode: 'paint-time', module: 'pintura', label: 'Tempo de pintura', description: 'Tempo por produtividade.', icon: 'h', plan: 'free', fields: [...wallFields, { key: 'coats', label: 'Demãos', suffix: 'x' }, { key: 'productivity', label: 'Produtividade', suffix: 'm²/h' }], compute: (n) => { const hours = wallArea(n) * n('coats','demãos') / n('productivity','produtividade'); return result(`Tempo: ${round(hours)} h`, [card('Horas', `${round(hours)} h`), card('Dias de 8h', `${round(hours / 8)} dia(s)`)], [`Horas: ${round(hours)} h`]); } },
  { mode: 'room-paint', module: 'pintura', label: 'Orçamento por cômodo', description: 'Material e mão de obra do cômodo.', icon: 'R$', plan: 'free', fields: [...wallFields, { key: 'coats', label: 'Demãos', suffix: 'x' }, { key: 'paintYield', label: 'Rendimento', suffix: 'm²/L' }, { key: 'sealerYield', label: 'Rendimento selador', suffix: 'm²/L' }, { key: 'paintPrice', label: 'Preço tinta', suffix: 'R$/L' }, { key: 'sealerPrice', label: 'Preço selador', suffix: 'R$/L' }, { key: 'laborM2', label: 'Mão de obra', suffix: 'R$/m²' }], compute: (n) => { const area = wallArea(n); const paint = area * n('coats','demãos') / n('paintYield','rendimento') * n('paintPrice','preço'); const sealer = area / n('sealerYield','selador') * n('sealerPrice','preço selador'); const labor = area * n('laborM2','mão de obra'); const total = paint + sealer + labor; return result(`Orçamento cômodo: ${money(total)}`, [card('Material', money(paint + sealer)), card('Mão de obra', money(labor)), card('Total', money(total))], [`Material: ${money(paint + sealer)}`, `Mão de obra: ${money(labor)}`, `Total: ${money(total)}`]); } },
  { mode: 'volume', module: 'conversores', label: 'm³ ↔ litros', description: 'Conversão de volume.', icon: '≋', plan: 'free', fields: [{ key: 'cubicMeters', label: 'm³', suffix: 'm³' }, { key: 'liters', label: 'Litros', suffix: 'L' }], compute: (n) => result(`${round(n('cubicMeters','m³') * 1000)} L`, [card('m³ → L', `${round(n('cubicMeters','m³') * 1000)} L`), card('L → m³', `${round(n('liters','litros') / 1000, 3)} m³`)], ['Conversão de volume']) },
  { mode: 'pressure', module: 'conversores', label: 'bar / psi / mca', description: 'Conversão de pressão.', icon: '↕', plan: 'free', fields: [{ key: 'bar', label: 'Bar', suffix: 'bar' }, { key: 'psi', label: 'PSI', suffix: 'psi' }, { key: 'mca', label: 'MCA', suffix: 'mca' }], compute: (n) => result(`${round(n('bar','bar') * 14.5038)} psi`, [card('bar → psi', `${round(n('bar','bar') * 14.5038)} psi`), card('bar → mca', `${round(n('bar','bar') * 10.197)} mca`), card('psi → bar', `${round(n('psi','psi') / 14.5038)} bar`), card('mca → bar', `${round(n('mca','mca') / 10.197)} bar`)], ['Conversão de pressão']) },
  { mode: 'power', module: 'conversores', label: 'CV / HP / kW', description: 'Conversão de potência.', icon: '⚙', plan: 'free', fields: [{ key: 'kw', label: 'kW', suffix: 'kW' }, { key: 'cv', label: 'CV', suffix: 'CV' }, { key: 'hp', label: 'HP', suffix: 'HP' }], compute: (n) => result(`${round(n('kw','kW') / 0.7355)} CV`, [card('kW → CV', `${round(n('kw','kW') / 0.7355)} CV`), card('CV → kW', `${round(n('cv','CV') * 0.7355)} kW`), card('HP → kW', `${round(n('hp','HP') * 0.7457)} kW`)], ['Conversão de potência']) },
  { mode: 'btu', module: 'conversores', label: 'BTU/h ↔ W', description: 'Conversão térmica.', icon: '❄', plan: 'free', fields: [{ key: 'btuh', label: 'BTU/h', suffix: 'BTU/h' }, { key: 'watts', label: 'Watts', suffix: 'W' }], compute: (n) => result(`${round(n('btuh','BTU/h') * 0.293071)} W`, [card('BTU/h → W', `${round(n('btuh','BTU/h') * 0.293071)} W`), card('W → BTU/h', `${round(n('watts','watts') / 0.293071)} BTU/h`)], ['Conversão térmica']) },
  { mode: 'length', module: 'conversores', label: 'Medidas', description: 'Metro, centímetro, milímetro e polegada.', icon: '↔', plan: 'free', fields: [{ key: 'meters', label: 'Metros', suffix: 'm' }, { key: 'inches', label: 'Polegadas', suffix: 'pol' }], compute: (n) => result(`${round(n('meters','metros') * 100)} cm`, [card('m → cm', `${round(n('meters','metros') * 100)} cm`), card('m → mm', `${round(n('meters','metros') * 1000)} mm`), card('pol → mm', `${round(n('inches','polegadas') * 25.4)} mm`)], ['Conversão de medidas']) },
  { mode: 'temperature', module: 'conversores', label: 'Temperatura', description: 'Celsius e Fahrenheit.', icon: '℃', plan: 'free', fields: [{ key: 'celsius', label: 'Celsius', suffix: '°C' }, { key: 'fahrenheit', label: 'Fahrenheit', suffix: '°F' }], compute: (n) => result(`${round(n('celsius','Celsius') * 9 / 5 + 32)} °F`, [card('°C → °F', `${round(n('celsius','Celsius') * 9 / 5 + 32)} °F`), card('°F → °C', `${round((n('fahrenheit','Fahrenheit') - 32) * 5 / 9)} °C`)], ['Conversão de temperatura']) },
  { mode: 'flow', module: 'conversores', label: 'Vazão', description: 'L/min, L/h e m³/h.', icon: '≈', plan: 'free', fields: [{ key: 'literMinute', label: 'L/min', suffix: 'L/min' }, { key: 'm3Hour', label: 'm³/h', suffix: 'm³/h' }], compute: (n) => result(`${round(n('literMinute','L/min') * 0.06)} m³/h`, [card('L/min → L/h', `${round(n('literMinute','L/min') * 60)} L/h`), card('L/min → m³/h', `${round(n('literMinute','L/min') * 0.06)} m³/h`), card('m³/h → L/min', `${round(n('m3Hour','m³/h') * 1000 / 60)} L/min`)], ['Conversão de vazão']) },
  { mode: 'labor', module: 'orcamentoTecnico', label: 'Mão de obra', description: 'Quantidade e valor unitário.', icon: 'R$', plan: 'free', fields: [{ key: 'quantity', label: 'Quantidade' }, { key: 'unitValue', label: 'Valor unitário', suffix: 'R$' }, { key: 'travel', label: 'Deslocamento', suffix: 'R$' }], compute: (n) => { const subtotal = n('quantity','quantidade') * n('unitValue','valor'); const total = subtotal + n('travel','deslocamento'); return result(`Mão de obra: ${money(total)}`, [card('Subtotal', money(subtotal)), card('Total', money(total))], [`Subtotal: ${money(subtotal)}`, `Total: ${money(total)}`]); } },
  { mode: 'final-price', module: 'orcamentoTecnico', label: 'Preço final', description: 'Material, mão de obra, lucro, imposto e desconto.', icon: 'Σ', plan: 'free', fields: [{ key: 'material', label: 'Material', suffix: 'R$' }, { key: 'labor', label: 'Mão de obra', suffix: 'R$' }, { key: 'travel', label: 'Deslocamento', suffix: 'R$' }, { key: 'profit', label: 'Lucro', suffix: '%' }, { key: 'tax', label: 'Imposto', suffix: '%' }, { key: 'discount', label: 'Desconto', suffix: '%' }], compute: (n) => { const base = n('material','material') + n('labor','mão de obra') + n('travel','deslocamento'); const profit = base * n('profit','lucro') / 100; const tax = (base + profit) * n('tax','imposto') / 100; const discount = (base + profit + tax) * n('discount','desconto') / 100; const total = base + profit + tax - discount; return result(`Preço final: ${money(total)}`, [card('Base', money(base)), card('Acréscimos', money(profit + tax)), card('Total', money(total))], [`Base: ${money(base)}`, `Lucro: ${money(profit)}`, `Imposto: ${money(tax)}`, `Desconto: ${money(discount)}`, `Total: ${money(total)}`]); } },
  { mode: 'daily', module: 'orcamentoTecnico', label: 'Diária', description: 'Diária profissional e ajudante.', icon: 'D', plan: 'free', fields: [{ key: 'days', label: 'Dias' }, { key: 'daily', label: 'Diária', suffix: 'R$' }, { key: 'helperDaily', label: 'Ajudante', suffix: 'R$' }, { key: 'travel', label: 'Deslocamento', suffix: 'R$' }], compute: (n) => { const total = n('days','dias') * (n('daily','diária') + n('helperDaily','ajudante')) + n('travel','deslocamento'); return result(`Diária: ${money(total)}`, [card('Total', money(total))], [`Total: ${money(total)}`]); } },
  { mode: 'hourly', module: 'orcamentoTecnico', label: 'Hora técnica', description: 'Preço por hora.', icon: 'H', plan: 'free', fields: [{ key: 'hours', label: 'Horas' }, { key: 'hourly', label: 'Valor/h', suffix: 'R$/h' }, { key: 'travel', label: 'Deslocamento', suffix: 'R$' }], compute: (n) => { const total = n('hours','horas') * n('hourly','valor/h') + n('travel','deslocamento'); return result(`Hora técnica: ${money(total)}`, [card('Total', money(total))], [`Total: ${money(total)}`]); } },
  { mode: 'installments', module: 'orcamentoTecnico', label: 'Parcelamento', description: 'Parcelas com juros simples.', icon: '÷', plan: 'free', fields: [{ key: 'total', label: 'Total', suffix: 'R$' }, { key: 'installments', label: 'Parcelas', suffix: 'x' }, { key: 'interest', label: 'Juros', suffix: '%' }], compute: (n) => { const total = n('total','total') * (1 + n('interest','juros') / 100); const installment = total / n('installments','parcelas'); return result(`${round(n('installments','parcelas'))}x de ${money(installment)}`, [card('Total', money(total)), card('Parcela', money(installment))], [`Total: ${money(total)}`, `Parcela: ${money(installment)}`]); } },
  { mode: 'upfront', module: 'orcamentoTecnico', label: 'Sinal e saldo', description: 'Entrada e saldo restante.', icon: '⇆', plan: 'free', fields: [{ key: 'total', label: 'Total', suffix: 'R$' }, { key: 'upfront', label: 'Sinal', suffix: '%' }], compute: (n) => { const upfront = n('total','total') * n('upfront','sinal') / 100; const balance = n('total','total') - upfront; return result(`Sinal: ${money(upfront)} · saldo: ${money(balance)}`, [card('Sinal', money(upfront)), card('Saldo', money(balance))], [`Sinal: ${money(upfront)}`, `Saldo: ${money(balance)}`]); } },
];

function NumberField({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (value: string) => void }) {
  return (
    <label className="general-form-field">
      <span>{field.label}</span>
      <div>
        <input type="number" inputMode="decimal" min={field.min ?? 0} step={field.step ?? 0.01} value={value} onChange={(event) => onChange(event.target.value)} />
        {field.suffix && <small>{field.suffix}</small>}
      </div>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="general-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function GeneralCalculatorWorkspace({ selectedModule, onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<RuleMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const moduleRules = rules.filter((rule) => rule.module === selectedModule);
  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  const read = (key: string, label: string) => requireNumber(parseNumber(values[key] ?? ''), label);

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function calculate(): CalcResult {
    if (!activeRule) return { error: null, summary: '', details: [], cards: [] };
    try {
      return activeRule.compute(read);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], cards: [] };
    }
  }

  const calculated = calculate();

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;
    const capture: CalculationCapture = {
      id: createId('general-calc'),
      module: activeRule.module,
      moduleLabel: moduleLabel(activeRule.module),
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: calculated.summary,
      details: calculated.details,
    };
    onCaptureCalculation?.(capture);
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no levantamento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no levantamento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveMode(null);
    setAddedMessage(null);
  }

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner"><div><strong>{moduleLabel(selectedModule)}</strong><span>Calculadoras estáveis para publicação inicial do OrçaOS.</span></div><em>{moduleRules.length} cálculos</em></div>
      <div className="general-picker-list">
        {moduleRules.map((rule) => <button className="general-picker-card" key={rule.mode} type="button" onClick={() => setActiveMode(rule.mode)}><span><strong>{rule.label}</strong><small>{rule.description}</small></span><em>{rule.plan === 'pro' ? 'PRO' : 'LIVRE'}</em></button>)}
      </div>
      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeCalculator} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header"><button type="button" onClick={closeCalculator}>‹</button><div><span>{moduleLabel(activeRule.module)}</span><h2>{activeRule.label}</h2><p>{activeRule.description}</p></div><em>{activeRule.plan === 'pro' ? 'PRO' : 'LIVRE'}</em></header>
            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>{activeRule.fields.map((field) => <NumberField key={field.key} field={field} value={values[field.key] ?? ''} onChange={(value) => setValue(field.key, value)} />)}</form>
            {calculated.error && <p className="general-error-message">{calculated.error}</p>}
            {calculated.cards.length > 0 && <div className="general-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}
            <div className="general-capture-actions"><button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button><button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button><button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button><button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button></div>
            <small className="general-technical-note">Cálculo preliminar. Valide medidas, perdas, materiais e condições reais antes de fechar a proposta.</small>
          </section>
        </div>
      )}
    </div>
  );
}
