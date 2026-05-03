import type { UserPlan } from '../core/access/featureAccess';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string }> = [
  { id: 'home', label: 'Início', description: 'Painel de gestão do atendimento', icon: 'IN', section: 'Trabalho' },
  { id: 'clients', label: 'Atendimentos', description: 'Clientes, OS e histórico local', icon: 'OS', section: 'Trabalho' },
  { id: 'survey', label: 'Campo', description: 'Campo, ambientes, serviços e materiais', icon: 'LEV', section: 'Trabalho' },
  { id: 'calculations', label: 'Cálculos', description: 'Ferramentas técnicas por área', icon: 'CAL', section: 'Técnico' },
  { id: 'reports', label: 'Relatórios', description: 'Documentos técnicos para cliente', icon: 'REL', section: 'Técnico' },
  { id: 'budgets', label: 'Orçamentos', description: 'Propostas comerciais e PDF', icon: 'ORC', section: 'Comercial' },
  { id: 'catalog', label: 'Catálogo', description: 'Serviços, materiais, composições e fornecedores', icon: 'CT', section: 'Gestão' },
  { id: 'settings', label: 'Configurações', description: 'Perfil, backup e preferências', icon: 'CFG', section: 'Sistema' },
  { id: 'store', label: 'Loja / Pro', description: 'Plano, acesso e recursos pagos', icon: 'PRO', section: 'Sistema' },
];

export const calculationModules: ModuleCardData[] = [
  { id: 'eletricaPredial', title: 'Elétrica predial', description: 'Corrente, potência, queda, cabo, disjuntor e proteção para decidir em campo', icon: 'E', tone: 'blue', count: 'Base livre + Pro', available: true, plan: 'free', calculatorModule: 'eletricaPredial' },
  { id: 'refrigeracao', title: 'Climatização', description: 'BTU, consumo e circuito dedicado para orientar instalação e proposta', icon: 'CL', tone: 'blue', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores e comandos', description: 'Corrente, partida, relé, contator e torque para manutenção e orçamento', icon: 'M', tone: 'orange', count: '8 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'construcaoCivil', title: 'Construção civil', description: 'Medições, perdas, concreto, telhado e escada para comprar e cobrar melhor', icon: 'OB', tone: 'gray', count: 'Base livre + Pro', available: true, plan: 'free', calculatorModule: 'obras' },
  { id: 'pintura', title: 'Pintura e acabamento', description: 'Área, tinta, custo e tempo por ambiente para fechar material e mão de obra', icon: 'P', tone: 'blue', count: 'Base livre + Pro', available: true, plan: 'free', calculatorModule: 'pintura' },
  { id: 'hidraulica', title: 'Hidráulica', description: 'Reservatório, vazão, pressão, esgoto, piscina e bomba para serviço em campo', icon: 'H', tone: 'blue', count: 'Base livre + Pro', available: true, plan: 'free', calculatorModule: 'hidraulica' },
  { id: 'conversores', title: 'Conversores técnicos', description: 'Unidades técnicas rápidas para conferir medida, compra e orçamento', icon: 'CV', tone: 'blue', count: 'Rápidos livres + Pro', available: true, plan: 'free', calculatorModule: 'conversores' },
  { id: 'orcamentoTecnico', title: 'Financeiro e preços', description: 'Preço, margem, desconto, diária, deslocamento e parcelamento do serviço', icon: 'R$', tone: 'orange', count: 'Base livre + Pro', available: true, plan: 'free', calculatorModule: 'orcamentoTecnico' },
  { id: 'eletronica', title: 'Eletrônica aplicada', description: 'LED, divisor de tensão, RC, PWM, ADC, bateria e fontes', icon: 'EL', tone: 'blue', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'transformadores', title: 'Transformadores', description: 'VA, correntes, relação e espiras para triagem técnica e orçamento', icon: 'T', tone: 'orange', count: '6 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'transformadores' },
  { id: 'solar', title: 'Solar fotovoltaico', description: 'Consumo, kWp, módulos, área, geração, bateria e payback inicial', icon: 'SF', tone: 'blue', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'solar' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Rotação, polos, passo polar e checklist seguro para inspeção inicial', icon: 'RB', tone: 'muted', count: '4 assistentes Pro', available: true, plan: 'pro', calculatorModule: 'rewinding' },
  { id: 'diagnosticoTecnico', title: 'Assistentes de campo', description: 'Checklist, risco, prioridade e manutenção para gerar texto de relatório', icon: 'AS', tone: 'blue', count: 'Checklist livre + Pro', available: true, plan: 'pro', calculatorModule: 'diagnosticoTecnico' },
];

export const calculationSectorGroups: CalculationSectorGroup[] = [
  {
    id: 'electrical',
    title: 'Elétrica',
    description: 'Decisão técnica para baixa tensão, climatização, motores, transformadores, solar e rebobinagem.',
    icon: 'E',
    moduleIds: ['eletricaPredial', 'refrigeracao', 'motores', 'transformadores', 'solar', 'rebobinagem', 'eletronica'],
  },
  {
    id: 'hydraulics',
    title: 'Hidráulica',
    description: 'Reservatório, vazão, pressão, esgoto, piscina e bomba simples para serviço em campo.',
    icon: 'H',
    moduleIds: ['hidraulica'],
  },
  {
    id: 'construction',
    title: 'Construção civil',
    description: 'Medições e quantidades para comprar material, estimar perda e montar proposta.',
    icon: 'OB',
    moduleIds: ['construcaoCivil'],
  },
  {
    id: 'painting',
    title: 'Pintura e acabamento',
    description: 'Área, rendimento, material, custo e tempo para fechar pintura por ambiente.',
    icon: 'P',
    moduleIds: ['pintura'],
  },
  {
    id: 'financial',
    title: 'Financeiro',
    description: 'Preço mínimo, margem, desconto, diária, deslocamento e negociação.',
    icon: 'R$',
    moduleIds: ['orcamentoTecnico'],
  },
  {
    id: 'converters',
    title: 'Conversores e unidades',
    description: 'Conversões de medida usadas no campo, na compra e no orçamento.',
    icon: 'CV',
    moduleIds: ['conversores'],
  },
  {
    id: 'diagnostics',
    title: 'Assistentes de campo',
    description: 'Checklists que ajudam a explicar risco, prioridade e manutenção no relatório.',
    icon: 'AS',
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
