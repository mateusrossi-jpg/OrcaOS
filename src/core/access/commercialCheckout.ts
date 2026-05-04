import type { OrcaAccountState } from './accountPlanStorage';

function checkoutUrl(): string {
  return import.meta.env.VITE_ORCAOS_PRO_CHECKOUT_URL ?? '';
}

function manageUrl(): string {
  return import.meta.env.VITE_ORCAOS_PRO_MANAGE_URL ?? '';
}

function appendAccountParams(baseUrl: string, account: OrcaAccountState): string {
  const url = new URL(baseUrl);
  if (account.email) url.searchParams.set('email', account.email);
  if (account.userId) url.searchParams.set('userId', account.userId);
  if (account.installationId) url.searchParams.set('installationId', account.installationId);
  url.searchParams.set('source', 'orcaos-app');
  return url.toString();
}

export function isProCheckoutConfigured(): boolean {
  return checkoutUrl().trim().length > 0;
}

export function isProManageConfigured(): boolean {
  return manageUrl().trim().length > 0;
}

export function buildProCheckoutUrl(account: OrcaAccountState): string {
  const configuredUrl = checkoutUrl().trim();
  if (!configuredUrl) throw new Error('Configure VITE_ORCAOS_PRO_CHECKOUT_URL para vender o Pro.');
  return appendAccountParams(configuredUrl, account);
}

export function buildProManageUrl(account: OrcaAccountState): string {
  const configuredUrl = manageUrl().trim();
  if (!configuredUrl) throw new Error('Configure VITE_ORCAOS_PRO_MANAGE_URL para gerenciar assinatura.');
  return appendAccountParams(configuredUrl, account);
}
