import type { UserPlan } from './featureAccess';

export type OrcaAccountStatus = 'guest' | 'email' | 'local' | 'google';
export type OrcaPlanSource = 'free' | 'local-test' | 'subscription';
export type OrcaPlanStatus = 'free' | 'active' | 'trial' | 'expired' | 'inactive' | 'past_due';

export interface GoogleAccountProfile {
  sub: string;
  name?: string;
  email?: string;
}

export interface OrcaAccountState {
  status: OrcaAccountStatus;
  userId: string | null;
  installationId: string;
  displayName: string;
  email: string;
  plan: UserPlan;
  planSource: OrcaPlanSource;
  planStatus: OrcaPlanStatus;
  planExpiresAt: string | null;
  updatedAt: string;
}

export const ORCA_ACCOUNT_CHANGED_EVENT = 'orcaos:account-plan-changed';

const STORAGE_KEY = 'orcaos:account-plan:v1';
const LEGACY_PLAN_KEY = 'orcaos:user-plan';
const INSTALLATION_ID_KEY = 'orcaos:installation-id:v1';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function now(): string {
  return new Date().toISOString();
}

function createStableId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000000)}`;
}

function getOrCreateInstallationId(): string {
  if (!hasStorage()) return createStableId('install');

  const storedId = window.localStorage.getItem(INSTALLATION_ID_KEY);
  if (storedId?.trim()) return storedId;

  const installationId = createStableId('install');
  window.localStorage.setItem(INSTALLATION_ID_KEY, installationId);
  return installationId;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function emitChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ORCA_ACCOUNT_CHANGED_EVENT));
}

export function createGuestAccount(plan: UserPlan = 'free', planSource: OrcaPlanSource = plan === 'pro' ? 'local-test' : 'free'): OrcaAccountState {
  return {
    status: 'guest',
    userId: null,
    installationId: getOrCreateInstallationId(),
    displayName: 'Visitante',
    email: '',
    plan,
    planSource,
    planStatus: plan === 'pro' ? 'active' : 'free',
    planExpiresAt: null,
    updatedAt: now(),
  };
}

function normalizePlanStatus(value: unknown, plan: UserPlan): OrcaPlanStatus {
  if (value === 'active' || value === 'trial' || value === 'expired' || value === 'inactive' || value === 'past_due') return value;
  return plan === 'pro' ? 'active' : 'free';
}

function normalizeAccount(value: Partial<OrcaAccountState> | null): OrcaAccountState | null {
  if (!value) return null;
  const plan: UserPlan = value.plan === 'pro' ? 'pro' : 'free';
  return {
    status: value.status === 'google' ? 'google' : value.status === 'email' ? 'email' : value.status === 'local' ? 'local' : 'guest',
    userId: value.userId ?? null,
    installationId: value.installationId?.trim() || getOrCreateInstallationId(),
    displayName: value.displayName?.trim() || (value.status === 'google' ? 'Conta Google' : value.status === 'email' ? 'Conta por e-mail' : value.status === 'local' ? 'Profissional local' : 'Visitante'),
    email: value.email ? normalizeEmail(value.email) : '',
    plan,
    planSource: value.planSource === 'subscription' ? 'subscription' : value.planSource === 'local-test' ? 'local-test' : plan === 'pro' ? 'local-test' : 'free',
    planStatus: normalizePlanStatus(value.planStatus, plan),
    planExpiresAt: typeof value.planExpiresAt === 'string' ? value.planExpiresAt : null,
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
  const installationId = account.installationId || getOrCreateInstallationId();
  window.localStorage.setItem(INSTALLATION_ID_KEY, installationId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...account, installationId }));
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
    userId: current.userId ?? createStableId('local'),
    installationId: current.installationId || getOrCreateInstallationId(),
    displayName: displayName.trim() || 'Profissional local',
    email: email.trim(),
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}

export function signInEmailAccount(email: string, displayName = ''): OrcaAccountState {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) throw new Error('Informe um e-mail válido para cadastrar a conta.');

  const current = loadAccountState();
  const next: OrcaAccountState = {
    ...current,
    status: 'email',
    userId: `email:${normalizedEmail}`,
    installationId: current.installationId || getOrCreateInstallationId(),
    displayName: displayName.trim() || normalizedEmail,
    email: normalizedEmail,
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}

export function signInGoogleAccount(profile: GoogleAccountProfile): OrcaAccountState {
  const current = loadAccountState();
  const googleEmail = profile.email ? normalizeEmail(profile.email) : '';
  const sameRegisteredEmail = Boolean(current.email && googleEmail && current.email === googleEmail);
  const next: OrcaAccountState = {
    ...current,
    status: 'google',
    userId: `google:${profile.sub}`,
    installationId: current.installationId || getOrCreateInstallationId(),
    displayName: profile.name?.trim() || (sameRegisteredEmail ? current.displayName : googleEmail) || 'Conta Google',
    email: googleEmail || current.email,
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}

export function signOutLocalAccount(): OrcaAccountState {
  const current = loadAccountState();
  const next = { ...createGuestAccount('free', 'free'), installationId: current.installationId || getOrCreateInstallationId() };
  saveAccountState(next);
  return next;
}

export function setLocalUserPlan(plan: UserPlan): OrcaAccountState {
  const current = loadAccountState();
  const next: OrcaAccountState = {
    ...current,
    plan,
    planSource: plan === 'pro' ? 'local-test' : 'free',
    planStatus: plan === 'pro' ? 'active' : 'free',
    planExpiresAt: null,
    updatedAt: now(),
  };
  saveAccountState(next);
  return next;
}
