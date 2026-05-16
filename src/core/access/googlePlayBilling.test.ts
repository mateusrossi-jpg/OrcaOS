import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../test/createMemoryStorage';
import type { AferixAccountState } from './accountPlanStorage';
import { getGooglePlayBillingSetup, purchaseGooglePlayPro, restoreGooglePlayPurchases, syncGooglePlayPurchaseEntitlement } from './googlePlayBilling';

const account: AferixAccountState = {
  status: 'google',
  userId: 'google:123',
  installationId: 'install-test',
  displayName: 'Profissional',
  email: 'profissional@example.com',
  plan: 'free',
  planSource: 'free',
  planStatus: 'free',
  planExpiresAt: null,
  updatedAt: '2026-05-03T00:00:00.000Z',
};

function jsonResponse(value: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(value),
    text: () => Promise.resolve(typeof value === 'string' ? value : JSON.stringify(value)),
  } as Response;
}

describe('google play billing bridge contract', () => {
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

  it('exposes setup expected by the native Android bridge', () => {
    vi.stubEnv('VITE_ORCAOS_PLAY_PRO_PRODUCT_ID', 'orcaos_pro_monthly');
    vi.stubEnv('VITE_ORCAOS_ANDROID_PACKAGE_NAME', 'com.orcaos.app');
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');

    expect(getGooglePlayBillingSetup()).toEqual({
      bridgeName: 'AferixGooglePlayBilling',
      productId: 'orcaos_pro_monthly',
      packageName: 'com.orcaos.app',
      entitlementEndpoint: 'https://api.example.com/entitlements',
      bridgeAvailable: false,
    });
  });

  it('asks the native bridge to purchase the configured Pro product', async () => {
    vi.stubEnv('VITE_ORCAOS_PLAY_PRO_PRODUCT_ID', 'orcaos_pro_monthly');
    vi.stubEnv('VITE_ORCAOS_ANDROID_PACKAGE_NAME', 'com.orcaos.app');
    window.AferixGooglePlayBilling = {
      purchase: vi.fn().mockResolvedValue({ platform: 'google-play', productId: 'orcaos_pro_monthly', purchaseToken: 'token-123' }),
      restorePurchases: vi.fn(),
    };

    const purchase = await purchaseGooglePlayPro();

    expect(window.AferixGooglePlayBilling.purchase).toHaveBeenCalledWith('orcaos_pro_monthly');
    expect(purchase.purchaseToken).toBe('token-123');
    expect(purchase.packageName).toBe('com.orcaos.app');
  });

  it('restores only purchases for the configured Pro product', async () => {
    vi.stubEnv('VITE_ORCAOS_PLAY_PRO_PRODUCT_ID', 'orcaos_pro_monthly');
    window.AferixGooglePlayBilling = {
      purchase: vi.fn(),
      restorePurchases: vi.fn().mockResolvedValue([
        { platform: 'google-play', productId: 'other', purchaseToken: 'ignore' },
        { platform: 'google-play', productId: 'orcaos_pro_monthly', purchaseToken: 'restore-token' },
      ]),
    };

    const purchases = await restoreGooglePlayPurchases();

    expect(purchases).toHaveLength(1);
    expect(purchases[0]?.purchaseToken).toBe('restore-token');
    expect(purchases[0]?.state).toBe('restored');
  });

  it('sends purchase token to backend and applies returned entitlement', async () => {
    vi.stubEnv('VITE_ORCAOS_ENTITLEMENTS_ENDPOINT', 'https://api.example.com/entitlements');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ plan: 'pro', status: 'active', planSource: 'subscription' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await syncGooglePlayPurchaseEntitlement(account, {
      platform: 'google-play',
      productId: 'orcaos_pro_monthly',
      purchaseToken: 'purchase-token',
      packageName: 'com.orcaos.app',
      orderId: 'GPA.123',
    });

    expect(result.account.plan).toBe('pro');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/entitlements',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"purchaseToken":"purchase-token"'),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toMatchObject({
      action: 'google-play-purchase',
      channel: 'google-play',
      productId: 'orcaos_pro_monthly',
      orderId: 'GPA.123',
      userId: 'google:123',
      installationId: 'install-test',
    });
  });
});
