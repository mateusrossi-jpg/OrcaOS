import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './appTypes';

export const userPlan: UserPlan = 'free';

/**
 * Navegação Radicalmente Simplificada para o MVP.
 * Foco: Home, Atendimentos (Operação), Financeiro e Menu (Mais).
 */
export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Início', description: 'Resumo e ações rápidas', icon: 'home', primary: true },
  { id: 'clients', label: 'Atendimentos', description: 'Clientes e propostas', icon: 'clients', primary: true },
  { id: 'financial', label: 'Financeiro', description: 'Entradas e saídas', icon: 'finance', primary: true },
  { id: 'settings', label: 'Menu', description: 'Mais ferramentas', icon: 'menu', primary: true },
];

export const calculationModules: ModuleCardData[] = [
  { 
    id: 'orcamentoTecnico', 
    title: 'Precificação e financeiro', 
    purpose: 'Quanto cobrar e quanto sobra', 
    description: 'Preço, margem, lucro, tempo de trabalho, deslocamento, materiais, impostos/taxas e parcelamento/juros.', 
    icon: 'R$', 
    tone: 'orange', 
    count: 'Preço + financeiro', 
    available: true, 
    plan: 'free', 
    calculatorModule: 'orcamentoTecnico' 
  },
];

export const calculationSectorGroups: CalculationSectorGroup[] = [
  {
    id: 'financial',
    title: 'Precificação',
    description: 'Cálculos voltados a preço, financeiro, margem/lucro, tempo, deslocamento, materiais, impostos/taxas e parcelamento/juros.',
    icon: 'R$',
    moduleIds: ['orcamentoTecnico'],
  },
];

export function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'Livre';
  if (plan === 'pro') return 'Pro';
  return 'Em breve';
}
