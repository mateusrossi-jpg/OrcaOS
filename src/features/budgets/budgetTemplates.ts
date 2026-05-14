import type { BudgetItem } from '../../core/types/business';

export const starterFinancialBudgetItems: BudgetItem[] = [
  {
    id: 'labor-service-base',
    description: 'Mão de obra para serviço base',
    quantity: 1,
    unitPrice: 80,
    category: 'labor',
  },
  {
    id: 'labor-service-review',
    description: 'Revisão, conferência e acabamento do serviço',
    quantity: 1,
    unitPrice: 75,
    category: 'labor',
  },
  {
    id: 'labor-technical-visit',
    description: 'Visita técnica e diagnóstico inicial',
    quantity: 1,
    unitPrice: 90,
    category: 'labor',
  },
  {
    id: 'material-consumables',
    description: 'Insumos e materiais de execução',
    quantity: 2,
    unitPrice: 18,
    category: 'material',
  },
  {
    id: 'material-finish-kit',
    description: 'Kit de acabamento e fixação',
    quantity: 1,
    unitPrice: 35,
    category: 'material',
  },
];
