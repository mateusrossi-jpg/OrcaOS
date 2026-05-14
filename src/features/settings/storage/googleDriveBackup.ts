import { parseOrcaBackup, stringifyOrcaBackup, type OrcaLocalBackup } from './localBackup';

const GOOGLE_IDENTITY_SCRIPT_ID = 'orcaos-google-identity-script';
const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_BACKUP_FILENAME = 'aferix-backup.json';

export interface GoogleDriveBackupMetadata {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

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
    throw new Error('Google Drive Backup só pode ser usado no navegador.');
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

export function isGoogleDriveBackupConfigured(): boolean {
  return getGoogleClientId().trim().length > 0;
}

export async function requestGoogleDriveAccessToken(): Promise<string> {
  const clientId = getGoogleClientId().trim();
  if (!clientId) throw new Error('Backup no Google Drive indisponível neste ambiente.');

  await loadGoogleIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Login do Google indisponível neste navegador.');

  return new Promise((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_APPDATA_SCOPE,
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

async function driveFetch<T>(accessToken: string, url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro do Google Drive: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function findGoogleDriveBackup(accessToken: string): Promise<GoogleDriveBackupMetadata | null> {
  const query = encodeURIComponent(`name='${DRIVE_BACKUP_FILENAME}' and trashed=false`);
  const fields = encodeURIComponent('files(id,name,modifiedTime,size)');
  const response = await driveFetch<{ files: GoogleDriveBackupMetadata[] }>(
    accessToken,
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=${fields}`,
  );

  return response.files[0] ?? null;
}

function createMultipartBody(metadata: Record<string, unknown>, content: string): { body: string; contentType: string } {
  const boundary = `orcaos_backup_${Date.now()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    content,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return { body, contentType: `multipart/related; boundary=${boundary}` };
}

export async function saveBackupToGoogleDrive(accessToken: string, backup: OrcaLocalBackup): Promise<GoogleDriveBackupMetadata> {
  const existingBackup = await findGoogleDriveBackup(accessToken);
  const serializedBackup = stringifyOrcaBackup(backup);
  const metadata = existingBackup ? { name: DRIVE_BACKUP_FILENAME } : { name: DRIVE_BACKUP_FILENAME, parents: ['appDataFolder'] };
  const multipart = createMultipartBody(metadata, serializedBackup);
  const endpoint = existingBackup
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingBackup.id}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size';
  const method = existingBackup ? 'PATCH' : 'POST';

  return driveFetch<GoogleDriveBackupMetadata>(accessToken, endpoint, {
    method,
    headers: { 'Content-Type': multipart.contentType },
    body: multipart.body,
  });
}

export async function loadBackupFromGoogleDrive(accessToken: string): Promise<OrcaLocalBackup> {
  const backupFile = await findGoogleDriveBackup(accessToken);
  if (!backupFile) throw new Error('Nenhum backup do Aferix encontrado no Google Drive.');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${backupFile.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível baixar o backup do Google Drive.');
  }

  return parseOrcaBackup(await response.text());
}
