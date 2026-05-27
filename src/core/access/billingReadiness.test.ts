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
    expect(readiness.statusTitle).toBe('Licença Gratuita (Beta)');
  });

  it('marks external checkout ready only with checkout and entitlement endpoint', () => {
    vi.stubEnv('VITE_AFERIX_BILLING_CHANNEL', 'external-checkout');
    vi.stubEnv('VITE_AFERIX_PRO_CHECKOUT_URL', 'https://checkout.example.com/pro');
    vi.stubEnv('VITE_AFERIX_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');

    const readiness = getBillingReadiness();

    expect(readiness.channel).toBe('external-checkout');
    expect(readiness.isExternalCheckoutReady).toBe(true);
    expect(readiness.entitlementEndpointConfigured).toBe(true);
  });

  it('marks Google Play ready only when package, product and entitlement endpoint are configured', () => {
    vi.stubEnv('VITE_AFERIX_BILLING_CHANNEL', 'google-play');
    vi.stubEnv('VITE_AFERIX_ANDROID_PACKAGE_NAME', 'com.financial.aferix');
    vi.stubEnv('VITE_AFERIX_PLAY_PRO_PRODUCT_ID', 'aferix_pro_monthly');
    vi.stubEnv('VITE_AFERIX_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');

    const readiness = getBillingReadiness();

    expect(readiness.channel).toBe('google-play');
    expect(readiness.isGooglePlayReady).toBe(true);
    expect(readiness.packageName).toBe('com.financial.aferix');
    expect(readiness.proProductId).toBe('aferix_pro_monthly');
  });
});
