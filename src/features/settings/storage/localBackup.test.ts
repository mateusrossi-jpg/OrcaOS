import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../../../test/createMemoryStorage';
import {
  collectOrcaLocalBackup,
  createBackupFilename,
  parseOrcaBackup,
  restoreOrcaBackup,
  stringifyOrcaBackup,
  summarizeOrcaBackup,
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

  it('collects only OrçaOS localStorage keys', () => {
    window.localStorage.setItem('orcaos:clients:v1', '[{"id":"c1","name":"Cliente"}]');
    window.localStorage.setItem('other-app:key', 'ignore-me');

    const backup = collectOrcaLocalBackup();

    expect(backup.app).toBe('OrçaOS');
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

    expect(parsed.app).toBe('OrçaOS');
    expect(parsed.version).toBe(1);
    expect(summary.keyCount).toBe(0);
    expect(summary.estimatedSizeKb).toBeGreaterThanOrEqual(1);
  });

  it('rejects backups from other apps or unsupported versions', () => {
    expect(() => parseOrcaBackup(JSON.stringify({ app: 'Outro', version: 1, keys: {} }))).toThrow('backup do OrçaOS');
    expect(() => parseOrcaBackup(JSON.stringify({ app: 'OrçaOS', version: 2, keys: {} }))).toThrow('Versão de backup');
  });

  it('ignores unsafe keys while parsing backups', () => {
    const parsed = parseOrcaBackup(JSON.stringify({
      app: 'OrçaOS',
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
      app: 'OrçaOS',
      version: 1,
      exportedAt: '2026-05-02T00:00:00.000Z',
      source: 'localStorage',
      keys: { 'orcaos:new:v1': 'new' },
    }, 'merge');

    expect(restoredMerge).toBe(1);
    expect(window.localStorage.getItem('orcaos:old:v1')).toBe('old');
    expect(window.localStorage.getItem('orcaos:new:v1')).toBe('new');

    const restoredReplace = restoreOrcaBackup({
      app: 'OrçaOS',
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
    expect(createBackupFilename()).toMatch(/^orcaos-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
