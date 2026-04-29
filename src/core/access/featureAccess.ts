export type UserPlan = 'free' | 'pro';

export type CalculatorMode =
  | 'current'
  | 'power'
  | 'consumption'
  | 'voltage-drop'
  | 'conversion'
  | 'lighting'
  | 'air-conditioning'
  | 'conduit-fill'
  | 'circuit-recommendation';

export type CalculatorModule = 'fundamentals' | 'installations' | 'environments';

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
    label: 'Corrente',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Corrente por potência, tensão, fase e fator de potência.',
  },
  {
    mode: 'power',
    label: 'Potência',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Potência por corrente, tensão, fase e fator de potência.',
  },
  {
    mode: 'conversion',
    label: 'W / VA / A',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Conversão entre potência ativa, aparente e corrente.',
  },
  {
    mode: 'consumption',
    label: 'Consumo',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Consumo em kWh e custo estimado.',
  },
  {
    mode: 'voltage-drop',
    label: 'Queda tensão',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Estimativa de queda de tensão em condutores.',
  },
  {
    mode: 'circuit-recommendation',
    label: 'Cabo/disjuntor',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Pré-dimensionamento de corrente, cabo e disjuntor.',
  },
  {
    mode: 'conduit-fill',
    label: 'Eletroduto',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Ocupação aproximada de eletroduto por cabos.',
  },
  {
    mode: 'lighting',
    label: 'Iluminação',
    module: 'environments',
    plan: 'pro',
    shortDescription: 'Lúmens necessários e quantidade de luminárias.',
  },
  {
    mode: 'air-conditioning',
    label: 'Ar-condicionado',
    module: 'environments',
    plan: 'pro',
    shortDescription: 'Estimativa inicial de capacidade em BTU/h.',
  },
];

export function canUseCalculator(mode: CalculatorMode, userPlan: UserPlan): boolean {
  const rule = calculatorAccessRules.find((item) => item.mode === mode);

  if (!rule) {
    return false;
  }

  return rule.plan === 'free' || userPlan === 'pro';
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
