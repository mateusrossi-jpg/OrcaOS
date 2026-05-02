import type { UserPlan } from '../core/access/featureAccess';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string }> = [
  { id: 'home', label: 'Início', description: 'Visão do dia e ações rápidas', icon: 'IN', section: 'Trabalho' },
  { id: 'clients', label: 'Atendimentos', description: 'Clientes, OS e contexto ativo', icon: 'OS', section: 'Trabalho' },
  { id: 'calculations', label: 'Cálculos', description: 'Setores técnicos e calculadoras', icon: 'CAL', section: 'Técnico' },
  { id: 'survey', label: 'Levantamento', description: 'Campo, ambientes e itens', icon: 'LEV', section: 'Técnico' },
  { id: 'budgets', label: 'Orçamentos', description: 'Proposta comercial', icon: 'ORC', section: 'Comercial' },
  { id: 'catalog', label: 'Catálogo', description: 'Itens, busca, fornecedores e estoque', icon: 'CT', section: 'Comercial' },
  { id: 'reports', label: 'Relatórios', description: 'PDFs e diagnósticos', icon: 'REL', section: 'Comercial' },
  { id: 'settings', label: 'Configurações', description: 'Perfil, backup e preferências', icon: 'CFG', section: 'Sistema' },
  { id: 'store', label: 'Loja / Pro', description: 'Pacotes e planos', icon: 'PRO', section: 'Sistema' },
];

export const calculationModules: ModuleCardData[] = [
  { id: 'eletricaPredial', title: 'Elétrica predial', description: 'Base elétrica, instalação residencial, dimensionamento, iluminação e sinais de automação', icon: 'E', tone: 'green', count: '27 cálculos', available: true, plan: 'free', calculatorModule: 'eletricaPredial' },
  { id: 'refrigeracao', title: 'Climatização', description: 'BTU/h, consumo, circuito dedicado e carga térmica inicial', icon: 'CL', tone: 'blue', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores e comandos', description: 'Corrente, partida, relé, contator, capacitor, torque e polias', icon: 'M', tone: 'orange', count: '8 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'construcaoCivil', title: 'Construção civil', description: 'Medições, concreto, alvenaria, piso, revestimento, argamassas, telhado, escada e rampa', icon: 'OB', tone: 'gray', count: '25 cálculos', available: true, plan: 'free', calculatorModule: 'obras' },
  { id: 'pintura', title: 'Pintura e acabamento', description: 'Área, tinta, selador, massa, custo e tempo de pintura', icon: 'P', tone: 'green', count: '6 cálculos livres', available: true, plan: 'free', calculatorModule: 'pintura' },
  { id: 'hidraulica', title: 'Hidráulica', description: 'Reservatório, consumo, autonomia, vazão, enchimento, pressão, piscina, esgoto e bomba simples', icon: 'H', tone: 'green', count: '15 cálculos', available: true, plan: 'free', calculatorModule: 'hidraulica' },
  { id: 'conversores', title: 'Conversores técnicos', description: 'Conversões rápidas e técnicas: volume, pressão, potência, BTU/W, AWG, polegadas, vazão e kWh/R$', icon: 'CV', tone: 'blue', count: '14 conversores livres', available: true, plan: 'free', calculatorModule: 'conversores' },
  { id: 'orcamentoTecnico', title: 'Financeiro e preços', description: 'Orçamento, produtividade, percentuais, negociação, margem, taxas, entrada e faixas de preço', icon: 'R$', tone: 'orange', count: '26 cálculos', available: true, plan: 'free', calculatorModule: 'orcamentoTecnico' },
  { id: 'eletronica', title: 'Eletrônica aplicada', description: 'LED, divisor de tensão, RC, PWM, ADC, bateria e fontes', icon: 'EL', tone: 'green', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'transformadores', title: 'Transformadores', description: 'VA, correntes, relação, espiras e potência por núcleo', icon: 'T', tone: 'orange', count: '6 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'transformadores' },
  { id: 'solar', title: 'Solar fotovoltaico', description: 'Consumo, kWp, módulos, área, geração, bateria e payback', icon: 'SF', tone: 'green', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'solar' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Rotação, polos, passo polar e checklist técnico seguro', icon: 'RB', tone: 'muted', count: '4 assistentes Pro', available: true, plan: 'pro', calculatorModule: 'rewinding' },
  { id: 'diagnosticoTecnico', title: 'Diagnóstico técnico', description: 'Relatório, risco, urgência, manutenção e checklist por intenção de uso', icon: 'DG', tone: 'green', count: '5 assistentes', available: true, plan: 'pro', calculatorModule: 'diagnosticoTecnico' },
];

export const calculationSectorGroups: CalculationSectorGroup[] = [
  {
    id: 'electrical',
    title: 'Elétrica',
    description: 'Um módulo principal para elétrica predial e módulos específicos para climatização, motores, transformadores, solar e rebobinagem.',
    icon: 'E',
    moduleIds: ['eletricaPredial', 'refrigeracao', 'motores', 'transformadores', 'solar', 'rebobinagem', 'eletronica'],
  },
  {
    id: 'hydraulics',
    title: 'Hidráulica',
    description: 'Um único módulo com abas para reservatórios, medições básicas, esgoto, piscina e bomba simples.',
    icon: 'H',
    moduleIds: ['hidraulica'],
  },
  {
    id: 'construction',
    title: 'Construção civil',
    description: 'Um único módulo para medir, quantificar materiais e montar composições de obra.',
    icon: 'OB',
    moduleIds: ['construcaoCivil'],
  },
  {
    id: 'painting',
    title: 'Pintura e acabamento',
    description: 'Área, rendimento, material, custo e tempo de pintura.',
    icon: 'P',
    moduleIds: ['pintura'],
  },
  {
    id: 'financial',
    title: 'Financeiro',
    description: 'Um único módulo para orçamento rápido, produtividade, percentuais, negociação, preço e margem.',
    icon: 'R$',
    moduleIds: ['orcamentoTecnico'],
  },
  {
    id: 'converters',
    title: 'Conversores e unidades',
    description: 'Um único módulo com conversores rápidos e técnicos organizados por abas internas.',
    icon: 'CV',
    moduleIds: ['conversores'],
  },
  {
    id: 'diagnostics',
    title: 'Relatório e diagnóstico',
    description: 'Escolha entre relatório, risco/urgência e manutenção antes de abrir o assistente.',
    icon: 'DG',
    moduleIds: ['diagnosticoTecnico'],
  },
];

export const storePackages = [
  { title: 'Base gratuita', description: 'Fundamentos, medições, hidráulica básica, pintura, conversores, orçamento rápido e apoio comercial simples.', price: 'R$ 0', icon: 'B' },
  { title: 'Pacote Elétrica Pro', description: 'Instalação residencial, dimensionamento, iluminação, automação, motores, transformadores e solar.', price: 'R$ 19,90', icon: 'E' },
  { title: 'Pacote Construção Pro', description: 'Composição de obra, revestimento, rodapé, telhado, escada, rampa e estimativas completas.', price: 'R$ 12,90', icon: 'OB' },
  { title: 'Pacote Hidráulica Pro', description: 'Instalações hidráulicas, piscina, esgoto, pressão por coluna, bomba simples e apoio de campo.', price: 'R$ 12,90', icon: 'H' },
  { title: 'Pacote Gestão Pro', description: 'Preço e margem, diagnóstico técnico, relatórios mais completos e recursos comerciais.', price: 'R$ 19,90', icon: 'G' },
  { title: 'Pacote Orçamentos Pro', description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.', price: 'R$ 12,90', icon: 'OR' },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}
