import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppNavItem, ModulePlan } from './appTypes';

export const userPlan: UserPlan = 'free';

export const navItems: AppNavItem[] = [
  { id: 'pulse', label: 'Pulse', description: 'Diagnóstico rápido do negócio', icon: 'home' },
  { id: 'work-history', label: 'Work', description: 'Fluxo operacional e orçamentos', icon: 'document' },
  { id: 'money', label: 'Money', description: 'Resultados financeiros automáticos', icon: 'finance' },
  { id: 'base', label: 'Base', description: 'Clientes, Catálogo e Configurações', icon: 'clients' },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'Livre';
  if (plan === 'pro') return 'Pro';
  return 'Em breve';
}
