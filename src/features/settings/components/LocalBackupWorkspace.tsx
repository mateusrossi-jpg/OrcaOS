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
          <ProfessionalProfileWorkspace />
          <AppSecurityPanel />
          <GoogleDriveBackupPanel />
        </>
      )}

      <section className="local-backup-workspace">
        <div className="local-backup-header">
          <div>
            <span className="orca-kicker">Backup local</span>
            <h2>Exportar e restaurar dados do Aferix</h2>
            <p>Salve uma cópia dos dados locais do app antes de trocar de navegador, limpar cache ou testar grandes mudanças.</p>
          </div>
          <strong>{summary.keyCount} grupo(s) · {summary.estimatedSizeKb} KB</strong>
        </div>

        <div className="local-backup-grid">
          <article className="local-backup-card">
            <div className="local-card-heading">
              <strong>Exportar backup</strong>
              <small>Gera um JSON com clientes, atendimentos, orçamentos, cálculos, catálogo, fornecedores, compras, estoque, perfil profissional e configurações salvas localmente.</small>
            </div>
            <div className="local-backup-summary-grid">
              {currentDataSummary.map((item) => <span key={item.label}>{item.label}: <strong>{item.count}</strong></span>)}
            </div>
            <div className="local-backup-actions">
              <button className="primary-action inline-action" type="button" onClick={downloadBackup}>Baixar JSON</button>
              <button className="secondary-action inline-action" type="button" onClick={copyBackup}>Copiar backup</button>
              <button className="secondary-action inline-action" type="button" onClick={refreshBackupText}>Gerar na caixa</button>
            </div>
          </article>

          <article className="local-backup-card">
            <div className="local-card-heading">
              <strong>Restaurar backup</strong>
              <small>Importe um JSON do Aferix. Mesclar mantém dados atuais; substituir apaga dados locais do Aferix antes de restaurar.</small>
            </div>
            <label className="local-backup-file">
              <span>Arquivo JSON</span>
              <input type="file" accept="application/json,.json" onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)} />
            </label>
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
              <button className="secondary-action inline-action" type="button" onClick={previewImport}>Verificar backup</button>
              <button className="primary-action inline-action" type="button" onClick={restoreImport}>Restaurar</button>
              {canReload && <button className="secondary-action inline-action" type="button" onClick={reloadAppNow}>Recarregar app agora</button>}
            </div>
          </article>
        </div>

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
          <p>Dados locais podem ser perdidos se o navegador limpar cache. Exporte backup regularmente. Fotos grandes e arquivos externos podem precisar de estratégia própria no futuro.</p>
        </div>

        {feedback && <div className="guided-cart-feedback">{feedback}</div>}
      </section>
    </>
  );
}
