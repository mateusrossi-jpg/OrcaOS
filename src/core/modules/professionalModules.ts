export type ProfessionalFamilyId =
  | 'core'
  | 'electricalAutomation'
  | 'civilConstruction'
  | 'hydraulics'
  | 'refrigeration'
  | 'paintingFinishing'
  | 'futureTrades';

export type ProfessionalModuleId =
  | 'generalFundamentals'
  | 'converters'
  | 'technicalBudget'
  | 'technicalDiagnostics'
  | 'electricalFundamentals'
  | 'electricalInstallations'
  | 'lighting'
  | 'electricalProtectionBoards'
  | 'motors'
  | 'electricalCommands'
  | 'industrialAutomation'
  | 'appliedElectronics'
  | 'transformers'
  | 'rewinding'
  | 'solarPhotovoltaic'
  | 'civilMeasurements'
  | 'masonry'
  | 'concrete'
  | 'mortarSubfloor'
  | 'floorWallCovering'
  | 'roofing'
  | 'basicStructureFoundation'
  | 'coldHotWater'
  | 'sewageDrainage'
  | 'reservoirs'
  | 'flowPressure'
  | 'pumps'
  | 'pipesConnections'
  | 'airConditioningSizing'
  | 'airConditioningInstall'
  | 'refrigerationConsumption'
  | 'copperPipingDrain'
  | 'painting'
  | 'surfacePreparation'
  | 'textureFinishing'
  | 'drywallPlaster'
  | 'finishBudget'
  | 'carpentry'
  | 'metalwork';

export type ProfessionalModuleStatus = 'active' | 'partial' | 'planned';
export type ProfessionalModulePlan = 'freeBase' | 'proModule' | 'futurePackage';

export interface ProfessionalModule {
  id: ProfessionalModuleId;
  familyId: ProfessionalFamilyId;
  title: string;
  shortTitle: string;
  description: string;
  status: ProfessionalModuleStatus;
  plan: ProfessionalModulePlan;
  freeCalculatorTarget: number;
  totalCalculatorTarget: number;
  examples: string[];
}

export interface ProfessionalFamily {
  id: ProfessionalFamilyId;
  title: string;
  description: string;
  modules: ProfessionalModule[];
}

export const professionalModules: ProfessionalModule[] = [
  {
    id: 'generalFundamentals',
    familyId: 'core',
    title: 'Fundamentos gerais',
    shortTitle: 'Fundamentos',
    description: 'Cálculos universais usados por várias profissões: regra de três, porcentagem, áreas, volumes, perdas e custos simples.',
    status: 'planned',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['Regra de três', 'Porcentagem', 'Acréscimo', 'Desconto', 'Área retangular', 'Volume simples', 'Custo por m²'],
  },
  {
    id: 'converters',
    familyId: 'core',
    title: 'Conversores',
    shortTitle: 'Conversores',
    description: 'Conversões gerais que servem para elétrica, hidráulica, construção civil, refrigeração e orçamento.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['m³/litros', 'bar/psi/mca', 'CV/HP/kW', 'BTU/h/W', 'mm/cm/m', 'polegada/mm', '°C/°F'],
  },
  {
    id: 'technicalBudget',
    familyId: 'core',
    title: 'Orçamento técnico',
    shortTitle: 'Orçamento',
    description: 'Cálculos comerciais usados em todos os setores: mão de obra, material, lucro, desconto, imposto e preço final.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Mão de obra por ponto', 'Mão de obra por m²', 'Lucro', 'Desconto', 'Imposto', 'Deslocamento', 'Preço final'],
  },
  {
    id: 'technicalDiagnostics',
    familyId: 'core',
    title: 'Diagnóstico técnico',
    shortTitle: 'Diagnóstico',
    description: 'Checklists, medições e apoio para relatórios técnicos de qualquer setor.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Nível de risco', 'Prioridade de correção', 'Checklist de quadro', 'Checklist hidráulico', 'Checklist de obra', 'Fotos', 'Parecer'],
  },

  {
    id: 'electricalFundamentals',
    familyId: 'electricalAutomation',
    title: 'Fundamentos elétricos',
    shortTitle: 'Fund. elétricos',
    description: 'Base de cálculo para técnicos, prestadores e estudantes: Ohm, potência, corrente, resistores e consumo.',
    status: 'active',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 15,
    examples: ['Corrente', 'Potência', 'Lei de Ohm', 'Resistores', 'W/VA/A', 'Consumo kWh', 'Custo de energia'],
  },
  {
    id: 'electricalInstallations',
    familyId: 'electricalAutomation',
    title: 'Instalações elétricas',
    shortTitle: 'Instalações',
    description: 'Cálculos específicos para instalações elétricas residenciais, comerciais e prediais.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['Queda de tensão', 'Seção por queda', 'Distância máxima', 'Cabo/disjuntor', 'Eletroduto', 'AWG/mm²', 'Transformador básico'],
  },
  {
    id: 'lighting',
    familyId: 'electricalAutomation',
    title: 'Iluminação',
    shortTitle: 'Iluminação',
    description: 'Cálculos de iluminação, lúmens, lux, luminárias, fitas LED, fontes e consumo.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Lux', 'Lúmens', 'Quantidade de luminárias', 'Fita LED', 'Fonte LED', 'Spots', 'Consumo'],
  },
  {
    id: 'electricalProtectionBoards',
    familyId: 'electricalAutomation',
    title: 'Quadros e proteção elétrica',
    shortTitle: 'Quadros/proteção',
    description: 'Cálculos e apoios para quadros, circuitos, proteção, DR, DPS, demanda e balanceamento.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 25,
    examples: ['DR', 'DPS', 'Carga instalada', 'Demanda', 'Balanceamento de fases', 'Módulos DIN', 'Aterramento básico'],
  },
  {
    id: 'motors',
    familyId: 'electricalAutomation',
    title: 'Custos fixos e ativos',
    shortTitle: 'Custos fixos',
    description: 'Cálculos para custos fixos, ativos de trabalho, depreciação, manutenção, alocação e margem.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Custo fixo mensal', 'Depreciação', 'Manutenção', 'Alocação por serviço', 'Margem', 'Reserva técnica', 'Proteção de caixa'],
  },
  {
    id: 'electricalCommands',
    familyId: 'electricalAutomation',
    title: 'Comandos elétricos',
    shortTitle: 'Comandos',
    description: 'Cálculos para contatores, relés, comandos, fontes de comando e circuitos 24 V.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Custos fixos', 'Materiais', 'Serviços', 'Taxas', 'Prazos', 'Garantia', 'Reserva de caixa'],
  },
  {
    id: 'industrialAutomation',
    familyId: 'electricalAutomation',
    title: 'Automação industrial',
    shortTitle: 'Automação',
    description: 'Instrumentação, sinais analógicos, CLP, sensores, encoder, painéis e produtividade industrial.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['4–20 mA', '0–10 V', 'Valor de engenharia', 'Sensor PNP/NPN', 'Encoder', 'Tempo de ciclo', 'I/O de CLP'],
  },
  {
    id: 'appliedElectronics',
    familyId: 'electricalAutomation',
    title: 'Eletrônica aplicada',
    shortTitle: 'Eletrônica',
    description: 'Cálculos de bancada e eletrônica aplicada à automação, fontes, sensores e circuitos auxiliares.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 30,
    examples: ['Resistor para LED', 'Divisor de tensão', 'Constante RC', 'PWM', 'ADC', 'Ripple', 'Autonomia de bateria'],
  },
  {
    id: 'transformers',
    familyId: 'electricalAutomation',
    title: 'Transformadores',
    shortTitle: 'Transformadores',
    description: 'Especialização eletrotécnica para transformadores, primário, secundário, VA, corrente, núcleo e fio.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 20,
    examples: ['VA', 'Relação de transformação', 'Espiras por volt', 'Corrente primária', 'Corrente secundária', 'Seção de núcleo', 'Fio preliminar'],
  },
  {
    id: 'rewinding',
    familyId: 'electricalAutomation',
    title: 'Rebobinagem',
    shortTitle: 'Rebobinagem',
    description: 'Especialização legada mantida como apoio de cálculo para custos, materiais, manutenção e serviços recorrentes.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 25,
    examples: ['Ranhuras', 'Polos', 'Bobinas', 'Tensão de trabalho', 'Fechamento', 'Sentido de rotação', 'Capacitor'],
  },
  {
    id: 'solarPhotovoltaic',
    familyId: 'electricalAutomation',
    title: 'Energia solar fotovoltaica',
    shortTitle: 'Solar',
    description: 'Especialização elétrica para pré-dimensionamento fotovoltaico, geração, inversor, strings, cabos e payback.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 25,
    examples: ['Consumo mensal', 'Quantidade de placas', 'Inversor', 'Strings', 'Bateria', 'Payback', 'Área do telhado'],
  },

  {
    id: 'civilMeasurements',
    familyId: 'civilConstruction',
    title: 'Medições de construção civil',
    shortTitle: 'Medições',
    description: 'Medições de área, volume, perímetro e levantamento básico para obra civil.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['Área de parede', 'Área de piso', 'Área de teto', 'Perímetro', 'Volume simples', 'Soma de áreas', 'Perda percentual'],
  },
  {
    id: 'masonry',
    familyId: 'civilConstruction',
    title: 'Alvenaria',
    shortTitle: 'Alvenaria',
    description: 'Cálculos para blocos, tijolos, paredes, descontos, fiadas e argamassa de assentamento.',
    status: 'partial',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Tijolos/blocos', 'Desconto de portas', 'Argamassa', 'Fiadas', 'Vergas', 'Perda', 'Custo por m²'],
  },
  {
    id: 'concrete',
    familyId: 'civilConstruction',
    title: 'Concreto',
    shortTitle: 'Concreto',
    description: 'Cálculos para volume de concreto, laje, pilar, viga, sapata, traço e consumo estimado.',
    status: 'partial',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Volume de concreto', 'Laje', 'Pilar', 'Viga', 'Sapata', 'Sacos de cimento', 'Perda'],
  },
  {
    id: 'mortarSubfloor',
    familyId: 'civilConstruction',
    title: 'Argamassa e contrapiso',
    shortTitle: 'Argamassa',
    description: 'Cálculos para contrapiso, reboco, chapisco, argamassa pronta e consumo por espessura.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Contrapiso', 'Reboco', 'Chapisco', 'Argamassa pronta', 'Espessura', 'Rendimento por saco', 'Custo por m²'],
  },
  {
    id: 'floorWallCovering',
    familyId: 'civilConstruction',
    title: 'Pisos e revestimentos',
    shortTitle: 'Revestimentos',
    description: 'Cálculos para piso, porcelanato, azulejo, caixas, rejunte, rodapé e perda por recorte.',
    status: 'partial',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Piso/revestimento', 'Caixas', 'Peças', 'Rodapé', 'Rejunte', 'Argamassa colante', 'Perda'],
  },
  {
    id: 'roofing',
    familyId: 'civilConstruction',
    title: 'Telhado e cobertura',
    shortTitle: 'Telhado',
    description: 'Cálculos para telhas, inclinação, área de cobertura, cumeeira, calha, rufo e estrutura básica.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Área de telhado', 'Inclinação', 'Telhas', 'Cumeeira', 'Calha', 'Rufo', 'Manta'],
  },
  {
    id: 'basicStructureFoundation',
    familyId: 'civilConstruction',
    title: 'Fundação e estrutura básica',
    shortTitle: 'Estrutura',
    description: 'Pré-levantamentos de volume, forma e aço para elementos simples, sem substituir projeto estrutural.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 20,
    examples: ['Volume de sapata', 'Baldrame', 'Pilar', 'Viga', 'Forma', 'Aço estimado', 'Arame recozido'],
  },

  {
    id: 'coldHotWater',
    familyId: 'hydraulics',
    title: 'Água fria e água quente',
    shortTitle: 'Água fria/quente',
    description: 'Cálculos para consumo, reservatório, tubulações e pontos de água fria/quente.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Consumo diário', 'Reservatório', 'Pontos de água', 'Tubos', 'Conexões', 'Aquecedor', 'Boiler'],
  },
  {
    id: 'sewageDrainage',
    familyId: 'hydraulics',
    title: 'Esgoto e drenagem',
    shortTitle: 'Esgoto',
    description: 'Cálculos e levantamentos para esgoto, drenagem, inclinação, caixas e conexões.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Inclinação de esgoto', 'Caixa de inspeção', 'Caixa de gordura', 'Tubos', 'Conexões', 'Drenagem', 'Comprimento equivalente'],
  },
  {
    id: 'reservoirs',
    familyId: 'hydraulics',
    title: 'Reservatórios',
    shortTitle: 'Reservatórios',
    description: 'Cálculos de volume, litros, autonomia, consumo por pessoa e dimensionamento básico de caixas.',
    status: 'planned',
    plan: 'freeBase',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 15,
    examples: ['Volume de caixa', 'Litros', 'Consumo por pessoa', 'Autonomia', 'Reserva mínima', 'Tempo de enchimento', 'Tempo de esvaziamento'],
  },
  {
    id: 'flowPressure',
    familyId: 'hydraulics',
    title: 'Vazão e pressão',
    shortTitle: 'Vazão/pressão',
    description: 'Cálculos para vazão, pressão, mca, bar, psi, tempo de enchimento e perda simplificada.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['Vazão', 'mca/bar/psi', 'Tempo de enchimento', 'Tempo de esvaziamento', 'Perda simplificada', 'Pressão disponível', 'Comprimento'],
  },
  {
    id: 'pumps',
    familyId: 'hydraulics',
    title: 'Bombas e pressurização',
    shortTitle: 'Bombas',
    description: 'Pré-dimensionamento de bomba, altura manométrica, vazão, potência e tempo de operação.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Altura manométrica', 'Vazão da bomba', 'Potência hidráulica', 'Rendimento', 'Pressurizador', 'Corrente da bomba', 'Reservatório'],
  },
  {
    id: 'pipesConnections',
    familyId: 'hydraulics',
    title: 'Tubos e conexões',
    shortTitle: 'Tubos/conexões',
    description: 'Levantamento de tubos, joelhos, tês, registros, luvas e conexões por trecho.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Tubos', 'Joelhos', 'Tês', 'Luva', 'Registro', 'Comprimento por trecho', 'Lista de compra'],
  },

  {
    id: 'airConditioningSizing',
    familyId: 'refrigeration',
    title: 'Dimensionamento de climatização',
    shortTitle: 'BTU/carga',
    description: 'Cálculos de BTU/h, carga térmica inicial, pessoas, insolação, equipamentos e capacidade comercial.',
    status: 'active',
    plan: 'proModule',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['BTU/h', 'Pessoas', 'Insolação', 'Eletrônicos', 'Pé-direito', 'Capacidade comercial', 'Ambiente'],
  },
  {
    id: 'airConditioningInstall',
    familyId: 'refrigeration',
    title: 'Instalação de ar-condicionado',
    shortTitle: 'Instalação AC',
    description: 'Levantamentos de infraestrutura, circuito dedicado, suporte, ponto elétrico, dreno e materiais.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 20,
    examples: ['Cabo dedicado', 'Disjuntor', 'Suporte', 'Tomada', 'Dreno', 'Tubulação', 'Lista de materiais'],
  },
  {
    id: 'refrigerationConsumption',
    familyId: 'refrigeration',
    title: 'Consumo em climatização',
    shortTitle: 'Consumo AC',
    description: 'Cálculos de consumo mensal, custo de energia e comparação básica entre equipamentos.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 15,
    examples: ['Consumo mensal', 'Custo estimado', 'Inverter x convencional', 'Horas de uso', 'Potência aproximada', 'Eficiência', 'Economia'],
  },
  {
    id: 'copperPipingDrain',
    familyId: 'refrigeration',
    title: 'Tubulação e dreno',
    shortTitle: 'Tubulação/dreno',
    description: 'Levantamento de tubulação de cobre, isolamento, dreno, comprimento e acessórios.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 15,
    examples: ['Tubos de cobre', 'Isolamento', 'Dreno', 'Comprimento', 'Curvas', 'Carga adicional', 'Acessórios'],
  },

  {
    id: 'painting',
    familyId: 'paintingFinishing',
    title: 'Pintura',
    shortTitle: 'Pintura',
    description: 'Cálculos de área a pintar, tinta, demãos, latas, galões e custo básico.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['Área a pintar', 'Litros de tinta', 'Galões', 'Latas', 'Demãos', 'Custo por m²', 'Orçamento por cômodo'],
  },
  {
    id: 'surfacePreparation',
    familyId: 'paintingFinishing',
    title: 'Preparação de superfície',
    shortTitle: 'Preparação',
    description: 'Cálculos para massa corrida, selador, fundo preparador, lixa e correção de superfície.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 18,
    examples: ['Massa corrida', 'Selador', 'Fundo preparador', 'Lixa', 'Correção', 'Rendimento por demão', 'Perda'],
  },
  {
    id: 'textureFinishing',
    familyId: 'paintingFinishing',
    title: 'Textura e grafiato',
    shortTitle: 'Textura',
    description: 'Cálculos de consumo e custo para textura, grafiato e acabamentos decorativos.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 15,
    examples: ['Textura', 'Grafiato', 'Rendimento por kg', 'Balde', 'Desempenadeira', 'Perda', 'Custo por m²'],
  },
  {
    id: 'drywallPlaster',
    familyId: 'paintingFinishing',
    title: 'Gesso e drywall',
    shortTitle: 'Gesso/drywall',
    description: 'Cálculos de forro, parede drywall, placas, perfis, massa, fita e parafusos.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 20,
    examples: ['Forro', 'Parede drywall', 'Placas', 'Montantes', 'Guias', 'Massa', 'Fita'],
  },
  {
    id: 'finishBudget',
    familyId: 'paintingFinishing',
    title: 'Orçamento de acabamento',
    shortTitle: 'Orç. acabamento',
    description: 'Composição de material, mão de obra, tempo e preço final para pintura e acabamento.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 5,
    totalCalculatorTarget: 18,
    examples: ['Mão de obra por m²', 'Material', 'Tempo estimado', 'Deslocamento', 'Preço final', 'Pacote básico', 'Pacote premium'],
  },

  {
    id: 'carpentry',
    familyId: 'futureTrades',
    title: 'Marcenaria',
    shortTitle: 'Marcenaria',
    description: 'Futuro módulo para chapas, fita de borda, cortes, ferragens e orçamento de móveis.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 20,
    examples: ['Chapa MDF', 'Fita de borda', 'Plano de corte', 'Dobradiças', 'Corrediças', 'Puxadores', 'Custo do móvel'],
  },
  {
    id: 'metalwork',
    familyId: 'futureTrades',
    title: 'Serralheria',
    shortTitle: 'Serralheria',
    description: 'Futuro módulo para perfis, chapas, solda, tinta, peso e orçamento metálico.',
    status: 'planned',
    plan: 'futurePackage',
    freeCalculatorTarget: 3,
    totalCalculatorTarget: 20,
    examples: ['Peso de perfil', 'Peso de chapa', 'Comprimento de barras', 'Solda', 'Tinta', 'Custo por kg', 'Portão/grade'],
  },
];

export const professionalFamilies: ProfessionalFamily[] = [
  {
    id: 'core',
    title: 'Núcleo transversal',
    description: 'Ferramentas que servem para todas as profissões e formam a base gratuita/comercial do Aferix.',
    modules: professionalModules.filter((module) => module.familyId === 'core'),
  },
  {
    id: 'electricalAutomation',
    title: 'Elétrica, eletrotécnica e automação',
    description: 'Família legada mantida como base de cálculo, com apresentação comercial orientada a serviços, materiais e custos fixos.',
    modules: professionalModules.filter((module) => module.familyId === 'electricalAutomation'),
  },
  {
    id: 'civilConstruction',
    title: 'Construção civil',
    description: 'Família para pedreiros, mestres de obras, alvenaria, concreto, revestimentos, telhados e estrutura básica.',
    modules: professionalModules.filter((module) => module.familyId === 'civilConstruction'),
  },
  {
    id: 'hydraulics',
    title: 'Hidráulica',
    description: 'Família para água fria/quente, esgoto, reservatórios, vazão, pressão, bombas e tubulações.',
    modules: professionalModules.filter((module) => module.familyId === 'hydraulics'),
  },
  {
    id: 'refrigeration',
    title: 'Refrigeração e climatização',
    description: 'Família para ar-condicionado, carga térmica, instalação, consumo, tubulação e dreno.',
    modules: professionalModules.filter((module) => module.familyId === 'refrigeration'),
  },
  {
    id: 'paintingFinishing',
    title: 'Pintura e acabamento',
    description: 'Família para pintura, preparação de superfície, textura, gesso, drywall e acabamento.',
    modules: professionalModules.filter((module) => module.familyId === 'paintingFinishing'),
  },
  {
    id: 'futureTrades',
    title: 'Ofícios futuros',
    description: 'Família reservada para módulos futuros como marcenaria e serralheria.',
    modules: professionalModules.filter((module) => module.familyId === 'futureTrades'),
  },
];
