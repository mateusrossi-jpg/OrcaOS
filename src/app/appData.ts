import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, ModulePlan } from './appTypes';

export const userPlan: UserPlan = 'free';

/**
 * Navegação Radicalmente Simplificada para o MVP.
 * Foco: Home, Atendimentos (Operação), Financeiro e Menu (Mais).
 */
export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Início', description: 'Resumo e ações rápidas', icon: 'home', primary: true },
  { id: 'clients', label: 'Atendimentos', description: 'Clientes e propostas', icon: 'clients', primary: true },
  { id: 'financial', label: 'Financeiro', description: 'Receitas e custos', icon: 'finance', primary: true },
  { id: 'settings', label: 'Menu', description: 'Mais ferramentas', icon: 'menu', primary: true },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'Livre';
  if (plan === 'pro') return 'Pro';
  return 'Em breve';
}
