import { useMemo, useState } from 'react';
import { canUsePlanFeature, proFeatureTitle, type CalculatorModule, type UserPlan } from '../../../core/access/featureAccess';
import { calculateVoltageDrop } from '../../../core/calculations/electrical';
import { calculateSalePriceByMarkup, calculateSalePriceByTargetMargin } from '../../../core/calculations/trade';
import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import { suggestNextBreaker } from '../../../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../../../data/electrical-tables/cableSections';
import './GeneralCalculatorWorkspace.css';

type ExpansionMode =
  | 'cable-current'
  | 'breaker-sizing'
  | 'voltage-drop-simple'
  | 'conduit-occupancy'
  | 'installed-load'
  | 'circuit-division'
  | 'phase-balance'
  | 'grounding'
  | 'dr-dps-checklist'
  | 'sale-price-margin'
  | 'sale-price-markup'
  | 'max-discount'
  | 'installment-fee'
  | 'recommended-upfront'
  | 'real-hourly-rate'
  | 'daily-rate-advanced'
  | 'travel-cost'
  | 'price-bands'
  | 'mortar-laying'
  | 'mortar-plaster'
  | 'wall-blocks'
  | 'simple-concrete'
  | 'tile-loss'
  | 'baseboard'
  | 'simple-roof'
  | 'stairs'
  | 'ramp'
  | 'tank-people'
  | 'tank-autonomy'
  | 'fill-time'
  | 'fixture-flow'
  | 'pool-volume'
  | 'sewage-slope'
  | 'water-column-pressure'
  | 'pump-simple'
  | 'awg-mm2'
  | 'power-units'
  | 'thermal-units'
  | 'pressure-units'
  | 'flow-units'
  | 'inch-mm'
  | 'fraction-inch'
  | 'kgf-bar'
  | 'temperature'
  | 'kwh-money';

interface Props {
  selectedModule: CalculatorModule;
  userPlan?: UserPlan;
  onUpgradeRequest?: () => void;
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface Field {
  key: string;
  label: string;
  suffix?: string;
  step?: number;
}

interface Option {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface ExpansionResult {
  error: string | null;
  summary: string;
  cards: ResultCardData[];
  details: string[];
  orientation: string;
  formula: string[];
  itemType?: TechnicalItemType;
  shouldGenerateBudgetItem?: boolean;
  editableDescription?: string;
  quantity?: string;
  unitValue?: string;
}

interface Rule {
  mode: ExpansionMode;
  module: CalculatorModule;
  label: string;
  description: string;
  plan: 'free' | 'pro';
  fields: Field[];
  options?: Option[];
  compute: (ctx: ComputeContext) => ExpansionResult;
}

interface ComputeContext {
  n: (key: string, label: string) => number;
  opt: (key: string) => string;
}

const defaultValues: Record<string, string> = {
  current: '20',
  powerWatts: '4400',
  voltage: '220',
  distance: '25',
  powerFactor: '0.92',
  maxDrop: '4',
  section: '2.5',
  conduitDiameter: '20',
  cableCount: '3',
  cableDiameter: '4',
  quantity: '4',
  margin: '30',
  markup: '40',
  tax: '6',
  discount: '5',
  cost: '800',
  price: '1200',
  minMargin: '20',
  installments: '6',
  monthlyFee: '2.5',
  materialCost: '600',
  risk: '2',
  desiredIncome: '6000',
  workDays: '22',
  productiveHours: '5',
  fixedCost: '1800',
  hours: '8',
  helperCost: '150',
  km: '40',
  consumption: '10',
  fuelPrice: '6',
  travelHours: '1.5',
  hourlyRate: '90',
  idealMargin: '35',
  premiumMargin: '50',
  area: '20',
  thickness: '2',
  loss: '10',
  bagKg: '20',
  blockWidth: '39',
  blockHeight: '19',
  width: '4',
  length: '5',
  height: '2.8',
  tileWidth: '60',
  tileHeight: '60',
  piecesPerBox: '4',
  pieceLength: '2.4',
  perimeter: '18',
  slope: '30',
  tilesPerM2: '16',
  totalHeight: '2.8',
  riser: '17',
  tread: '28',
  availableLength: '4',
  people: '4',
  litersPersonDay: '150',
  days: '2',
  reservoirLiters: '1000',
  volumeLiters: '1000',
  flow: '20',
  collectedVolume: '10',
  collectedSeconds: '30',
  diameter: '4',
  depth: '1.4',
  heightMeters: '12',
  horizontalDistance: '35',
  losses: '20',
  value: '1',
  tariff: '0.95',
};

const defaultOptions: Record<string, string> = {
  phase: 'single',
  conductor: 'copper',
  loadType: 'general',
  supply: 'single',
  soil: 'normal',
  wetArea: 'yes',
  outdoorOutlet: 'no',
  shower: 'yes',
  sensitive: 'yes',
  groundingOk: 'yes',
  neutralEarthSeparated: 'unknown',
  surgeHistory: 'no',
  material: 'concrete-block',
  concreteType: 'slab',
  poolShape: 'rectangular',
  converterUnit: 'base',
  feePayer: 'client',
};

const awgTable = [
  { awg: '20', mm2: 0.52 }, { awg: '18', mm2: 0.82 }, { awg: '16', mm2: 1.31 }, { awg: '14', mm2: 2.08 },
  { awg: '12', mm2: 3.31 }, { awg: '10', mm2: 5.26 }, { awg: '8', mm2: 8.37 }, { awg: '6', mm2: 13.3 },
  { awg: '4', mm2: 21.15 }, { awg: '2', mm2: 33.62 }, { awg: '1/0', mm2: 53.49 },
];

function parseNumber(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return normalized ? Number(normalized) : Number.NaN;
}

function positive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Informe um valor maior que zero para ${label}.`);
  return value;
}

function nonNegative(value: number, label: string): number {
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

function moduleLabel(module: CalculatorModule): string {
  if (module === 'eletricaResidencial') return 'Instalação residencial';
  if (module === 'financeiroAvancado') return 'Preço e margem';
  if (module === 'construcaoAvancada') return 'Composição de obra';
  if (module === 'hidraulicaAvancada') return 'Instalações hidráulicas';
  if (module === 'conversoresAvancados') return 'Conversores técnicos';
  return 'Cálculos técnicos';
}

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[], extra: Partial<ExpansionResult> = {}): ExpansionResult {
  return { error: null, summary, cards, details, orientation, formula, ...extra };
}

function voltageCurrent(n: (key: string, label: string) => number, opt: (key: string) => string): number {
  const current = parseNumber(defaultValues.current);
  const power = n('powerWatts', 'potência');
  const voltage = n('voltage', 'tensão');
  const fp = n('powerFactor', 'fator de potência');
  const calculated = opt('phase') === 'three' ? power / (Math.sqrt(3) * voltage * fp) : power / (voltage * fp);
  return Number.isFinite(current) ? n('current', 'corrente') || calculated : calculated;
}

function voltageDrop(current: number, distance: number, section: number, voltage: number, phase: string, conductor: string) {
  const drop = calculateVoltageDrop({
    currentAmps: current,
    distanceMeters: distance,
    sectionMm2: section,
    voltageVolts: voltage,
    phase: phase === 'three' ? 'three-phase' : 'single-phase',
    material: conductor === 'aluminum' ? 'aluminum' : 'copper',
  });
  return { volts: drop.dropVolts, percent: drop.dropPercent };
}

function suggestSectionByCurrent(current: number): number {
  return suggestMinimumCableSectionByCurrent(current) ?? 95;
}

function suggestBreaker(current: number, margin = 1.15): number {
  return suggestNextBreaker(current * margin) ?? Math.ceil(current * margin);
}

const rules: Rule[] = [
  { mode: 'cable-current', module: 'eletricaResidencial', label: 'Cabo por corrente', description: 'Seção preliminar por corrente/potência e queda estimada.', plan: 'pro', fields: [{ key: 'current', label: 'Corrente', suffix: 'A' }, { key: 'voltage', label: 'Tensão', suffix: 'V' }, { key: 'distance', label: 'Distância', suffix: 'm' }, { key: 'maxDrop', label: 'Queda máxima', suffix: '%' }], options: [{ key: 'phase', label: 'Circuito', options: [{ value: 'single', label: 'Monofásico/bifásico' }, { value: 'three', label: 'Trifásico' }] }, { key: 'conductor', label: 'Condutor', options: [{ value: 'copper', label: 'Cobre' }, { value: 'aluminum', label: 'Alumínio' }] }], compute: ({ n, opt }) => { const current = n('current', 'corrente'); const section = suggestSectionByCurrent(current); const drop = voltageDrop(current, n('distance', 'distância'), section, n('voltage', 'tensão'), opt('phase'), opt('conductor')); return result(`Cabo preliminar: ${section} mm²`, [{ label: 'Seção sugerida', value: `${section} mm²` }, { label: 'Queda estimada', value: `${round(drop.percent)}%` }, { label: 'Corrente', value: `${round(current)} A` }], [`Corrente: ${round(current)} A`, `Seção: ${section} mm²`, `Queda: ${round(drop.volts)} V (${round(drop.percent)}%)`], 'Estimativa preliminar. Validar método de instalação, temperatura, agrupamento, norma aplicável e proteção do condutor.', ['Seção inicial por faixa de corrente', 'Queda = multiplicador × resistividade × distância × corrente ÷ seção.']); } },
  { mode: 'breaker-sizing', module: 'eletricaResidencial', label: 'Disjuntor', description: 'Faixa de disjuntor por corrente e margem.', plan: 'pro', fields: [{ key: 'current', label: 'Corrente de projeto', suffix: 'A' }, { key: 'margin', label: 'Margem', suffix: '%' }], options: [{ key: 'loadType', label: 'Tipo de carga', options: [{ value: 'general', label: 'Geral' }, { value: 'motor', label: 'Motor' }, { value: 'shower', label: 'Chuveiro/resistiva' }] }], compute: ({ n, opt }) => { const current = n('current', 'corrente'); const factor = 1 + n('margin', 'margem') / 100; const breaker = suggestBreaker(current, factor); return result(`Disjuntor sugerido: ${breaker} A`, [{ label: 'Corrente', value: `${round(current)} A` }, { label: 'Disjuntor', value: `${breaker} A` }, { label: 'Carga', value: opt('loadType') }], [`Disjuntor: ${breaker} A`], 'O disjuntor deve proteger o cabo e ser compatível com a carga. Motores podem exigir curva/partida específica.', ['Disjuntor comercial >= corrente × margem.']); } },
  { mode: 'voltage-drop-simple', module: 'eletricaResidencial', label: 'Queda de tensão', description: 'Queda em volts e percentual.', plan: 'pro', fields: [{ key: 'current', label: 'Corrente', suffix: 'A' }, { key: 'distance', label: 'Distância', suffix: 'm' }, { key: 'section', label: 'Seção', suffix: 'mm²' }, { key: 'voltage', label: 'Tensão', suffix: 'V' }], options: [{ key: 'phase', label: 'Circuito', options: [{ value: 'single', label: 'Monofásico/bifásico' }, { value: 'three', label: 'Trifásico' }] }, { key: 'conductor', label: 'Condutor', options: [{ value: 'copper', label: 'Cobre' }, { value: 'aluminum', label: 'Alumínio' }] }], compute: ({ n, opt }) => { const drop = voltageDrop(n('current', 'corrente'), n('distance', 'distância'), n('section', 'seção'), n('voltage', 'tensão'), opt('phase'), opt('conductor')); const status = drop.percent > 5 ? 'Revisar' : drop.percent > 4 ? 'Atenção' : 'OK'; return result(`Queda: ${round(drop.percent)}% · ${status}`, [{ label: 'Volts', value: `${round(drop.volts)} V` }, { label: 'Percentual', value: `${round(drop.percent)}%` }, { label: 'Status', value: status }], [`Queda: ${round(drop.volts)} V`, `Percentual: ${round(drop.percent)}%`], 'Se a queda estiver alta, revisar seção, distância, tensão ou divisão de circuitos.', ['Queda = multiplicador × resistividade × distância × corrente ÷ seção', 'Percentual = queda ÷ tensão × 100.']); } },
  { mode: 'conduit-occupancy', module: 'eletricaResidencial', label: 'Ocupação de eletroduto', description: 'Ocupação estimada por diâmetro dos cabos.', plan: 'pro', fields: [{ key: 'conduitDiameter', label: 'Diâmetro interno', suffix: 'mm' }, { key: 'cableCount', label: 'Quantidade de cabos' }, { key: 'cableDiameter', label: 'Diâmetro cabo', suffix: 'mm' }], compute: ({ n }) => { const conduitArea = Math.PI * (n('conduitDiameter', 'eletroduto') / 2) ** 2; const cableArea = n('cableCount', 'cabos') * Math.PI * (n('cableDiameter', 'cabo') / 2) ** 2; const occupancy = cableArea / conduitArea * 100; const status = occupancy > 40 ? 'Aumentar eletroduto' : occupancy > 33 ? 'Atenção' : 'OK'; return result(`Ocupação: ${round(occupancy)}%`, [{ label: 'Ocupação', value: `${round(occupancy)}%` }, { label: 'Status', value: status }], [`Ocupação: ${round(occupancy)}%`], 'Estimativa geométrica. Conferir diâmetro real dos cabos, curvas e facilidade de passagem.', ['Ocupação = área total dos cabos ÷ área interna do eletroduto × 100.']); } },
  { mode: 'installed-load', module: 'eletricaResidencial', label: 'Carga instalada', description: 'Potência total e corrente estimada.', plan: 'free', fields: [{ key: 'powerWatts', label: 'Potência por carga', suffix: 'W' }, { key: 'quantity', label: 'Quantidade' }, { key: 'voltage', label: 'Tensão', suffix: 'V' }], compute: ({ n }) => { const total = n('powerWatts', 'potência') * n('quantity', 'quantidade'); const current = total / n('voltage', 'tensão'); const circuits = Math.max(1, Math.ceil(current / 16)); return result(`Carga instalada: ${round(total)} W`, [{ label: 'Potência total', value: `${round(total)} W` }, { label: 'Corrente', value: `${round(current)} A` }, { label: 'Circuitos', value: `${circuits}` }], [`Potência total: ${round(total)} W`, `Corrente: ${round(current)} A`], 'Use para estimativa e divisão inicial. Cargas específicas podem exigir circuito dedicado.', ['Potência total = potência unitária × quantidade', 'Corrente = potência total ÷ tensão.']); } },
  { mode: 'circuit-division', module: 'eletricaResidencial', label: 'Divisão de circuitos', description: 'Agrupamento simples por tipo de carga.', plan: 'pro', fields: [{ key: 'powerWatts', label: 'Potência aproximada', suffix: 'W' }, { key: 'quantity', label: 'Ambientes/cargas' }], options: [{ key: 'loadType', label: 'Tipo', options: [{ value: 'lighting', label: 'Iluminação' }, { value: 'outlet', label: 'Tomadas' }, { value: 'shower', label: 'Chuveiro' }, { value: 'ac', label: 'Ar-condicionado' }] }], compute: ({ n, opt }) => { const total = n('powerWatts', 'potência') * n('quantity', 'quantidade'); const dedicated = opt('loadType') === 'shower' || opt('loadType') === 'ac'; const circuits = dedicated ? Math.ceil(n('quantity', 'quantidade')) : Math.max(1, Math.ceil(total / 1800)); return result(`Sugestão: ${circuits} circuito(s)`, [{ label: 'Circuitos', value: `${circuits}` }, { label: 'Dedicado', value: dedicated ? 'Sim' : 'Não' }], [`Circuitos sugeridos: ${circuits}`], 'Agrupamento orientativo para organizar levantamento e orçamento. Validar critérios normativos e quadro real.', ['Circuitos gerais por potência aproximada; cargas como chuveiro/ar tendem a circuito dedicado.']); } },
  { mode: 'phase-balance', module: 'eletricaResidencial', label: 'Balanceamento de fases', description: 'Desequilíbrio entre fases.', plan: 'pro', fields: [{ key: 'current', label: 'Fase A', suffix: 'A' }, { key: 'powerWatts', label: 'Fase B', suffix: 'A' }, { key: 'quantity', label: 'Fase C', suffix: 'A' }], compute: ({ n }) => { const loads = [n('current', 'fase A'), n('powerWatts', 'fase B'), n('quantity', 'fase C')]; const avg = loads.reduce((a, b) => a + b, 0) / 3; const max = Math.max(...loads); const imbalance = (max - avg) / avg * 100; return result(`Desequilíbrio: ${round(imbalance)}%`, [{ label: 'Fase mais carregada', value: `${round(max)} A` }, { label: 'Desequilíbrio', value: `${round(imbalance)}%` }], [`Cargas: ${loads.map((item) => round(item)).join(' / ')} A`], 'Redistribua cargas se uma fase estiver muito acima das demais.', ['Desequilíbrio = (maior corrente - média) ÷ média × 100.']); } },
  { mode: 'grounding', module: 'eletricaResidencial', label: 'Aterramento simplificado', description: 'Resistência equivalente estimada.', plan: 'pro', fields: [{ key: 'quantity', label: 'Hastes' }, { key: 'current', label: 'Resistência por haste', suffix: 'Ω' }], options: [{ key: 'soil', label: 'Solo', options: [{ value: 'dry', label: 'Seco' }, { value: 'normal', label: 'Normal' }, { value: 'wet', label: 'Úmido' }] }], compute: ({ n, opt }) => { const soilFactor = opt('soil') === 'dry' ? 1.3 : opt('soil') === 'wet' ? 0.8 : 1; const equivalent = n('current', 'resistência') / n('quantity', 'hastes') * soilFactor; return result(`Resistência estimada: ${round(equivalent)} Ω`, [{ label: 'Estimativa', value: `${round(equivalent)} Ω` }], [`Resistência estimada: ${round(equivalent)} Ω`], 'Aterramento deve ser medido com instrumento adequado. Este cálculo só organiza uma estimativa inicial.', ['Resistência equivalente simplificada = resistência por haste ÷ quantidade × fator do solo.']); } },
  { mode: 'dr-dps-checklist', module: 'eletricaResidencial', label: 'Proteção elétrica DR/DPS', description: 'Checklist de decisão, não cálculo numérico.', plan: 'free', fields: [], options: [{ key: 'wetArea', label: 'Existe área molhada ou uso com água?', options: [{ value: 'yes', label: 'Sim: banheiro, lavanderia, cozinha, área de serviço' }, { value: 'no', label: 'Não identificado' }] }, { key: 'outdoorOutlet', label: 'Existe tomada ou circuito em área externa?', options: [{ value: 'yes', label: 'Sim: área externa, garagem, jardim ou fachada' }, { value: 'no', label: 'Não identificado' }] }, { key: 'shower', label: 'Há chuveiro, aquecedor ou carga de maior risco?', options: [{ value: 'yes', label: 'Sim: avaliar proteção e circuito dedicado' }, { value: 'no', label: 'Não identificado' }] }, { key: 'sensitive', label: 'Há equipamentos sensíveis ou caros?', options: [{ value: 'yes', label: 'Sim: eletrônicos, automação, informática ou inversores' }, { value: 'no', label: 'Não identificado' }] }, { key: 'surgeHistory', label: 'Cliente relata queima por raio/surto?', options: [{ value: 'yes', label: 'Sim: houve queima, pico ou oscilação' }, { value: 'no', label: 'Não relatado' }] }, { key: 'groundingOk', label: 'Aterramento foi confirmado?', options: [{ value: 'yes', label: 'Sim: existe aterramento funcional aparente' }, { value: 'no', label: 'Não: não foi confirmado ou não existe' }] }, { key: 'neutralEarthSeparated', label: 'Quadro separa neutro e terra?', options: [{ value: 'yes', label: 'Sim: separação aparente conferida' }, { value: 'no', label: 'Não: precisa revisar antes de definir proteção' }, { value: 'unknown', label: 'Não conferido ainda' }] }], compute: ({ opt }) => { const drNeeded = opt('wetArea') === 'yes' || opt('outdoorOutlet') === 'yes' || opt('shower') === 'yes'; const dpsNeeded = opt('sensitive') === 'yes' || opt('surgeHistory') === 'yes'; const groundingIssue = opt('groundingOk') === 'no' || opt('neutralEarthSeparated') !== 'yes'; const recommendations = ['Conferir quadro, aterramento, separação entre neutro/terra e circuitos antes de definir qualquer proteção.']; if (drNeeded) recommendations.push('Avaliar DR para circuitos com maior risco de contato com pessoas, água ou área externa.'); if (dpsNeeded) recommendations.push('Avaliar DPS para proteção contra surtos, especialmente com equipamentos sensíveis ou histórico de queima.'); if (groundingIssue) recommendations.push('Antes de instalar ou recomendar DR/DPS, revisar aterramento e organização do quadro.'); if (!drNeeded && !dpsNeeded) recommendations.push('Nenhuma condição crítica foi marcada, mas a proteção deve ser conferida conforme instalação real.'); const drStatus = drNeeded ? 'Avaliar DR' : 'Conferir em campo'; const dpsStatus = dpsNeeded ? 'Avaliar DPS' : 'Conferir necessidade'; return result('Checklist de proteção elétrica gerado', [{ label: 'DR', value: drStatus }, { label: 'DPS', value: dpsStatus }, { label: 'Quadro/terra', value: groundingIssue ? 'Revisar' : 'Conferido' }], recommendations, 'Assistente de campo para gerar orientação técnica. Não substitui projeto, inspeção normativa, medição de aterramento ou responsabilidade profissional.', ['Decisão por perguntas objetivas: risco de contato/água/área externa orienta DR; surto/equipamento sensível orienta DPS; aterramento e quadro condicionam a aplicação.'], { itemType: 'diagnostic', shouldGenerateBudgetItem: false }); } },
  { mode: 'sale-price-margin', module: 'financeiroAvancado', label: 'Preço por margem real', description: 'Preço de venda com margem sobre venda.', plan: 'free', fields: [{ key: 'cost', label: 'Custo', suffix: 'R$' }, { key: 'margin', label: 'Margem desejada', suffix: '%' }, { key: 'tax', label: 'Taxas/impostos', suffix: '%' }, { key: 'discount', label: 'Desconto', suffix: '%' }], compute: ({ n }) => { const price = calculateSalePriceByTargetMargin({ cost: n('cost', 'custo'), marginPercent: n('margin', 'margem'), taxPercent: n('tax', 'taxas'), plannedDiscountPercent: n('discount', 'desconto') }); return result(`Preço sugerido: ${money(price.suggestedPrice)}`, [{ label: 'Preço mínimo', value: money(price.minimumPrice) }, { label: 'Preço sugerido', value: money(price.suggestedPrice) }, { label: 'Lucro', value: money(price.profit) }], [`Preço sugerido: ${money(price.suggestedPrice)}`], 'Margem real é calculada sobre o preço de venda, diferente de markup sobre custo.', ['Preço = custo ÷ (1 - margem)', 'Preço sugerido considera taxas e desconto planejado.']); } },
  { mode: 'sale-price-markup', module: 'financeiroAvancado', label: 'Preço por markup', description: 'Preço final com markup sobre custo.', plan: 'free', fields: [{ key: 'cost', label: 'Custo', suffix: 'R$' }, { key: 'markup', label: 'Markup', suffix: '%' }, { key: 'tax', label: 'Taxas', suffix: '%' }], compute: ({ n }) => { const price = calculateSalePriceByMarkup({ cost: n('cost', 'custo'), markupPercent: n('markup', 'markup'), taxPercent: n('tax', 'taxas') }); return result(`Preço final: ${money(price.finalPrice)}`, [{ label: 'Preço', value: money(price.finalPrice) }, { label: 'Lucro bruto', value: money(price.grossProfit) }], [`Preço: ${money(price.finalPrice)}`], 'Markup é aplicado sobre o custo. A margem real resultante será menor que o percentual de markup.', ['Preço = custo × (1 + markup) × (1 + taxas).']); } },
  { mode: 'max-discount', module: 'financeiroAvancado', label: 'Desconto máximo', description: 'Desconto sem cair abaixo da margem mínima.', plan: 'pro', fields: [{ key: 'price', label: 'Preço atual', suffix: 'R$' }, { key: 'cost', label: 'Custo', suffix: 'R$' }, { key: 'minMargin', label: 'Margem mínima', suffix: '%' }], compute: ({ n }) => { const minPrice = n('cost', 'custo') / (1 - n('minMargin', 'margem') / 100); const discount = Math.max(0, (n('price', 'preço') - minPrice) / n('price', 'preço') * 100); const status = n('price', 'preço') < minPrice ? 'Abaixo da margem' : 'Pode negociar'; return result(`Desconto máximo: ${round(discount)}%`, [{ label: 'Preço mínimo', value: money(minPrice) }, { label: 'Desconto', value: `${round(discount)}%` }, { label: 'Status', value: status }], [`Preço mínimo: ${money(minPrice)}`], 'Use para negociação sem destruir a margem mínima.', ['Preço mínimo = custo ÷ (1 - margem mínima)', 'Desconto máximo = (preço atual - preço mínimo) ÷ preço atual.']); } },
  { mode: 'installment-fee', module: 'financeiroAvancado', label: 'Parcelamento com taxa', description: 'Parcela e custo financeiro.', plan: 'pro', fields: [{ key: 'price', label: 'Preço à vista', suffix: 'R$' }, { key: 'monthlyFee', label: 'Taxa mensal', suffix: '%' }, { key: 'installments', label: 'Parcelas' }], options: [{ key: 'feePayer', label: 'Quem absorve?', options: [{ value: 'client', label: 'Cliente' }, { value: 'professional', label: 'Profissional' }] }], compute: ({ n, opt }) => { const fee = n('monthlyFee', 'taxa') / 100 * n('installments', 'parcelas'); const final = opt('feePayer') === 'client' ? n('price', 'preço') * (1 + fee) : n('price', 'preço'); const cost = n('price', 'preço') * fee; return result(`${round(n('installments', 'parcelas'))}x de ${money(final / n('installments', 'parcelas'))}`, [{ label: 'Preço final', value: money(final) }, { label: 'Custo financeiro', value: money(cost) }], [`Preço final: ${money(final)}`], 'Taxa simplificada. Confira taxa real da maquininha/plataforma.', ['Taxa total simplificada = taxa mensal × parcelas.']); } },
  { mode: 'recommended-upfront', module: 'financeiroAvancado', label: 'Entrada recomendada', description: 'Sinal por material e risco.', plan: 'pro', fields: [{ key: 'price', label: 'Valor total', suffix: 'R$' }, { key: 'materialCost', label: 'Custo material', suffix: 'R$' }, { key: 'margin', label: 'Entrada desejada', suffix: '%' }, { key: 'risk', label: 'Risco', suffix: '1-3' }], compute: ({ n }) => { const base = Math.max(n('price', 'total') * n('margin', 'entrada') / 100, n('materialCost', 'material')); const recommended = base * (1 + (n('risk', 'risco') - 1) * 0.1); return result(`Sinal recomendado: ${money(recommended)}`, [{ label: 'Sinal', value: money(recommended) }, { label: 'Saldo', value: money(n('price', 'total') - recommended) }], [`Sinal: ${money(recommended)}`], 'Use para cobrir material, agenda e risco do serviço.', ['Sinal = maior valor entre percentual do total e custo de material, ajustado pelo risco.']); } },
  { mode: 'real-hourly-rate', module: 'financeiroAvancado', label: 'Hora técnica real', description: 'Hora por renda, custos fixos e margem.', plan: 'pro', fields: [{ key: 'desiredIncome', label: 'Renda desejada', suffix: 'R$/mês' }, { key: 'fixedCost', label: 'Custos fixos', suffix: 'R$/mês' }, { key: 'workDays', label: 'Dias úteis' }, { key: 'productiveHours', label: 'Horas produtivas/dia' }, { key: 'margin', label: 'Margem', suffix: '%' }], compute: ({ n }) => { const monthly = n('desiredIncome', 'renda') + n('fixedCost', 'custos'); const min = monthly / (n('workDays', 'dias') * n('productiveHours', 'horas')); const rec = min * (1 + n('margin', 'margem') / 100); return result(`Hora recomendada: ${money(rec)}`, [{ label: 'Hora mínima', value: money(min) }, { label: 'Hora recomendada', value: money(rec) }], [`Hora recomendada: ${money(rec)}`], 'Ajuda a evitar cobrar só pelo tempo visível e esquecer custos fixos.', ['Hora mínima = (renda + custos fixos) ÷ horas produtivas mensais.']); } },
  { mode: 'daily-rate-advanced', module: 'financeiroAvancado', label: 'Diária técnica', description: 'Diária mínima e recomendada.', plan: 'pro', fields: [{ key: 'hourlyRate', label: 'Hora técnica', suffix: 'R$/h' }, { key: 'hours', label: 'Horas/diária' }, { key: 'cost', label: 'Deslocamento', suffix: 'R$' }, { key: 'helperCost', label: 'Ajudante', suffix: 'R$' }, { key: 'margin', label: 'Margem', suffix: '%' }], compute: ({ n }) => { const min = n('hourlyRate', 'hora') * n('hours', 'horas') + n('cost', 'deslocamento') + n('helperCost', 'ajudante'); const rec = min * (1 + n('margin', 'margem') / 100); return result(`Diária recomendada: ${money(rec)}`, [{ label: 'Mínima', value: money(min) }, { label: 'Recomendada', value: money(rec) }], [`Diária: ${money(rec)}`], 'Defina o que está incluso na diária antes de enviar a proposta.', ['Diária mínima = hora × horas + deslocamento + ajudante.']); } },
  { mode: 'travel-cost', module: 'financeiroAvancado', label: 'Deslocamento', description: 'Combustível, tempo e visita.', plan: 'pro', fields: [{ key: 'km', label: 'Km ida/volta' }, { key: 'consumption', label: 'Consumo', suffix: 'km/L' }, { key: 'fuelPrice', label: 'Combustível', suffix: 'R$/L' }, { key: 'travelHours', label: 'Tempo', suffix: 'h' }, { key: 'hourlyRate', label: 'Hora', suffix: 'R$/h' }], compute: ({ n }) => { const fuel = n('km', 'km') / n('consumption', 'consumo') * n('fuelPrice', 'combustível'); const time = n('travelHours', 'tempo') * n('hourlyRate', 'hora'); return result(`Visita sugerida: ${money(fuel + time)}`, [{ label: 'Combustível', value: money(fuel) }, { label: 'Tempo', value: money(time) }, { label: 'Total', value: money(fuel + time) }], [`Deslocamento: ${money(fuel + time)}`], 'Inclua pedágio/estacionamento quando houver.', ['Combustível = km ÷ consumo × preço', 'Tempo = horas × valor/hora.']); } },
  { mode: 'price-bands', module: 'financeiroAvancado', label: 'Preço mínimo/ideal/premium', description: 'Três faixas de preço por margem.', plan: 'pro', fields: [{ key: 'cost', label: 'Custo total', suffix: 'R$' }, { key: 'minMargin', label: 'Margem mínima', suffix: '%' }, { key: 'idealMargin', label: 'Margem ideal', suffix: '%' }, { key: 'premiumMargin', label: 'Margem premium', suffix: '%' }], compute: ({ n }) => { const price = (m: number) => n('cost', 'custo') / (1 - m / 100); return result('Faixas comerciais calculadas', [{ label: 'Mínimo', value: money(price(n('minMargin', 'mínima'))) }, { label: 'Ideal', value: money(price(n('idealMargin', 'ideal'))) }, { label: 'Premium', value: money(price(n('premiumMargin', 'premium'))) }], ['Faixas de preço geradas'], 'Use mínimo para negociação limitada, ideal para proposta padrão e premium para urgência/garantia/complexidade.', ['Preço = custo ÷ (1 - margem).']); } },
];

const constructionRules: Rule[] = [
  { mode: 'mortar-laying', module: 'construcaoAvancada', label: 'Argamassa assentamento', description: 'Volume e sacos aproximados.', plan: 'pro', fields: [{ key: 'area', label: 'Área de parede', suffix: 'm²' }, { key: 'thickness', label: 'Junta média', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }, { key: 'bagKg', label: 'Saco', suffix: 'kg' }], compute: ({ n }) => { const volume = n('area', 'área') * n('thickness', 'junta') / 100 * 0.18 * (1 + n('loss', 'perda') / 100); const kg = volume * 1800; return result(`Argamassa: ${round(volume, 3)} m³`, [{ label: 'Volume', value: `${round(volume, 3)} m³` }, { label: 'Sacos', value: `${Math.ceil(kg / n('bagKg', 'saco'))}` }], [`Volume: ${round(volume, 3)} m³`], 'Estimativa para compra. Tipo de bloco, junta e traço alteram consumo.', ['Volume estimado = área × junta × fator de consumo × perda.']); } },
  { mode: 'mortar-plaster', module: 'construcaoAvancada', label: 'Argamassa reboco', description: 'Volume e sacos para reboco.', plan: 'pro', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'thickness', label: 'Espessura', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }, { key: 'bagKg', label: 'Saco', suffix: 'kg' }], compute: ({ n }) => { const volume = n('area', 'área') * n('thickness', 'espessura') / 100 * (1 + n('loss', 'perda') / 100); const kg = volume * 1800; return result(`Reboco: ${round(volume, 3)} m³`, [{ label: 'Volume', value: `${round(volume, 3)} m³` }, { label: 'Sacos', value: `${Math.ceil(kg / n('bagKg', 'saco'))}` }], [`Reboco: ${round(volume, 3)} m³`], 'Consumo varia com prumo, chapisco, base e traço.', ['Volume = área × espessura × perda.']); } },
  { mode: 'wall-blocks', module: 'construcaoAvancada', label: 'Blocos por parede', description: 'Quantidade por largura/altura.', plan: 'free', fields: [{ key: 'width', label: 'Largura parede', suffix: 'm' }, { key: 'height', label: 'Altura parede', suffix: 'm' }, { key: 'blockWidth', label: 'Largura bloco', suffix: 'cm' }, { key: 'blockHeight', label: 'Altura bloco', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: ({ n }) => { const area = n('width', 'largura') * n('height', 'altura'); const blockArea = n('blockWidth', 'bloco') / 100 * n('blockHeight', 'bloco') / 100; const qty = Math.ceil(area / blockArea * (1 + n('loss', 'perda') / 100)); return result(`Blocos: ${qty}`, [{ label: 'Área', value: `${round(area)} m²` }, { label: 'Quantidade', value: `${qty}` }], [`Blocos: ${qty}`], 'Inclua vãos, amarração e quebras conforme campo.', ['Quantidade = área ÷ área do bloco × perda.']); } },
  { mode: 'simple-concrete', module: 'construcaoAvancada', label: 'Concreto simples', description: 'Volume e materiais estimados.', plan: 'free', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'thickness', label: 'Espessura/altura', suffix: 'cm' }, { key: 'loss', label: 'Perda', suffix: '%' }], options: [{ key: 'concreteType', label: 'Tipo', options: [{ value: 'footing', label: 'Sapata' }, { value: 'beam', label: 'Viga' }, { value: 'pillar', label: 'Pilar' }, { value: 'slab', label: 'Laje simples' }] }], compute: ({ n, opt }) => { const volume = n('width', 'largura') * n('length', 'comprimento') * n('thickness', 'espessura') / 100 * (1 + n('loss', 'perda') / 100); return result(`Concreto ${opt('concreteType')}: ${round(volume, 3)} m³`, [{ label: 'Volume', value: `${round(volume, 3)} m³` }, { label: 'Cimento ref.', value: `${Math.ceil(volume * 7)} sacos` }], [`Volume: ${round(volume, 3)} m³`], 'Traço e resistência devem ser definidos conforme aplicação.', ['Volume = largura × comprimento × altura × perda.']); } },
  { mode: 'tile-loss', module: 'construcaoAvancada', label: 'Piso/revestimento com perda', description: 'Peças, caixas e área com perda.', plan: 'free', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'tileWidth', label: 'Largura peça', suffix: 'cm' }, { key: 'tileHeight', label: 'Altura peça', suffix: 'cm' }, { key: 'piecesPerBox', label: 'Peças/caixa' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: ({ n }) => { const totalArea = n('area', 'área') * (1 + n('loss', 'perda') / 100); const pieceArea = n('tileWidth', 'largura') / 100 * n('tileHeight', 'altura') / 100; const pieces = Math.ceil(totalArea / pieceArea); return result(`Caixas: ${Math.ceil(pieces / n('piecesPerBox', 'peças'))}`, [{ label: 'Área compra', value: `${round(totalArea)} m²` }, { label: 'Peças', value: `${pieces}` }], [`Peças: ${pieces}`], 'Confira peças por caixa e paginação.', ['Peças = área com perda ÷ área da peça.']); } },
  { mode: 'baseboard', module: 'construcaoAvancada', label: 'Rodapé', description: 'Peças por perímetro.', plan: 'pro', fields: [{ key: 'perimeter', label: 'Perímetro', suffix: 'm' }, { key: 'pieceLength', label: 'Tamanho peça', suffix: 'm' }, { key: 'loss', label: 'Perda', suffix: '%' }], compute: ({ n }) => { const total = n('perimeter', 'perímetro') * (1 + n('loss', 'perda') / 100); return result(`Rodapé: ${Math.ceil(total / n('pieceLength', 'peça'))} peças`, [{ label: 'Metros', value: `${round(total)} m` }], [`Metros: ${round(total)} m`], 'Desconte portas se necessário.', ['Peças = perímetro com perda ÷ tamanho da peça.']); } },
  { mode: 'simple-roof', module: 'construcaoAvancada', label: 'Telhado simples', description: 'Área inclinada e telhas.', plan: 'pro', fields: [{ key: 'width', label: 'Largura', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'slope', label: 'Inclinação', suffix: '%' }, { key: 'tilesPerM2', label: 'Telhas/m²' }], compute: ({ n }) => { const area = n('width', 'largura') * n('length', 'comprimento') * Math.sqrt(1 + (n('slope', 'inclinação') / 100) ** 2); return result(`Área inclinada: ${round(area)} m²`, [{ label: 'Área', value: `${round(area)} m²` }, { label: 'Telhas', value: `${Math.ceil(area * n('tilesPerM2', 'telhas'))}` }], [`Área: ${round(area)} m²`], 'Conferir beirais, recortes, sobreposição e tipo de telha.', ['Área inclinada = área projetada × fator da inclinação.']); } },
  { mode: 'stairs', module: 'construcaoAvancada', label: 'Escada', description: 'Degraus, espelho real e comprimento.', plan: 'pro', fields: [{ key: 'totalHeight', label: 'Altura total', suffix: 'm' }, { key: 'riser', label: 'Espelho desejado', suffix: 'cm' }, { key: 'tread', label: 'Piso', suffix: 'cm' }], compute: ({ n }) => { const steps = Math.ceil(n('totalHeight', 'altura') * 100 / n('riser', 'espelho')); const realRiser = n('totalHeight', 'altura') * 100 / steps; const run = steps * n('tread', 'piso') / 100; return result(`Escada: ${steps} degraus`, [{ label: 'Degraus', value: `${steps}` }, { label: 'Espelho real', value: `${round(realRiser)} cm` }, { label: 'Comprimento', value: `${round(run)} m` }], [`Degraus: ${steps}`], 'Valide conforto, norma aplicável, patamar e espaço real.', ['Degraus = altura total ÷ espelho desejado.']); } },
  { mode: 'ramp', module: 'construcaoAvancada', label: 'Rampa', description: 'Inclinação percentual.', plan: 'free', fields: [{ key: 'totalHeight', label: 'Desnível', suffix: 'm' }, { key: 'availableLength', label: 'Comprimento disponível', suffix: 'm' }], compute: ({ n }) => { const slope = n('totalHeight', 'desnível') / n('availableLength', 'comprimento') * 100; const status = slope > 12 ? 'Íngreme' : slope > 8 ? 'Atenção' : 'Suave'; return result(`Inclinação: ${round(slope)}%`, [{ label: 'Inclinação', value: `${round(slope)}%` }, { label: 'Status', value: status }], [`Inclinação: ${round(slope)}%`], 'Verificar uso, acessibilidade, piso e segurança.', ['Inclinação = desnível ÷ comprimento × 100.']); } },
];

const hydraulicRules: Rule[] = [
  { mode: 'tank-people', module: 'hidraulicaAvancada', label: 'Caixa d’água por pessoas', description: 'Volume recomendado por autonomia.', plan: 'free', fields: [{ key: 'people', label: 'Pessoas' }, { key: 'litersPersonDay', label: 'Consumo pessoa/dia', suffix: 'L' }, { key: 'days', label: 'Autonomia', suffix: 'dias' }], compute: ({ n }) => { const liters = n('people', 'pessoas') * n('litersPersonDay', 'consumo') * n('days', 'dias'); return result(`Volume recomendado: ${round(liters)} L`, [{ label: 'Volume', value: `${round(liters)} L` }], [`Volume: ${round(liters)} L`], 'Ajuste por perfil de uso e reserva técnica.', ['Volume = pessoas × consumo diário × dias.']); } },
  { mode: 'tank-autonomy', module: 'hidraulicaAvancada', label: 'Autonomia de reservatório', description: 'Dias de autonomia.', plan: 'free', fields: [{ key: 'reservoirLiters', label: 'Reservatório', suffix: 'L' }, { key: 'people', label: 'Pessoas' }, { key: 'litersPersonDay', label: 'Consumo pessoa/dia', suffix: 'L' }], compute: ({ n }) => { const days = n('reservoirLiters', 'reservatório') / (n('people', 'pessoas') * n('litersPersonDay', 'consumo')); return result(`Autonomia: ${round(days)} dias`, [{ label: 'Dias', value: `${round(days)}` }], [`Autonomia: ${round(days)} dias`], 'Estimativa de consumo médio.', ['Autonomia = volume ÷ consumo diário.']); } },
  { mode: 'fill-time', module: 'hidraulicaAvancada', label: 'Tempo de enchimento', description: 'Tempo por volume e vazão.', plan: 'free', fields: [{ key: 'volumeLiters', label: 'Volume', suffix: 'L' }, { key: 'flow', label: 'Vazão', suffix: 'L/min' }], compute: ({ n }) => { const minutes = n('volumeLiters', 'volume') / n('flow', 'vazão'); return result(`Tempo: ${round(minutes)} min`, [{ label: 'Minutos', value: `${round(minutes)}` }, { label: 'Horas', value: `${round(minutes / 60, 2)}` }], [`Tempo: ${round(minutes)} min`], 'Vazão real pode variar com pressão e tubulação.', ['Tempo = volume ÷ vazão.']); } },
  { mode: 'fixture-flow', module: 'hidraulicaAvancada', label: 'Vazão por coleta', description: 'L/min por volume coletado.', plan: 'free', fields: [{ key: 'collectedVolume', label: 'Volume coletado', suffix: 'L' }, { key: 'collectedSeconds', label: 'Tempo', suffix: 's' }], compute: ({ n }) => { const lmin = n('collectedVolume', 'volume') / n('collectedSeconds', 'tempo') * 60; return result(`Vazão: ${round(lmin)} L/min`, [{ label: 'L/min', value: `${round(lmin)}` }, { label: 'L/h', value: `${round(lmin * 60)}` }], [`Vazão: ${round(lmin)} L/min`], 'Útil para torneira, chuveiro e ponto de consumo.', ['L/min = litros coletados ÷ segundos × 60.']); } },
  { mode: 'pool-volume', module: 'hidraulicaAvancada', label: 'Volume de piscina', description: 'Retangular ou circular.', plan: 'pro', fields: [{ key: 'width', label: 'Largura/diâmetro', suffix: 'm' }, { key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'depth', label: 'Profundidade média', suffix: 'm' }], options: [{ key: 'poolShape', label: 'Formato', options: [{ value: 'rectangular', label: 'Retangular' }, { value: 'circular', label: 'Circular' }] }], compute: ({ n, opt }) => { const m3 = opt('poolShape') === 'circular' ? Math.PI * (n('width', 'diâmetro') / 2) ** 2 * n('depth', 'profundidade') : n('width', 'largura') * n('length', 'comprimento') * n('depth', 'profundidade'); return result(`Piscina: ${round(m3, 2)} m³`, [{ label: 'm³', value: `${round(m3, 2)}` }, { label: 'Litros', value: `${round(m3 * 1000)} L` }], [`Volume: ${round(m3, 2)} m³`], 'Use profundidade média para piscinas irregulares.', ['Volume retangular = largura × comprimento × profundidade', 'Volume circular = π × raio² × profundidade.']); } },
  { mode: 'sewage-slope', module: 'hidraulicaAvancada', label: 'Inclinação de esgoto', description: 'Desnível necessário.', plan: 'pro', fields: [{ key: 'length', label: 'Comprimento', suffix: 'm' }, { key: 'slope', label: 'Inclinação desejada', suffix: '%' }], compute: ({ n }) => { const drop = n('length', 'comprimento') * n('slope', 'inclinação') / 100; return result(`Desnível: ${round(drop, 3)} m`, [{ label: 'Desnível', value: `${round(drop * 100)} cm` }], [`Desnível: ${round(drop)} m`], 'Conferir diâmetro, inspeções, interferências e norma aplicável.', ['Desnível = comprimento × inclinação ÷ 100.']); } },
  { mode: 'water-column-pressure', module: 'hidraulicaAvancada', label: 'Pressão por coluna', description: 'mca, bar e psi por altura.', plan: 'free', fields: [{ key: 'heightMeters', label: 'Altura', suffix: 'm' }], compute: ({ n }) => { const mca = n('heightMeters', 'altura'); const bar = mca / 10.197; const psi = bar * 14.5038; return result(`Pressão: ${round(mca)} mca`, [{ label: 'mca', value: `${round(mca)}` }, { label: 'bar', value: `${round(bar, 2)}` }, { label: 'psi', value: `${round(psi, 1)}` }], [`Pressão: ${round(mca)} mca`], 'Estimativa por coluna d’água vertical.', ['mca = altura em metros', 'bar = mca ÷ 10,197.']); } },
  { mode: 'pump-simple', module: 'hidraulicaAvancada', label: 'Bomba simplificada', description: 'Altura manométrica aproximada.', plan: 'pro', fields: [{ key: 'heightMeters', label: 'Altura vertical', suffix: 'm' }, { key: 'horizontalDistance', label: 'Distância horizontal', suffix: 'm' }, { key: 'flow', label: 'Vazão desejada', suffix: 'L/min' }, { key: 'losses', label: 'Perdas simplificadas', suffix: '%' }], compute: ({ n }) => { const hm = (n('heightMeters', 'altura') + n('horizontalDistance', 'distância') * 0.05) * (1 + n('losses', 'perdas') / 100); return result(`Altura manométrica: ${round(hm)} mca`, [{ label: 'HM aproximada', value: `${round(hm)} mca` }, { label: 'Vazão', value: `${round(n('flow', 'vazão'))} L/min` }], [`HM: ${round(hm)} mca`], 'Não substitui seleção por curva da bomba, perda de carga real e diâmetros.', ['HM simplificada = (altura vertical + 5% da distância horizontal) × perdas.']); } },
];

const converterRules: Rule[] = [
  { mode: 'awg-mm2', module: 'conversoresAvancados', label: 'mm² ↔ AWG', description: 'AWG próximo por seção.', plan: 'pro', fields: [{ key: 'value', label: 'Seção', suffix: 'mm²' }], compute: ({ n }) => { const value = n('value', 'seção'); const nearest = awgTable.reduce((best, item) => Math.abs(item.mm2 - value) < Math.abs(best.mm2 - value) ? item : best, awgTable[0]); return result(`AWG próximo: ${nearest.awg}`, [{ label: 'AWG', value: nearest.awg }, { label: 'Tabela', value: `${nearest.mm2} mm²` }], [`AWG: ${nearest.awg}`], 'Conversão aproximada por tabela comum.', ['Busca seção AWG mais próxima.']); } },
  { mode: 'power-units', module: 'conversoresAvancados', label: 'CV / HP / kW', description: 'Potência mecânica.', plan: 'free', fields: [{ key: 'value', label: 'Valor em kW', suffix: 'kW' }], compute: ({ n }) => result(`${round(n('value', 'valor') / 0.7355)} CV`, [{ label: 'CV', value: `${round(n('value', 'valor') / 0.7355)}` }, { label: 'HP', value: `${round(n('value', 'valor') / 0.7457)}` }], ['Conversão de potência'], 'Use uma unidade base e converta para as demais.', ['CV = kW ÷ 0,7355', 'HP = kW ÷ 0,7457.']) },
  { mode: 'thermal-units', module: 'conversoresAvancados', label: 'BTU/h / W / kcal/h', description: 'Potência térmica.', plan: 'free', fields: [{ key: 'value', label: 'Valor em BTU/h', suffix: 'BTU/h' }], compute: ({ n }) => { const w = n('value', 'BTU') * 0.293071; return result(`${round(w)} W`, [{ label: 'W', value: `${round(w)}` }, { label: 'kcal/h', value: `${round(w * 0.859845)}` }], ['Conversão térmica'], 'Referência para climatização.', ['W = BTU/h × 0,293071.']); } },
  { mode: 'pressure-units', module: 'conversoresAvancados', label: 'bar / psi / mca / kPa', description: 'Pressão completa.', plan: 'free', fields: [{ key: 'value', label: 'Valor em bar', suffix: 'bar' }], compute: ({ n }) => result(`${round(n('value', 'bar') * 14.5038)} psi`, [{ label: 'psi', value: `${round(n('value', 'bar') * 14.5038)}` }, { label: 'mca', value: `${round(n('value', 'bar') * 10.197)}` }, { label: 'kPa', value: `${round(n('value', 'bar') * 100)}` }], ['Conversão de pressão'], 'Use uma unidade base e converta para as demais.', ['psi = bar × 14,5038', 'mca = bar × 10,197', 'kPa = bar × 100.']) },
  { mode: 'flow-units', module: 'conversoresAvancados', label: 'm³/h / L/min / L/s', description: 'Vazão completa.', plan: 'free', fields: [{ key: 'value', label: 'Valor em m³/h', suffix: 'm³/h' }], compute: ({ n }) => result(`${round(n('value', 'vazão') * 1000 / 60)} L/min`, [{ label: 'L/min', value: `${round(n('value', 'vazão') * 1000 / 60)}` }, { label: 'L/s', value: `${round(n('value', 'vazão') * 1000 / 3600, 3)}` }], ['Conversão de vazão'], 'Útil para hidráulica e bombas.', ['L/min = m³/h × 1000 ÷ 60.']) },
  { mode: 'inch-mm', module: 'conversoresAvancados', label: 'Polegada ↔ mm', description: 'Polegada decimal para mm.', plan: 'free', fields: [{ key: 'value', label: 'Polegadas', suffix: 'pol' }], compute: ({ n }) => result(`${round(n('value', 'polegadas') * 25.4)} mm`, [{ label: 'mm', value: `${round(n('value', 'polegadas') * 25.4)}` }], ['Polegadas para mm'], 'Conversão rápida.', ['mm = polegadas × 25,4.']) },
  { mode: 'fraction-inch', module: 'conversoresAvancados', label: 'Fração de polegada', description: 'Decimal e mm aproximado.', plan: 'pro', fields: [{ key: 'value', label: 'Polegada decimal', suffix: 'pol' }], compute: ({ n }) => { const sixteenths = Math.round(n('value', 'pol') * 16); return result(`${sixteenths}/16 pol`, [{ label: 'Fração', value: `${sixteenths}/16` }, { label: 'mm', value: `${round(n('value', 'pol') * 25.4)}` }], ['Fração aproximada'], 'Arredonda para dezesseis avos.', ['Fração = polegadas × 16.']); } },
  { mode: 'kgf-bar', module: 'conversoresAvancados', label: 'kgf/cm² ↔ bar', description: 'Pressão técnica.', plan: 'pro', fields: [{ key: 'value', label: 'kgf/cm²' }], compute: ({ n }) => result(`${round(n('value', 'kgf') * 0.980665)} bar`, [{ label: 'bar', value: `${round(n('value', 'kgf') * 0.980665)}` }], ['kgf/cm² para bar'], 'Conversão aproximada.', ['bar = kgf/cm² × 0,980665.']) },
  { mode: 'temperature', module: 'conversoresAvancados', label: '°C ↔ °F', description: 'Temperatura.', plan: 'free', fields: [{ key: 'value', label: 'Celsius', suffix: '°C' }], compute: ({ n }) => result(`${round(n('value', 'C') * 9 / 5 + 32)} °F`, [{ label: '°F', value: `${round(n('value', 'C') * 9 / 5 + 32)}` }], ['Celsius para Fahrenheit'], 'Conversão direta.', ['°F = °C × 9/5 + 32.']) },
  { mode: 'kwh-money', module: 'conversoresAvancados', label: 'kWh ↔ R$', description: 'Custo por tarifa.', plan: 'pro', fields: [{ key: 'value', label: 'Energia', suffix: 'kWh' }, { key: 'tariff', label: 'Tarifa', suffix: 'R$/kWh' }], compute: ({ n }) => result(`Custo: ${money(n('value', 'kWh') * n('tariff', 'tarifa'))}`, [{ label: 'Custo', value: money(n('value', 'kWh') * n('tariff', 'tarifa')) }], ['kWh para R$'], 'Use tarifa local com impostos quando possível.', ['Custo = kWh × tarifa.']) },
];

const allRules = [...rules, ...constructionRules, ...hydraulicRules, ...converterRules];

function NumberField({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  return <label className="general-form-field"><span>{field.label}</span><div><input type="number" inputMode="decimal" min="0" step={field.step ?? 0.01} value={value} onChange={(event) => onChange(event.target.value)} />{field.suffix && <small>{field.suffix}</small>}</div></label>;
}

function SelectField({ option, value, onChange }: { option: Option; value: string; onChange: (value: string) => void }) {
  return <label className="general-form-field"><span>{option.label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{option.options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
}

export function ExpansionCalculatorsWorkspace({ selectedModule, userPlan = 'free', onUpgradeRequest, onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<ExpansionMode | null>(null);
  const [lockedRule, setLockedRule] = useState<Rule | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [options, setOptions] = useState<Record<string, string>>(defaultOptions);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const moduleRules = allRules.filter((rule) => rule.module === selectedModule);
  const activeRule = activeMode ? allRules.find((rule) => rule.mode === activeMode) : undefined;
  const computed = useMemo<ExpansionResult>(() => {
    if (!activeRule) return { error: null, summary: '', cards: [], details: [], orientation: '', formula: [] };
    try {
      return activeRule.compute({
        n: (key, label) => positive(parseNumber(values[key] ?? ''), label),
        opt: (key) => options[key] ?? '',
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', cards: [], details: [], orientation: '', formula: [] };
    }
  }, [activeRule, values, options]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || computed.error || computed.cards.length === 0) return;
    const capture: CalculationCapture = {
      id: createId('expansion-calc'),
      module: activeRule.module,
      moduleLabel: moduleLabel(activeRule.module),
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: computed.summary,
      details: [...computed.details, ...computed.formula.map((item) => `Fórmula: ${item}`), `Orientação: ${computed.orientation}`],
      itemType: computed.itemType ?? 'technicalObservation',
      editableDescription: computed.editableDescription ?? computed.summary,
      quantity: computed.quantity ?? '1',
      unitValue: computed.unitValue ?? '',
      shouldGenerateBudgetItem: computed.shouldGenerateBudgetItem ?? destination !== 'survey',
      reportReady: true,
      technicalNote: computed.orientation,
    };
    onCaptureCalculation?.(capture);
    setAddedMessage(`${activeRule.label} enviado ao fluxo.`);
  }

  function openRule(rule: Rule) {
    setAddedMessage(null);
    if (!canUsePlanFeature(rule.plan, userPlan)) {
      setLockedRule(rule);
      return;
    }
    setActiveMode(rule.mode);
  }

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner"><div><strong>{moduleLabel(selectedModule)}</strong><span>Ferramentas práticas com poucos campos, resultado claro e orientação para campo, orçamento ou relatório.</span></div><em>{moduleRules.length} ferramentas</em></div>
      <div className="general-picker-list">{moduleRules.map((rule) => <button className="general-picker-card" key={rule.mode} type="button" onClick={() => openRule(rule)}><span><strong>{rule.label}</strong><small>{rule.description}</small></span><em>{rule.plan === 'pro' ? 'PRO' : 'LIVRE'}</em></button>)}</div>
      {lockedRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={proFeatureTitle(lockedRule.plan)}>
          <div className="general-overlay-backdrop" onClick={() => setLockedRule(null)} />
          <section className="general-overlay-panel general-upgrade-panel">
            <header className="general-overlay-header"><button type="button" onClick={() => setLockedRule(null)}>‹</button><div><span>{moduleLabel(lockedRule.module)}</span><h2>{proFeatureTitle(lockedRule.plan)}</h2><p>{lockedRule.label} faz parte dos recursos profissionais do OrçaOS.</p></div><em>PRO</em></header>
            <div className="general-formula-box"><strong>Por que este recurso é Pro</strong><span>Ajuda a tomar decisão técnica, reduzir erro de orçamento e gerar informação pronta para levantamento, proposta ou relatório.</span><span>Os cálculos livres continuam disponíveis para testar o fluxo principal do aplicativo.</span></div>
            <div className="general-capture-actions"><button type="button" onClick={onUpgradeRequest}>Ver Loja / Pro</button><button className="secondary-action" type="button" onClick={() => setLockedRule(null)}>Continuar no gratuito</button></div>
          </section>
        </div>
      )}
      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={() => setActiveMode(null)} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header"><button type="button" onClick={() => setActiveMode(null)}>‹</button><div><span>{moduleLabel(activeRule.module)}</span><h2>{activeRule.label}</h2><p>{activeRule.description}</p></div><em>{activeRule.plan === 'pro' ? 'PRO' : 'LIVRE'}</em></header>
            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>{activeRule.fields.map((field) => <NumberField key={field.key} field={field} value={values[field.key] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />)}{activeRule.options?.map((option) => <SelectField key={option.key} option={option} value={options[option.key] ?? option.options[0]?.value ?? ''} onChange={(value) => setOptions((current) => ({ ...current, [option.key]: value }))} />)}</form>
            {computed.error && <p className="general-error-message">{computed.error}</p>}
            {computed.cards.length > 0 && <div className="general-result-grid">{computed.cards.map((item) => <article className="general-result-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong>{item.helper && <small>{item.helper}</small>}</article>)}</div>}
            {computed.formula.length > 0 && <div className="general-formula-box"><strong>{activeRule.mode === 'dr-dps-checklist' ? 'Como este checklist decide' : 'Como este cálculo é feito'}</strong>{computed.formula.map((item) => <span key={item}>{item}</span>)}</div>}
            {computed.orientation && <p className="general-helper-text">{computed.orientation}</p>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}
            <div className="general-capture-actions"><button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button><button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button><button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button><button className="secondary-action" type="button" onClick={() => setActiveMode(null)}>Voltar</button></div>
            <small className="general-technical-note">{activeRule.mode === 'dr-dps-checklist' ? 'Checklist orientativo. Validar quadro, aterramento, esquema elétrico e normas aplicáveis antes de executar.' : 'Cálculo preliminar. Validar condições reais, normas aplicáveis, fabricante e medições antes de executar.'}</small>
          </section>
        </div>
      )}
    </div>
  );
}
