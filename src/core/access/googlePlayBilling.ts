import type { OrcaAccountState } from './accountPlanStorage';
import { applyPlanEntitlementResponse, type PlanEntitlementResult, type PlanEntitlementResponse } from './planEntitlements';

export type GooglePlayPurchaseState = 'purchased' | 'pending' | 'canceled' | 'failed' | 'restored';

export interface GooglePlayPurchase {
  platform: 'google-play';
  productId: string;
  purchaseToken: string;
  packageName?: string;
  orderId?: string;
  state?: GooglePlayPurchaseState;
  acknowledged?: boolean;
  purchasedAt?: string;
}

export interface GooglePlayBillingBridge {
  isAvailable?: () => boolean | Promise<boolean>;
  purchase: (productId: string) => Promise<GooglePlayPurchase>;
  restorePurchases: (productIds: string[]) => Promise<GooglePlayPurchase[]>;
}

declare global {
  interface Window {
    OrcaOSGooglePlayBilling?: GooglePlayBillingBridge;
  }
}

function getProProductId(): string {
  return String(import.meta.env.VITE_ORCAOS_PLAY_PRO_PRODUCT_ID ?? '').trim();
}

function getPackageName(): string {
  return String(import.meta.env.VITE_ORCAOS_ANDROID_PACKAGE_NAME ?? '').trim();
}

function getEntitlementsEndpoint(): string {
  return String(import.meta.env.VITE_ORCAOS_ENTITLEMENTS_ENDPOINT ?? '').trim();
}

function getBridge(): GooglePlayBillingBridge | null {
  if (typeof window === 'undefined') return null;
  return window.OrcaOSGooglePlayBilling ?? null;
}

function assertGooglePlayConfigured(): string {
  const productId = getProProductId();
  if (!productId) throw new Error('Configure VITE_ORCAOS_PLAY_PRO_PRODUCT_ID com o produto/assinatura Pro do Google Play.');
  return productId;
}

function assertBridge(): GooglePlayBillingBridge {
  const bridge = getBridge();
  if (!bridge) throw new Error('Compra Google Play disponível apenas no app Android com o bridge OrcaOSGooglePlayBilling instalado.');
  return bridge;
}

export function getGooglePlayBillingSetup() {
  return {
    bridgeName: 'OrcaOSGooglePlayBilling',
    productId: getProProductId(),
    packageName: getPackageName(),
    entitlementEndpoint: getEntitlementsEndpoint(),
    bridgeAvailable: Boolean(getBridge()),
  };
}

export async function isGooglePlayBillingAvailable(): Promise<boolean> {
  const bridge = getBridge();
  if (!bridge) return false;
  if (!bridge.isAvailable) return true;
  return Boolean(await bridge.isAvailable());
}

export async function purchaseGooglePlayPro(): Promise<GooglePlayPurchase> {
  const productId = assertGooglePlayConfigured();
  const bridge = assertBridge();
  const purchase = await bridge.purchase(productId);
  if (!purchase.purchaseToken) throw new Error('A compra não retornou purchaseToken para validação segura.');
  return { ...purchase, platform: 'google-play', productId: purchase.productId || productId, packageName: purchase.packageName || getPackageName() };
}

export async function restoreGooglePlayPurchases(): Promise<GooglePlayPurchase[]> {
  const productId = assertGooglePlayConfigured();
  const bridge = assertBridge();
  return (await bridge.restorePurchases([productId]))
    .filter((purchase) => purchase.productId === productId && Boolean(purchase.purchaseToken))
    .map((purchase) => ({ ...purchase, platform: 'google-play', packageName: purchase.packageName || getPackageName(), state: purchase.state ?? 'restored' }));
}

export async function syncGooglePlayPurchaseEntitlement(account: OrcaAccountState, purchase: GooglePlayPurchase, action: 'purchase' | 'restore' = 'purchase'): Promise<PlanEntitlementResult> {
  const endpoint = getEntitlementsEndpoint();
  if (!endpoint) throw new Error('Configure VITE_ORCAOS_ENTITLEMENTS_ENDPOINT para validar compras Google Play no backend.');
  if (!account.userId) throw new Error('Entre com Google ou e-mail antes de validar a compra Pro.');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: action === 'restore' ? 'google-play-restore' : 'google-play-purchase',
      channel: 'google-play',
      userId: account.userId,
      installationId: account.installationId,
      email: account.email,
      accountStatus: account.status,
      packageName: purchase.packageName || getPackageName(),
      productId: purchase.productId,
      purchaseToken: purchase.purchaseToken,
      orderId: purchase.orderId ?? null,
      purchaseState: purchase.state ?? null,
      acknowledged: purchase.acknowledged ?? null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Não foi possível validar a compra Google Play: ${response.status}`);
  }

  return applyPlanEntitlementResponse(account, await response.json() as PlanEntitlementResponse);
}
