export type BillingChannel = 'beta-assisted' | 'external-checkout' | 'google-play';

export interface BillingReadiness {
  channel: BillingChannel;
  channelLabel: string;
  isGooglePlayReady: boolean;
  isExternalCheckoutReady: boolean;
  packageName: string;
  proProductId: string;
  googlePlayBridgeName: string;
  entitlementEndpointConfigured: boolean;
  statusTitle: string;
  statusDescription: string;
  releaseChecklist: string[];
}

function billingChannel(): BillingChannel {
  const value = String(import.meta.env.VITE_AFERIX_BILLING_CHANNEL ?? '').trim();
  if (value === 'google-play' || value === 'external-checkout') return value;
  return 'beta-assisted';
}

function packageName(): string {
  return String(import.meta.env.VITE_AFERIX_ANDROID_PACKAGE_NAME ?? '').trim();
}

function proProductId(): string {
  return String(import.meta.env.VITE_AFERIX_PLAY_PRO_PRODUCT_ID ?? '').trim();
}

function checkoutUrl(): string {
  return String(import.meta.env.VITE_AFERIX_PRO_CHECKOUT_URL ?? '').trim();
}

function entitlementEndpoint(): string {
  return String(import.meta.env.VITE_AFERIX_ENTITLEMENTS_ENDPOINT ?? '').trim();
}

export function getBillingReadiness(): BillingReadiness {
  const channel = billingChannel();
  const hasPackageName = Boolean(packageName());
  const hasProductId = Boolean(proProductId());
  const entitlementEndpointConfigured = Boolean(entitlementEndpoint());
  const isGooglePlayReady = channel === 'google-play' && hasPackageName && hasProductId && entitlementEndpointConfigured;
  const isExternalCheckoutReady = channel === 'external-checkout' && Boolean(checkoutUrl()) && entitlementEndpointConfigured;

  const defaultChecklist = [
    'Plano Pro em preparação',
    'Recursos premium serão liberados gradualmente',
    'Sua licença atual é gratuita durante este período',
  ];

  if (channel === 'google-play') {
    return {
      channel,
      channelLabel: 'Acesso Premium',
      isGooglePlayReady,
      isExternalCheckoutReady,
      packageName: packageName(),
      proProductId: proProductId(),
      googlePlayBridgeName: 'AferixGooglePlayBilling',
      entitlementEndpointConfigured,
      statusTitle: 'Licença Profissional',
      statusDescription: 'Sua assinatura profissional está sendo preparada para os próximos recursos de nuvem.',
      releaseChecklist: defaultChecklist,
    };
  }

  if (channel === 'external-checkout') {
    return {
      channel,
      channelLabel: 'Acesso Premium',
      isGooglePlayReady,
      isExternalCheckoutReady,
      packageName: packageName(),
      proProductId: proProductId(),
      googlePlayBridgeName: 'AferixGooglePlayBilling',
      entitlementEndpointConfigured,
      statusTitle: 'Licença Profissional',
      statusDescription: 'Sua assinatura profissional está sendo preparada para os próximos recursos de nuvem.',
      releaseChecklist: defaultChecklist,
    };
  }

  return {
    channel,
    channelLabel: 'Beta',
    isGooglePlayReady,
    isExternalCheckoutReady,
    packageName: packageName(),
    proProductId: proProductId(),
    googlePlayBridgeName: 'AferixGooglePlayBilling',
    entitlementEndpointConfigured,
    statusTitle: 'Licença Gratuita (Beta)',
    statusDescription: 'O plano profissional está em fase de preparação e será liberado gradualmente.',
    releaseChecklist: defaultChecklist,
  };
}
