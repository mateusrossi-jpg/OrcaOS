import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  collectAferixLocalBackup,
  createBackupFilename,
  downloadBackupFile,
  parseAferixBackup,
  restoreAferixBackup,
  stringifyAferixBackup,
} from '../storage/localBackup';
import { ERPLoader } from '../../../app/components/ui';
import { SurfaceCard } from '../../../ui/system/Cards';
import { SectionLabel } from '../../../ui/system/Typography';
import { Download, Upload, AlertTriangle, Database } from 'lucide-react';
import { cn } from '../../../utils/ui';

/**
 * LocalBackupWorkspace: Executive local data management.
 * Redesigned for glassmorphic premium dark-mode standard.
 */
export function LocalBackupWorkspace({ includeLinkedSettings: _includeLinkedSettings = true }: { includeLinkedSettings?: boolean }) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadCurrentData() {
      try {
        await collectAferixLocalBackup();
      } catch (_err) {
        console.error('Failed to load backup summary:', _err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCurrentData();
  }, []);

  async function handleExport() {
    setIsExporting(true);
    try {
      setFeedback({ type: 'info', msg: 'Preparando backup...' });
      const backup = await collectAferixLocalBackup();
      const text = stringifyAferixBackup(backup);
      downloadBackupFile(createBackupFilename(), text);
      setFeedback({ type: 'success', msg: 'Backup exportado com sucesso.' });
    } catch {
      setFeedback({ type: 'error', msg: 'Falha ao exportar backup.' });
    } finally {
      setIsExporting(false);
    }
  }

  function handleFileImport(file: File | null) {
    if (!file) return;
    setIsRestoring(true);
    setFeedback({ type: 'info', msg: 'Lendo arquivo de backup...' });
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const parsed = parseAferixBackup(result);
        const restoredCount = await restoreAferixBackup(parsed, 'replace');
        setFeedback({ type: 'success', msg: `Restauradas ${restoredCount} tabelas. Recarregando em 2s...` });
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        setFeedback({ type: 'error', msg: error instanceof Error ? error.message : 'Arquivo inválido.' });
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  }

  if (isLoading) {
    return <ERPLoader message="Carregando sistema de backup..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* EXPORT */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
            <Database size={16} />
          </div>
          <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.25em]">Backup Offline</SectionLabel>
        </div>
        <p className="text-[12px] text-white/30 leading-relaxed mb-6">
          Proteja seus dados exportando uma cópia local para o seu dispositivo.
        </p>
        <button
          onClick={handleExport}
          disabled={isRestoring || isExporting}
          className="w-full h-14 bg-[#D4AF37] text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(212,169,74,0.2)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <Download size={16} />
          {isExporting ? 'Exportando...' : 'Exportar Base de Dados'}
        </button>
      </SurfaceCard>

      {/* RESTORE */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Upload size={16} />
          </div>
          <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.25em]">Restauração</SectionLabel>
        </div>
        <p className="text-[12px] text-white/30 leading-relaxed mb-4">
          Importe um arquivo de backup anterior para recuperar o estado completo do sistema.
        </p>

        {/* WARNING */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/[0.06] border border-red-500/15 mb-5">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-black text-red-400 uppercase tracking-wider">Ação Irreversível</span>
            <span className="text-[11px] text-white/30 leading-snug">
              Restaurar um backup substituirá todos os dados atuais deste dispositivo.
            </span>
          </div>
        </div>

        <label className={cn(
          "w-full h-14 rounded-2xl border text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] transition-all",
          isRestoring
            ? "bg-white/[0.02] border-white/[0.05] text-white/20 cursor-not-allowed pointer-events-none"
            : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]"
        )}>
          <Upload size={16} />
          {isRestoring ? 'Processando...' : 'Importar Arquivo .JSON'}
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            disabled={isRestoring}
            onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)}
          />
        </label>
      </SurfaceCard>

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
    </div>
  );
}
