import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildProCheckoutUrl, isProCheckoutConfigured } from './commercialCheckout';
import type { AferixAccountState } from './accountPlanStorage';

const account: AferixAccountState = {
  status: 'email',
  userId: 'email:cliente@example.com',
  installationId: 'install-test-device',
  displayName: 'Cliente',
  email: 'cliente@example.com',
  plan: 'free',
  planSource: 'free',
  planStatus: 'free',
  planExpiresAt: null,
  updatedAt: '2026-05-03T00:00:00.000Z',
};

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('commercial checkout', () => {
  it('detects configured checkout URL', () => {
    vi.stubEnv('VITE_ORCAOS_PRO_CHECKOUT_URL', 'https://checkout.example.com/pro');

    expect(isProCheckoutConfigured()).toBe(true);
  });

  it('builds checkout URL with account context but no secrets', () => {
    vi.stubEnv('VITE_ORCAOS_PRO_CHECKOUT_URL', 'https://checkout.example.com/pro?plan=pro');

    const url = new URL(buildProCheckoutUrl(account));

    expect(url.origin).toBe('https://checkout.example.com');
    expect(url.searchParams.get('plan')).toBe('pro');
    expect(url.searchParams.get('email')).toBe('cliente@example.com');
    expect(url.searchParams.get('userId')).toBe('email:cliente@example.com');
    expect(url.searchParams.get('installationId')).toBe('install-test-device');
    expect(url.searchParams.get('source')).toBe('orcaos-app');
  });
});
