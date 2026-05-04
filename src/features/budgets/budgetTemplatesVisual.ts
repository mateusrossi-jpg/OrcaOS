import type { BudgetTemplateId } from '../../core/types/business';

export interface BudgetTemplateOption {
  id: BudgetTemplateId;
  title: string;
  description: string;
  value: string;
  plan: 'free' | 'pro';
}

export const budgetTemplateOptions: BudgetTemplateOption[] = [
  {
    id: 'simple',
    title: 'Orçamento Simples',
    description: 'Modelo grátis, limpo e funcional, sem marca d agua e sem capa.',
    value: 'Cliente, data, descrição, itens, totais, observações e dados básicos.',
    plan: 'free',
  },
  {
    id: 'professional',
    title: 'Profissional Comercial',
    description: 'Cabeçalho profissional, logo, dados completos e campo de aceite.',
    value: 'Feito para parecer mais organizado e aumentar confiança na aprovação.',
    plan: 'pro',
  },
  {
    id: 'technical',
    title: 'Técnico Detalhado',
    description: 'Diagnóstico, ambientes, medições, cálculos, recomendações e totais por categoria.',
    value: 'Indicado para serviços que precisam justificar tecnicamente o valor.',
    plan: 'pro',
  },
  {
    id: 'premiumModern',
    title: 'Proposta Premium',
    description: 'Capa, problema identificado, solução proposta, benefícios e próximos passos.',
    value: 'Para vender melhor serviços maiores com uma proposta mais consultiva.',
    plan: 'pro',
  },
];
