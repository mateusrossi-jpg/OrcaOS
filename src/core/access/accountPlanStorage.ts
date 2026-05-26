import type { UserPlan } from './featureAccess';

export type AferixAccountStatus = 'guest' | 'email' | 'local' | 'google';
export type AferixPlanSource = 'free' | 'local-test' | 'subscription';
export type AferixPlanStatus = 'free' | 'active' | 'trial' | 'expired' | 'inactive' | 'past_due';

export interface GoogleAccountProfile {
  sub: string;
  name?: string;
  email?: string;
}

export interface AferixAccountState {
  status: AferixAccountStatus;
  userId: string | null;
  installationId: string;
  displayName: string;
  email: string;
  plan: UserPlan;
  planSource: AferixPlanSource;
  planStatus: AferixPlanStatus;
  planExpiresAt: string | null;
  updatedAt: string;
}

export const AFERIX_ACCOUNT_CHANGED_EVENT = 'aferix:account-plan-changed';

export function createGuestAccount(plan: UserPlan = 'free', planSource: AferixPlanSource = plan === 'pro' ? 'local-test' : 'free'): AferixAccountState {
  return {
    status: 'guest',
    userId: null,
    installationId: `install-${Date.now()}`,
    displayName: 'Visitante',
    email: '',
    plan,
    planSource,
    planStatus: plan === 'pro' ? 'active' : 'free',
    planExpiresAt: null,
    updatedAt: new Date().toISOString(),
  };
}

// LEGACY Migration Helper ONLY
export function legacyLoadAccountState(): AferixAccountState {
  const STORAGE_KEY = 'aferix:account-plan:v1';
  const LEGACY_PLAN_KEY = 'orcaos:user-plan';
  
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return createGuestAccount();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const value = JSON.parse(stored) as Partial<AferixAccountState>;
      const plan = value.plan === 'pro' ? 'pro' : 'free';
      return {
        status: value.status === 'google' ? 'google' : value.status === 'email' ? 'email' : value.status === 'local' ? 'local' : 'guest',
        userId: value.userId ?? null,
        installationId: value.installationId?.trim() || `install-${Date.now()}`,
        displayName: value.displayName?.trim() || 'Visitante',
        email: value.email || '',
        plan,
        planSource: value.planSource === 'subscription' ? 'subscription' : value.planSource === 'local-test' ? 'local-test' : plan === 'pro' ? 'local-test' : 'free',
        planStatus: value.planStatus as AferixPlanStatus || (plan === 'pro' ? 'active' : 'free'),
        planExpiresAt: typeof value.planExpiresAt === 'string' ? value.planExpiresAt : null,
        updatedAt: value.updatedAt || new Date().toISOString(),
      };
    }
  } catch {
    // Ignore error
  }

  const legacyPlan = window.localStorage.getItem(LEGACY_PLAN_KEY);
  return createGuestAccount(legacyPlan === 'pro' ? 'pro' : 'free');
}
