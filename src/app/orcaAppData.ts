import type { UserPlan } from '../core/access/featureAccess';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string }> = [
  { id: 'home', label: 'Início', description: 'Visão do dia e ações rápidas', icon: '⌂', section: 'Trabalho' },
  { id: 'clients', label: 'Atendimentos', description: 'Clientes, OS e contexto ativo', icon: '◉', section: 'Trabalho' },
  { id: 'calculations', label: 'Cálculos', description: 'Setores técnicos e calculadoras', icon: '▦', section: 'Técnico' },
  { id: 'survey', label: 'Levantamento', description: 'Campo, ambientes e itens', icon: '▤', section: 'Técnico' },
  { id: 'budgets', label: 'Orçamentos', description: 'Proposta comercial', icon: '▣', section: 'Comercial' },
  { id: 'catalog', label: 'Catálogo / Estoque', description: 'Itens, fornecedores e compras', icon: '▥', section: 'Comercial' },
  { id: 'reports', label: 'Relatórios', description: 'PDFs e diagnósticos', icon: '◫', section: 'Comercial' },
  { id: 'settings', label: 'Configurações', description: 'Perfil, backup e preferências', icon: '⚙', section: 'Sistema' },
  { id: 'store', label: 'Loja / Pro', description: 'Pacotes e planos', icon: '◆', section: 'Sistema' },
];

export const calculationModules: ModuleCardData[] = [
  { id: 'fundamentos', title: 'Fundamentos elétricos', description: 'Ohm, corrente, potência, resistores, VA e consumo', icon: 'ϟ', tone: 'blue', count: '8 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentals' },
  { id: 'eletricaResidencial', title: 'Instalação residencial', description: 'Cabo, disjuntor, queda, cargas, fases, aterramento e DR/DPS para obra residencial', icon: 'ϟ', tone: 'green', count: '9 cálculos', available: true, plan: 'pro', calculatorModule: 'eletricaResidencial' },
  { id: 'instalacoes', title: 'Dimensionamento elétrico', description: 'Queda de tensão, distância, AWG, disjuntor, cabo, transformador e eletroduto', icon: '⌁', tone: 'gray', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'installations' },
  { id: 'iluminacao', title: 'Iluminação', description: 'Lúmens, lux e quantidade inicial de luminárias', icon: '☼', tone: 'green', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'lighting' },
  { id: 'refrigeracao', title: 'Climatização', description: 'BTU/h, consumo, circuito dedicado e carga térmica inicial', icon: '❄', tone: 'blue', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores e comandos', description: 'Corrente, partida, relé, contator, capacitor, torque e polias', icon: '⚙', tone: 'orange', count: '8 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'automacaoIndustrial', title: 'Automação e sinais', description: 'Escalas 4–20 mA, 0–10 V e valor de engenharia', icon: '▥', tone: 'green', count: '2 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'industrialAutomation' },
  { id: 'construcaoCivil', title: 'Construção civil', description: 'Medições, concreto, alvenaria, piso, revestimento, argamassas, telhado, escada e rampa', icon: '▧', tone: 'gray', count: '25 cálculos', available: true, plan: 'free', calculatorModule: 'obras' },
  { id: 'pintura', title: 'Pintura e acabamento', description: 'Área, tinta, selador, massa, custo e tempo de pintura', icon: '▨', tone: 'green', count: '6 cálculos livres', available: true, plan: 'free', calculatorModule: 'pintura' },
  { id: 'hidraulica', title: 'Hidráulica', description: 'Reservatório, consumo, autonomia, vazão, enchimento, pressão, piscina, esgoto e bomba simples', icon: '≋', tone: 'green', count: '15 cálculos', available: true, plan: 'free', calculatorModule: 'hidraulica' },
  { id: 'conversores', title: 'Conversores técnicos', description: 'Conversões rápidas e técnicas: volume, pressão, potência, BTU/W, AWG, polegadas, vazão e kWh/R$', icon: '⇄', tone: 'blue', count: '14 conversores livres', available: true, plan: 'free', calculatorModule: 'conversores' },
  { id: 'orcamentoTecnico', title: 'Financeiro e preços', description: 'Orçamento, produtividade, percentuais, negociação, margem, taxas, entrada e faixas de preço', icon: 'R$', tone: 'orange', count: '26 cálculos', available: true, plan: 'free', calculatorModule: 'orcamentoTecnico' },
  { id: 'eletronica', title: 'Eletrônica aplicada', description: 'LED, divisor de tensão, RC, PWM, ADC, bateria e fontes', icon: '◌', tone: 'green', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'transformadores', title: 'Transformadores', description: 'VA, correntes, relação, espiras e potência por núcleo', icon: '▤', tone: 'orange', count: '6 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'transformadores' },
  { id: 'solar', title: 'Solar fotovoltaico', description: 'Consumo, kWp, módulos, área, geração, bateria e payback', icon: '☉', tone: 'green', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'solar' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Rotação, polos, passo polar e checklist técnico seguro', icon: '⟳', tone: 'muted', count: '4 assistentes Pro', available: true, plan: 'pro', calculatorModule: 'rewinding' },
  { id: 'diagnosticoTecnico', title: 'Assistentes de diagnóstico', description: 'Urgência, risco, manutenção, checklist e texto técnico para relatório', icon: '□', tone: 'green', count: '5 assistentes', available: true, plan: 'pro', calculatorModule: 'diagnosticoTecnico' },
];

export const calculationSectorGroups: CalculationSectorGroup[] = [
  {
    id: 'electrical',
    title: 'Elétrica',
    description: 'Comece pelos fundamentos, avance para instalação residencial e use módulos específicos quando o serviço exigir.',
    icon: 'ϟ',
    moduleIds: ['fundamentos', 'eletricaResidencial', 'instalacoes', 'iluminacao', 'refrigeracao', 'motores', 'automacaoIndustrial', 'transformadores', 'solar', 'rebobinagem', 'eletronica'],
  },
  {
    id: 'hydraulics',
    title: 'Hidráulica',
    description: 'Um único módulo com abas para reservatórios, medições básicas, esgoto, piscina e bomba simples.',
    icon: '≋',
    moduleIds: ['hidraulica'],
  },
  {
    id: 'construction',
    title: 'Construção civil',
    description: 'Um único módulo para medir, quantificar materiais e montar composições de obra.',
    icon: '▧',
    moduleIds: ['construcaoCivil'],
  },
  {
    id: 'painting',
    title: 'Pintura e acabamento',
    description: 'Área, rendimento, material, custo e tempo de pintura.',
    icon: '▨',
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
    icon: '⇄',
    moduleIds: ['conversores'],
  },
  {
    id: 'diagnostics',
    title: 'Relatório e diagnóstico',
    description: 'Assistentes que não são fórmulas puras: ajudam a classificar risco, urgência e texto técnico.',
    icon: '□',
    moduleIds: ['diagnosticoTecnico'],
  },
];

export const storePackages = [
  { title: 'Base gratuita', description: 'Fundamentos, medições, hidráulica básica, pintura, conversores, orçamento rápido e apoio comercial simples.', price: 'R$ 0', icon: '∑' },
  { title: 'Pacote Elétrica Pro', description: 'Instalação residencial, dimensionamento, iluminação, automação, motores, transformadores e solar.', price: 'R$ 19,90', icon: '⌁' },
  { title: 'Pacote Construção Pro', description: 'Composição de obra, revestimento, rodapé, telhado, escada, rampa e estimativas completas.', price: 'R$ 12,90', icon: '▧' },
  { title: 'Pacote Hidráulica Pro', description: 'Instalações hidráulicas, piscina, esgoto, pressão por coluna, bomba simples e apoio de campo.', price: 'R$ 12,90', icon: '≋' },
  { title: 'Pacote Gestão Pro', description: 'Preço e margem, diagnóstico técnico, relatórios mais completos e recursos comerciais.', price: 'R$ 19,90', icon: '◆' },
  { title: 'Pacote Orçamentos Pro', description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.', price: 'R$ 12,90', icon: '▣' },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}
