export type UserPlan = 'free' | 'pro';
export type FeaturePlan = UserPlan | 'soon';

export type CalculatorMode =
  | 'markup'
  | 'margin'
  | 'taxes'
  | 'installments'
  | 'travel'
  | 'goals'
  | 'warranty'
  | 'discount'
  | 'productivity';

export function canUseCalculator(_mode: CalculatorMode, userPlan: UserPlan): boolean {
  return userPlan === 'pro'; // MVP simplificado: precificação avançada é Pro
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
