import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  collectOrcaLocalBackup,
  createBackupFilename,
  parseOrcaBackup,
  restoreOrcaBackup,
  stringifyOrcaBackup,
  summarizeOrcaBackup,
  summarizeOrcaBackupData,
} from './localBackup';

describe('local backup storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createMemoryStorage(),
    });
  });

  afterEach(() => {
    if (typeof window !== 'undefined') window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('collects only Aferix localStorage keys', () => {
    window.localStorage.setItem('orcaos:clients:v1', '[{"id":"c1","name":"Cliente"}]');
    window.localStorage.setItem('other-app:key', 'ignore-me');

    const backup = collectOrcaLocalBackup();

    expect(backup.app).toBe('Aferix');
    expect(backup.version).toBe(1);
    expect(backup.keys).toEqual({
      'orcaos:clients:v1': '[{"id":"c1","name":"Cliente"}]',
    });
  });

  it('stringifies, parses and summarizes backups safely', () => {
    const backup = collectOrcaLocalBackup();
    const serialized = stringifyOrcaBackup(backup);
    const parsed = parseOrcaBackup(serialized);
    const summary = summarizeOrcaBackup(parsed);

    expect(parsed.app).toBe('Aferix');
    expect(parsed.version).toBe(1);
    expect(summary.keyCount).toBe(0);
    expect(summary.estimatedSizeKb).toBeGreaterThanOrEqual(1);
  });

  it('summarizes business data groups from backup keys', () => {
    const backup = parseOrcaBackup(JSON.stringify({
      app: 'Aferix',
      version: 1,
      exportedAt: '2026-05-02T00:00:00.000Z',
      keys: {
        'orcaos:clients:v1': JSON.stringify([{ id: 'c1' }, { id: 'c2' }]),
        'orcaos:work-orders:v1': JSON.stringify([{ id: 'os1' }]),
        'orcaos:saved-budgets:v1': JSON.stringify([{ id: 'b1' }]),
        'orcaos:catalog-hub-items:v1': JSON.stringify([{ id: 'i1' }, { id: 'i2' }]),
        'orcaos:catalog-suppliers:v1': JSON.stringify([{ id: 's1' }]),
        'orcaos:calculation-captures:v1': JSON.stringify([{ id: 'cap1' }]),
        'orcaos:business-profile:v1': '{}',
        'orcaos:professional-profile:v1': '{}',
        'aferix:account-plan:v1': '{}',
      },
    }));

    expect(summarizeOrcaBackupData(backup)).toEqual(expect.arrayContaining([
      { label: 'Clientes', count: 2 },
      { label: 'OS', count: 1 },
      { label: 'Orçamentos', count: 1 },
      { label: 'Catálogo', count: 2 },
      { label: 'Fornecedores', count: 1 },
      { label: 'Capturas de campo', count: 1 },
      { label: 'Perfil profissional', count: 2 },
      { label: 'Conta/plano local', count: 1 },
    ]));
  });

  it('rejects backups from other apps or unsupported versions', () => {
    expect(() => parseOrcaBackup(JSON.stringify({ app: 'Outro', version: 1, keys: {} }))).toThrow('backup do Aferix');
    expect(() => parseOrcaBackup(JSON.stringify({ app: 'Aferix', version: 2, keys: {} }))).toThrow('Versão de backup');
    expect(() => parseOrcaBackup('{invalid-json')).toThrow('JSON inválido');
  });

  it('ignores unsafe keys while parsing backups', () => {
    const parsed = parseOrcaBackup(JSON.stringify({
      app: 'Aferix',
      version: 1,
      exportedAt: '2026-05-02T00:00:00.000Z',
      keys: {
        'orcaos:clients:v1': 'valid',
        'not-orca:key': 'invalid',
        'orcaos:bad-object': { value: 'invalid' },
      },
    }));

    expect(parsed.keys).toEqual({ 'orcaos:clients:v1': 'valid' });
  });

  it('restores backups in merge and replace modes', () => {
    window.localStorage.setItem('orcaos:old:v1', 'old');
    window.localStorage.setItem('external:key', 'keep');

    const restoredMerge = restoreOrcaBackup({
      app: 'Aferix',
      version: 1,
      exportedAt: '2026-05-02T00:00:00.000Z',
      source: 'localStorage',
      keys: { 'orcaos:new:v1': 'new' },
    }, 'merge');

    expect(restoredMerge).toBe(1);
    expect(window.localStorage.getItem('orcaos:old:v1')).toBe('old');
    expect(window.localStorage.getItem('orcaos:new:v1')).toBe('new');

    const restoredReplace = restoreOrcaBackup({
      app: 'Aferix',
      version: 1,
      exportedAt: '2026-05-02T00:00:00.000Z',
      source: 'localStorage',
      keys: { 'orcaos:replacement:v1': 'replacement' },
    }, 'replace');

    expect(restoredReplace).toBe(1);
    expect(window.localStorage.getItem('orcaos:old:v1')).toBeNull();
    expect(window.localStorage.getItem('orcaos:new:v1')).toBeNull();
    expect(window.localStorage.getItem('orcaos:replacement:v1')).toBe('replacement');
    expect(window.localStorage.getItem('external:key')).toBe('keep');
  });

  it('creates date-based backup filenames', () => {
    expect(createBackupFilename()).toMatch(/^aferix-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('accepts legacy app markers for existing local-first backups', () => {
    const parsed = parseOrcaBackup(JSON.stringify({
      app: 'Or\u00e7aOS',
      version: 1,
      exportedAt: '2026-05-02T00:00:00.000Z',
      keys: { 'orcaos:clients:v1': 'legacy' },
    }));

    expect(parsed.app).toBe('Aferix');
    expect(parsed.keys).toEqual({ 'orcaos:clients:v1': 'legacy' });
  });
});
