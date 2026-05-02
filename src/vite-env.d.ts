/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_ORCAOS_ENTITLEMENTS_ENDPOINT?: string;
  readonly VITE_ORCAOS_ENTITLEMENTS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
