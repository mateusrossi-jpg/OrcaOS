import { type AferixAccountState, type AferixPlanSource, type AferixPlanStatus } from './accountPlanStorage';
import type { UserPlan } from './featureAccess';
import { accountPlanService } from '../../services/accountPlanService';

export interface PlanEntitlementResponse {
  plan?: UserPlan;
  planSource?: AferixPlanSource;
  status?: 'active' | 'inactive' | 'trial' | 'past_due' | 'expired' | 'canceled';
  expiresAt?: string | null;
}

export interface PlanEntitlementResult {
  account: AferixAccountState;
  status: AferixPlanStatus;
  expiresAt: string | null;
}

function getEntitlementsEndpoint(): string {
  return import.meta.env.VITE_AFERIX_ENTITLEMENTS_ENDPOINT ?? '';
}

function getEntitlementsApiKey(): string {
  return import.meta.env.VITE_AFERIX_ENTITLEMENTS_API_KEY ?? '';
}

export function isPlanEntitlementSyncConfigured(): boolean {
  return getEntitlementsEndpoint().trim().length > 0;
}

function normalizePlan(value: unknown): UserPlan {
  return value === 'pro' ? 'pro' : 'free';
}

function normalizePlanSource(value: unknown, plan: UserPlan): AferixPlanSource {
  if (value === 'subscription') return 'subscription';
  if (value === 'local-test') return 'local-test';
  return plan === 'pro' ? 'subscription' : 'free';
}

function normalizeStatus(value: unknown, plan: UserPlan): AferixPlanStatus {
  if (value === 'active' || value === 'trial' || value === 'past_due' || value === 'inactive' || value === 'expired') {
    return value;
  }
  if (value === 'canceled') return 'inactive';
  return plan === 'pro' ? 'active' : 'inactive';
}

function resolveEffectivePlan(plan: UserPlan, status: AferixPlanStatus): UserPlan {
  return plan === 'pro' && (status === 'active' || status === 'trial') ? 'pro' : 'free';
}

export async function applyPlanEntitlementResponse(account: AferixAccountState, entitlement: PlanEntitlementResponse): Promise<PlanEntitlementResult> {
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
  await accountPlanService.saveAccount(nextAccount);

  return {
    account: nextAccount,
    status: nextAccount.planStatus,
    expiresAt,
  };
}

export async function refreshPlanEntitlement(account?: AferixAccountState): Promise<PlanEntitlementResult> {
  const resolvedAccount = account || await accountPlanService.getAccount();
  const endpoint = getEntitlementsEndpoint().trim();
  if (!endpoint) throw new Error('Configure VITE_AFERIX_ENTITLEMENTS_ENDPOINT para verificar a liberação Pro.');
  if (!resolvedAccount.userId) throw new Error('Entre com uma conta antes de verificar a liberação Pro.');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = getEntitlementsApiKey().trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: resolvedAccount.userId,
      installationId: resolvedAccount.installationId,
      email: resolvedAccount.email,
      status: resolvedAccount.status,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Falha ao verificar a liberação Pro: ${response.status}`);
  }

  return applyPlanEntitlementResponse(resolvedAccount, await response.json() as PlanEntitlementResponse);
}
