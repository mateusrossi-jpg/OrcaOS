import { useState } from 'react';
import { Button, Select } from '../../../app/components/ui';
import {
  collectAferixLocalBackup,
  restoreAferixBackup,
  summarizeAferixBackup,
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
      const localBackup = collectAferixLocalBackup();
      const summary = summarizeAferixBackup(localBackup);
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
      const restoredCount = restoreAferixBackup(backup, restoreMode);
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
    <section className="google-drive-backup-premium">
      <div className="backup-panel-header">
        <span className="orca-kicker">Google Drive</span>
        <h2>Backup Privado</h2>
        <p>Sincronize seus dados com o Google Drive para segurança e backup.</p>
      </div>

      {!isConfigured ? (
        <div className="backup-unavailable-card">
          <strong>Drive Indisponível</strong>
          <p>O backup no Drive requer configuração de ambiente.</p>
        </div>
      ) : (
        <div className="backup-actions-grid-premium">
          <div className="backup-status-card">
            <span>Status da Conexão</span>
            <strong>{accessToken ? 'Conectado' : 'Desconectado'}</strong>
            {!accessToken && <Button variant="secondary" onClick={connectDrive}>Conectar Google</Button>}
          </div>

          <div className="backup-main-actions">
            <Button variant="primary" disabled={!accessToken || isBusy} onClick={saveDriveBackup}>
              {isBusy ? 'Salvando...' : 'Fazer Backup Agora'}
            </Button>
            
            <div className="restore-area-premium">
              <Select label="Restauração" value={restoreMode} onChange={(value) => setRestoreMode(value as 'merge' | 'replace')}>
                <option value="merge">Mesclar dados</option>
                <option value="replace">Substituir tudo</option>
              </Select>
              
              {restoreMode === 'replace' && (
                <div className="replace-confirmation-field">
                  <input value={replaceConfirmation} placeholder="Digite SUBSTITUIR" onChange={(event) => setReplaceConfirmation(event.target.value)} />
                </div>
              )}
              
              <Button variant="ghost" disabled={!accessToken || isBusy} onClick={restoreDriveBackup}>
                Restaurar Backup
              </Button>
            </div>
          </div>
        </div>
      )}

      {driveBackup && (
        <div className="backup-last-info">
          <small>Último backup: {formatDriveDate(driveBackup.modifiedTime)} · {formatDriveSize(driveBackup.size)}</small>
        </div>
      )}

      {feedback && <div className="backup-feedback-message">{feedback}</div>}
      {canReload && <Button variant="primary" className="reload-btn" onClick={reloadAppNow}>Recarregar App</Button>}
    </section>
  );
}
