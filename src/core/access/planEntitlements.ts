import { loadAccountState, saveAccountState, type AferixAccountState, type OrcaPlanSource, type OrcaPlanStatus } from './accountPlanStorage';
import type { UserPlan } from './featureAccess';

export interface PlanEntitlementResponse {
  plan?: UserPlan;
  planSource?: OrcaPlanSource;
  status?: 'active' | 'inactive' | 'trial' | 'past_due' | 'expired' | 'canceled';
  expiresAt?: string | null;
}

export interface PlanEntitlementResult {
  account: AferixAccountState;
  status: OrcaPlanStatus;
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

function normalizeStatus(value: unknown, plan: UserPlan): OrcaPlanStatus {
  if (value === 'active' || value === 'trial' || value === 'past_due' || value === 'inactive' || value === 'expired') {
    return value;
  }
  if (value === 'canceled') return 'inactive';
  return plan === 'pro' ? 'active' : 'inactive';
}

function resolveEffectivePlan(plan: UserPlan, status: OrcaPlanStatus): UserPlan {
  return plan === 'pro' && (status === 'active' || status === 'trial') ? 'pro' : 'free';
}

export function applyPlanEntitlementResponse(account: AferixAccountState, entitlement: PlanEntitlementResponse): PlanEntitlementResult {
  const requestedPlan = normalizePlan(entitlement.plan);
  const status = normalizeStatus(entitlement.status, requestedPlan);
  const plan = resolveEffectivePlan(requestedPlan, status);
  const expiresAt = entitlement.expiresAt ?? null;
  const nextAccount: AferixAccountState = {
    ...account,
    plan,
    planSource: normalizePlanSource(entitlement.planSource, plan),
    planStatus: plan === 'free' && status === 'active' ? 'inactive' : status,
    planExpiresAt: expiresAt,
    updatedAt: new Date().toISOString(),
  };
  saveAccountState(nextAccount);

  return {
    account: nextAccount,
    status: nextAccount.planStatus,
    expiresAt,
  };
}

export async function refreshPlanEntitlement(account = loadAccountState()): Promise<PlanEntitlementResult> {
  const endpoint = getEntitlementsEndpoint().trim();
  if (!endpoint) throw new Error('Configure VITE_ORCAOS_ENTITLEMENTS_ENDPOINT para verificar a liberação Pro.');
  if (!account.userId) throw new Error('Entre com uma conta antes de verificar a liberação Pro.');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = getEntitlementsApiKey().trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: account.userId,
      installationId: account.installationId,
      email: account.email,
      status: account.status,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Não foi possível verificar a liberação Pro: ${response.status}`);
  }

  return applyPlanEntitlementResponse(account, await response.json() as PlanEntitlementResponse);
}
