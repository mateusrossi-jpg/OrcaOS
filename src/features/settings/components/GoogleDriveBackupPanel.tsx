import { useState } from 'react';
import { GlassInput, GlassSelect } from '../../../ui/system/GlassForms';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import {
  collectAferixLocalBackup,
  restoreAferixBackup,
  summarizeAferixBackup,
} from '../storage/localBackup';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import {
  findGoogleDriveBackup,
  isGoogleDriveBackupConfigured,
  loadBackupFromGoogleDrive,
  requestGoogleDriveAccessToken,
  saveBackupToGoogleDrive,
  type GoogleDriveBackupMetadata,
} from '../storage/googleDriveBackup';
import { SurfaceCard } from '../../../ui/system/Cards';
import { SectionLabel } from '../../../ui/system/Typography';
import { HardDrive, Cloud, RefreshCw, UploadCloud, DownloadCloud, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../../utils/ui';

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
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
      setFeedback({
        type: 'success',
        msg: backup
          ? `Conectado. Último backup: ${formatDriveDate(backup.modifiedTime)}.`
          : 'Conectado. Nenhum backup encontrado ainda.'
      });
    } catch (error) {
      setFeedback({ type: 'error', msg: error instanceof Error ? error.message : 'Falha ao conectar.' });
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
      const localBackup = await collectAferixLocalBackup();
      const summary = summarizeAferixBackup(localBackup);
      const saved = await saveBackupToGoogleDrive(token, localBackup);
      setDriveBackup(saved);
      setFeedback({
        type: 'success',
        msg: `Backup salvo: ${summary.keyCount} grupo(s), ≈${summary.estimatedSizeKb} KB.`
      });
    } catch (error) {
      setFeedback({ type: 'error', msg: error instanceof Error ? error.message : 'Falha ao salvar no Drive.' });
    } finally {
      setIsBusy(false);
    }
  }

  async function restoreDriveBackup() {
    if (restoreMode === 'replace' && replaceConfirmation.trim() !== 'SUBSTITUIR') {
      setFeedback({ type: 'error', msg: 'Digite SUBSTITUIR para confirmar a substituição de dados.' });
      return;
    }
    setIsBusy(true);
    try {
      const token = await ensureToken();
      const backup = await loadBackupFromGoogleDrive(token);
      const restoredCount = restoreAferixBackup(backup, restoreMode);
      setDriveBackup(await findGoogleDriveBackup(token));
      setFeedback({ type: 'success', msg: `${restoredCount} grupo(s) restaurado(s). Recarregue para aplicar.` });
      setCanReload(true);
    } catch (error) {
      setFeedback({ type: 'error', msg: error instanceof Error ? error.message : 'Falha ao restaurar do Drive.' });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {!isConfigured ? (
        <SurfaceCard padding="lg" className="opacity-50 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/20">
              <HardDrive size={16} />
            </div>
            <div>
              <span className="text-[13px] font-black text-white/30 uppercase tracking-tight block">Google Drive Backup</span>
              <span className="text-[11px] text-white/20">Indisponível — Configuração de ambiente necessária</span>
            </div>
          </div>
        </SurfaceCard>
      ) : (
        <>
          {/* CONNECTION STATUS */}
          <SurfaceCard padding="lg" className="shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className={cn(
                "w-9 h-9 rounded-xl border flex items-center justify-center",
                accessToken
                  ? "bg-[#47C46A]/10 border-[#47C46A]/20 text-[#47C46A]"
                  : "bg-white/[0.04] border-white/[0.07] text-white/30"
              )}>
                {accessToken ? <Wifi size={16} /> : <WifiOff size={16} />}
              </div>
              <div>
                <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.25em]">Google Drive</SectionLabel>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  accessToken ? "text-[#47C46A]" : "text-white/25"
                )}>
                  {accessToken ? "CONECTADO" : "DESCONECTADO"}
                </span>
              </div>
            </div>

            {driveBackup && (
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 mb-4">
                <span className="text-[9px] font-bold text-white/25 uppercase block mb-1">Último Backup</span>
                <span className="text-[12px] font-black text-white/60">
                  {formatDriveDate(driveBackup.modifiedTime)} · {formatDriveSize(driveBackup.size)}
                </span>
              </div>
            )}

            {!accessToken ? (
              <button
                disabled={isBusy}
                onClick={connectDrive}
                className="w-full h-12 bg-white/[0.04] border border-white/[0.08] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                <Cloud size={14} />
                Conectar Google Drive
              </button>
            ) : (
              <button
                disabled={isBusy}
                onClick={saveDriveBackup}
                className="w-full h-12 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(212,169,74,0.2)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                <UploadCloud size={14} />
                {isBusy ? 'Salvando...' : 'Fazer Backup Agora'}
              </button>
            )}
          </SurfaceCard>

          {/* RESTORE */}
          {accessToken && (
            <SurfaceCard padding="lg" className="shadow-2xl">
              <SectionLabel className="mb-5 opacity-40 uppercase tracking-[0.25em]">Restauração</SectionLabel>
              <div className="flex flex-col gap-4">
                <GlassSelect
                  label="Modo de Restauração"
                  value={restoreMode}
                  onChange={e => setRestoreMode(e.target.value as 'merge' | 'replace')}
                >
                  <option value="merge">Mesclar dados</option>
                  <option value="replace">Substituir tudo</option>
                </GlassSelect>

                {restoreMode === 'replace' && (
                  <GlassInput
                    label="Confirmação"
                    value={replaceConfirmation}
                    placeholder="Digite SUBSTITUIR"
                    onChange={e => setReplaceConfirmation(e.target.value)}
                    error={replaceConfirmation && replaceConfirmation !== 'SUBSTITUIR' ? 'Digite exatamente SUBSTITUIR' : undefined}
                  />
                )}

                <button
                  disabled={isBusy}
                  onClick={restoreDriveBackup}
                  className="w-full h-12 bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  <DownloadCloud size={14} />
                  Restaurar Backup
                </button>
              </div>
            </SurfaceCard>
          )}
        </>
      )}

      {/* FEEDBACK */}
      {feedback && (
        <div className={cn(
          "p-4 rounded-2xl text-[12px] font-bold text-center border animate-in fade-in",
          feedback.type === 'success'
            ? "bg-[#47C46A]/10 border-[#47C46A]/20 text-[#47C46A]"
            : feedback.type === 'error'
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
        )}>
          {feedback.msg}
        </div>
      )}

      {/* RELOAD */}
      {canReload && (
        <button
          onClick={() => window.location.reload()}
          className="w-full h-12 bg-[#47C46A] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(53,199,89,0.3)] active:scale-[0.98] transition-all"
        >
          <RefreshCw size={14} />
          Recarregar App
        </button>
      )}
    </div>
  );
}
