const FIRST_RUN_KEY = 'aferix_first_run_complete';
const ACTIVE_ATTENDANCE_KEY = 'aferix_active_attendance_id';
const DEBUG_KEY = 'aferix_debug';
const FAVORITE_CATALOG_KEY = 'aferix_favorite_catalog_items';
const MONTHLY_RECORD_KEY = 'aferix_record_monthly_revenue';

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
    // Storage indisponível (ex.: modo privado) — ignora silenciosamente.
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

export const uiPreferences = {
  isFirstRunComplete(): boolean {
    return read(FIRST_RUN_KEY) === 'true';
  },

  completeFirstRun(): void {
    write(FIRST_RUN_KEY, 'true');
  },

  getActiveAttendanceId(): string | null {
    return read(ACTIVE_ATTENDANCE_KEY);
  },

  setActiveAttendanceId(id: string): void {
    write(ACTIVE_ATTENDANCE_KEY, id);
  },

  clearActiveAttendanceId(): void {
    remove(ACTIVE_ATTENDANCE_KEY);
  },

  isDebugModeEnabled(): boolean {
    return read(DEBUG_KEY) === 'true';
  },

  getFavoriteCatalogItems(): string[] {
    const raw = read(FAVORITE_CATALOG_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getMonthlyRevenueRecord(): number {
    const raw = Number(read(MONTHLY_RECORD_KEY));
    return Number.isFinite(raw) && raw > 0 ? raw : 2000;
  },

  setMonthlyRevenueRecord(value: number): void {
    write(MONTHLY_RECORD_KEY, String(value));
  }
};