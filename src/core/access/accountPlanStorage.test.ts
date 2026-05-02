import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../test/createMemoryStorage';
import {
  loadAccountState,
  resolveUserPlan,
  setLocalUserPlan,
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
    expect(resolveUserPlan()).toBe('free');
  });

  it('creates a local account without changing the current plan', () => {
    const account = signInLocalAccount('Mateus', 'mateus@example.com');

    expect(account.status).toBe('local');
    expect(account.displayName).toBe('Mateus');
    expect(account.email).toBe('mateus@example.com');
    expect(account.plan).toBe('free');
  });

  it('stores a Google account without changing the current plan', () => {
    const account = signInGoogleAccount({ sub: '123', name: 'Mateus Rossi', email: 'mateus@example.com' });

    expect(account.status).toBe('google');
    expect(account.userId).toBe('google:123');
    expect(account.displayName).toBe('Mateus Rossi');
    expect(account.email).toBe('mateus@example.com');
    expect(account.plan).toBe('free');
  });

  it('can switch the local test plan to pro and back to free', () => {
    setLocalUserPlan('pro');

    expect(resolveUserPlan()).toBe('pro');
    expect(loadAccountState().planSource).toBe('local-test');

    setLocalUserPlan('free');

    expect(resolveUserPlan()).toBe('free');
    expect(loadAccountState().planSource).toBe('free');
  });

  it('migrates the previous user plan override', () => {
    window.localStorage.setItem('orcaos:user-plan', 'pro');

    expect(loadAccountState().plan).toBe('pro');
  });

  it('signs out to a free guest account', () => {
    signInLocalAccount();
    setLocalUserPlan('pro');

    const account = signOutLocalAccount();

    expect(account.status).toBe('guest');
    expect(account.plan).toBe('free');
  });
});
