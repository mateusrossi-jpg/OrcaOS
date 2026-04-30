export type ProfessionalDomainId =
  | 'generalFundamentals'
  | 'electrical'
  | 'civilConstruction'
  | 'paintingFinishing'
  | 'hydraulics'
  | 'refrigeration'
  | 'industrialAutomation'
  | 'motors'
  | 'electronics'
  | 'transformers'
  | 'rewinding'
  | 'solar'
  | 'technicalBudget'
  | 'technicalDiagnostics';

export type ProfessionalDomainStatus = 'active' | 'partial' | 'planned';
export type ProfessionalDomainPlan = 'freeBase' | 'proModule' | 'futurePackage';

export interface ProfessionalDomain {
  id: ProfessionalDomainId;
  title: string;
  shortTitle: string;
  description: string;
  status: ProfessionalDomainStatus;
  plan: ProfessionalDomainPlan;
  freeCalculatorTarget: number;
  totalCalculatorTarget: number;
  examples: string[];
}

export const professionalDomains: ProfessionalDomain[] = [
  {
    id: 'generalFundamentals',
    title: 'Fundamentos gerais',
    shortTitle: 'Fundamentos gerais',
    description: 'Cálculos universais usados por várias profissões: porcentagem, regra de três, áreas, volumes, conversões e custos simples.',
    status: 'planned',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['Regra de três', 'Porcentagem', 'Área retangular', 'Volume simples', 'Custo por m²', 'Perda percentual', 'Conversão de medidas'],
  },
  {
    id: 'electrical',
    title: 'Serviços elétricos',
    shortTitle: 'Elétrica',
    description: 'Cálculos para eletricistas, instaladores e técnicos de baixa tensão.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['Lei de Ohm', 'Corrente', 'Potência', 'Queda de tensão', 'Cabo/disjuntor', 'Eletroduto', 'Quadro elétrico'],
  },
  {
    id: 'civilConstruction',
    title: 'Construção civil',
    shortTitle: 'Construção civil',
    description: 'Cálculos para pedreiros, mestres de obras e profissionais de execução civil. Substitui o nome genérico “Obras”.',
    status: 'partial',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['Área de parede', 'Volume de concreto', 'Contrapiso', 'Tijolos/blocos', 'Piso/revestimento', 'Telhado', 'Argamassa'],
  },
  {
    id: 'paintingFinishing',
    title: 'Pintura e acabamento',
    shortTitle: 'Pintura',
    description: 'Cálculos para pintura, preparação de superfície, acabamento e orçamento por área.',
    status: 'partial',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Área a pintar', 'Litros de tinta', 'Demãos', 'Selador', 'Massa corrida', 'Textura/grafiato', 'Orçamento por m²'],
  },
  {
    id: 'hydraulics',
    title: 'Serviços hidráulicos',
    shortTitle: 'Hidráulica',
    description: 'Cálculos para encanadores, instalações hidráulicas, reservatórios, pressão, vazão e bombas.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Caixa d’água', 'Vazão', 'Tempo de enchimento', 'mca/bar/psi', 'Bomba', 'Tubulação', 'Perda de carga simplificada'],
  },
  {
    id: 'refrigeration',
    title: 'Refrigeração e climatização',
    shortTitle: 'Refrigeração',
    description: 'Cálculos para ar-condicionado, BTU, carga térmica inicial, consumo e instalação dedicada.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['BTU/h', 'Capacidade comercial', 'Consumo mensal', 'Cabo/disjuntor dedicado', 'Pessoas/insolação', 'Tubulação', 'Dreno'],
  },
  {
    id: 'industrialAutomation',
    title: 'Automação industrial',
    shortTitle: 'Automação',
    description: 'Cálculos para instrumentação, sinais analógicos, sensores, CLP, painéis e comandos.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['4–20 mA', '0–10 V', 'Valor de engenharia', 'Fonte 24 V', 'Tempo de ciclo', 'Encoder', 'I/O de CLP'],
  },
  {
    id: 'motors',
    title: 'Motores elétricos',
    shortTitle: 'Motores',
    description: 'Cálculos para motores, corrente, rotação, escorregamento, torque e transmissão.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Corrente de motor', 'Rotação síncrona', 'Escorregamento', 'Polias', 'Torque', 'Capacitor', 'Proteção preliminar'],
  },
  {
    id: 'electronics',
    title: 'Eletrônica',
    shortTitle: 'Eletrônica',
    description: 'Cálculos de bancada para eletrônica básica e automação embarcada.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['Resistor para LED', 'Divisor de tensão', 'Constante RC', 'PWM', 'ADC', 'Ripple', 'Autonomia de bateria'],
  },
  {
    id: 'transformers',
    title: 'Transformadores',
    shortTitle: 'Transformadores',
    description: 'Cálculos para transformadores, primário, secundário, VA, corrente e fio preliminar.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 20,
    examples: ['VA', 'Relação de transformação', 'Espiras por volt', 'Corrente primária', 'Corrente secundária', 'Seção de núcleo', 'Fio preliminar'],
  },
  {
    id: 'rewinding',
    title: 'Rebobinagem',
    shortTitle: 'Rebobinagem',
    description: 'Cálculos e registros técnicos para rebobinagem de motores e fechamento correto.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 25,
    examples: ['Ranhuras', 'Polos', 'Bobinas', 'Tensão de trabalho', 'Fechamento', 'Sentido de rotação', 'Capacitor'],
  },
  {
    id: 'solar',
    title: 'Energia solar',
    shortTitle: 'Solar',
    description: 'Cálculos para pré-dimensionamento fotovoltaico, geração, inversor, cabos, bateria e payback.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 25,
    examples: ['Consumo mensal', 'Quantidade de placas', 'Inversor', 'Strings', 'Bateria', 'Payback', 'Área do telhado'],
  },
  {
    id: 'technicalBudget',
    title: 'Orçamento técnico',
    shortTitle: 'Orçamento',
    description: 'Cálculos comerciais usados por todas as profissões: mão de obra, lucro, desconto, imposto e preço final.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Mão de obra por ponto', 'Mão de obra por m²', 'Lucro', 'Desconto', 'Imposto', 'Deslocamento', 'Preço final'],
  },
  {
    id: 'technicalDiagnostics',
    title: 'Diagnóstico técnico',
    shortTitle: 'Diagnóstico',
    description: 'Checklists e cálculos de apoio para visitas técnicas e relatórios.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Nível de risco', 'Prioridade de correção', 'Sobrecarga provável', 'Queda medida', 'Checklist de quadro', 'Checklist hidráulico', 'Checklist de obra'],
  },
];
