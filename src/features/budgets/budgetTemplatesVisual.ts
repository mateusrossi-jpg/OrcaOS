import type { BudgetTemplateId } from '../../core/types/business';

export interface BudgetTemplateOption {
  id: BudgetTemplateId;
  title: string;
  description: string;
  plan: 'free' | 'pro';
}

export const budgetTemplateOptions: BudgetTemplateOption[] = [
  {
    id: 'professional',
    title: 'Profissional',
    description: 'Modelo completo com cabeçalho da empresa, dados do cliente, tabela e condições comerciais.',
    plan: 'free',
  },
  {
    id: 'technical',
    title: 'Técnico',
    description: 'Modelo com visual mais técnico, bom para propostas com diagnóstico e justificativa.',
    plan: 'free',
  },
  {
    id: 'simple',
    title: 'Simples',
    description: 'Modelo direto, limpo e rápido para pequenos serviços.',
    plan: 'free',
  },
  {
    id: 'premiumModern',
    title: 'Premium moderno',
    description: 'Modelo visual mais comercial, previsto para pacote de modelos pagos.',
    plan: 'pro',
  },
  {
    id: 'premiumDetailed',
    title: 'Premium detalhado',
    description: 'Modelo avançado com seções comerciais e técnicas extras, previsto para venda futura.',
    plan: 'pro',
  },
];
