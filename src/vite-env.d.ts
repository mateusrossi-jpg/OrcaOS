/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_AFERIX_ENTITLEMENTS_ENDPOINT?: string;
  readonly VITE_AFERIX_ENTITLEMENTS_API_KEY?: string;
  readonly VITE_AFERIX_PRO_CHECKOUT_URL?: string;
  readonly VITE_AFERIX_PRO_MANAGE_URL?: string;
  readonly VITE_AFERIX_BILLING_CHANNEL?: string;
  readonly VITE_AFERIX_ANDROID_PACKAGE_NAME?: string;
  readonly VITE_AFERIX_PLAY_PRO_PRODUCT_ID?: string;
  readonly VITE_AFERIX_DEV_TOOLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
