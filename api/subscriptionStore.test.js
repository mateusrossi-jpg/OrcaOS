import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveEntitlement, upsertSubscription } from './subscriptionStore.js';

const supabaseEnv = {
  ORCAOS_SUPABASE_URL: 'https://orcaos.supabase.co',
  ORCAOS_SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('subscription store', () => {
  it('resolves pro from an active Supabase subscription row', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          {
            email: 'cliente@example.com',
            user_id: 'google:123',
            plan: 'pro',
            status: 'active',
            current_period_end: '2099-01-01T00:00:00.000Z',
            provider: 'manual',
            updated_at: '2026-05-02T00:00:00.000Z',
          },
        ],
      })),
    );

    const result = await resolveEntitlement({ email: 'cliente@example.com' }, supabaseEnv);

    expect(result).toEqual({
      plan: 'pro',
      planSource: 'subscription',
      status: 'active',
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
  });

  it('keeps expired Supabase subscriptions as free', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          {
            email: 'cliente@example.com',
            plan: 'pro',
            status: 'active',
            current_period_end: '2020-01-01T00:00:00.000Z',
          },
        ],
      })),
    );

    const result = await resolveEntitlement({ email: 'cliente@example.com' }, supabaseEnv);

    expect(result.plan).toBe('free');
    expect(result.status).toBe('expired');
  });

  it('falls back to the beta allowlist when Supabase is not configured', async () => {
    const result = await resolveEntitlement(
      { email: 'cliente@example.com' },
      { ORCAOS_PRO_USERS: 'cliente@example.com' },
    );

    expect(result.plan).toBe('pro');
  });

  it('upserts a normalized subscription through the Supabase REST API', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [{ email: 'cliente@example.com', plan: 'pro', status: 'active' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await upsertSubscription(
      {
        email: ' Cliente@Example.com ',
        userId: 'google:123',
        plan: 'pro',
        status: 'active',
        provider: 'manual',
      },
      supabaseEnv,
    );

    expect(result.email).toBe('cliente@example.com');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://orcaos.supabase.co/rest/v1/orcaos_subscriptions?on_conflict=email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'service-role-key',
          Authorization: 'Bearer service-role-key',
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: expect.stringContaining('"email":"cliente@example.com"'),
      }),
    );
  });
});
