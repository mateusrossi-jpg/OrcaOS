import type { CalculationDestination } from '../../../core/types/workflow';
import type { GuidedLine, KitTemplate } from '../types/guidedBudget';

export function material(description: string, quantity: number, destination: CalculationDestination, note: string, brand?: string): Omit<GuidedLine, 'id' | 'environment'> {
  return { kind: 'kit', description, quantity, unitValue: 0, itemType: 'material', destination, note, brand };
}

export function service(description: string, quantity: number, unitValue: number, destination: CalculationDestination, note: string): Omit<GuidedLine, 'id' | 'environment'> {
  return { kind: 'kit', description, quantity, unitValue, itemType: 'service', destination, note };
}

export const kitTemplates: KitTemplate[] = [
  {
    id: 'simple-outlet-4x2',
    title: 'Tomada simples 4x2',
    description: 'Suporte, 1 módulo, placa simples e mão de obra.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      material('Chassis/suporte 4x2 para tomada simples', q, destination, 'Gerado por kit de tomada simples 4x2.', brand),
      material('Módulo de tomada 2P+T', q, destination, 'Tomada simples: 1 módulo por ponto.', brand),
      material('Placa 4x2 simples para tomada', q, destination, 'Uma placa simples por tomada.', brand),
      service('Mão de obra: instalação de tomada simples', q, 45, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme obra.'),
    ],
  },
  {
    id: 'double-outlet-4x2',
    title: 'Tomada dupla 4x2',
    description: 'Suporte, 2 módulos, placa dupla e mão de obra.',
    defaultQuantity: '4',
    generate: (q, brand, destination) => [
      material('Chassis/suporte 4x2 para tomada dupla', q, destination, 'Gerado por kit de tomada dupla 4x2.', brand),
      material('Módulo de tomada 2P+T', q * 2, destination, 'Tomada dupla: 2 módulos por ponto.', brand),
      material('Placa 4x2 dupla para tomada', q, destination, 'Uma placa dupla por tomada dupla.', brand),
      service('Mão de obra: instalação de tomada dupla', q, 55, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme obra.'),
    ],
  },
  {
    id: 'simple-switch-4x2',
    title: 'Interruptor simples 4x2',
    description: 'Suporte, módulo interruptor, placa e mão de obra.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      material('Chassis/suporte 4x2 para interruptor', q, destination, 'Gerado por kit de interruptor simples.', brand),
      material('Módulo interruptor simples', q, destination, 'Um módulo interruptor simples por ponto.', brand),
      material('Placa 4x2 para interruptor simples', q, destination, 'Uma placa por ponto de interruptor.', brand),
      service('Mão de obra: instalação de interruptor simples', q, 45, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme obra.'),
    ],
  },
  {
    id: 'lighting-point',
    title: 'Ponto de iluminação',
    description: 'Ponto de luz, conector e luminária a definir.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      service('Mão de obra: instalação de ponto de iluminação', q, 65, destination, 'Confirmar fiação, interruptor e acabamento.'),
      material('Conector de emenda para iluminação', q, destination, 'Conector sugerido para ligação segura do ponto.', brand),
      material('Lâmpada/luminária a definir', q, destination, 'Item placeholder: definir modelo com o cliente.', brand),
    ],
  },
  {
    id: 'spot-led',
    title: 'Spot LED',
    description: 'Spot, conector e serviço por unidade.',
    defaultQuantity: '4',
    generate: (q, brand, destination) => [
      material('Spot LED de embutir/sobrepor a definir', q, destination, 'Definir potência, cor da luz e modelo do spot.', brand),
      material('Conector de emenda para spot LED', q, destination, 'Conector sugerido para ligação do spot.', brand),
      service('Mão de obra: instalação de spot LED', q, 45, destination, 'Ajuste valor conforme acesso e acabamento.'),
    ],
  },
  {
    id: 'ac-dedicated-circuit',
    title: 'Circuito dedicado ar-condicionado',
    description: 'Serviço, disjuntor, tomada/isolador e placeholders.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      service('Mão de obra: circuito dedicado para ar-condicionado', q, 180, destination, 'Validar potência, distância, bitola, disjuntor, DR e padrão do fabricante.'),
      material('Disjuntor para circuito dedicado de ar-condicionado', q, destination, 'Definir corrente/polos após dimensionamento.', brand),
      material('Tomada/isolador para ar-condicionado', q, destination, 'Definir padrão conforme equipamento.', brand),
      material('Cabo elétrico para circuito dedicado', q, destination, 'Placeholder: calcular metragem e seção.', brand),
    ],
  },
  {
    id: 'external-outlet',
    title: 'Tomada externa aparente',
    description: 'Caixa externa, tomada, tampa e serviço.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      material('Caixa/tomada externa aparente com proteção', q, destination, 'Escolher grau de proteção conforme exposição.', brand),
      material('Módulo de tomada 2P+T para área externa', q, destination, 'Definir 10A ou 20A conforme uso.', brand),
      material('Tampa/placa para tomada externa', q, destination, 'Acabamento com proteção adequada.', brand),
      service('Mão de obra: instalação de tomada externa', q, 75, destination, 'Validar vedação, altura, percurso e proteção.'),
    ],
  },
];

export const kitBrands = ['Fabricante B', 'Fabricante C', 'Fabricante A', 'Fabricante D', 'Fabricante E', 'Fabricante F', 'Outra'];
