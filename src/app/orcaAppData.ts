import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Dashboard', description: 'KPIs, lucro e recebíveis', icon: 'dashboard', section: 'Gestão financeira', primary: true },
  { id: 'budgets', label: 'Propostas', description: 'Orçamentos, envio e aprovação', icon: 'budget', section: 'Gestão financeira', primary: true },
  { id: 'clients', label: 'Clientes', description: 'Cadastro, histórico e serviços', icon: 'clients', section: 'Gestão financeira', primary: true },
  { id: 'financial', label: 'Financeiro', description: 'Receita, custos e lucro real', icon: 'finance', section: 'Gestão financeira', primary: true },
  { id: 'catalog', label: 'Catálogo', description: 'Itens, serviços e fornecedores', icon: 'catalog', section: 'Operação', primary: true },
  { id: 'calculations', label: 'Simulador', description: 'Margem, taxas e parcelamento', icon: 'calculator', section: 'Operação' },
  { id: 'purchaseList', label: 'Compras', description: 'Materiais e itens de execução', icon: 'list', section: 'Operação' },
  { id: 'reports', label: 'Relatórios', description: 'Documento comercial e gerencial', icon: 'reports', section: 'Operação' },
  { id: 'survey', label: 'Base técnica', description: 'Itens de apoio para proposta', icon: 'survey', section: 'Operação' },
  { id: 'store', label: 'Licença', description: 'Plano, recursos Pro e assinatura', icon: 'store', section: 'Sistema' },
  { id: 'settings', label: 'Configurações', description: 'Perfil, acesso, backup e preferências', icon: 'settings', section: 'Sistema' },
  { id: 'beta', label: 'Beta', description: 'Checklist de teste fechado', icon: 'beta', section: 'Sistema' },
  { id: 'more', label: 'Mais recursos', description: 'Atalhos para áreas avançadas', icon: 'more', section: 'Sistema' },
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
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}
