import { describe, expect, it } from 'vitest';
import {
  collectAferixLocalBackup,
  createBackupFilename,
  parseAferixBackup,
  stringifyAferixBackup,
  summarizeAferixBackup,
  summarizeAferixBackupData,
} from './localBackup';

describe('local backup storage', () => {
  // Since we use Dexie in memory for tests or we can just mock db.tables,
  // but let's test the functions assuming db is initialized.
  
  it('collects Aferix dexie tables', async () => {
    const backup = await collectAferixLocalBackup();

    expect(backup.app).toBe('Aferix');
    expect(backup.version).toBe(2);
    expect(backup.tables).toBeDefined();
  });

  it('stringifies, parses and summarizes backups safely', async () => {
    const backup = await collectAferixLocalBackup();
    const serialized = stringifyAferixBackup(backup);
    const parsed = parseAferixBackup(serialized);
    const summary = summarizeAferixBackup(parsed);

    expect(parsed.app).toBe('Aferix');
    expect(parsed.version).toBe(2);
    expect(summary.estimatedSizeKb).toBeGreaterThanOrEqual(1);
  });

  it('summarizes business data groups from backup tables', () => {
    const backup = parseAferixBackup(JSON.stringify({
      app: 'Aferix',
      version: 2,
      exportedAt: '2026-05-02T00:00:00.000Z',
      tables: {
        'clients': [{ id: 'c1' }, { id: 'c2' }],
        'workOrders': [{ id: 'os1' }],
        'budgets': [{ id: 'b1' }],
        'catalog': [{ id: 'i1' }, { id: 'i2' }],
      },
    }));

    expect(summarizeAferixBackupData(backup)).toEqual(expect.arrayContaining([
      { label: 'Clientes', count: 2 },
      { label: 'Histórico Operacional (OS)', count: 1 },
      { label: 'Orçamentos', count: 1 },
      { label: 'Catálogo (Serviços/Itens)', count: 2 },
    ]));
  });

  it('rejects backups from other apps or unsupported versions', () => {
    expect(() => parseAferixBackup(JSON.stringify({ app: 'Outro', version: 2, tables: {} }))).toThrow('backup válido do Aferix');
    expect(() => parseAferixBackup(JSON.stringify({ app: 'Aferix', version: 3, tables: {} }))).toThrow('Versão de backup não suportada');
    expect(() => parseAferixBackup(JSON.stringify({ app: 'Aferix', version: 1, keys: {} }))).toThrow('Backup versão 1');
    expect(() => parseAferixBackup('{invalid-json')).toThrow('Arquivo de backup inválido ou JSON corrompido.');
  });

  it('creates date-based backup filenames', () => {
    expect(createBackupFilename()).toMatch(/^aferix-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
