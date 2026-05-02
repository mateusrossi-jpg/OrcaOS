import type { UserPlan } from '../core/access/featureAccess';
import type { AppTab, CalculationProfessionGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string }> = [
  { id: 'home', label: 'Início', description: 'Visão do dia e ações rápidas', icon: '⌂' },
  { id: 'clients', label: 'Clientes / OS', description: 'Atendimentos e histórico', icon: '◉' },
  { id: 'calculations', label: 'Cálculos', description: 'Módulos e calculadoras', icon: '▦' },
  { id: 'survey', label: 'Levantamento', description: 'Campo, ambientes, mão de obra e peças', icon: '▤' },
  { id: 'budgets', label: 'Orçamentos', description: 'Proposta comercial', icon: '▣' },
  { id: 'reports', label: 'Relatórios', description: 'PDFs e diagnósticos', icon: '◫' },
  { id: 'settings', label: 'Configurações', description: 'Conta, backup e cadastros', icon: '⚙' },
  { id: 'store', label: 'Loja / Pro', description: 'Pacotes e planos', icon: '◆' },
];

export const calculationModules: ModuleCardData[] = [
  { id: 'fundamentosGerais', title: 'Fundamentos gerais', description: 'Regra de três, porcentagem, áreas, volumes, custos e produtividade', icon: '∑', tone: 'green', count: '17 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentosGerais' },
  { id: 'fundamentos', title: 'Fundamentos elétricos', description: 'Ohm, corrente, potência, resistores, VA e consumo', icon: 'ϟ', tone: 'blue', count: '8 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentals' },
  { id: 'instalacoes', title: 'Instalações elétricas', description: 'Queda, distância, transformador, AWG, disjuntor, cabo e eletroduto', icon: '⌁', tone: 'gray', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'installations' },
  { id: 'iluminacao', title: 'Iluminação', description: 'Lúmens, lux, luminárias e iluminação de ambiente', icon: '☼', tone: 'green', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'lighting' },
  { id: 'refrigeracao', title: 'Refrigeração', description: 'BTU/h, climatização e carga térmica inicial', icon: '❄', tone: 'blue', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores', description: 'Corrente, rotação, escorregamento e relação de polias', icon: '⚙', tone: 'orange', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'automacaoIndustrial', title: 'Automação industrial', description: 'Escalas 4–20 mA, 0–10 V e valor de engenharia', icon: '▥', tone: 'green', count: '2 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'industrialAutomation' },
  { id: 'construcaoCivil', title: 'Construção civil', description: 'Medições, concreto, alvenaria, piso, revestimento e telhado', icon: '▧', tone: 'gray', count: '10 cálculos', available: true, plan: 'free', calculatorModule: 'obras' },
  { id: 'pintura', title: 'Pintura e acabamento', description: 'Área, tinta necessária e orçamento simples por m²', icon: '▨', tone: 'green', count: '3 cálculos', available: true, plan: 'free', calculatorModule: 'pintura' },
  { id: 'hidraulica', title: 'Hidráulica', description: 'Reservatório, consumo, autonomia, vazão, enchimento e pressão', icon: '≋', tone: 'blue', count: '7 cálculos livres', available: true, plan: 'free', calculatorModule: 'hidraulica' },
  { id: 'conversores', title: 'Conversores', description: 'm³/litros, pressão, potência, BTU/h, medidas, temperatura e vazão', icon: '⇄', tone: 'blue', count: '4 conversores', available: true, plan: 'free', calculatorModule: 'conversores' },
  { id: 'orcamentoTecnico', title: 'Orçamento técnico', description: 'Mão de obra, diária, hora técnica, parcelamento, sinal e preço final', icon: 'R$', tone: 'orange', count: '6 cálculos', available: true, plan: 'free', calculatorModule: 'orcamentoTecnico' },
  { id: 'eletronica', title: 'Eletrônica aplicada', description: 'LED, divisor de tensão, RC, PWM, ADC, bateria e fontes', icon: '◌', tone: 'green', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'transformadores', title: 'Transformadores', description: 'VA, espiras por volt, primário, secundário e fio preliminar', icon: '▤', tone: 'orange', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'solar', title: 'Solar fotovoltaico', description: 'Placas, inversor, cabos, geração, bateria e payback', icon: '☉', tone: 'green', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Bobinas, fechamento, tensão de trabalho e rotação', icon: '⟳', tone: 'muted', count: 'Em breve', available: false, plan: 'soon' },
];

export const calculationProfessionGroups: CalculationProfessionGroup[] = [
  {
    id: 'electrical',
    title: 'Elétrica',
    description: 'Fundamentos, instalações, iluminação, motores, automação e módulos previstos para baixa tensão.',
    icon: 'ϟ',
    moduleIds: ['fundamentos', 'instalacoes', 'iluminacao', 'motores', 'automacaoIndustrial', 'transformadores', 'solar', 'eletronica', 'rebobinagem'],
  },
  {
    id: 'hydraulics',
    title: 'Hidráulica',
    description: 'Reservatório, consumo, autonomia, vazão, enchimento e pressão.',
    icon: '≋',
    moduleIds: ['hidraulica'],
  },
  {
    id: 'construction',
    title: 'Construção civil',
    description: 'Medições, concreto, alvenaria, piso, revestimento e telhado.',
    icon: '▧',
    moduleIds: ['construcaoCivil'],
  },
  {
    id: 'painting',
    title: 'Pintura',
    description: 'Área, rendimento, tinta necessária e orçamento simples por metro quadrado.',
    icon: '▨',
    moduleIds: ['pintura'],
  },
  {
    id: 'technicalBudget',
    title: 'Orçamento técnico',
    description: 'Hora técnica, diária, mão de obra, margem, sinal e preço final.',
    icon: 'R$',
    moduleIds: ['orcamentoTecnico'],
  },
  {
    id: 'converters',
    title: 'Conversores',
    description: 'Medidas, pressão, potência, temperatura, vazão e unidades de apoio.',
    icon: '⇄',
    moduleIds: ['fundamentosGerais', 'conversores'],
  },
];

export const storePackages = [
  { title: 'Base gratuita', description: 'Fundamentos gerais, hidráulica inicial, construção civil básica, pintura, conversores e orçamento simples.', price: 'R$ 0', icon: '∑' },
  { title: 'Pacote Instalações Pro', description: 'Queda de tensão, distância máxima, cabo/disjuntor, transformador, AWG e eletroduto.', price: 'R$ 12,90', icon: '⌁' },
  { title: 'Pacote Construção Civil Pro', description: 'Alvenaria, revestimento, telhado, argamassa, concreto, listas e composições avançadas.', price: 'R$ 12,90', icon: '▧' },
  { title: 'Pacote Hidráulica Pro', description: 'Bombas, perda de carga, conexões, esgoto, drenagem, reservatórios e lista de materiais.', price: 'R$ 12,90', icon: '≋' },
  { title: 'Pacote Orçamentos Pro', description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.', price: 'R$ 12,90', icon: '▣' },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}
