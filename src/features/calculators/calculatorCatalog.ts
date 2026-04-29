export interface CalculatorCatalogItem {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'planned';
  plan: 'free' | 'pro';
}

export const calculatorCatalog: CalculatorCatalogItem[] = [
  {
    id: 'current-from-power',
    title: 'Corrente por potência',
    description: 'Calcule a corrente aproximada a partir da potência, tensão, fase e fator de potência.',
    status: 'available',
    plan: 'free',
  },
  {
    id: 'power-from-current',
    title: 'Potência por corrente',
    description: 'Estime potência em circuitos monofásicos ou trifásicos.',
    status: 'available',
    plan: 'free',
  },
  {
    id: 'energy-consumption',
    title: 'Consumo em kWh',
    description: 'Calcule consumo mensal e custo estimado de equipamentos.',
    status: 'available',
    plan: 'free',
  },
  {
    id: 'voltage-drop',
    title: 'Queda de tensão',
    description: 'Apoio inicial para estimar queda de tensão em condutores.',
    status: 'available',
    plan: 'pro',
  },
  {
    id: 'conduit-fill',
    title: 'Ocupação de eletroduto',
    description: 'Planejado para calcular ocupação conforme cabos e eletroduto.',
    status: 'planned',
    plan: 'pro',
  },
];
