import type { GoogleAccountProfile } from './accountPlanStorage';

const GOOGLE_IDENTITY_SCRIPT_ID = 'orcaos-google-identity-script';
const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_PROFILE_SCOPE = 'openid email profile';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface GoogleAccountsApi {
  accounts?: {
    oauth2?: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: unknown) => void;
      }) => GoogleTokenClient;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleAccountsApi;
  }
}

function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
}

function ensureBrowser(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Login Google só pode ser usado no navegador.');
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  ensureBrowser();

  if (window.google?.accounts?.oauth2) return Promise.resolve();

  const existingScript = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Não foi possível carregar o login do Google.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_IDENTITY_SCRIPT_ID;
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Não foi possível carregar o login do Google.'));
    document.head.appendChild(script);
  });
}

export function isGoogleAccountLoginConfigured(): boolean {
  return getGoogleClientId().trim().length > 0;
}

async function requestGoogleProfileAccessToken(): Promise<string> {
  const clientId = getGoogleClientId().trim();
  if (!clientId) throw new Error('Configure VITE_GOOGLE_CLIENT_ID para ativar login Google.');

  await loadGoogleIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Login do Google indisponível neste navegador.');

  return new Promise((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_PROFILE_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        if (!response.access_token) {
          reject(new Error('Google não retornou token de acesso.'));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: () => reject(new Error('Login do Google cancelado ou bloqueado.')),
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function requestGoogleAccountProfile(): Promise<GoogleAccountProfile> {
  const accessToken = await requestGoogleProfileAccessToken();
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível carregar o perfil Google.');
  }

  const profile = await response.json() as Partial<GoogleAccountProfile>;
  if (!profile.sub) throw new Error('Google não retornou identificador da conta.');
  return {
    sub: profile.sub,
    name: profile.name,
    email: profile.email,
  };
}
