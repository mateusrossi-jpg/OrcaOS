import { useEffect, useState } from 'react';
import {
  collectAferixLocalBackup,
  createBackupFilename,
  downloadBackupFile,
  parseAferixBackup,
  restoreAferixBackup,
  stringifyAferixBackup,
} from '../storage/localBackup';
import { 
  PrimaryButton, 
  Card, 
  ContextBanner, 
  SectionLabel, 
  ERPLoader 
} from '../../../app/components/ui';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import './LocalBackupWorkspace.css';

/**
 * LocalBackupWorkspace: Executive local data management.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function LocalBackupWorkspace({ includeLinkedSettings: _includeLinkedSettings = true }: { includeLinkedSettings?: boolean }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    async function loadCurrentData() {
      try {
        await collectAferixLocalBackup();
      } catch ( _err ) {
        console.error('Failed to load backup summary:', _err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCurrentData();
  }, []);

  async function handleExport() {
    try {
      setFeedback('Preparando backup...');
      const backup = await collectAferixLocalBackup();
      const text = stringifyAferixBackup(backup);
      downloadBackupFile(createBackupFilename(), text);
      setFeedback('Backup exportado com sucesso.');
    } catch {
      setFeedback('Falha ao exportar backup.');
    }
  }

  function handleFileImport(file: File | null) {
    if (!file) return;
    setIsRestoring(true);
    setFeedback('Lendo arquivo de backup...');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const parsed = parseAferixBackup(result);
        const restoredCount = await restoreAferixBackup(parsed, 'replace');
        setFeedback(`Restauradas ${restoredCount} tabelas com sucesso. Recarregando app em 2s...`);
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Arquivo inválido.');
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  }

  if (isLoading) {
    return <ERPLoader message="Carregando sistema de backup..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-8">
        <SectionLabel className="mt-0 mb-6">Backup Offline</SectionLabel>
        <p className="text-[var(--fs-base)] font-medium text-[var(--text-secondary)] leading-relaxed mb-8">
          Proteja seus dados do ERP exportando uma cópia criptografada localmente para o seu dispositivo.
        </p>

        <PrimaryButton 
          onClick={handleExport} 
          disabled={isRestoring} 
          className="w-full h-16"
        >
          <Download className="h-5 w-5" /> Exportar Base de Dados
        </PrimaryButton>
      </Card>

      <Card className="p-8">
        <SectionLabel className="mt-0 mb-6">Restauração</SectionLabel>
        <p className="text-[var(--fs-base)] font-medium text-[var(--text-secondary)] leading-relaxed mb-6">
          Importe um arquivo de backup anterior para recuperar o estado completo do sistema.
        </p>
        
        <ContextBanner
          title="Ação Irreversível"
          meta="Restaurar um backup substituirá todos os dados atuais deste dispositivo."
          icon={<AlertTriangle className="h-5 w-5" />}
          className="mb-8"
        />

        <label className="min-h-[64px] rounded-[var(--radius-button)] px-6 text-[14.5px] font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-3 bg-[var(--bg-surface-glass)] border var(--border-soft) text-[var(--text-primary)] hover:bg-white/[0.08] cursor-pointer">
          <Upload className="h-5 w-5 opacity-60" />
          {isRestoring ? 'Processando Restauração...' : 'Importar Arquivo .JSON'}
          <input 
            type="file" 
            accept="application/json,.json" 
            className="hidden"
            disabled={isRestoring}
            onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)} 
          />
        </label>
      </Card>

      {feedback && (
        <div className="p-6 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-center animate-in fade-in">
          <strong className="text-[var(--accent-gold)] font-bold text-[14px]">{feedback}</strong>
        </div>
      )}
    </div>
  );
}
