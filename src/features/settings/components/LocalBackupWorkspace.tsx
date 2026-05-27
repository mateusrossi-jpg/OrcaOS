import { useEffect, useState } from 'react';
import {
  collectAferixLocalBackup,
  createBackupFilename,
  downloadBackupFile,
  parseAferixBackup,
  restoreAferixBackup,
  stringifyAferixBackup,
  summarizeAferixBackup,
  summarizeAferixBackupData,
  type AferixLocalBackup,
  type AferixBackupSummary,
  type AferixBackupDataSummaryItem
} from '../storage/localBackup';
import { PrimaryButton, SecondaryButton, DangerButton, PanelCard, ContextBanner } from '../../../app/components/ui';
import './LocalBackupWorkspace.css';

export function LocalBackupWorkspace({ includeLinkedSettings = true }: { includeLinkedSettings?: boolean }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [summary, setSummary] = useState<AferixBackupSummary | null>(null);
  const [currentDataSummary, setCurrentDataSummary] = useState<AferixBackupDataSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    async function loadCurrentData() {
      try {
        const backup = await collectAferixLocalBackup();
        setSummary(summarizeAferixBackup(backup));
        setCurrentDataSummary(summarizeAferixBackupData(backup));
      } catch (err) {
        console.error('Failed to load backup summary:', err);
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
    } catch (err) {
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
    return <div className="aferix-panel-card"><p>Carregando sistema de backup...</p></div>;
  }

  return (
    <div className="local-backup-workspace-premium aferix-d-flex aferix-flex-column aferix-gap-md">
      <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-md" style={{ padding: '24px' }}>
        <div>
          <h2 className="aferix-font-xl aferix-font-bold">Offline Backup</h2>
          <p className="aferix-text-muted">Proteja seus dados do ERP exportando localmente para o seu dispositivo.</p>
        </div>

        <div className="aferix-mt-sm">
          <PrimaryButton onClick={handleExport} disabled={isRestoring} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
            Exportar Backup de Segurança
          </PrimaryButton>
        </div>
      </PanelCard>

      <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-md" style={{ padding: '24px' }}>
        <div>
          <h2 className="aferix-font-lg aferix-font-bold">Restauração</h2>
          <p className="aferix-text-muted">Importe um arquivo JSON para restaurar seu ERP.</p>
        </div>
        
        <ContextBanner
          title="Atenção: Ação Irreversível"
          meta="Restaurar um backup substituirá todos os dados atuais deste dispositivo."
          icon={<span className="nav-icon">⚠️</span>}
        />

        <div className="aferix-mt-sm">
          <label className="aferix-button aferix-button-secondary" style={{ width: '100%', textAlign: 'center', display: 'block', cursor: 'pointer', padding: '12px' }}>
            {isRestoring ? 'Restaurando...' : 'Restaurar Backup (JSON)'}
            <input 
              type="file" 
              accept="application/json,.json" 
              style={{ display: 'none' }} 
              disabled={isRestoring}
              onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)} 
            />
          </label>
        </div>
      </PanelCard>

      {feedback && (
        <div className="aferix-card-warning" style={{ textAlign: 'center', padding: '16px' }}>
          <strong>{feedback}</strong>
        </div>
      )}
    </div>
  );
}
