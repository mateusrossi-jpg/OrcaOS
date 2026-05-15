import type { OrcaAccountState } from '../../core/access/accountPlanStorage';

export function planStatusTitle(account: OrcaAccountState): string {
  if (account.plan === 'pro' && account.planStatus === 'trial') return 'Pro em teste';
  if (account.plan === 'pro') return 'Pro ativo';
  if (account.planStatus === 'expired') return 'Liberação expirada';
  if (account.planStatus === 'past_due') return 'Liberação pendente';
  if (account.planStatus === 'inactive') return 'Nenhuma liberação Pro encontrada';
  return 'Plano grátis';
}

export function planStatusDescription(account: OrcaAccountState, planSourceLabel: string): string {
  if (account.plan === 'pro' && account.planStatus === 'trial') return `Teste Pro liberado por ${planSourceLabel}.`;
  if (account.plan === 'pro') return `Recursos Pro liberados por ${planSourceLabel}.`;
  if (account.planStatus === 'expired') return 'A liberação Pro foi encontrada, mas expirou. Recursos Pro permanecem bloqueados.';
  if (account.planStatus === 'past_due') return 'Existe pendência na assinatura Pro. Regularize no checkout/portal e verifique novamente.';
  if (account.planStatus === 'inactive') return 'Nenhuma liberação Pro ativa foi encontrada para a conta/e-mail usado.';
  return 'Free ativo. Assine Pro para liberar modelos profissionais, limites maiores e recursos de lucro real.';
}
