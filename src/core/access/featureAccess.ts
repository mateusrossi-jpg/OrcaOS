export type UserPlan = 'free' | 'pro';

export type CalculatorMode =
  | 'current'
  | 'power'
  | 'ohms-law'
  | 'power-resistance'
  | 'resistor-network'
  | 'consumption'
  | 'voltage-drop'
  | 'conversion'
  | 'lighting'
  | 'air-conditioning'
  | 'conduit-fill'
  | 'circuit-recommendation'
  | 'cable-section-drop'
  | 'max-distance-drop'
  | 'transformer-sizing'
  | 'awg-conversion'
  | 'motor-current'
  | 'motor-speed'
  | 'pulley-ratio'
  | 'analog-4-20ma'
  | 'analog-0-10v';

export type CalculatorModule =
  | 'fundamentals'
  | 'installations'
  | 'lighting'
  | 'refrigeration'
  | 'motors'
  | 'rewinding'
  | 'industrialAutomation';

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
    mode: 'ohms-law',
    label: 'Lei de Ohm',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Resistência por tensão e corrente.',
  },
  {
    mode: 'power-resistance',
    label: 'Potência/R',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Potência por resistência usando corrente ou tensão.',
  },
  {
    mode: 'resistor-network',
    label: 'Resistores',
    module: 'fundamentals',
    plan: 'free',
    shortDescription: 'Associação de resistores em série e paralelo.',
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
    mode: 'cable-section-drop',
    label: 'Seção por queda',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Seção mínima estimada a partir da queda de tensão máxima.',
  },
  {
    mode: 'max-distance-drop',
    label: 'Distância máxima',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Distância máxima estimada respeitando uma queda de tensão limite.',
  },
  {
    mode: 'transformer-sizing',
    label: 'Transformador',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Dimensionamento inicial de transformador em kVA com margem.',
  },
  {
    mode: 'awg-conversion',
    label: 'AWG ↔ mm²',
    module: 'installations',
    plan: 'pro',
    shortDescription: 'Converta bitola AWG para mm² ou encontre AWG próximo.',
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
    module: 'lighting',
    plan: 'pro',
    shortDescription: 'Lúmens necessários e quantidade de luminárias.',
  },
  {
    mode: 'air-conditioning',
    label: 'BTU ar-condicionado',
    module: 'refrigeration',
    plan: 'pro',
    shortDescription: 'Estimativa inicial de capacidade em BTU/h para climatização.',
  },
  {
    mode: 'motor-current',
    label: 'Corrente motor',
    module: 'motors',
    plan: 'pro',
    shortDescription: 'Corrente estimada de motor por potência mecânica, rendimento e fator de potência.',
  },
  {
    mode: 'motor-speed',
    label: 'Rotação motor',
    module: 'motors',
    plan: 'pro',
    shortDescription: 'Rotação síncrona e escorregamento por frequência, polos e RPM medido.',
  },
  {
    mode: 'pulley-ratio',
    label: 'Polias',
    module: 'motors',
    plan: 'pro',
    shortDescription: 'Relação de polias e rotação do eixo movido.',
  },
  {
    mode: 'analog-4-20ma',
    label: '4–20 mA',
    module: 'industrialAutomation',
    plan: 'pro',
    shortDescription: 'Escalonamento de sinal 4–20 mA para valor de engenharia.',
  },
  {
    mode: 'analog-0-10v',
    label: '0–10 V',
    module: 'industrialAutomation',
    plan: 'pro',
    shortDescription: 'Escalonamento de sinal 0–10 V para valor de engenharia.',
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
