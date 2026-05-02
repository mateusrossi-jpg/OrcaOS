import { describe, expect, it } from 'vitest';
import { createEntitlement } from './entitlements.js';

describe('entitlements api contract', () => {
  it('returns pro when the email is in the pro allowlist', () => {
    const result = createEntitlement(
      { userId: 'google:123', email: 'mateus@example.com' },
      { ORCAOS_PRO_USERS: 'mateus@example.com' },
    );

    expect(result).toEqual({
      plan: 'pro',
      planSource: 'subscription',
      status: 'active',
      expiresAt: null,
    });
  });

  it('returns pro when the user id is in the pro allowlist', () => {
    const result = createEntitlement(
      { userId: 'google:123', email: 'mateus@example.com' },
      { ORCAOS_PRO_USERS: 'google:123' },
    );

    expect(result.plan).toBe('pro');
  });

  it('returns free for unknown accounts', () => {
    const result = createEntitlement(
      { userId: 'google:123', email: 'mateus@example.com' },
      { ORCAOS_PRO_USERS: 'cliente@example.com' },
    );

    expect(result.plan).toBe('free');
    expect(result.status).toBe('inactive');
  });
});
