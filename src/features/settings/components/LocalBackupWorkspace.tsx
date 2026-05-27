import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
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
import { Button, Select } from '../../../app/components/ui';
import { AppSecurityPanel } from './AppSecurityPanel';
import { GoogleDriveBackupPanel } from './GoogleDriveBackupPanel';
import { ProfessionalProfileWorkspace } from './ProfessionalProfileWorkspace';
import './LocalBackupWorkspace.css';

export function LocalBackupWorkspace({ includeLinkedSettings = true }: { includeLinkedSettings?: boolean }) {
  const [backupText, setBackupText] = useState('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<AferixLocalBackup | null>(null);
  const [replaceConfirmation, setReplaceConfirmation] = useState('');
  const [canReload, setCanReload] = useState(false);
  
  const [summary, setSummary] = useState<AferixBackupSummary | null>(null);
  const [currentDataSummary, setCurrentDataSummary] = useState<AferixBackupDataSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const importDataSummary = importPreview ? summarizeAferixBackupData(importPreview) : [];

  async function refreshBackupText() {
    setFeedback('Gerando backup...');
    const backup = await collectAferixLocalBackup();
    setBackupText(stringifyAferixBackup(backup));
    setFeedback('Backup gerado na caixa de texto.');
  }

  async function copyBackup() {
    setFeedback('Copiando...');
    const backup = await collectAferixLocalBackup();
    const text = stringifyAferixBackup(backup);
    setBackupText(text);
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Backup copiado para a área de transferência.');
    } catch {
      setFeedback('Backup gerado. Se o navegador bloquear a cópia, selecione e copie manualmente.');
    }
  }

  async function downloadBackup() {
    setFeedback('Preparando arquivo...');
    const backup = await collectAferixLocalBackup();
    const text = stringifyAferixBackup(backup);
    downloadBackupFile(createBackupFilename(), text);
    setBackupText(text);
    setFeedback('Arquivo de backup gerado para download.');
  }

  function previewImport() {
    try {
      const parsed = parseAferixBackup(backupText);
      setImportPreview(parsed);
      const importedSummary = summarizeAferixBackup(parsed);
      setCanReload(false);
      setFeedback(`Backup válido: ${importedSummary.keyCount} tabelas, aproximadamente ${importedSummary.estimatedSizeKb} KB.`);
    } catch (error) {
      setImportPreview(null);
      setFeedback(error instanceof Error ? error.message : 'Falha ao ler o backup.');
    }
  }

  async function restoreImport() {
    try {
      setFeedback('Restaurando backup...');
      const parsed = importPreview ?? parseAferixBackup(backupText);
      if (restoreMode === 'replace' && replaceConfirmation.trim() !== 'SUBSTITUIR') {
        setFeedback('Isso substituirá os dados locais do Aferix neste navegador. Digite SUBSTITUIR para confirmar.');
        return;
      }
      const restoredCount = await restoreAferixBackup(parsed, restoreMode);
      setFeedback(`${restoredCount} tabelas restauradas. Recarregue o app para garantir que todas as telas leiam os dados atualizados.`);
      setImportPreview(parsed);
      setCanReload(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao restaurar o backup.');
    }
  }

  function reloadAppNow() {
    window.location.reload();
  }

  function handleFileImport(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setBackupText(result);
      try {
        const parsed = parseAferixBackup(result);
        setImportPreview(parsed);
        setFeedback(`Arquivo carregado: ${Object.keys(parsed.tables).length} tabelas encontradas.`);
      } catch (error) {
        setImportPreview(null);
        setFeedback(error instanceof Error ? error.message : 'Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  }

  if (isLoading) {
    return <div className="aferix-panel-card"><p>Carregando sistema de backup...</p></div>;
  }

  return (
    <>
      {includeLinkedSettings && (
        <>
          <AppSecurityPanel />
          <GoogleDriveBackupPanel />
          <ProfessionalProfileWorkspace />
        </>
      )}

      <div className="local-backup-workspace-premium">
      <div className="aferix-panel-card">
        <header>
          <div>
            <span className="aferix-kicker">Segurança</span>
            <h2>Exportar e Restaurar</h2>
            <p>Salve uma cópia local dos seus dados antes de trocar de dispositivo.</p>
            <small>{summary?.keyCount || 0} tabelas locais, aproximadamente {summary?.estimatedSizeKb || 0} KB.</small>
          </div>
        </header>
      </div>

      <div className="aferix-form-grid">
        <div className="aferix-panel-card">
          <header><div><h2>Exportar Dados</h2></div></header>
          <div className="dashboard-finance-tiles local-backup-summary-tiles">
            {currentDataSummary.slice(0, 3).map((item) => (
              <article className="finance-tile" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </article>
            ))}
          </div>
          <div className="local-backup-actions local-backup-actions-spaced">
            <Button variant="secondary" onClick={downloadBackup}>Download JSON</Button>
            <Button variant="ghost" onClick={copyBackup}>Copiar</Button>
            <Button variant="ghost" onClick={refreshBackupText}>Ver JSON</Button>
          </div>
        </div>

        <div className="aferix-panel-card">
          <header><div><h2>Restaurar Dados</h2></div></header>
          <div className="local-backup-restore-fields">
            <label className="budget-field wide">
              <span>Arquivo JSON</span>
              <input type="file" accept="application/json,.json" onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)} />
            </label>
            <Select label="Modo" value={restoreMode} onChange={(value) => setRestoreMode(value as 'merge' | 'replace')}>
              <option value="merge">Mesclar dados</option>
              <option value="replace">Substituir tudo</option>
            </Select>
            {restoreMode === 'replace' && (
              <label className="budget-field wide">
                <span>Confirmação</span>
                <input value={replaceConfirmation} placeholder="Digite SUBSTITUIR" onChange={(e) => setReplaceConfirmation(e.target.value)} />
              </label>
            )}
          </div>
          <div className="local-backup-actions local-backup-actions-padded">
            <Button variant="primary" onClick={restoreImport}>Restaurar Backup</Button>
            {canReload && <Button variant="secondary" onClick={reloadAppNow}>Recarregar App</Button>}
          </div>
        </div>
      </div>

      <div className="aferix-panel-card">
        <header><div><h2>Ferramentas Avançadas</h2></div></header>
        <div className="local-backup-advanced-body">
          <label className="local-backup-textarea">
            <span>Conteúdo do backup JSON</span>
            <textarea value={backupText} placeholder="Cole aqui um backup JSON do Aferix ou gere um backup para visualizar." onChange={(event) => setBackupText(event.target.value)} />
          </label>

          {importPreview && (
            <div className="local-backup-preview">
              <strong>Prévia do backup</strong>
              <small>Exportado em: {new Date(importPreview.exportedAt).toLocaleString('pt-BR')} · {Object.keys(importPreview.tables).length} tabelas</small>
              <div className="local-backup-summary-grid">
                {importDataSummary.map((item) => <span key={item.label}>{item.label}: <strong>{item.count}</strong></span>)}
              </div>
            </div>
          )}

          <div className="local-backup-actions">
            <Button variant="secondary" onClick={previewImport}>Validar JSON</Button>
            <Button variant="primary" onClick={restoreImport}>Restaurar JSON</Button>
          </div>

          <div className="local-backup-warning">
            <strong>Atenção</strong>
            <p>Dados locais podem ser perdidos se o navegador limpar cache. Exporte backup regularmente.</p>
          </div>
        </div>
      </div>

      {feedback && <div className="backup-feedback-message local-backup-feedback">{feedback}</div>}
    </div>
    </>
  );
}
