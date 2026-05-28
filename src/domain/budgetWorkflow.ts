export type WorkflowStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

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
    label: 'Contexto',
    description: 'Dê um nome ao projeto para facilitar a busca no histórico.',
    fields: ['title'],
    requiredFields: ['title'],
    isLockedAfterStatus: ['finalizado', 'arquivado'],
    actionLabel: 'Próximo: Identificar Cliente',
    icon: '🏷️',
  },
  2: {
    id: 2,
    label: 'Cliente',
    description: 'Vincule um cliente da base ou digite um nome avulso.',
    fields: ['clientId', 'clientName'],
    requiredFields: ['clientName'],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Próximo: Adicionar Itens',
    icon: '👤',
  },
  3: {
    id: 3,
    label: 'Itens e Serviços',
    description: 'Liste o que será feito e os materiais do catálogo.',
    fields: ['items'],
    requiredFields: ['items'],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Próximo: Custos de Obra',
    icon: '🛠️',
  },
  4: {
    id: 4,
    label: 'Custos de Obra',
    description: 'Quanto você vai gastar com materiais, ajudantes e viagem?',
    fields: ['materialCost', 'helperCost', 'travelCost', 'otherCosts'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Próximo: Impostos e Descontos',
    icon: '💸',
  },
  5: {
    id: 5,
    label: 'Deduções',
    description: 'Taxas de cartão, impostos e descontos comerciais.',
    fields: ['fees', 'discounts'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Próximo: Definir Preço Final',
    icon: '📉',
  },
  6: {
    id: 6,
    label: 'Análise de Lucro',
    description: 'Ajuste o valor final e valide sua margem de segurança.',
    fields: ['chargedValue'],
    requiredFields: ['chargedValue'],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Revisar Proposta',
    icon: '💰',
  },
  7: {
    id: 7,
    label: 'Proposta',
    description: 'Envie o documento profissional para o cliente aprovar.',
    fields: ['commercialNotes'],
    requiredFields: [],
    isLockedAfterStatus: ['autorizado', 'em_execucao', 'finalizado'],
    actionLabel: 'Enviar para Cliente',
    icon: '📑',
  },
  8: {
    id: 8,
    label: 'Execução',
    description: 'Trabalho em andamento. Gerencie a Ordem de Serviço.',
    fields: ['notes'],
    requiredFields: [],
    isLockedAfterStatus: ['finalizado'],
    actionLabel: 'Concluir Trabalho',
    icon: '🏗️',
  },
  9: {
    id: 9,
    label: 'Fechamento',
    description: 'Resultado real alcançado e arquivamento do projeto.',
    fields: [],
    requiredFields: [],
    isLockedAfterStatus: [],
    actionLabel: 'Arquivar Orçamento',
    icon: '🏁',
  },
};
