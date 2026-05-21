import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, ModulePlan } from './appTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Início', description: 'Dashboard e resumo', icon: 'home', primary: true },
  { id: 'budgets', label: 'Novo orçamento', description: 'Criar orçamento', icon: 'document', primary: true },
  { id: 'budget-history', label: 'Histórico de orçamentos', description: 'Lista e filtros', icon: 'document', primary: true },
  { id: 'clients', label: 'Clientes', description: 'Gestão de clientes', icon: 'clients', primary: true },
  { id: 'financial', label: 'Financeiro', description: 'Receitas e custos', icon: 'finance', primary: true },
  { id: 'reports', label: 'Relatórios', description: 'Visão geral da operação', icon: 'chart', primary: true },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'Livre';
  if (plan === 'pro') return 'Pro';
  return 'Em breve';
}
