import { Target, Zap, ClipboardList, DollarSign, Activity, Users, Play } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  tabId: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'quick-service',
    label: 'Serviço Expresso',
    description: 'Criar, finalizar e faturar serviço com 1 toque.',
    icon: Zap,
    color: 'var(--accent-gold)',
    tabId: 'new-quick-service'
  },
  {
    id: 'new-proposal',
    label: 'Nova Proposta',
    description: 'Gerar orçamento completo com materiais e serviços.',
    icon: Target,
    color: 'var(--accent-gold)',
    tabId: 'new-budget'
  },
  {
    id: 'new-os',
    label: 'Nova OS',
    description: 'Registrar ordem de serviço diretamente na Agenda.',
    icon: ClipboardList,
    color: 'var(--accent-green)',
    tabId: 'new-budget'
  },
  {
    id: 'payment',
    label: 'Receber Pagamento',
    description: 'Liquidar lançamentos em aberto no livro-razão.',
    icon: DollarSign,
    color: 'var(--accent-green)',
    tabId: 'money'
  },
  {
    id: 'diagnostic',
    label: 'Novo Laudo',
    description: 'Emitir laudo técnico completo de inspeção de ativos.',
    icon: Activity,
    color: 'var(--accent-gold)',
    tabId: 'diagnostics'
  },
  {
    id: 'new-client',
    label: 'Novo Cliente',
    description: 'Cadastrar novo cliente na base de dados.',
    icon: Users,
    color: 'var(--text-secondary)',
    tabId: 'clients'
  },
  {
    id: 'manage-assets',
    label: 'Equipamentos',
    description: 'Acessar prontuário técnico e histórico de ativos.',
    icon: ClipboardList,
    color: 'var(--accent-gold)',
    tabId: 'assets'
  },
  {
    id: 'manage-checklists',
    label: 'Checklists',
    description: 'Personalizar campos de inspeção por categoria.',
    icon: ClipboardList,
    color: 'var(--accent-gold)',
    tabId: 'checklist-manager'
  }
];
