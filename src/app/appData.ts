import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppNavItem, ModulePlan } from './appTypes';

export const userPlan: UserPlan = 'free';

export const navItems: AppNavItem[] = [
  { id: 'pulse', label: 'Resumo', description: 'Resumo geral do negócio', icon: 'home' },
  { id: 'work-history', label: 'Operacional', description: 'Fluxo operacional e orçamentos', icon: 'document' },
  { id: 'money', label: 'Financeiro', description: 'Resultados financeiros automáticos', icon: 'finance' },
  { id: 'base', label: 'Base', description: 'Clientes, Catálogo e Configurações', icon: 'clients' },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'Livre';
  if (plan === 'pro') return 'Pro';
  return 'Em breve';
}
