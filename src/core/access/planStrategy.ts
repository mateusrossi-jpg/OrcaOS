export interface PlanBenefit {
  title: string;
  description: string;
}

export interface PlanPackage {
  title: string;
  description: string;
  price: string;
  icon: string;
}

export const FREE_PLAN_LIMITS = {
  savedBudgets: 5,
  catalogItems: 20,
  serviceTemplates: 3,
} as const;

export const freePlanBenefits: PlanBenefit[] = [
  { title: 'Cálculos básicos', description: 'Precificação essencial para decidir quanto cobrar.' },
  { title: 'Orçamento manual simples', description: 'Monte e compartilhe uma proposta básica sem bloquear o atendimento.' },
  { title: 'Alguns orçamentos salvos', description: 'Rascunhos e histórico local para uso real no dia a dia.' },
  { title: 'Clientes básicos', description: 'Cadastro simples para identificar cliente, contato e endereço.' },
  { title: 'Produtos e serviços simples', description: 'Itens recorrentes para acelerar o orçamento sem virar ERP pesado.' },
  { title: 'Texto e PDF simples', description: 'Compartilhamento em texto e modelo simples sem marca d agua.' },
  { title: 'Backup local e offline', description: 'Uso local-first com exportação manual dos dados.' },
];

export const proPlanBenefits: PlanBenefit[] = [
  { title: 'Orçamentos ilimitados', description: 'Sem limite prático para histórico, rascunhos e propostas.' },
  { title: 'PDFs profissionais', description: 'Modelos comercial, técnico detalhado e proposta premium.' },
  { title: 'Identidade profissional', description: 'Logo, dados completos, assinatura, Pix e campos comerciais avançados.' },
  { title: 'Modelos personalizados', description: 'Serviços compostos e modelos reutilizáveis para ganhar tempo.' },
  { title: 'Catálogo ilimitado', description: 'Produtos, serviços, fornecedores e histórico mais completo.' },
  { title: 'Cálculos avançados', description: 'Margem, lucro, taxas, impostos estimados, juros e parcelamento.' },
  { title: 'Relatórios técnicos', description: 'Documentos mais completos para cliente e histórico profissional.' },
  { title: 'Financeiro gerencial', description: 'Lucro bruto/líquido, taxa de cartão, imposto estimado e resumo mensal.' },
  { title: 'Lista de compra do cliente', description: 'Materiais organizados para evitar compra errada.' },
];

export const proV1Priorities: PlanBenefit[] = [
  { title: 'Cálculos Pro vitalícios', description: 'Primeira camada vendável: margem real, taxas, parcelamento, metas, entrada, deslocamento e lucro.' },
  { title: 'PDFs profissionais', description: 'Primeiro ganho perceptível: aparência melhor e proposta mais confiável.' },
  { title: 'Orçamentos ilimitados', description: 'Remove atrito para quem usa o app todo dia.' },
  { title: 'Modelos personalizados', description: 'Acelera orçamento recorrente e serviços compostos.' },
  { title: 'Cálculos avançados', description: 'Ajuda a formar preço, desconto, juros, taxas e lucro.' },
  { title: 'Relatórios técnicos', description: 'Melhora entrega e histórico sem entrar em fiscal oficial.' },
  { title: 'Financeiro/lucro real básico', description: 'Mostra quanto realmente sobrou depois de custos e taxas.' },
];

export const futureProBacklog: PlanBenefit[] = [
  { title: 'OrçaParts avançado', description: 'Biblioteca técnica mais inteligente e expansível.' },
  { title: 'Busca online', description: 'Apoio de referência de compra, sem depender de scraping frágil.' },
  { title: 'Backup em nuvem', description: 'Sincronização futura quando backend estiver pronto.' },
  { title: 'Fiscal, web e multiusuário', description: 'Fases futuras fora da obrigação da V1.' },
];

export const storePackages: PlanPackage[] = [
  {
    title: 'Free',
    description: 'Uso real básico: orçamento simples, cálculos essenciais, clientes básicos, catálogo simples, texto, PDF sem marca d agua e backup local.',
    price: 'Grátis',
    icon: 'FREE',
  },
  {
    title: 'Cálculos Pro vitalício',
    description: 'Pacote de entrada para liberar precificação avançada, margem real, taxas, parcelamento, deslocamento, metas e simulação de lucro.',
    price: 'R$ 29,90 sugerido',
    icon: 'CALC',
  },
  {
    title: 'OrçaOS Pro',
    description: 'Para parecer mais profissional, ganhar tempo no orçamento e entender lucro real com modelos, relatórios e financeiro gerencial.',
    price: 'Valor em validação',
    icon: 'PRO',
  },
];
