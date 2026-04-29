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
    id: 'labor-breaker-install',
    description: 'Instalação de disjuntor em quadro existente',
    quantity: 1,
    unitPrice: 90,
    category: 'labor',
  },
];
