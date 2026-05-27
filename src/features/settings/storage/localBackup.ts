import { safeJsonParse } from '../../../core/runtime/safeGuards';
import { db } from '../../../storage/dexieDatabase';

export interface AferixLocalBackup {
  app: string;
  version: 2;
  exportedAt: string;
  source: 'dexie';
  tables: Record<string, unknown[]>;
}

export interface AferixBackupSummary {
  keyCount: number;
  estimatedSizeKb: number;
  exportedAt?: string;
  version?: number;
}

export interface AferixBackupDataSummaryItem {
  label: string;
  count: number;
}

const LEGACY_APP_MARKER = 'Or\u00e7aOS';

export async function collectAferixLocalBackup(): Promise<AferixLocalBackup> {
  const tablesData: Record<string, unknown[]> = {};
  
  if (typeof window !== 'undefined') {
    for (const table of db.tables) {
      tablesData[table.name] = await table.toArray();
    }
  }

  return {
    app: 'Aferix',
    version: 2,
    exportedAt: new Date().toISOString(),
    source: 'dexie',
    tables: tablesData,
  };
}

export function stringifyAferixBackup(backup: AferixLocalBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function summarizeAferixBackup(backup: AferixLocalBackup): AferixBackupSummary {
  const serialized = stringifyAferixBackup(backup);
  return {
    keyCount: Object.keys(backup.tables || {}).length,
    estimatedSizeKb: Math.max(1, Math.ceil(new Blob([serialized]).size / 1024)),
    exportedAt: backup.exportedAt,
    version: backup.version,
  };
}

export function summarizeAferixBackupData(backup: AferixLocalBackup): AferixBackupDataSummaryItem[] {
  const tables = backup.tables || {};
  
  return [
    { label: 'Orçamentos', count: tables['budgets']?.length || 0 },
    { label: 'Clientes', count: tables['clients']?.length || 0 },
    { label: 'Histórico Operacional (OS)', count: tables['workOrders']?.length || 0 },
    { label: 'Eventos (Timeline)', count: tables['operationalEvents']?.length || 0 },
    { label: 'Lançamentos Financeiros', count: tables['simpleFinanceRecords']?.length || 0 },
    { label: 'Catálogo (Serviços/Itens)', count: tables['catalog']?.length || 0 },
    { label: 'Propostas de Clientes', count: tables['clientProposals']?.length || 0 },
    { label: 'Tabelas Extras (Settings/Misc)', count: Object.keys(tables).filter(t => !['budgets', 'clients', 'workOrders', 'operationalEvents', 'simpleFinanceRecords', 'catalog', 'clientProposals'].includes(t)).length }
  ];
}

export function parseAferixBackup(value: string): AferixLocalBackup {
  const parsed = safeJsonParse<Partial<AferixLocalBackup> | null>(value, null);
  
  if (!parsed || typeof parsed !== 'object') throw new Error('Arquivo de backup inválido ou JSON corrompido.');

  const backup = parsed;
  if (backup.app !== 'Aferix' && backup.app !== LEGACY_APP_MARKER) throw new Error('Este arquivo não parece ser um backup válido do Aferix.');
  // Backwards compatibility with version 1 (localStorage)
  if ((backup as Record<string, unknown>).version === 1) {
      throw new Error('Backup versão 1 (localStorage) detectado. O sistema agora usa banco de dados Dexie (v2). Atualize o app antigo primeiro, migre os dados e gere um novo backup.');
  }

  if (backup.version !== 2) throw new Error('Versão de backup não suportada.');

  if (!backup.tables || typeof backup.tables !== 'object') throw new Error('Backup sem tabelas restauráveis.');

  return {
    app: 'Aferix',
    version: 2,
    exportedAt: backup.exportedAt || new Date().toISOString(),
    source: 'dexie',
    tables: backup.tables,
  };
}

export async function restoreAferixBackup(backup: AferixLocalBackup, mode: 'merge' | 'replace'): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  let restoredCount = 0;

  await db.transaction('rw', db.tables, async () => {
    if (mode === 'replace') {
      for (const table of db.tables) {
        await table.clear();
      }
    }

    for (const [tableName, records] of Object.entries(backup.tables)) {
      if (db.tables.find(t => t.name === tableName)) {
        await db.table(tableName).bulkPut(records);
        restoredCount++;
      }
    }
  });

  return restoredCount;
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
