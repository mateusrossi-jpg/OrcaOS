import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, ModulePlan } from './appTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Pulse', description: 'Saúde do negócio', icon: 'home', primary: true },
  { id: 'budgets', label: 'Novo orçamento', description: 'Criar orçamento', icon: 'document', primary: true },
  { id: 'budget-history', label: 'Histórico de orçamentos', description: 'Pipeline operacional', icon: 'document', primary: true },
  { id: 'financial', label: 'Money', description: 'Receitas, custos e lucro', icon: 'finance', primary: true },
  { id: 'clients', label: 'Clientes', description: 'Base de clientes', icon: 'clients', primary: true },
  { id: 'catalog', label: 'Catálogo', description: 'Itens e serviços', icon: 'document', primary: true },
  { id: 'reports', label: 'Relatórios', description: 'Visão analítica', icon: 'chart', primary: true },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'Livre';
  if (plan === 'pro') return 'Pro';
  return 'Em breve';
}
