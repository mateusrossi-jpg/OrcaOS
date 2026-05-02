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
    expect(result.status).toBe('active');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/entitlements',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
      }),
    );
  });

  it('fails clearly when the entitlement endpoint rejects the request', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const account = signInGoogleAccount({ sub: '123' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse('not allowed', false, 403)));

    await expect(refreshPlanEntitlement(account)).rejects.toThrow('not allowed');
  });
});
