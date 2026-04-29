import type { BudgetItem } from '../../core/types/business';

export const starterElectricalBudgetItems: BudgetItem[] = [
  {
    id: 'labor-outlet-point',
    description: 'Mão de obra para ponto de tomada simples',
    quantity: 1,
    unitPrice: 80,
    category: 'labor',
  },
  {
    id: 'labor-light-point',
    description: 'Mão de obra para ponto de iluminação',
    quantity: 1,
    unitPrice: 75,
    category: 'labor',
  },
  {
    id: 'labor-panel-service',
    description: 'Serviço em quadro elétrico existente',
    quantity: 1,
    unitPrice: 90,
    category: 'labor',
  },
  {
    id: 'material-outlet-module',
    description: 'Módulo de tomada 20 A',
    quantity: 2,
    unitPrice: 18,
    category: 'material',
  },
  {
    id: 'material-box',
    description: 'Caixa elétrica de sobrepor',
    quantity: 1,
    unitPrice: 35,
    category: 'material',
  },
];
