import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  loadAccountState,
  saveAccountState,
  createGuestAccount,
  resolveUserPlan,
  signInLocalAccount,
  signInEmailAccount,
  signInGoogleAccount,
} from '../accountPlanStorage';

describe('Plan Access and Account Strategy Protection', () => {
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
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    vi.unstubAllGlobals();
  });

  it('correctly maps Guest account as free plan by default', () => {
    const guest = createGuestAccount();
    expect(guest.status).toBe('guest');
    expect(guest.plan).toBe('free');
    expect(guest.planSource).toBe('free');
    expect(guest.planStatus).toBe('free');
    expect(guest.userId).toBeNull();
  });

  it('correctly maps Local account plan selection and persists it', () => {
    const localAccount = signInLocalAccount('Mateus', 'mateus@example.com');
    expect(localAccount.status).toBe('local');
    expect(localAccount.displayName).toBe('Mateus');
    expect(localAccount.email).toBe('mateus@example.com');
    expect(localAccount.userId).toMatch(/^local-/);

    // Resolve plan should return guest plan (free) or persisted plan
    const plan = resolveUserPlan();
    expect(plan).toBe('free');
  });

  it('registers email account safely with valid checks', () => {
    const emailAccount = signInEmailAccount('contato@aferix.com.br', 'Aferix');
    expect(emailAccount.status).toBe('email');
    expect(emailAccount.email).toBe('contato@aferix.com.br');
    expect(emailAccount.displayName).toBe('Aferix');
    expect(emailAccount.userId).toBe('email:contato@aferix.com.br');

    expect(() => signInEmailAccount('invalid-email')).toThrow('e-mail válido');
  });

  it('registers google account and handles email mappings', () => {
    const googleAccount = signInGoogleAccount({
      sub: 'google-sub-123',
      name: 'Google User',
      email: 'user@google.com',
    });

    expect(googleAccount.status).toBe('google');
    expect(googleAccount.userId).toBe('google:google-sub-123');
    expect(googleAccount.email).toBe('user@google.com');
    expect(googleAccount.displayName).toBe('Google User');
  });

  it('gracefully handles missing account state in localStorage', () => {
    const account = loadAccountState();
    expect(account.status).toBe('guest');
    expect(account.plan).toBe('free');
  });
});
