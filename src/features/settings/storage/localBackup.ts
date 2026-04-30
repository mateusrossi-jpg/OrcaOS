export interface OrcaLocalBackup {
  app: 'OrçaOS';
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

const ORCA_PREFIX = 'orcaos:';

export function collectOrcaLocalBackup(): OrcaLocalBackup {
  const keys: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(ORCA_PREFIX)) {
        const value = window.localStorage.getItem(key);
        if (value !== null) keys[key] = value;
      }
    }
  }

  return {
    app: 'OrçaOS',
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

export function parseOrcaBackup(value: string): OrcaLocalBackup {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object') throw new Error('Arquivo de backup inválido.');

  const backup = parsed as Partial<OrcaLocalBackup>;
  if (backup.app !== 'OrçaOS') throw new Error('Este arquivo não parece ser um backup do OrçaOS.');
  if (backup.version !== 1) throw new Error('Versão de backup não suportada.');
  if (!backup.keys || typeof backup.keys !== 'object') throw new Error('Backup sem dados restauráveis.');

  const safeKeys: Record<string, string> = {};
  Object.entries(backup.keys).forEach(([key, itemValue]) => {
    if (key.startsWith(ORCA_PREFIX) && typeof itemValue === 'string') {
      safeKeys[key] = itemValue;
    }
  });

  return {
    app: 'OrçaOS',
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
      if (key?.startsWith(ORCA_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }

  Object.entries(backup.keys).forEach(([key, value]) => {
    if (key.startsWith(ORCA_PREFIX)) window.localStorage.setItem(key, value);
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
  return `orcaos-backup-${date}.json`;
}
