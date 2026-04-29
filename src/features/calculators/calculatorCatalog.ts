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
    id: 'w-va-a-conversion',
    title: 'Conversão W / VA / A',
    description: 'Converta potência ativa, potência aparente e corrente com fator de potência.',
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
    id: 'circuit-recommendation',
    title: 'Cabo e disjuntor',
    description: 'Pré-dimensione corrente, disjuntor comercial e seção inicial de cabo.',
    status: 'available',
    plan: 'pro',
  },
  {
    id: 'lighting',
    title: 'Iluminação por ambiente',
    description: 'Calcule lúmens necessários e quantidade inicial de luminárias.',
    status: 'available',
    plan: 'free',
  },
  {
    id: 'air-conditioning',
    title: 'Ar-condicionado',
    description: 'Estime BTU/h por área, pessoas, equipamentos e fator de calor.',
    status: 'available',
    plan: 'free',
  },
  {
    id: 'conduit-fill',
    title: 'Ocupação de eletroduto',
    description: 'Calcule ocupação aproximada com diâmetro externo dos cabos e diâmetro interno do eletroduto.',
    status: 'available',
    plan: 'pro',
  },
];
