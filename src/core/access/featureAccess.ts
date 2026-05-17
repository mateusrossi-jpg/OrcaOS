export type UserPlan = 'free' | 'pro';
export type FeaturePlan = UserPlan | 'soon';

export type CalculatorMode =
  | 'current'
  | 'power'
  | 'markup'
  | 'margin'
  | 'taxes'
  | 'installments'
  | 'travel'
  | 'goals'
  | 'warranty'
  | 'discount'
  | 'productivity';

export type CalculatorModule =
  | 'orcamentoTecnico'
  | 'financeiroAvancado';

export interface CalculatorAccessRule {
  mode: CalculatorMode;
  label: string;
  module: CalculatorModule;
  plan: UserPlan;
  shortDescription: string;
}

export const calculatorAccessRules: CalculatorAccessRule[] = [
  {
    mode: 'current',
    label: 'Custo por serviço',
    module: 'orcamentoTecnico',
    plan: 'free',
    shortDescription: 'Estimativa de custo direto por serviço com margem e reserva.',
  },
  {
    mode: 'power',
    label: 'Custo fixo mensal',
    module: 'orcamentoTecnico',
    plan: 'free',
    shortDescription: 'Rateio mensal de custos fixos por período, volume e meta de lucro.',
  },
  {
    mode: 'margin',
    label: 'Margem real',
    module: 'financeiroAvancado',
    plan: 'pro',
    shortDescription: 'Cálculo de margem líquida real após custos e impostos.',
  }
];

export function canUseCalculator(mode: CalculatorMode, userPlan: UserPlan): boolean {
  const rule = calculatorAccessRules.find((item) => item.mode === mode);
  if (!rule) return false;
  return rule.plan === 'free' || userPlan === 'pro';
}

export function canUsePlanFeature(requiredPlan: FeaturePlan, userPlan: UserPlan): boolean {
  if (requiredPlan === 'soon') return false;
  return requiredPlan === 'free' || userPlan === 'pro';
}

export function proFeatureTitle(requiredPlan: FeaturePlan): string {
  if (requiredPlan === 'soon') return 'Recurso em breve';
  if (requiredPlan === 'pro') return 'Recurso do Aferix Pro';
  return 'Recurso livre';
}

export function getCalculatorAccessRule(mode: CalculatorMode): CalculatorAccessRule | undefined {
  return calculatorAccessRules.find((item) => item.mode === mode);
}

export function getFreeCalculatorCount(): number {
  return calculatorAccessRules.filter((item) => item.plan === 'free').length;
}

export function getProCalculatorCount(): number {
  return calculatorAccessRules.filter((item) => item.plan === 'pro').length;
}
