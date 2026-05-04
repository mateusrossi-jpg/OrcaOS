import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBillingReadiness } from './billingReadiness';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('billing readiness', () => {
  it('defaults to beta assisted mode without real charging', () => {
    const readiness = getBillingReadiness();

    expect(readiness.channel).toBe('beta-assisted');
    expect(readiness.isGooglePlayReady).toBe(false);
    expect(readiness.statusTitle).toBe('Beta sem cobrança real');
  });

  it('marks external checkout ready only with checkout and entitlement endpoint', () => {
    vi.stubEnv('VITE_ORCAOS_BILLING_CHANNEL', 'external-checkout');
    vi.stubEnv('VITE_ORCAOS_PRO_CHECKOUT_URL', 'https://checkout.example.com/pro');
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');

    const readiness = getBillingReadiness();

    expect(readiness.channel).toBe('external-checkout');
    expect(readiness.isExternalCheckoutReady).toBe(true);
    expect(readiness.entitlementEndpointConfigured).toBe(true);
  });

  it('marks Google Play ready only when package, product and entitlement endpoint are configured', () => {
    vi.stubEnv('VITE_ORCAOS_BILLING_CHANNEL', 'google-play');
    vi.stubEnv('VITE_ORCAOS_ANDROID_PACKAGE_NAME', 'com.orcaos.app');
    vi.stubEnv('VITE_ORCAOS_PLAY_PRO_PRODUCT_ID', 'orcaos_pro_monthly');
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');

    const readiness = getBillingReadiness();

    expect(readiness.channel).toBe('google-play');
    expect(readiness.isGooglePlayReady).toBe(true);
    expect(readiness.packageName).toBe('com.orcaos.app');
    expect(readiness.proProductId).toBe('orcaos_pro_monthly');
  });
});
