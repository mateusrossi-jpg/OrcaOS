export type ProfessionalFamilyId =
  | 'core'
  | 'business';

export type ProfessionalModuleId =
  | 'generalFundamentals'
  | 'technicalBudget'
  | 'financialManagement'
  | 'commercialChecklist';

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
    description: 'Cálculos universais: regra de três, porcentagem, áreas, volumes e custos simples.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 20,
    examples: ['Regra de três', 'Porcentagem', 'Área', 'Volume'],
  },
  {
    id: 'technicalBudget',
    familyId: 'core',
    title: 'Orçamento técnico',
    shortTitle: 'Orçamento',
    description: 'Cálculos comerciais: mão de obra, material, lucro, desconto e preço final.',
    status: 'partial',
    plan: 'freeBase',
    freeCalculatorTarget: 7,
    totalCalculatorTarget: 25,
    examples: ['Mão de obra', 'Material', 'Lucro', 'Desconto'],
  },
  {
    id: 'financialManagement',
    familyId: 'business',
    title: 'Gestão financeira',
    shortTitle: 'Financeiro',
    description: 'Fluxo de caixa, lucro real, taxas e impostos.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 0,
    totalCalculatorTarget: 15,
    examples: ['Lucro real', 'Taxas de cartão', 'Imposto estimado'],
  },
  {
    id: 'commercialChecklist',
    familyId: 'business',
    title: 'Checklist comercial',
    shortTitle: 'Checklist',
    description: 'Apoio para levantamento de campo e relatórios.',
    status: 'planned',
    plan: 'proModule',
    freeCalculatorTarget: 0,
    totalCalculatorTarget: 20,
    examples: ['Prioridade', 'Nível de risco'],
  },
];

export const professionalFamilies: ProfessionalFamily[] = [
  {
    id: 'core',
    title: 'Núcleo transversal',
    description: 'Ferramentas base do Aferix.',
    modules: professionalModules.filter((module) => module.familyId === 'core'),
  },
  {
    id: 'business',
    title: 'Gestão de negócio',
    description: 'Ferramentas avançadas para prestadores de serviço.',
    modules: professionalModules.filter((module) => module.familyId === 'business'),
  },
];
