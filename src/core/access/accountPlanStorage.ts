import type { UserPlan } from './featureAccess';

export type OrcaAccountStatus = 'guest' | 'local' | 'google';
export type OrcaPlanSource = 'free' | 'local-test' | 'subscription';

export interface GoogleAccountProfile {
  sub: string;
  name?: string;
  email?: string;
}

export interface OrcaAccountState {
  status: OrcaAccountStatus;
  userId: string | null;
  displayName: string;
  email: string;
  plan: UserPlan;
  planSource: OrcaPlanSource;
  updatedAt: string;
}

export const ORCA_ACCOUNT_CHANGED_EVENT = 'orcaos:account-plan-changed';

const STORAGE_KEY = 'orcaos:account-plan:v1';
const LEGACY_PLAN_KEY = 'orcaos:user-plan';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function now(): string {
  return new Date().toISOString();
}

function createLocalUserId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function emitChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ORCA_ACCOUNT_CHANGED_EVENT));
}

export function createGuestAccount(plan: UserPlan = 'free', planSource: OrcaPlanSource = plan === 'pro' ? 'local-test' : 'free'): OrcaAccountState {
  return {
    status: 'guest',
    userId: null,
    displayName: 'Visitante',
    email: '',
    plan,
    planSource,
    updatedAt: now(),
  };
}

function normalizeAccount(value: Partial<OrcaAccountState> | null): OrcaAccountState | null {
  if (!value) return null;
  const plan: UserPlan = value.plan === 'pro' ? 'pro' : 'free';
  return {
    status: value.status === 'google' ? 'google' : value.status === 'local' ? 'local' : 'guest',
    userId: value.userId ?? null,
    displayName: value.displayName?.trim() || (value.status === 'google' ? 'Conta Google' : value.status === 'local' ? 'Profissional local' : 'Visitante'),
    email: value.email?.trim() || '',
    plan,
    planSource: value.planSource === 'subscription' ? 'subscription' : value.planSource === 'local-test' ? 'local-test' : plan === 'pro' ? 'local-test' : 'free',
    updatedAt: value.updatedAt || now(),
  };
}

export function loadAccountState(): OrcaAccountState {
  if (!hasStorage()) return createGuestAccount();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? normalizeAccount(JSON.parse(stored) as Partial<OrcaAccountState>) : null;
    if (parsed) return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const legacyPlan = window.localStorage.getItem(LEGACY_PLAN_KEY);
  return createGuestAccount(legacyPlan === 'pro' ? 'pro' : 'free');
}

export function saveAccountState(account: OrcaAccountState): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  window.localStorage.setItem(LEGACY_PLAN_KEY, account.plan);
  emitChanged();
}

export function resolveUserPlan(defaultPlan: UserPlan = 'free'): UserPlan {
  const account = loadAccountState();
  return account.plan ?? defaultPlan;
}

export function signInLocalAccount(displayName = 'Profissional local', email = ''): OrcaAccountState {
  const current = loadAccountState();
  const next: OrcaAccountState = {
    ...current,
    status: 'local',
    userId: current.userId ?? createLocalUserId(),
    displayName: displayName.trim() || 'Profissional local',
    email: email.trim(),
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}

export function signInGoogleAccount(profile: GoogleAccountProfile): OrcaAccountState {
  const current = loadAccountState();
  const next: OrcaAccountState = {
    ...current,
    status: 'google',
    userId: `google:${profile.sub}`,
    displayName: profile.name?.trim() || profile.email?.trim() || 'Conta Google',
    email: profile.email?.trim() || '',
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}

export function signOutLocalAccount(): OrcaAccountState {
  const next = createGuestAccount('free', 'free');
  saveAccountState(next);
  return next;
}

export function setLocalUserPlan(plan: UserPlan): OrcaAccountState {
  const current = loadAccountState();
  const next: OrcaAccountState = {
    ...current,
    plan,
    planSource: plan === 'pro' ? 'local-test' : 'free',
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}
