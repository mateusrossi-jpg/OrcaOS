export interface AppAccessLockState {
  enabled: boolean;
  salt: string;
  pinHash: string;
  updatedAt: string;
}

export const APP_ACCESS_LOCK_CHANGED_EVENT = 'orcaos:app-access-lock-changed';

const STORAGE_KEY = 'orcaos:access-lock:v1';
const SESSION_UNLOCK_KEY = 'orcaos:access-unlocked:v1';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }
  return `${Date.now()}-${Math.random()}`;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return btoa(`${salt}:${pin}`);
  }

  const encoded = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToHex(new Uint8Array(digest));
}

function emitAccessLockChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(APP_ACCESS_LOCK_CHANGED_EVENT));
}

export function loadAppAccessLock(): AppAccessLockState | null {
  if (!hasStorage()) return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<AppAccessLockState>;
    if (!parsed.enabled || !parsed.salt || !parsed.pinHash) return null;
    return {
      enabled: true,
      salt: parsed.salt,
      pinHash: parsed.pinHash,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function isAppAccessLockEnabled(): boolean {
  return Boolean(loadAppAccessLock()?.enabled);
}

export function isAppAccessUnlocked(): boolean {
  if (!isAppAccessLockEnabled()) return true;
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return false;
  return window.sessionStorage.getItem(SESSION_UNLOCK_KEY) === 'true';
}

export function unlockCurrentSession(): void {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;
  window.sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
  emitAccessLockChanged();
}

export function lockCurrentSession(): void {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_UNLOCK_KEY);
  emitAccessLockChanged();
}

export async function enableAppAccessLock(pin: string): Promise<void> {
  const normalizedPin = pin.trim();
  if (normalizedPin.length < 4) throw new Error('Use um PIN com pelo menos 4 dígitos.');
  if (!hasStorage()) throw new Error('Armazenamento local indisponível neste navegador.');

  const salt = createSalt();
  const pinHash = await hashPin(normalizedPin, salt);
  const payload: AppAccessLockState = {
    enabled: true,
    salt,
    pinHash,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  unlockCurrentSession();
  emitAccessLockChanged();
}

export async function verifyAppAccessPin(pin: string): Promise<boolean> {
  const lock = loadAppAccessLock();
  if (!lock) return true;
  const pinHash = await hashPin(pin.trim(), lock.salt);
  const isValid = pinHash === lock.pinHash;
  if (isValid) unlockCurrentSession();
  return isValid;
}

export function disableAppAccessLock(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  unlockCurrentSession();
  emitAccessLockChanged();
}
