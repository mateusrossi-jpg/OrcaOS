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
  const [replaceConfirmation, setReplaceConfirmation] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [canReload, setCanReload] = useState(false);
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
    if (restoreMode === 'replace' && replaceConfirmation.trim() !== 'SUBSTITUIR') {
      setFeedback('Isso substituirá os dados locais do Aferix neste navegador. Digite SUBSTITUIR para confirmar.');
      return;
    }
    setIsBusy(true);
    try {
      const token = await ensureToken();
      const backup = await loadBackupFromGoogleDrive(token);
      const restoredCount = restoreOrcaBackup(backup, restoreMode);
      setDriveBackup(await findGoogleDriveBackup(token));
      setFeedback(`${restoredCount} grupo(s) restaurado(s) do Drive. Recarregue o app para garantir leitura completa.`);
      setCanReload(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível restaurar do Google Drive.');
    } finally {
      setIsBusy(false);
    }
  }

  function reloadAppNow() {
    window.location.reload();
  }

  async function refreshDriveStatus() {
    setIsBusy(true);
    try {
      const token = await ensureToken();
      const backup = await findGoogleDriveBackup(token);
      setDriveBackup(backup);
      setFeedback(backup ? `Backup encontrado: ${formatDriveDate(backup.modifiedTime)}.` : 'Nenhum backup do Aferix encontrado no Drive.');
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
          <p>Conecte Google somente quando quiser salvar ou restaurar uma cópia privada dos dados do Aferix.</p>
        </div>
        <strong>{accessToken ? 'Google conectado' : isConfigured ? 'Pronto para conectar' : 'Indisponível'}</strong>
      </div>

      {!isConfigured && (
        <div className="local-backup-warning">
          <strong>Drive indisponível neste ambiente</strong>
          <p>O backup local continua disponível. O backup no Drive será liberado quando o acesso Google estiver configurado para este app.</p>
        </div>
      )}

      <div className="local-backup-grid">
        <article className="local-backup-card">
          <div className="local-card-heading">
            <strong>Salvar no Drive</strong>
            <small>Cria ou atualiza uma cópia privada do Aferix na área do app dentro do Google Drive.</small>
          </div>
          <div className="local-backup-actions">
            <button className="secondary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={connectDrive}>Conectar Google</button>
            <button className="primary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={saveDriveBackup}>Salvar backup</button>
          </div>
        </article>

        <article className="local-backup-card">
          <div className="local-card-heading">
            <strong>Restaurar do Drive</strong>
            <small>Mesclar mantém os dados atuais. Substituir apaga os dados locais do Aferix antes de restaurar.</small>
          </div>
          <label className="local-backup-file">
            <span>Modo de restauração</span>
            <select value={restoreMode} onChange={(event) => setRestoreMode(event.target.value as 'merge' | 'replace')}>
              <option value="merge">Mesclar com dados atuais</option>
              <option value="replace">Substituir dados locais do Aferix</option>
            </select>
          </label>
          {restoreMode === 'replace' && (
            <label className="local-backup-file">
              <span>Confirmação para substituir</span>
              <input value={replaceConfirmation} placeholder="Digite SUBSTITUIR" onChange={(event) => setReplaceConfirmation(event.target.value)} />
              <small>Isso substituirá os dados locais do Aferix neste navegador.</small>
            </label>
          )}
          <div className="local-backup-actions">
            <button className="secondary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={refreshDriveStatus}>Ver último backup</button>
            <button className="primary-action inline-action" disabled={!isConfigured || isBusy} type="button" onClick={restoreDriveBackup}>Restaurar</button>
            {canReload && <button className="secondary-action inline-action" type="button" onClick={reloadAppNow}>Recarregar app agora</button>}
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
