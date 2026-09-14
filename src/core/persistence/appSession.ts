const ACTIVE_USER_KEY = 'aferix_active_user';
const ACTIVE_ROLE_KEY = 'aferix_active_role';
const INSTALLATION_ID_KEY = 'AFERIX_INSTALLATION_ID';

function read(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage disponível apenas em runtime (browser/Capacitor).
  }
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage indisponível — ignora silenciosamente.
  }
}

export const appSession = {
  getActiveUserData(): string | null {
    return read(ACTIVE_USER_KEY);
  },

  saveActiveUser(serializedUser: string): void {
    write(ACTIVE_USER_KEY, serializedUser);
  },

  clearActiveUser(): void {
    remove(ACTIVE_USER_KEY);
  },

  getActiveRole(): string | null {
    return read(ACTIVE_ROLE_KEY);
  },

  saveActiveRole(role: string): void {
    write(ACTIVE_ROLE_KEY, role);
  },

  clearActiveRole(): void {
    remove(ACTIVE_ROLE_KEY);
  },

  getInstallationId(): string | null {
    return read(INSTALLATION_ID_KEY);
  },

  setInstallationId(id: string): void {
    write(INSTALLATION_ID_KEY, id);
  }
};