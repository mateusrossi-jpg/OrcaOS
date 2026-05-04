/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_ORCAOS_ENTITLEMENTS_ENDPOINT?: string;
  readonly VITE_ORCAOS_ENTITLEMENTS_API_KEY?: string;
  readonly VITE_ORCAOS_PRO_CHECKOUT_URL?: string;
  readonly VITE_ORCAOS_PRO_MANAGE_URL?: string;
  readonly VITE_ORCAOS_BILLING_CHANNEL?: string;
  readonly VITE_ORCAOS_ANDROID_PACKAGE_NAME?: string;
  readonly VITE_ORCAOS_PLAY_PRO_PRODUCT_ID?: string;
  readonly VITE_ORCAOS_DEV_TOOLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
