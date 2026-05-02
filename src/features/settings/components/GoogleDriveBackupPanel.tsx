import { useState } from 'react';
import {
  collectOrcaLocalBackup,
  restoreOrcaBackup,
  summarizeOrcaBackup,
} from '../storage/localBackup';
import {
  findGoogleDriveBackup,
  isGoogleDriveBackupConfigured,
  loadBackupFromGoogleDrive,
  requestGoogleDriveAccessToken,
  saveBackupToGoogleDrive,
  type GoogleDriveBackupMetadata,
} from '../storage/googleDriveBackup';

function formatDriveDate(value?: string): string {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatDriveSize(value?: string): string {
  const size = Number(value);
  if (!Number.isFinite(size) || size <= 0) return 'Tamanho não informado';
  return `${Math.max(1, Math.ceil(size / 1024))} KB`;
}

export function GoogleDriveBackupPanel() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveBackup, setDriveBackup] = useState<GoogleDriveBackupMetadata | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const isConfigured = isGoogleDriveBackupConfigured();

  async function connectDrive() {
    setIsBusy(true);
    try {
      const token = await requestGoogleDriveAccessToken();
      setAccessToken(token);
      const backup = await findGoogleDriveBackup(token);
      setDriveBackup(backup);
      setFeedback(backup ? `Conectado. Último backup: ${formatDriveDate(backup.modifiedTime)}.` : 'Conectado. Nenhum backup encontrado ainda.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível conectar ao Google Drive.');
    } finally {
      setIsBusy(false);
    }
  }

  async function ensureToken(): Promise<string> {
    if (accessToken) return accessToken;
    const token = await requestGoogleDriveAccessToken();
    setAccessToken(token);
    return token;
  }

  async function saveDriveBackup() {
    setIsBusy(true);
    try {
      const token = await ensureToken();
      const localBackup = collectOrcaLocalBackup();
      const summary = summarizeOrcaBackup(localBackup);
      const saved = await saveBackupToGoogleDrive(token, localBackup);
      setDriveBackup(saved);
      setFeedback(`Backup salvo no Drive: ${summary.keyCount} grupo(s), aproximadamente ${summary.estimatedSizeKb} KB.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível salvar no Google Drive.');
    } finally {
      setIsBusy(false);
    }
  }

  async function restoreDriveBackup() {
    setIsBusy(true);
    try {
      const token = await ensureToken();
      const backup = await loadBackupFromGoogleDrive(token);
      const restoredCount = restoreOrcaBackup(backup, restoreMode);
      setDriveBackup(await findGoogleDriveBackup(token));
      setFeedback(`${restoredCount} grupo(s) restaurado(s) do Drive. Recarregue o app para garantir leitura completa.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível restaurar do Google Drive.');
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshDriveStatus() {
    setIsBusy(true);
    try {
      const token = await ensureToken();
      const backup = await findGoogleDriveBackup(token);
      setDriveBackup(backup);
      setFeedback(backup ? `Backup encontrado: ${formatDriveDate(backup.modifiedTime)}.` : 'Nenhum backup do OrçaOS encontrado no Drive.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível consultar o Google Drive.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="local-backup-workspace google-drive-backup-panel">
      <div className="local-backup-header">
        <div>
          <span className="orca-kicker">Google Drive</span>
          <h2>Backup privado no Drive</h2>
          <p>Salve uma cópia manual dos dados do OrçaOS na pasta privada do app no Google Drive.</p>
        </div>
        <strong>{accessToken ? 'Conectado' : 'Manual'}</strong>
      </div>

      {!isConfigured && (
        <div className="local-backup-warning">
          <strong>Configuração pendente</strong>
          <p>Adicione `VITE_GOOGLE_CLIENT_ID` no ambiente do Vite para ativar o login com Google Drive.</p>
        </div>
      )}

      <div className="local-backup-grid">
        <article className="local-backup-card">
          <strong>Salvar no Drive</strong>
          <small>Cria ou atualiza o arquivo `orcaos-backup.json` dentro do appDataFolder do Google Drive.</small>
          <div className="local-backup-actions">
            <button className="secondary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={connectDrive}>Conectar Google</button>
            <button className="primary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={saveDriveBackup}>Salvar backup</button>
          </div>
        </article>

        <article className="local-backup-card">
          <strong>Restaurar do Drive</strong>
          <small>Mesclar mantém os dados atuais. Substituir apaga os dados locais do OrçaOS antes de restaurar.</small>
          <label className="local-backup-file">
            <span>Modo de restauração</span>
            <select value={restoreMode} onChange={(event) => setRestoreMode(event.target.value as 'merge' | 'replace')}>
              <option value="merge">Mesclar com dados atuais</option>
              <option value="replace">Substituir dados locais do OrçaOS</option>
            </select>
          </label>
          <div className="local-backup-actions">
            <button className="secondary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={refreshDriveStatus}>Ver último backup</button>
            <button className="primary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={restoreDriveBackup}>Restaurar</button>
          </div>
        </article>
      </div>

      {driveBackup && (
        <div className="local-backup-preview">
          <strong>Último backup no Drive</strong>
          <small>{driveBackup.name} · {formatDriveDate(driveBackup.modifiedTime)} · {formatDriveSize(driveBackup.size)}</small>
        </div>
      )}

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
