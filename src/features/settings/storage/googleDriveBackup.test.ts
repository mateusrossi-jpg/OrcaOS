import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OrcaLocalBackup } from './localBackup';
import {
  findGoogleDriveBackup,
  isGoogleDriveBackupConfigured,
  loadBackupFromGoogleDrive,
  saveBackupToGoogleDrive,
} from './googleDriveBackup';

function jsonResponse(value: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(value),
    text: () => Promise.resolve(typeof value === 'string' ? value : JSON.stringify(value)),
  } as Response;
}

function textResponse(value: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(JSON.parse(value)),
    text: () => Promise.resolve(value),
  } as Response;
}

const backup: OrcaLocalBackup = {
  app: 'Aferix',
  version: 1,
  exportedAt: '2026-05-02T00:00:00.000Z',
  source: 'localStorage',
  keys: {
    'orcaos:clients:v1': '[{"id":"c1","name":"Cliente"}]',
  },
};

describe('google drive backup storage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports whether Google Drive backup is configured', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    expect(isGoogleDriveBackupConfigured()).toBe(false);

    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'google-client-id');
    expect(isGoogleDriveBackupConfigured()).toBe(true);
  });

  it('finds the latest Aferix backup metadata in appDataFolder', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      files: [{ id: 'file-1', name: 'aferix-backup.json', modifiedTime: '2026-05-02T00:00:00.000Z', size: '2048' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const found = await findGoogleDriveBackup('token');

    expect(found?.id).toBe('file-1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) }),
    );
  });

  it('returns null when no Drive backup exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ files: [] })));

    await expect(findGoogleDriveBackup('token')).resolves.toBeNull();
  });

  it('throws useful errors when Drive responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse('drive-error', false, 403)));

    await expect(findGoogleDriveBackup('token')).rejects.toThrow('drive-error');
  });

  it('loads and parses an existing backup from Google Drive', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'file-1', name: 'aferix-backup.json' }] }))
      .mockResolvedValueOnce(textResponse(JSON.stringify(backup)));
    vi.stubGlobal('fetch', fetchMock);

    const loaded = await loadBackupFromGoogleDrive('token');

    expect(loaded.keys).toEqual(backup.keys);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://www.googleapis.com/drive/v3/files/file-1?alt=media',
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } }),
    );
  });

  it('fails clearly when there is no backup to restore from Drive', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ files: [] })));

    await expect(loadBackupFromGoogleDrive('token')).rejects.toThrow('Nenhum backup do Aferix');
  });

  it('creates a new Drive backup in appDataFolder', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'created', name: 'aferix-backup.json' }));
    vi.stubGlobal('fetch', fetchMock);

    const saved = await saveBackupToGoogleDrive('token', backup);
    const [, uploadInit] = fetchMock.mock.calls[1];

    expect(saved.id).toBe('created');
    expect(fetchMock.mock.calls[1][0]).toContain('/upload/drive/v3/files?uploadType=multipart');
    expect(uploadInit.method).toBe('POST');
    expect(String(uploadInit.body)).toContain('"parents":["appDataFolder"]');
    expect(String(uploadInit.body)).toContain('"orcaos:clients:v1"');
  });

  it('updates an existing Drive backup file', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'existing', name: 'aferix-backup.json' }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 'existing', name: 'aferix-backup.json' }));
    vi.stubGlobal('fetch', fetchMock);

    await saveBackupToGoogleDrive('token', backup);
    const [, uploadInit] = fetchMock.mock.calls[1];

    expect(fetchMock.mock.calls[1][0]).toContain('/upload/drive/v3/files/existing?uploadType=multipart');
    expect(uploadInit.method).toBe('PATCH');
    expect(String(uploadInit.body)).not.toContain('"parents":["appDataFolder"]');
  });
});
