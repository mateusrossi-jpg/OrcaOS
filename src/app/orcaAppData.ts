import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Dashboard', description: 'Resumo financeiro', icon: 'dashboard', section: 'Gestão financeira', primary: true },
  { id: 'budgets', label: 'Propostas', description: 'Fluxo comercial', icon: 'budget', section: 'Gestão financeira', primary: true },
  { id: 'clients', label: 'Clientes', description: 'Atendimentos', icon: 'clients', section: 'Gestão financeira', primary: true },
  { id: 'financial', label: 'Financeiro', description: 'Receitas e custos', icon: 'finance', section: 'Gestão financeira', primary: true },
  { id: 'catalog', label: 'Catálogo', description: 'Itens e serviços', icon: 'catalog', section: 'Operação', primary: true },
  { id: 'calculations', label: 'Simulador', description: 'Preço e margem', icon: 'calculator', section: 'Operação' },
  { id: 'purchaseList', label: 'Compras', description: 'Lista do cliente', icon: 'list', section: 'Operação' },
  { id: 'reports', label: 'Relatórios', description: 'Prévia do documento', icon: 'reports', section: 'Operação' },
  { id: 'survey', label: 'Base técnica', description: 'Registro opcional', icon: 'survey', section: 'Operação' },
  { id: 'store', label: 'Licença', description: 'Planos e acesso', icon: 'store', section: 'Sistema' },
  { id: 'settings', label: 'Configurações', description: 'Perfil e backup', icon: 'settings', section: 'Sistema' },
];

export const calculationModules: ModuleCardData[] = [
  { id: 'orcamentoTecnico', title: 'Precificação e financeiro', purpose: 'Quanto cobrar e quanto sobra', description: 'Preço, margem, lucro, tempo de trabalho, deslocamento, materiais, impostos/taxas e parcelamento/juros.', icon: 'R$', tone: 'orange', count: 'Preço + financeiro', available: true, plan: 'free', calculatorModule: 'orcamentoTecnico' },
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
