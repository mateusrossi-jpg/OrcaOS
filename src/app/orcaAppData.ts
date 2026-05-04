import type { UserPlan } from '../core/access/featureAccess';
export { storePackages } from '../core/access/planStrategy';
import type { AppTab, CalculationSectorGroup, ModuleCardData, ModulePlan } from './orcaAppTypes';

export const userPlan: UserPlan = 'free';

export const navItems: Array<{ id: AppTab; label: string; description: string; icon: string; section?: string; primary?: boolean }> = [
  { id: 'home', label: 'Início', description: 'Decida o próximo passo', icon: 'IN', section: 'Uso diário', primary: true },
  { id: 'clients', label: 'Atendimentos', description: 'Clientes, visitas e serviços em orçamento', icon: 'AT', section: 'Uso diário', primary: true },
  { id: 'budgets', label: 'Orçamentos', description: 'Propostas, envio, aprovação e OS', icon: 'ORC', section: 'Uso diário', primary: true },
  { id: 'catalog', label: 'Estoque', description: 'Catálogo, peças, serviços e fornecedores', icon: 'EST', section: 'Uso diário', primary: true },
  { id: 'financial', label: 'Financeiro', description: 'Recebimentos, custos e lucro real', icon: 'FIN', section: 'Uso diário', primary: true },
  { id: 'calculations', label: 'Precificação', description: 'Margem, lucro, taxas e parcelamento', icon: 'R$', section: 'Ferramentas' },
  { id: 'purchaseList', label: 'Lista de compra', description: 'Materiais para o cliente comprar', icon: 'LC', section: 'Ferramentas' },
  { id: 'reports', label: 'Relatórios', description: 'Documento técnico e visão gerencial', icon: 'REL', section: 'Ferramentas' },
  { id: 'survey', label: 'Itens técnicos', description: 'Base técnica para orçamento e relatório', icon: 'IT', section: 'Ferramentas' },
  { id: 'store', label: 'Loja / Pro', description: 'Plano, recursos Pro e assinatura', icon: 'PRO', section: 'Administração' },
  { id: 'settings', label: 'Configurações', description: 'Perfil, acesso, backup e preferências', icon: 'CFG', section: 'Administração' },
  { id: 'beta', label: 'Beta', description: 'Checklist de teste fechado', icon: 'BETA', section: 'Administração' },
  { id: 'more', label: 'Mais recursos', description: 'Atalhos para áreas avançadas', icon: 'MAIS', section: 'Administração' },
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
