import { useMemo, useState } from 'react';
import {
  collectOrcaLocalBackup,
  createBackupFilename,
  downloadBackupFile,
  parseOrcaBackup,
  restoreOrcaBackup,
  stringifyOrcaBackup,
  summarizeOrcaBackup,
  summarizeOrcaBackupData,
  type OrcaLocalBackup,
} from '../storage/localBackup';
import { AppSecurityPanel } from './AppSecurityPanel';
import { GoogleDriveBackupPanel } from './GoogleDriveBackupPanel';
import { ProfessionalProfileWorkspace } from './ProfessionalProfileWorkspace';
import './LocalBackupWorkspace.css';

export function LocalBackupWorkspace({ includeLinkedSettings = true }: { includeLinkedSettings?: boolean }) {
  const [backupText, setBackupText] = useState('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<OrcaLocalBackup | null>(null);
  const [replaceConfirmation, setReplaceConfirmation] = useState('');
  const [canReload, setCanReload] = useState(false);
  const currentBackup = useMemo(() => collectOrcaLocalBackup(), []);
  const summary = summarizeOrcaBackup(currentBackup);
  const currentDataSummary = summarizeOrcaBackupData(currentBackup);
  const importDataSummary = importPreview ? summarizeOrcaBackupData(importPreview) : [];

  function refreshBackupText() {
    setBackupText(stringifyOrcaBackup(collectOrcaLocalBackup()));
    setFeedback('Backup gerado na caixa de texto.');
  }

  async function copyBackup() {
    const text = stringifyOrcaBackup(collectOrcaLocalBackup());
    setBackupText(text);
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Backup copiado para a área de transferência.');
    } catch {
      setFeedback('Backup gerado. Se o navegador bloquear a cópia, selecione e copie manualmente.');
    }
  }

  function downloadBackup() {
    const text = stringifyOrcaBackup(collectOrcaLocalBackup());
    downloadBackupFile(createBackupFilename(), text);
    setBackupText(text);
    setFeedback('Arquivo de backup gerado para download.');
  }

  function previewImport() {
    try {
      const parsed = parseOrcaBackup(backupText);
      setImportPreview(parsed);
      const importedSummary = summarizeOrcaBackup(parsed);
      setCanReload(false);
      setFeedback(`Backup válido: ${importedSummary.keyCount} grupo(s) de dados, aproximadamente ${importedSummary.estimatedSizeKb} KB.`);
    } catch (error) {
      setImportPreview(null);
      setFeedback(error instanceof Error ? error.message : 'Não foi possível ler o backup.');
    }
  }

  function restoreImport() {
    try {
      const parsed = importPreview ?? parseOrcaBackup(backupText);
      if (restoreMode === 'replace' && replaceConfirmation.trim() !== 'SUBSTITUIR') {
        setFeedback('Isso substituirá os dados locais do Aferix neste navegador. Digite SUBSTITUIR para confirmar.');
        return;
      }
      const restoredCount = restoreOrcaBackup(parsed, restoreMode);
      setFeedback(`${restoredCount} grupo(s) restaurado(s). Recarregue o app para garantir que todas as telas leiam os dados atualizados.`);
      setImportPreview(parsed);
      setCanReload(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível restaurar o backup.');
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
        const parsed = parseOrcaBackup(result);
        setImportPreview(parsed);
        setFeedback(`Arquivo carregado: ${Object.keys(parsed.keys).length} grupo(s) de dados encontrados.`);
      } catch (error) {
        setImportPreview(null);
        setFeedback(error instanceof Error ? error.message : 'Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      {includeLinkedSettings && (
        <>
          <AppSecurityPanel />
          <GoogleDriveBackupPanel />
        </>
      )}

      <div className="orca-panel-card">
        <header>
          <div>
            <span className="orca-kicker">Segurança</span>
            <h2>Exportar e Restaurar</h2>
            <p>Salve uma cópia local dos seus dados antes de trocar de dispositivo.</p>
          </div>
        </header>
      </div>

      <div className="orca-panel-card">
        <header>
          <div>
            <h2>Exportar Dados</h2>
          </div>
        </header>
        <div className="dashboard-finance-tiles" style={{ padding: '1rem' }}>
          {currentDataSummary.slice(0, 3).map((item) => (
            <article className="finance-tile" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </article>
          ))}
        </div>
        <div className="local-backup-actions" style={{ padding: '0 1.5rem 1.5rem' }}>
          <button className="ghost-action" type="button" onClick={downloadBackup}>Download JSON</button>
          <button className="ghost-action" type="button" onClick={copyBackup}>Copiar</button>
        </div>
      </div>

      <div className="orca-panel-card">
        <header>
          <div>
            <h2>Restaurar Dados</h2>
          </div>
        </header>
        <div className="professional-profile-grid" style={{ padding: '1.5rem' }}>
          <label className="budget-field wide">
            <span>Arquivo JSON</span>
            <input type="file" accept="application/json,.json" onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)} />
          </label>
          <label className="budget-field wide">
            <span>Modo</span>
            <select value={restoreMode} onChange={(event) => setRestoreMode(event.target.value as 'merge' | 'replace')}>
              <option value="merge">Mesclar dados</option>
              <option value="replace">Substituir tudo</option>
            </select>
          </label>
        </div>
        <div className="local-backup-actions" style={{ padding: '0 1.5rem 1.5rem' }}>
          <button className="ghost-action" type="button" onClick={restoreImport}>Restaurar</button>
          {canReload && <button className="ghost-action" type="button" onClick={reloadAppNow}>Recarregar App</button>}
        </div>
      </div>
      <div className="orca-panel-card">
        <header>
          <div>
            <h2>Ferramentas Avançadas</h2>
          </div>
        </header>
        <div style={{ padding: '1.5rem' }}>
          <label className="local-backup-textarea">
            <span>Conteúdo do backup JSON</span>
            <textarea value={backupText} placeholder="Cole aqui um backup JSON do Aferix ou gere um backup para visualizar." onChange={(event) => setBackupText(event.target.value)} />
          </label>

          {importPreview && (
            <div className="local-backup-preview">
              <strong>Prévia do backup</strong>
              <small>Exportado em: {new Date(importPreview.exportedAt).toLocaleString('pt-BR')} · {Object.keys(importPreview.keys).length} grupo(s)</small>
              <div className="local-backup-summary-grid">
                {importDataSummary.map((item) => <span key={item.label}>{item.label}: <strong>{item.count}</strong></span>)}
              </div>
              <ul>
                {Object.keys(importPreview.keys).slice(0, 12).map((key) => <li key={key}>{key}</li>)}
              </ul>
            </div>
          )}

          <div className="local-backup-warning">
            <strong>Atenção</strong>
            <p>Dados locais podem ser perdidos se o navegador limpar cache. Exporte backup regularmente.</p>
          </div>

          {feedback && <div className="guided-cart-feedback">{feedback}</div>}
        </div>
      </div>
    </>
  );
}
