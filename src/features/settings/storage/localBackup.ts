export interface OrcaLocalBackup {
  app: string;
  version: 1;
  exportedAt: string;
  source: 'localStorage';
  keys: Record<string, string>;
}

export interface OrcaBackupSummary {
  keyCount: number;
  estimatedSizeKb: number;
  exportedAt?: string;
  version?: number;
}

export interface OrcaBackupDataSummaryItem {
  label: string;
  count: number;
}

const ORCA_PREFIX = 'orcaos:';
const AFERIX_PREFIX = 'aferix:';
const LEGACY_APP_MARKER = 'Or\u00e7aOS';

function parseJsonValue(value: string | undefined): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function countArrayValue(value: string | undefined): number {
  const parsedValue = parseJsonValue(value);
  return Array.isArray(parsedValue) ? parsedValue.length : 0;
}

function countPresentValue(value: string | undefined): number {
  return value ? 1 : 0;
}

export function collectOrcaLocalBackup(): OrcaLocalBackup {
  const keys: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(ORCA_PREFIX) || key?.startsWith(AFERIX_PREFIX)) {
        const value = window.localStorage.getItem(key);
        if (value !== null) keys[key] = value;
      }
    }
  }

  return {
    app: 'Aferix',
    version: 1,
    exportedAt: new Date().toISOString(),
    source: 'localStorage',
    keys,
  };
}

export function stringifyOrcaBackup(backup: OrcaLocalBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function summarizeOrcaBackup(backup: OrcaLocalBackup): OrcaBackupSummary {
  const serialized = stringifyOrcaBackup(backup);
  return {
    keyCount: Object.keys(backup.keys).length,
    estimatedSizeKb: Math.max(1, Math.ceil(new Blob([serialized]).size / 1024)),
    exportedAt: backup.exportedAt,
    version: backup.version,
  };
}

export function summarizeOrcaBackupData(backup: OrcaLocalBackup): OrcaBackupDataSummaryItem[] {
  const keys = backup.keys;
  const catalogCount = countArrayValue(keys['orcaos:catalog-hub-items:v1']) + countArrayValue(keys['orcaos:catalog-items:v1']);
  const supplierCount = countArrayValue(keys['orcaos:catalog-suppliers:v1']) + countArrayValue(keys['orcaos:supplier-profiles:v1']);
  const surveyCount = countArrayValue(keys['orcaos:calculation-captures:v1']) + countArrayValue(keys['orcaos:guided-rooms:v1']) + countArrayValue(keys['orcaos:guided-labor-templates:v1']);
  const settingsCount = countPresentValue(keys['orcaos:access-lock:v1']) + countPresentValue(keys['orcaos:purchase-tax-records:v1']);
  const profileCount = countPresentValue(keys['orcaos:business-profile:v1']) + countPresentValue(keys['orcaos:professional-profile:v1']);
  const accountCount = countPresentValue(keys['aferix:account-plan:v1']) + countPresentValue(keys['orcaos:user-plan']);

  return [
    { label: 'Clientes', count: countArrayValue(keys['orcaos:clients:v1']) },
    { label: 'OS', count: countArrayValue(keys['orcaos:work-orders:v1']) },
    { label: 'Orçamentos', count: countArrayValue(keys['orcaos:saved-budgets:v1']) },
    { label: 'Catálogo', count: catalogCount },
    { label: 'Fornecedores', count: supplierCount },
    { label: 'Configurações', count: settingsCount },
    { label: 'Capturas de campo', count: surveyCount },
    { label: 'Perfil profissional', count: profileCount },
    { label: 'Conta/plano local', count: accountCount },
  ];
}

export function parseOrcaBackup(value: string): OrcaLocalBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('JSON inválido. Confira se o conteúdo colado é um backup completo do Aferix.');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Arquivo de backup inválido.');

  const backup = parsed as Partial<OrcaLocalBackup>;
  if (backup.app !== 'Aferix' && backup.app !== LEGACY_APP_MARKER) throw new Error('Este arquivo não parece ser um backup do Aferix.');
  if (backup.version !== 1) throw new Error('Versão de backup não suportada.');
  if (!backup.keys || typeof backup.keys !== 'object') throw new Error('Backup sem dados restauráveis.');

  const safeKeys: Record<string, string> = {};
  Object.entries(backup.keys).forEach(([key, itemValue]) => {
    if ((key.startsWith(ORCA_PREFIX) || key.startsWith(AFERIX_PREFIX)) && typeof itemValue === 'string') {
      safeKeys[key] = itemValue;
    }
  });

  return {
    app: 'Aferix',
    version: 1,
    exportedAt: backup.exportedAt || new Date().toISOString(),
    source: 'localStorage',
    keys: safeKeys,
  };
}

export function restoreOrcaBackup(backup: OrcaLocalBackup, mode: 'merge' | 'replace'): number {
  if (typeof window === 'undefined') return 0;

  if (mode === 'replace') {
    const keysToRemove: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(ORCA_PREFIX) || key?.startsWith(AFERIX_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }

  Object.entries(backup.keys).forEach(([key, value]) => {
    if (key.startsWith(ORCA_PREFIX) || key.startsWith(AFERIX_PREFIX)) window.localStorage.setItem(key, value);
  });

  return Object.keys(backup.keys).length;
}

export function downloadBackupFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function createBackupFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `aferix-backup-${date}.json`;
}
