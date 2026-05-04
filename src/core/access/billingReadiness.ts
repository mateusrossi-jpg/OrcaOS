export type BillingChannel = 'beta-assisted' | 'external-checkout' | 'google-play';

export interface BillingReadiness {
  channel: BillingChannel;
  channelLabel: string;
  isGooglePlayReady: boolean;
  isExternalCheckoutReady: boolean;
  packageName: string;
  proProductId: string;
  entitlementEndpointConfigured: boolean;
  statusTitle: string;
  statusDescription: string;
  releaseChecklist: string[];
}

function billingChannel(): BillingChannel {
  const value = String(import.meta.env.VITE_ORCAOS_BILLING_CHANNEL ?? '').trim();
  if (value === 'google-play' || value === 'external-checkout') return value;
  return 'beta-assisted';
}

function packageName(): string {
  return String(import.meta.env.VITE_ORCAOS_ANDROID_PACKAGE_NAME ?? '').trim();
}

function proProductId(): string {
  return String(import.meta.env.VITE_ORCAOS_PLAY_PRO_PRODUCT_ID ?? '').trim();
}

function checkoutUrl(): string {
  return String(import.meta.env.VITE_ORCAOS_PRO_CHECKOUT_URL ?? '').trim();
}

function entitlementEndpoint(): string {
  return String(import.meta.env.VITE_ORCAOS_ENTITLEMENTS_ENDPOINT ?? '').trim();
}

export function getBillingReadiness(): BillingReadiness {
  const channel = billingChannel();
  const hasPackageName = Boolean(packageName());
  const hasProductId = Boolean(proProductId());
  const entitlementEndpointConfigured = Boolean(entitlementEndpoint());
  const isGooglePlayReady = channel === 'google-play' && hasPackageName && hasProductId && entitlementEndpointConfigured;
  const isExternalCheckoutReady = channel === 'external-checkout' && Boolean(checkoutUrl()) && entitlementEndpointConfigured;

  if (channel === 'google-play') {
    return {
      channel,
      channelLabel: 'Google Play Billing',
      isGooglePlayReady,
      isExternalCheckoutReady,
      packageName: packageName(),
      proProductId: proProductId(),
      entitlementEndpointConfigured,
      statusTitle: isGooglePlayReady ? 'Google Play preparado' : 'Google Play pendente',
      statusDescription: isGooglePlayReady
        ? 'Produto Pro, pacote Android e endpoint de validação estão configurados. A compra nativa ainda precisa do bridge Play Billing no Android.'
        : 'Configure package name, produto Pro e endpoint antes de liberar cobrança real pela Play Store.',
      releaseChecklist: [
        'Criar assinatura/produto Pro no Google Play Console.',
        'Implementar bridge nativo Play Billing no Android/Capacitor.',
        'Enviar purchaseToken e productId para backend seguro.',
        'Validar compra no backend com Google Play Developer API.',
        'Liberar Pro somente via endpoint de entitlement.',
      ],
    };
  }

  if (channel === 'external-checkout') {
    return {
      channel,
      channelLabel: 'Checkout externo',
      isGooglePlayReady,
      isExternalCheckoutReady,
      packageName: packageName(),
      proProductId: proProductId(),
      entitlementEndpointConfigured,
      statusTitle: isExternalCheckoutReady ? 'Checkout externo preparado' : 'Checkout externo pendente',
      statusDescription: isExternalCheckoutReady
        ? 'Checkout e endpoint estão configurados. Útil para venda assistida fora da Google Play quando permitido pela estratégia de distribuição.'
        : 'Configure checkout público e endpoint de entitlement para liberar Pro após pagamento.',
      releaseChecklist: [
        'Confirmar se o canal externo é permitido para a distribuição escolhida.',
        'Conectar webhook do provedor ao backend.',
        'Gravar assinatura no backend.',
        'Liberar Pro via endpoint de entitlement.',
      ],
    };
  }

  return {
    channel,
    channelLabel: 'Beta assistido',
    isGooglePlayReady,
    isExternalCheckoutReady,
    packageName: packageName(),
    proProductId: proProductId(),
    entitlementEndpointConfigured,
    statusTitle: 'Beta sem cobrança real',
    statusDescription: 'A loja mostra a estratégia Pro, mas não deve prometer venda automática até o canal de pagamento ser ativado.',
    releaseChecklist: [
      'Validar valor percebido do Pro no beta fechado.',
      'Definir preço e periodicidade.',
      'Escolher canal inicial: Google Play Billing ou checkout externo.',
      'Ativar endpoint de entitlement antes de liberar venda real.',
    ],
  };
}
