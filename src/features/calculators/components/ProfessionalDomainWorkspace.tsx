import { useMemo, useState } from 'react';
import type { CalculatorModule } from '../../../core/access/featureAccess';
import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import './GeneralCalculatorWorkspace.css';

export type DomainMode =
  | 'btu-area'
  | 'ac-consumption'
  | 'ac-circuit'
  | 'motor-current'
  | 'motor-start'
  | 'thermal-relay'
  | 'contactor'
  | 'capacitor'
  | 'pulley'
  | 'slip'
  | 'torque'
  | 'sync-rpm'
  | 'poles'
  | 'polar-pitch'
  | 'winding-checklist'
  | 'transformer-va'
  | 'transformer-current'
  | 'transformer-ratio'
  | 'turns-per-volt'
  | 'turns-estimate'
  | 'core-power'
  | 'solar-consumption'
  | 'solar-kwp'
  | 'solar-modules'
  | 'solar-area'
  | 'solar-generation'
  | 'solar-payback'
  | 'solar-battery'
  | 'urgency'
  | 'risk'
  | 'maintenance'
  | 'preventive-vs-corrective'
  | 'diagnostic-checklist';

interface Props {
  selectedModule: CalculatorModule;
  modeFilter?: DomainMode[];
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface FieldConfig {
  key: string;
  label: string;
  suffix?: string;
  step?: number;
}

interface OptionConfig {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface DomainResult {
  error: string | null;
  summary: string;
  cards: ResultCardData[];
  details: string[];
  orientation: string;
  formula: string[];
  itemType?: TechnicalItemType;
  editableDescription?: string;
  quantity?: string;
  unitValue?: string;
  shouldGenerateBudgetItem?: boolean;
}

interface DomainRule {
  mode: DomainMode;
  module: CalculatorModule;
  label: string;
  description: string;
  plan: 'free' | 'pro' | 'soon';
  fields: FieldConfig[];
  options?: OptionConfig[];
  compute: (ctx: ComputeContext) => DomainResult;
}

interface ComputeContext {
  n: (key: string, label: string) => number;
  opt: (key: string) => string;
}

const commercialBtus = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

const defaultValues: Record<string, string> = {
  area: '12',
  ceiling: '2.7',
  people: '2',
  equipment: '1',
  powerWatts: '1200',
  hoursPerDay: '8',
  days: '22',
  tariff: '0.95',
  voltage: '220',
  distance: '20',
  power: '1.5',
  efficiency: '85',
  powerFactor: '0.82',
  current: '10',
  multiplier: '6',
  adjustment: '1.05',
  rpmMotor: '1720',
  rpmDriven: '860',
  diameterMotor: '80',
  diameterDriven: '160',
  frequency: '60',
  poles: '4',
  slots: '36',
  primaryVoltage: '220',
  secondaryVoltage: '24',
  secondaryCurrent: '10',
  va: '500',
  turns: '220',
  turnsPerVolt: '2',
  coreArea: '10',
  empiricalFactor: '1.2',
  monthlyConsumption: '450',
  sunHours: '4.8',
  losses: '20',
  modulePower: '550',
  moduleArea: '2.6',
  kwp: '3',
  investment: '14000',
  monthlySavings: '350',
  dailyConsumption: '5',
  autonomyDays: '1',
  batteryVoltage: '24',
  dischargeDepth: '50',
  riskA: '2',
  riskB: '2',
  riskC: '2',
  preventiveCost: '250',
  correctiveCost: '1200',
  failureProbability: '35',
  lastMaintenanceDays: '120',
  periodicityDays: '180',
};

const defaultOptions: Record<string, string> = {
  sun: 'normal',
  phase: 'single',
  powerUnit: 'kw',
  startType: 'direct',
  capacitorType: 'permanent',
  diagnosticCategory: 'eletrica',
};

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
  if (module === 'refrigeration') return 'Climatização';
  if (module === 'motors') return 'Motores e comandos';
  if (module === 'rewinding') return 'Rebobinagem';
  if (module === 'transformadores') return 'Transformadores';
  if (module === 'solar') return 'Solar fotovoltaico';
  if (module === 'diagnosticoTecnico') return 'Assistentes de diagnóstico';
  return 'Cálculos técnicos';
}

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[], extra: Partial<DomainResult> = {}): DomainResult {
  return { error: null, summary, cards, details, orientation, formula, ...extra };
}

function btuCommercial(value: number): string {
  const suggested = commercialBtus.find((item) => item >= value);
  return suggested ? `${suggested.toLocaleString('pt-BR')} BTU/h` : 'Acima de 60.000 BTU/h';
}

function powerToKw(value: number, unit: string): number {
  if (unit === 'cv') return value * 0.7355;
  if (unit === 'hp') return value * 0.7457;
  return value;
}

const rules: DomainRule[] = [
  { mode: 'btu-area', module: 'refrigeration', label: 'BTU por área', description: 'Capacidade por área, pessoas, equipamentos e insolação.', plan: 'pro', fields: [{ key: 'area', label: 'Área', suffix: 'm²' }, { key: 'people', label: 'Pessoas', suffix: 'un.' }, { key: 'equipment', label: 'Equipamentos', suffix: 'un.' }], options: [{ key: 'sun', label: 'Insolação', options: [{ value: 'low', label: 'Baixa' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'Alta' }] }], compute: ({ n, opt }) => { const area = n('area', 'área'); const people = n('people', 'pessoas'); const equipment = n('equipment', 'equipamentos'); const sunFactor = opt('sun') === 'high' ? 1.18 : opt('sun') === 'low' ? 0.92 : 1; const base = area * 600; const extraPeople = Math.max(people - 2, 0) * 600; const extraEquipment = equipment * 600; const btuh = (base + extraPeople + extraEquipment) * sunFactor; return result(`Capacidade sugerida: ${btuCommercial(btuh)}`, [{ label: 'Carga estimada', value: `${round(btuh)} BTU/h` }, { label: 'Faixa comercial', value: btuCommercial(btuh) }, { label: 'Correções', value: `${round((sunFactor - 1) * 100)}%`, helper: 'insolação' }], [`Área: ${round(area)} m²`, `Pessoas: ${round(people)}`, `Equipamentos: ${round(equipment)}`, `Carga estimada: ${round(btuh)} BTU/h`], 'Estimativa inicial. Ambientes com cozinha, pé-direito alto, vidros grandes ou carga térmica incomum exigem avaliação específica.', ['BTU/h = área × 600 + pessoas adicionais × 600 + equipamentos × 600', 'Resultado ajustado por insolação.']); } },
  { mode: 'ac-consumption', module: 'refrigeration', label: 'Consumo mensal de ar', description: 'kWh/mês e custo estimado.', plan: 'free', fields: [{ key: 'powerWatts', label: 'Potência', suffix: 'W' }, { key: 'hoursPerDay', label: 'Horas/dia', suffix: 'h' }, { key: 'days', label: 'Dias/mês' }, { key: 'tariff', label: 'Tarifa', suffix: 'R$/kWh' }], compute: ({ n }) => { const kwh = n('powerWatts', 'potência') * n('hoursPerDay', 'horas') * n('days', 'dias') / 1000; const cost = kwh * n('tariff', 'tarifa'); return result(`Consumo: ${round(kwh)} kWh/mês`, [{ label: 'Energia', value: `${round(kwh)} kWh` }, { label: 'Custo', value: money(cost) }], [`Consumo: ${round(kwh)} kWh/mês`, `Custo: ${money(cost)}`], 'Use potência elétrica do equipamento ou estimativa do fabricante. Equipamentos inverter variam conforme uso real.', ['kWh = potência W × horas/dia × dias ÷ 1000', 'Custo = kWh × tarifa.']); } },
  { mode: 'ac-circuit', module: 'refrigeration', label: 'Circuito para ar-condicionado', description: 'Corrente estimada e alerta de circuito dedicado.', plan: 'pro', fields: [{ key: 'powerWatts', label: 'Potência', suffix: 'W' }, { key: 'voltage', label: 'Tensão', suffix: 'V' }, { key: 'distance', label: 'Distância', suffix: 'm' }], compute: ({ n }) => { const current = n('powerWatts', 'potência') / n('voltage', 'tensão'); return result(`Corrente estimada: ${round(current)} A`, [{ label: 'Corrente', value: `${round(current)} A` }, { label: 'Circuito', value: 'Dedicado', helper: 'recomendado' }], [`Corrente: ${round(current)} A`, `Distância: ${round(n('distance', 'distância'))} m`], 'Ar-condicionado normalmente exige circuito dedicado e validação de cabo, disjuntor, tomada/conexão e queda de tensão.', ['Corrente = potência ÷ tensão.']); } },
  { mode: 'motor-current', module: 'motors', label: 'Corrente nominal', description: 'Corrente por potência, tensão, fase, rendimento e FP.', plan: 'pro', fields: [{ key: 'power', label: 'Potência', suffix: 'kW/CV/HP' }, { key: 'voltage', label: 'Tensão', suffix: 'V' }, { key: 'efficiency', label: 'Rendimento', suffix: '%' }, { key: 'powerFactor', label: 'Fator de potência' }], options: [{ key: 'powerUnit', label: 'Unidade', options: [{ value: 'kw', label: 'kW' }, { value: 'cv', label: 'CV' }, { value: 'hp', label: 'HP' }] }, { key: 'phase', label: 'Fase', options: [{ value: 'single', label: 'Monofásico' }, { value: 'three', label: 'Trifásico' }] }], compute: ({ n, opt }) => { const kw = powerToKw(n('power', 'potência'), opt('powerUnit')); const divisor = opt('phase') === 'three' ? Math.sqrt(3) * n('voltage', 'tensão') * (n('efficiency', 'rendimento') / 100) * n('powerFactor', 'fator de potência') : n('voltage', 'tensão') * (n('efficiency', 'rendimento') / 100) * n('powerFactor', 'fator de potência'); const current = kw * 1000 / divisor; return result(`Corrente nominal: ${round(current)} A`, [{ label: 'Corrente', value: `${round(current)} A` }, { label: 'Potência', value: `${round(kw, 3)} kW` }], [`Corrente estimada: ${round(current)} A`], 'Estimativa. Para proteção e comando, conferir placa do motor, regime, partida e condições de instalação.', ['Corrente trifásica = P(W) ÷ (√3 × V × rendimento × FP)', 'Corrente monofásica = P(W) ÷ (V × rendimento × FP)']); } },
  { mode: 'motor-start', module: 'motors', label: 'Corrente de partida', description: 'Corrente de partida por multiplicador.', plan: 'pro', fields: [{ key: 'current', label: 'Corrente nominal', suffix: 'A' }, { key: 'multiplier', label: 'Multiplicador', suffix: 'x' }], compute: ({ n }) => { const start = n('current', 'corrente') * n('multiplier', 'multiplicador'); return result(`Partida estimada: ${round(start)} A`, [{ label: 'Partida', value: `${round(start)} A` }], [`Partida: ${round(start)} A`], 'Use multiplicador conforme tipo de partida e dados do motor. Validar queda de tensão e proteção.', ['Corrente de partida = corrente nominal × multiplicador.']); } },
  { mode: 'thermal-relay', module: 'motors', label: 'Relé térmico', description: 'Ajuste preliminar do relé.', plan: 'pro', fields: [{ key: 'current', label: 'Corrente nominal', suffix: 'A' }, { key: 'adjustment', label: 'Fator de ajuste' }], compute: ({ n }) => { const adjust = n('current', 'corrente') * n('adjustment', 'fator'); return result(`Ajuste sugerido: ${round(adjust)} A`, [{ label: 'Relé', value: `${round(adjust)} A` }], [`Ajuste: ${round(adjust)} A`], 'Ajuste deve respeitar placa, regime e fabricante. Não substitui coordenação de proteção.', ['Ajuste = corrente nominal × fator.']); } },
  { mode: 'contactor', module: 'motors', label: 'Contator', description: 'Corrente mínima do contator.', plan: 'pro', fields: [{ key: 'current', label: 'Corrente do motor', suffix: 'A' }, { key: 'adjustment', label: 'Folga', suffix: 'x' }], compute: ({ n }) => { const min = n('current', 'corrente') * n('adjustment', 'folga'); return result(`Contator mínimo: ${round(min)} A`, [{ label: 'Corrente mínima', value: `${round(min)} A` }], [`Contator: ${round(min)} A`], 'Validar categoria de aplicação, tensão da bobina, manobras/hora e fabricante.', ['Corrente mínima = corrente do motor × folga.']); } },
  { mode: 'capacitor', module: 'motors', label: 'Capacitor monofásico', description: 'Estimativa inicial de capacitância.', plan: 'pro', fields: [{ key: 'power', label: 'Potência', suffix: 'CV/kW' }, { key: 'voltage', label: 'Tensão', suffix: 'V' }], options: [{ key: 'powerUnit', label: 'Unidade', options: [{ value: 'cv', label: 'CV' }, { value: 'kw', label: 'kW' }] }, { key: 'capacitorType', label: 'Tipo', options: [{ value: 'permanent', label: 'Permanente' }, { value: 'start', label: 'Partida' }] }], compute: ({ n, opt }) => { const cv = opt('powerUnit') === 'kw' ? n('power', 'potência') / 0.7355 : n('power', 'potência'); const factor = opt('capacitorType') === 'start' ? 220 : 45; const uf = cv * factor * (220 / n('voltage', 'tensão')); return result(`Capacitor estimado: ${round(uf)} µF`, [{ label: 'Capacitância', value: `${round(uf)} µF` }], [`Capacitância: ${round(uf)} µF`], 'Estimativa grosseira. Sempre validar com placa/manual do motor e capacitor original.', ['µF estimado = CV × fator empírico × correção de tensão.']); } },
  { mode: 'pulley', module: 'motors', label: 'Relação de polias', description: 'RPM final por diâmetros.', plan: 'pro', fields: [{ key: 'rpmMotor', label: 'RPM motor' }, { key: 'diameterMotor', label: 'Polia motor', suffix: 'mm' }, { key: 'diameterDriven', label: 'Polia movida', suffix: 'mm' }], compute: ({ n }) => { const rpm = n('rpmMotor', 'RPM') * n('diameterMotor', 'polia motor') / n('diameterDriven', 'polia movida'); return result(`RPM final: ${round(rpm)} rpm`, [{ label: 'Rotação', value: `${round(rpm)} rpm` }], [`RPM final: ${round(rpm)}`], 'Estimativa sem considerar escorregamento de correia.', ['RPM movida = RPM motor × diâmetro motora ÷ diâmetro movida.']); } },
  { mode: 'slip', module: 'motors', label: 'Escorregamento', description: 'Escorregamento por RPM síncrona e real.', plan: 'pro', fields: [{ key: 'rpmMotor', label: 'RPM síncrona' }, { key: 'rpmDriven', label: 'RPM real' }], compute: ({ n }) => { const slip = (n('rpmMotor', 'RPM síncrona') - n('rpmDriven', 'RPM real')) / n('rpmMotor', 'RPM síncrona') * 100; return result(`Escorregamento: ${round(slip)}%`, [{ label: 'Escorregamento', value: `${round(slip)}%` }], [`Escorregamento: ${round(slip)}%`], 'Compare com a placa e condição de carga do motor.', ['Escorregamento = (RPM síncrona - RPM real) ÷ RPM síncrona × 100.']); } },
  { mode: 'torque', module: 'motors', label: 'Torque', description: 'Torque por potência e rotação.', plan: 'pro', fields: [{ key: 'power', label: 'Potência', suffix: 'kW' }, { key: 'rpmMotor', label: 'Rotação', suffix: 'rpm' }], compute: ({ n }) => { const torque = 9550 * n('power', 'potência') / n('rpmMotor', 'rotação'); return result(`Torque: ${round(torque)} N.m`, [{ label: 'Torque', value: `${round(torque)} N.m` }], [`Torque: ${round(torque)} N.m`], 'Estimativa mecânica ideal, sem perdas adicionais do acoplamento.', ['Torque N.m = 9550 × kW ÷ rpm.']); } },
  { mode: 'sync-rpm', module: 'rewinding', label: 'Rotação síncrona', description: 'RPM síncrona por frequência e polos.', plan: 'pro', fields: [{ key: 'frequency', label: 'Frequência', suffix: 'Hz' }, { key: 'poles', label: 'Polos' }], compute: ({ n }) => { const rpm = 120 * n('frequency', 'frequência') / n('poles', 'polos'); return result(`Rotação síncrona: ${round(rpm)} rpm`, [{ label: 'RPM', value: `${round(rpm)} rpm` }], [`RPM síncrona: ${round(rpm)}`], 'Base para conferência. Motor real opera abaixo por escorregamento.', ['RPM = 120 × frequência ÷ polos.']); } },
  { mode: 'poles', module: 'rewinding', label: 'Número de polos', description: 'Polos estimados por frequência e RPM.', plan: 'pro', fields: [{ key: 'frequency', label: 'Frequência', suffix: 'Hz' }, { key: 'rpmMotor', label: 'RPM síncrona aproximada' }], compute: ({ n }) => { const poles = Math.round(120 * n('frequency', 'frequência') / n('rpmMotor', 'RPM')); return result(`Polos estimados: ${poles}`, [{ label: 'Polos', value: `${poles}` }], [`Polos: ${poles}`], 'Use rotações síncronas comerciais como referência.', ['Polos = 120 × frequência ÷ RPM síncrona.']); } },
  { mode: 'polar-pitch', module: 'rewinding', label: 'Passo polar básico', description: 'Ranhuras por polo.', plan: 'pro', fields: [{ key: 'slots', label: 'Ranhuras' }, { key: 'poles', label: 'Polos' }], compute: ({ n }) => { const pitch = n('slots', 'ranhuras') / n('poles', 'polos'); return result(`Passo polar: ${round(pitch, 2)} ranhuras/polo`, [{ label: 'Passo', value: `${round(pitch, 2)}` }], [`Passo polar: ${round(pitch, 2)}`], 'Estrutura inicial. Não gera mapa completo de bobinagem.', ['Passo polar = ranhuras ÷ polos.']); } },
  { mode: 'winding-checklist', module: 'rewinding', label: 'Checklist de bobinagem', description: 'Assistente textual seguro para conferência.', plan: 'soon', fields: [], compute: () => result('Checklist de bobinagem preparado', [{ label: 'Conferir', value: 'Placa, fechamento, rotação' }], ['Conferir tensão de trabalho', 'Conferir fechamento', 'Marcar início/fim das bobinas', 'Conferir capacitor/chave quando monofásico'], 'Assistente textual. Mapa completo de bobinagem deve ser validado por especialista antes de virar cálculo automático.', ['Checklist técnico, sem fórmula numérica.'], { shouldGenerateBudgetItem: false, itemType: 'diagnostic' }) },
  { mode: 'transformer-va', module: 'transformadores', label: 'VA do transformador', description: 'VA por tensão e corrente secundária.', plan: 'pro', fields: [{ key: 'secondaryVoltage', label: 'Tensão secundária', suffix: 'V' }, { key: 'secondaryCurrent', label: 'Corrente secundária', suffix: 'A' }], compute: ({ n }) => { const va = n('secondaryVoltage', 'tensão') * n('secondaryCurrent', 'corrente'); return result(`Transformador: ${round(va)} VA`, [{ label: 'Potência', value: `${round(va)} VA` }], [`VA: ${round(va)}`], 'Adicionar margem e validar tipo de carga, aquecimento e fabricante.', ['VA = tensão secundária × corrente secundária.']); } },
  { mode: 'transformer-current', module: 'transformadores', label: 'Correntes primária/secundária', description: 'Corrente por VA e tensões.', plan: 'pro', fields: [{ key: 'va', label: 'Potência', suffix: 'VA' }, { key: 'primaryVoltage', label: 'Primário', suffix: 'V' }, { key: 'secondaryVoltage', label: 'Secundário', suffix: 'V' }], compute: ({ n }) => { const ip = n('va', 'VA') / n('primaryVoltage', 'primário'); const is = n('va', 'VA') / n('secondaryVoltage', 'secundário'); return result(`Correntes: ${round(ip)} A / ${round(is)} A`, [{ label: 'Primário', value: `${round(ip)} A` }, { label: 'Secundário', value: `${round(is)} A` }], [`Ip: ${round(ip)} A`, `Is: ${round(is)} A`], 'Estimativa ideal. Considerar rendimento, aquecimento e proteção.', ['I = VA ÷ tensão.']); } },
  { mode: 'transformer-ratio', module: 'transformadores', label: 'Relação de transformação', description: 'Relação entre tensões.', plan: 'pro', fields: [{ key: 'primaryVoltage', label: 'Primário', suffix: 'V' }, { key: 'secondaryVoltage', label: 'Secundário', suffix: 'V' }], compute: ({ n }) => { const ratio = n('primaryVoltage', 'primário') / n('secondaryVoltage', 'secundário'); return result(`Relação: ${round(ratio, 2)}:1`, [{ label: 'Relação', value: `${round(ratio, 2)}:1` }], [`Relação: ${round(ratio, 2)}:1`], 'Relação ideal por tensão nominal.', ['Relação = tensão primária ÷ tensão secundária.']); } },
  { mode: 'turns-per-volt', module: 'transformadores', label: 'Espiras por volt', description: 'Espiras por tensão.', plan: 'pro', fields: [{ key: 'turns', label: 'Espiras' }, { key: 'secondaryVoltage', label: 'Tensão', suffix: 'V' }], compute: ({ n }) => { const epv = n('turns', 'espiras') / n('secondaryVoltage', 'tensão'); return result(`Espiras/volt: ${round(epv, 2)}`, [{ label: 'Esp/V', value: `${round(epv, 2)}` }], [`Espiras por volt: ${round(epv, 2)}`], 'Usar apenas como estimativa didática ou conferência.', ['Espiras/volt = espiras ÷ tensão.']); } },
  { mode: 'turns-estimate', module: 'transformadores', label: 'Estimativa de espiras', description: 'Espiras por tensão e espiras/volt.', plan: 'pro', fields: [{ key: 'secondaryVoltage', label: 'Tensão', suffix: 'V' }, { key: 'turnsPerVolt', label: 'Espiras/volt' }], compute: ({ n }) => { const turns = n('secondaryVoltage', 'tensão') * n('turnsPerVolt', 'espiras/volt'); return result(`Espiras estimadas: ${Math.round(turns)}`, [{ label: 'Espiras', value: `${Math.round(turns)}` }], [`Espiras: ${Math.round(turns)}`], 'Estimativa. Projeto de transformador exige validação de núcleo, fluxo, bitola e aquecimento.', ['Espiras = tensão × espiras/volt.']); } },
  { mode: 'core-power', module: 'transformadores', label: 'Potência por núcleo', description: 'Potência empírica por área do núcleo.', plan: 'pro', fields: [{ key: 'coreArea', label: 'Área do núcleo', suffix: 'cm²' }, { key: 'empiricalFactor', label: 'Fator empírico' }], compute: ({ n }) => { const power = (n('coreArea', 'área') ** 2) * n('empiricalFactor', 'fator'); return result(`Potência aproximada: ${round(power)} VA`, [{ label: 'Potência', value: `${round(power)} VA` }], [`Potência aproximada: ${round(power)} VA`], 'Regra empírica, não substitui projeto magnético.', ['Potência aproximada = área² × fator empírico.']); } },
  { mode: 'solar-consumption', module: 'solar', label: 'Consumo mensal', description: 'kWh/mês por potência, horas e dias.', plan: 'free', fields: [{ key: 'powerWatts', label: 'Potência', suffix: 'W' }, { key: 'hoursPerDay', label: 'Horas/dia' }, { key: 'days', label: 'Dias/mês' }], compute: ({ n }) => { const kwh = n('powerWatts', 'potência') * n('hoursPerDay', 'horas') * n('days', 'dias') / 1000; return result(`Consumo: ${round(kwh)} kWh/mês`, [{ label: 'Consumo', value: `${round(kwh)} kWh/mês` }], [`Consumo: ${round(kwh)} kWh/mês`], 'Some os equipamentos ou use conta de energia para projeto inicial.', ['kWh = W × horas/dia × dias ÷ 1000.']); } },
  { mode: 'solar-kwp', module: 'solar', label: 'Potência do sistema', description: 'kWp por consumo, HSP e perdas.', plan: 'pro', fields: [{ key: 'monthlyConsumption', label: 'Consumo mensal', suffix: 'kWh' }, { key: 'sunHours', label: 'Horas sol pico' }, { key: 'losses', label: 'Perdas', suffix: '%' }], compute: ({ n }) => { const kwp = n('monthlyConsumption', 'consumo') / (30 * n('sunHours', 'HSP') * (1 - n('losses', 'perdas') / 100)); return result(`Sistema estimado: ${round(kwp, 2)} kWp`, [{ label: 'Potência', value: `${round(kwp, 2)} kWp` }], [`kWp: ${round(kwp, 2)}`], 'Estimativa inicial. Projeto fotovoltaico depende de irradiação local, orientação, sombras e normas aplicáveis.', ['kWp = consumo mensal ÷ (30 × HSP × eficiência).']); } },
  { mode: 'solar-modules', module: 'solar', label: 'Quantidade de módulos', description: 'Módulos por kWp e potência unitária.', plan: 'pro', fields: [{ key: 'kwp', label: 'Sistema', suffix: 'kWp' }, { key: 'modulePower', label: 'Módulo', suffix: 'W' }], compute: ({ n }) => { const qty = Math.ceil(n('kwp', 'kWp') * 1000 / n('modulePower', 'módulo')); return result(`Módulos: ${qty}`, [{ label: 'Quantidade', value: `${qty}` }], [`Módulos: ${qty}`], 'Arredondado para cima. Conferir arranjo do inversor.', ['Módulos = kWp × 1000 ÷ potência do módulo.']); } },
  { mode: 'solar-area', module: 'solar', label: 'Área necessária', description: 'Área por quantidade de módulos.', plan: 'pro', fields: [{ key: 'people', label: 'Módulos', suffix: 'un.' }, { key: 'moduleArea', label: 'Área por módulo', suffix: 'm²' }], compute: ({ n }) => { const area = n('people', 'módulos') * n('moduleArea', 'área'); return result(`Área aproximada: ${round(area)} m²`, [{ label: 'Área', value: `${round(area)} m²` }], [`Área: ${round(area)} m²`], 'Adicionar área de manutenção, afastamentos e condição do telhado.', ['Área = módulos × área por módulo.']); } },
  { mode: 'solar-generation', module: 'solar', label: 'Geração mensal', description: 'kWh/mês por kWp, HSP e perdas.', plan: 'pro', fields: [{ key: 'kwp', label: 'Sistema', suffix: 'kWp' }, { key: 'sunHours', label: 'Horas sol pico' }, { key: 'losses', label: 'Perdas', suffix: '%' }], compute: ({ n }) => { const kwh = n('kwp', 'kWp') * n('sunHours', 'HSP') * 30 * (1 - n('losses', 'perdas') / 100); return result(`Geração: ${round(kwh)} kWh/mês`, [{ label: 'Geração', value: `${round(kwh)} kWh/mês` }], [`Geração: ${round(kwh)} kWh/mês`], 'Estimativa. Não substitui simulação com dados locais.', ['kWh/mês = kWp × HSP × 30 × eficiência.']); } },
  { mode: 'solar-payback', module: 'solar', label: 'Payback simples', description: 'Retorno por investimento e economia.', plan: 'free', fields: [{ key: 'investment', label: 'Investimento', suffix: 'R$' }, { key: 'monthlySavings', label: 'Economia mensal', suffix: 'R$' }], compute: ({ n }) => { const months = n('investment', 'investimento') / n('monthlySavings', 'economia'); return result(`Payback: ${round(months)} meses`, [{ label: 'Meses', value: `${round(months)}` }, { label: 'Anos', value: `${round(months / 12, 1)}` }], [`Payback: ${round(months)} meses`], 'Payback simples não considera inflação, reajuste tarifário, manutenção ou degradação.', ['Payback = investimento ÷ economia mensal.']); } },
  { mode: 'solar-battery', module: 'solar', label: 'Bateria/autonomia básica', description: 'Banco em Ah por consumo e autonomia.', plan: 'pro', fields: [{ key: 'dailyConsumption', label: 'Consumo diário', suffix: 'kWh' }, { key: 'autonomyDays', label: 'Autonomia', suffix: 'dias' }, { key: 'batteryVoltage', label: 'Tensão banco', suffix: 'V' }, { key: 'dischargeDepth', label: 'Profundidade descarga', suffix: '%' }], compute: ({ n }) => { const ah = n('dailyConsumption', 'consumo') * 1000 * n('autonomyDays', 'autonomia') / (n('batteryVoltage', 'tensão') * (n('dischargeDepth', 'descarga') / 100)); return result(`Banco estimado: ${round(ah)} Ah`, [{ label: 'Capacidade', value: `${round(ah)} Ah` }], [`Capacidade: ${round(ah)} Ah`], 'Estimativa inicial. Baterias exigem projeto específico, corrente, BMS/controlador e regime de descarga.', ['Ah = Wh diário × dias ÷ (tensão × profundidade de descarga).']); } },
  { mode: 'urgency', module: 'diagnosticoTecnico', label: 'Classificação de urgência', description: 'Baixo, médio, alto ou urgente.', plan: 'pro', fields: [{ key: 'riskA', label: 'Risco técnico', suffix: '0-3' }, { key: 'riskB', label: 'Impacto no uso', suffix: '0-3' }, { key: 'riskC', label: 'Recorrência', suffix: '0-3' }], compute: ({ n }) => { const score = nonNegative(n('riskA', 'risco'), 'risco') + nonNegative(n('riskB', 'impacto'), 'impacto') + nonNegative(n('riskC', 'recorrência'), 'recorrência'); const label = score >= 8 ? 'Urgente' : score >= 6 ? 'Alto' : score >= 3 ? 'Médio' : 'Baixo'; return result(`Urgência: ${label}`, [{ label: 'Classificação', value: label }, { label: 'Pontuação', value: `${round(score)}/9` }], [`Urgência: ${label}`, `Pontuação: ${round(score)}/9`], 'Use como linguagem de relatório para priorizar atendimento e orientar o cliente.', ['Pontuação = risco + impacto + recorrência.'], { itemType: 'diagnostic', shouldGenerateBudgetItem: false }); } },
  { mode: 'risk', module: 'diagnosticoTecnico', label: 'Classificação de risco', description: 'Matriz simples para relatório.', plan: 'pro', fields: [{ key: 'riskA', label: 'Probabilidade', suffix: '1-5' }, { key: 'riskB', label: 'Severidade', suffix: '1-5' }], compute: ({ n }) => { const score = n('riskA', 'probabilidade') * n('riskB', 'severidade'); const label = score >= 16 ? 'Alto' : score >= 8 ? 'Médio' : 'Baixo'; return result(`Risco: ${label}`, [{ label: 'Risco', value: label }, { label: 'Matriz', value: `${round(score)}` }], [`Risco: ${label}`, `Matriz: ${round(score)}`], 'Útil para relatório técnico, sem substituir inspeção detalhada.', ['Risco = probabilidade × severidade.'], { itemType: 'diagnostic', shouldGenerateBudgetItem: false }); } },
  { mode: 'maintenance', module: 'diagnosticoTecnico', label: 'Manutenção preventiva', description: 'Status por última manutenção e periodicidade.', plan: 'free', fields: [{ key: 'lastMaintenanceDays', label: 'Dias desde manutenção' }, { key: 'periodicityDays', label: 'Periodicidade', suffix: 'dias' }], compute: ({ n }) => { const elapsed = n('lastMaintenanceDays', 'dias'); const period = n('periodicityDays', 'periodicidade'); const remaining = period - elapsed; const status = remaining < 0 ? 'Vencida' : remaining <= period * 0.2 ? 'Atenção' : 'Em dia'; return result(`Manutenção: ${status}`, [{ label: 'Status', value: status }, { label: 'Prazo', value: remaining >= 0 ? `${round(remaining)} dias` : `${round(Math.abs(remaining))} dias vencida` }], [`Status: ${status}`], 'Transforma manutenção em ação clara para o cliente.', ['Prazo restante = periodicidade - dias desde a última manutenção.'], { itemType: 'diagnostic', shouldGenerateBudgetItem: false }); } },
  { mode: 'preventive-vs-corrective', module: 'diagnosticoTecnico', label: 'Preventiva vs corretiva', description: 'Economia potencial por probabilidade de falha.', plan: 'pro', fields: [{ key: 'preventiveCost', label: 'Custo preventivo', suffix: 'R$' }, { key: 'correctiveCost', label: 'Custo corretivo', suffix: 'R$' }, { key: 'failureProbability', label: 'Probabilidade', suffix: '%' }], compute: ({ n }) => { const expected = n('correctiveCost', 'corretivo') * n('failureProbability', 'probabilidade') / 100; const economy = expected - n('preventiveCost', 'preventivo'); return result(`Economia potencial: ${money(economy)}`, [{ label: 'Custo esperado', value: money(expected) }, { label: 'Preventiva', value: money(n('preventiveCost', 'preventivo')) }, { label: 'Diferença', value: money(economy) }], [`Economia potencial: ${money(economy)}`], 'Use como argumento comercial quando a preventiva reduz risco e parada.', ['Custo esperado = custo corretivo × probabilidade', 'Economia = custo esperado - custo preventivo.'], { itemType: 'diagnostic', shouldGenerateBudgetItem: false }); } },
  { mode: 'diagnostic-checklist', module: 'diagnosticoTecnico', label: 'Checklist de diagnóstico', description: 'Texto técnico por categoria.', plan: 'free', fields: [], options: [{ key: 'diagnosticCategory', label: 'Categoria', options: [{ value: 'eletrica', label: 'Elétrica' }, { value: 'hidraulica', label: 'Hidráulica' }, { value: 'ar', label: 'Ar-condicionado' }, { value: 'motor', label: 'Motor' }, { value: 'obra', label: 'Pintura/reforma' }] }], compute: ({ opt }) => { const category = opt('diagnosticCategory'); const list = category === 'eletrica' ? ['Conferir quadro, proteções, aquecimento e aterramento.', 'Registrar circuitos críticos e pontos de risco.'] : category === 'hidraulica' ? ['Conferir vazamentos, pressão, registros e reservatório.', 'Registrar pontos de infiltração e urgência.'] : category === 'ar' ? ['Conferir filtros, dreno, serpentina, consumo e instalação elétrica.'] : category === 'motor' ? ['Conferir placa, corrente, ruído, aquecimento, partida e proteção.'] : ['Conferir base, umidade, trincas, rendimento e acabamento.']; return result('Checklist técnico gerado', [{ label: 'Categoria', value: category }], list, 'Use o checklist como base de relatório e complete com fotos, medições e observações reais.', ['Assistente textual, sem fórmula numérica.'], { itemType: 'diagnostic', shouldGenerateBudgetItem: false }); } },
];

function NumberField({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (value: string) => void }) {
  return <label className="general-form-field"><span>{field.label}</span><div><input type="number" inputMode="decimal" min="0" step={field.step ?? 0.01} value={value} onChange={(event) => onChange(event.target.value)} />{field.suffix && <small>{field.suffix}</small>}</div></label>;
}

function SelectField({ option, value, onChange }: { option: OptionConfig; value: string; onChange: (value: string) => void }) {
  return <label className="general-form-field"><span>{option.label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{option.options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
}

export function ProfessionalDomainWorkspace({ selectedModule, modeFilter, onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<DomainMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [options, setOptions] = useState<Record<string, string>>(defaultOptions);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const moduleRules = rules.filter((rule) => rule.module === selectedModule && (!modeFilter || modeFilter.includes(rule.mode)));
  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  const computed = useMemo<DomainResult>(() => {
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

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function setOption(key: string, value: string) {
    setOptions((current) => ({ ...current, [key]: value }));
  }

  function openRule(mode: DomainMode) {
    setActiveMode(mode);
    setAddedMessage(null);
  }

  function closeRule() {
    setActiveMode(null);
    setAddedMessage(null);
  }

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || computed.error || computed.cards.length === 0) return;
    const capture: CalculationCapture = {
      id: createId('professional-domain'),
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

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner"><div><strong>{moduleLabel(selectedModule)}</strong><span>Cálculos orientativos com resultado, fórmula e texto técnico para relatório.</span></div><em>{moduleRules.length} cálculos</em></div>
      <div className="general-picker-list">{moduleRules.map((rule) => <button className="general-picker-card" key={rule.mode} type="button" onClick={() => openRule(rule.mode)}><span><strong>{rule.label}</strong><small>{rule.description}</small></span><em>{rule.plan === 'pro' ? 'PRO' : rule.plan === 'soon' ? 'EM BREVE' : 'LIVRE'}</em></button>)}</div>
      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeRule} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header"><button type="button" onClick={closeRule}>‹</button><div><span>{moduleLabel(activeRule.module)}</span><h2>{activeRule.label}</h2><p>{activeRule.description}</p></div><em>{activeRule.plan === 'pro' ? 'PRO' : activeRule.plan === 'soon' ? 'EM BREVE' : 'LIVRE'}</em></header>
            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.fields.map((field) => <NumberField key={field.key} field={field} value={values[field.key] ?? ''} onChange={(value) => setValue(field.key, value)} />)}
              {activeRule.options?.map((option) => <SelectField key={option.key} option={option} value={options[option.key] ?? option.options[0]?.value ?? ''} onChange={(value) => setOption(option.key, value)} />)}
            </form>
            {computed.error && <p className="general-error-message">{computed.error}</p>}
            {computed.cards.length > 0 && <div className="general-result-grid">{computed.cards.map((item) => <article className="general-result-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong>{item.helper && <small>{item.helper}</small>}</article>)}</div>}
            {computed.formula.length > 0 && <div className="general-formula-box"><strong>Como este cálculo é feito</strong>{computed.formula.map((item) => <span key={item}>{item}</span>)}</div>}
            {computed.orientation && <p className="general-helper-text">{computed.orientation}</p>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}
            <div className="general-capture-actions"><button type="button" onClick={() => includeResult('survey')}>Adicionar ao levantamento</button><button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button><button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button><button className="secondary-action" type="button" onClick={closeRule}>Voltar</button></div>
            <small className="general-technical-note">Cálculo preliminar e orientativo. Validar medições, condições reais e critérios técnicos antes de executar ou contratar.</small>
          </section>
        </div>
      )}
    </div>
  );
}
