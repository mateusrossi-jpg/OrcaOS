export type WorkflowStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  description: string;
  fields: string[];
  requiredFields: string[];
  isLockedAfterStatus: string[];
  actionLabel: string;
  icon: string;
}

export const BUDGET_WORKFLOW_MAP: Record<WorkflowStepId, WorkflowStep> = {
  1: {
    id: 1,
    label: 'Cliente',
    description: 'Busque na base ou informe o nome do cliente.',
    fields: ['clientId', 'clientName'],
    requiredFields: ['clientName'],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Escopo',
    icon: '👤',
  },
  2: {
    id: 2,
    label: 'Escopo',
    description: 'Título do projeto e prazo de execução.',
    fields: ['title', 'executionDeadline'],
    requiredFields: ['title'],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Técnico',
    icon: '🎯',
  },
  3: {
    id: 3,
    label: 'Técnico',
    description: 'Levantamento e descrição do problema.',
    fields: ['technicalNotes'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'M. Obra',
    icon: '🔍',
  },
  4: {
    id: 4,
    label: 'M. Obra',
    description: 'Serviços que serão executados.',
    fields: ['items'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Materiais',
    icon: '🛠️',
  },
  5: {
    id: 5,
    label: 'Materiais',
    description: 'Insumos necessários para a obra.',
    fields: ['items'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Logística',
    icon: '📦',
  },
  6: {
    id: 6,
    label: 'Logística',
    description: 'Custos diretos de deslocamento e ajudantes.',
    fields: ['helperCost', 'travelCost', 'otherCosts'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Taxas',
    icon: '🚚',
  },
  7: {
    id: 7,
    label: 'Taxas',
    description: 'Impostos e descontos aplicados.',
    fields: ['fees', 'discounts'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Estratégia',
    icon: '📉',
  },
  8: {
    id: 8,
    label: 'Estratégia',
    description: 'Definição do preço de venda e margem.',
    fields: ['chargedValue'],
    requiredFields: ['chargedValue'],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Proposta',
    icon: '💰',
  },
  9: {
    id: 9,
    label: 'Proposta',
    description: 'Termos, condições e envio ao cliente.',
    fields: ['commercialNotes', 'paymentTerms', 'guarantee'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Enviar ao Cliente',
    icon: '📑',
  },
  10: {
    id: 10,
    label: 'Execução',
    description: 'Diário de obra e checklist.',
    fields: ['notes'],
    requiredFields: [],
    isLockedAfterStatus: ['finalizado'],
    actionLabel: 'Concluir Obra',
    icon: '🏗️',
  },
  11: {
    id: 11,
    label: 'Fechamento',
    description: 'Auditoria de lucro e arquivamento.',
    fields: [],
    requiredFields: [],
    isLockedAfterStatus: [],
    actionLabel: 'Arquivar Projeto',
    icon: '🏁',
  },
};
