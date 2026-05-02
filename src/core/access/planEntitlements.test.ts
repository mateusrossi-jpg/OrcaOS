import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../test/createMemoryStorage';
import { signInGoogleAccount } from './accountPlanStorage';
import { isPlanEntitlementSyncConfigured, refreshPlanEntitlement } from './planEntitlements';

function jsonResponse(value: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(value),
    text: () => Promise.resolve(typeof value === 'string' ? value : JSON.stringify(value)),
  } as Response;
}

describe('plan entitlements', () => {
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
    vi.unstubAllEnvs();
  });

  it('reports whether entitlement sync is configured', () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', '');
    expect(isPlanEntitlementSyncConfigured()).toBe(false);

    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    expect(isPlanEntitlementSyncConfigured()).toBe(true);
  });

  it('requires an endpoint and an account', async () => {
    await expect(refreshPlanEntitlement()).rejects.toThrow('ENTITLEMENTS_ENDPOINT');

    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    await expect(refreshPlanEntitlement()).rejects.toThrow('Entre com uma conta');
  });

  it('updates the account plan from an entitlement response', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_API_KEY', 'secret');
    const account = signInGoogleAccount({ sub: '123', name: 'Mateus', email: 'mateus@example.com' });
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ plan: 'pro', status: 'active', planSource: 'subscription', expiresAt: '2026-06-01T00:00:00.000Z' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await refreshPlanEntitlement(account);

    expect(result.account.plan).toBe('pro');
    expect(result.account.planSource).toBe('subscription');
    expect(result.account.planStatus).toBe('active');
    expect(result.account.planExpiresAt).toBe('2026-06-01T00:00:00.000Z');
    expect(result.status).toBe('active');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/entitlements',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
      }),
    );
  });

  it('preserves expired subscription status from the entitlement endpoint', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const account = signInGoogleAccount({ sub: '123', name: 'Mateus', email: 'mateus@example.com' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ plan: 'free', status: 'expired', expiresAt: '2026-01-01T00:00:00.000Z' })));

    const result = await refreshPlanEntitlement(account);

    expect(result.account.plan).toBe('free');
    expect(result.account.planStatus).toBe('expired');
    expect(result.status).toBe('expired');
    expect(result.expiresAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('allows trial subscriptions as Pro', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const account = signInGoogleAccount({ sub: '123', email: 'mateus@example.com' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ plan: 'pro', status: 'trial', planSource: 'subscription' })));

    const result = await refreshPlanEntitlement(account);

    expect(result.account.plan).toBe('pro');
    expect(result.account.planStatus).toBe('trial');
  });

  it('does not release Pro when subscription is past due', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const account = signInGoogleAccount({ sub: '123', email: 'mateus@example.com' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ plan: 'pro', status: 'past_due', planSource: 'subscription' })));

    const result = await refreshPlanEntitlement(account);

    expect(result.account.plan).toBe('free');
    expect(result.account.planStatus).toBe('past_due');
  });

  it('keeps inactive subscription users on free plan', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const account = signInGoogleAccount({ sub: '123', email: 'mateus@example.com' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ plan: 'pro', status: 'inactive', planSource: 'subscription' })));

    const result = await refreshPlanEntitlement(account);

    expect(result.account.plan).toBe('free');
    expect(result.account.planStatus).toBe('inactive');
  });

  it('fails clearly when the entitlement endpoint rejects the request', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const account = signInGoogleAccount({ sub: '123' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse('not allowed', false, 403)));

    await expect(refreshPlanEntitlement(account)).rejects.toThrow('not allowed');
  });
});
