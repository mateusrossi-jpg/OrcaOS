import { loadAccountState, saveAccountState, type OrcaAccountState, type OrcaPlanSource } from './accountPlanStorage';
import type { UserPlan } from './featureAccess';

export interface PlanEntitlementResponse {
  plan?: UserPlan;
  planSource?: OrcaPlanSource;
  status?: 'active' | 'inactive' | 'trial' | 'past_due' | 'expired';
  expiresAt?: string | null;
}

export interface PlanEntitlementResult {
  account: OrcaAccountState;
  status: NonNullable<PlanEntitlementResponse['status']>;
  expiresAt: string | null;
}

function getEntitlementsEndpoint(): string {
  return import.meta.env.VITE_ORCAOS_ENTITLEMENTS_ENDPOINT ?? '';
}

function getEntitlementsApiKey(): string {
  return import.meta.env.VITE_ORCAOS_ENTITLEMENTS_API_KEY ?? '';
}

export function isPlanEntitlementSyncConfigured(): boolean {
  return getEntitlementsEndpoint().trim().length > 0;
}

function normalizePlan(value: unknown): UserPlan {
  return value === 'pro' ? 'pro' : 'free';
}

function normalizePlanSource(value: unknown, plan: UserPlan): OrcaPlanSource {
  if (value === 'subscription') return 'subscription';
  if (value === 'local-test') return 'local-test';
  return plan === 'pro' ? 'subscription' : 'free';
}

function normalizeStatus(value: unknown, plan: UserPlan): NonNullable<PlanEntitlementResponse['status']> {
  if (value === 'active' || value === 'trial' || value === 'past_due' || value === 'inactive' || value === 'expired') {
    return value;
  }
  return plan === 'pro' ? 'active' : 'inactive';
}

export async function refreshPlanEntitlement(account = loadAccountState()): Promise<PlanEntitlementResult> {
  const endpoint = getEntitlementsEndpoint().trim();
  if (!endpoint) throw new Error('Configure VITE_ORCAOS_ENTITLEMENTS_ENDPOINT para verificar assinatura.');
  if (!account.userId) throw new Error('Entre com uma conta antes de verificar assinatura.');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = getEntitlementsApiKey().trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: account.userId,
      email: account.email,
      status: account.status,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Não foi possível verificar assinatura: ${response.status}`);
  }

  const entitlement = await response.json() as PlanEntitlementResponse;
  const plan = normalizePlan(entitlement.plan);
  const nextAccount: OrcaAccountState = {
    ...account,
    plan,
    planSource: normalizePlanSource(entitlement.planSource, plan),
    updatedAt: new Date().toISOString(),
  };
  saveAccountState(nextAccount);

  return {
    account: nextAccount,
    status: normalizeStatus(entitlement.status, plan),
    expiresAt: entitlement.expiresAt ?? null,
  };
}
