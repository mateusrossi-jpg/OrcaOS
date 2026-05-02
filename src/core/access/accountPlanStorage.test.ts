import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../test/createMemoryStorage';
import {
  loadAccountState,
  resolveUserPlan,
  setLocalUserPlan,
  signInEmailAccount,
  signInGoogleAccount,
  signInLocalAccount,
  signOutLocalAccount,
} from './accountPlanStorage';

describe('account plan storage', () => {
  beforeEach(() => {
    vi.stubGlobal('CustomEvent', class {
      type: string;

      constructor(type: string) {
        this.type = type;
      }
    });
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('starts as a free guest account', () => {
    const account = loadAccountState();

    expect(account.status).toBe('guest');
    expect(account.plan).toBe('free');
    expect(account.planStatus).toBe('free');
    expect(resolveUserPlan()).toBe('free');
  });

  it('creates a local account without changing the current plan', () => {
    const account = signInLocalAccount('Mateus', 'mateus@example.com');

    expect(account.status).toBe('local');
    expect(account.displayName).toBe('Mateus');
    expect(account.email).toBe('mateus@example.com');
    expect(account.plan).toBe('free');
  });

  it('registers an account with email', () => {
    const account = signInEmailAccount('Mateus@Example.com', 'Mateus');

    expect(account.status).toBe('email');
    expect(account.userId).toBe('email:mateus@example.com');
    expect(account.email).toBe('mateus@example.com');
    expect(account.displayName).toBe('Mateus');
  });

  it('rejects invalid email registration', () => {
    expect(() => signInEmailAccount('mateus')).toThrow('e-mail válido');
  });

  it('stores a Google account without changing the current plan', () => {
    const account = signInGoogleAccount({ sub: '123', name: 'Mateus Rossi', email: 'mateus@example.com' });

    expect(account.status).toBe('google');
    expect(account.userId).toBe('google:123');
    expect(account.displayName).toBe('Mateus Rossi');
    expect(account.email).toBe('mateus@example.com');
    expect(account.plan).toBe('free');
  });

  it('links Google identity to the registered email when they match', () => {
    signInEmailAccount('mateus@example.com', 'Mateus');

    const account = signInGoogleAccount({ sub: '123', name: 'Mateus Google', email: 'mateus@example.com' });

    expect(account.status).toBe('google');
    expect(account.userId).toBe('google:123');
    expect(account.email).toBe('mateus@example.com');
    expect(account.displayName).toBe('Mateus Google');
  });

  it('can switch the local test plan to pro and back to free', () => {
    setLocalUserPlan('pro');

    expect(resolveUserPlan()).toBe('pro');
    expect(loadAccountState().planSource).toBe('local-test');
    expect(loadAccountState().planStatus).toBe('active');

    setLocalUserPlan('free');

    expect(resolveUserPlan()).toBe('free');
    expect(loadAccountState().planSource).toBe('free');
    expect(loadAccountState().planStatus).toBe('free');
  });

  it('migrates the previous user plan override', () => {
    window.localStorage.setItem('orcaos:user-plan', 'pro');

    expect(loadAccountState().plan).toBe('pro');
    expect(loadAccountState().planStatus).toBe('active');
  });

  it('signs out to a free guest account', () => {
    signInLocalAccount();
    setLocalUserPlan('pro');

    const account = signOutLocalAccount();

    expect(account.status).toBe('guest');
    expect(account.plan).toBe('free');
  });
});
