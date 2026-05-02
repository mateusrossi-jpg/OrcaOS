import { useMemo, useState } from 'react';
import {
  collectOrcaLocalBackup,
  createBackupFilename,
  downloadBackupFile,
  parseOrcaBackup,
  restoreOrcaBackup,
  stringifyOrcaBackup,
  summarizeOrcaBackup,
  type OrcaLocalBackup,
} from '../storage/localBackup';
import { GoogleDriveBackupPanel } from './GoogleDriveBackupPanel';
import { ProfessionalProfileWorkspace } from './ProfessionalProfileWorkspace';
import './LocalBackupWorkspace.css';

export function LocalBackupWorkspace() {
  const [backupText, setBackupText] = useState('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<OrcaLocalBackup | null>(null);
  const currentBackup = useMemo(() => collectOrcaLocalBackup(), []);
  const summary = summarizeOrcaBackup(currentBackup);

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
      setFeedback(`Backup válido: ${importedSummary.keyCount} grupo(s) de dados, aproximadamente ${importedSummary.estimatedSizeKb} KB.`);
    } catch (error) {
      setImportPreview(null);
      setFeedback(error instanceof Error ? error.message : 'Não foi possível ler o backup.');
    }
  }

  function restoreImport() {
    try {
      const parsed = importPreview ?? parseOrcaBackup(backupText);
      const restoredCount = restoreOrcaBackup(parsed, restoreMode);
      setFeedback(`${restoredCount} grupo(s) restaurado(s). Recarregue o app para garantir que todas as telas leiam os dados atualizados.`);
      setImportPreview(parsed);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível restaurar o backup.');
    }
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
      <ProfessionalProfileWorkspace />
      <GoogleDriveBackupPanel />

      <section className="local-backup-workspace">
        <div className="local-backup-header">
          <div>
            <span className="orca-kicker">Backup local</span>
            <h2>Exportar e restaurar dados do OrçaOS</h2>
            <p>Salve uma cópia dos dados locais do app antes de trocar de navegador, limpar cache ou testar grandes mudanças.</p>
          </div>
          <strong>{summary.keyCount} grupo(s) · {summary.estimatedSizeKb} KB</strong>
        </div>

        <div className="local-backup-grid">
          <article className="local-backup-card">
            <strong>Exportar backup</strong>
            <small>Gera um JSON com clientes, OS, cálculos, catálogo, fornecedores, compras, estoque, perfil profissional e configurações salvas localmente.</small>
            <div className="local-backup-actions">
              <button className="primary-action inline-action" type="button" onClick={downloadBackup}>Baixar JSON</button>
              <button className="secondary-action inline-action" type="button" onClick={copyBackup}>Copiar backup</button>
              <button className="secondary-action inline-action" type="button" onClick={refreshBackupText}>Gerar na caixa</button>
            </div>
          </article>

          <article className="local-backup-card">
            <strong>Restaurar backup</strong>
            <small>Importe um JSON do OrçaOS. Mesclar mantém dados atuais; substituir apaga dados locais do OrçaOS antes de restaurar.</small>
            <label className="local-backup-file">
              <span>Arquivo JSON</span>
              <input type="file" accept="application/json,.json" onChange={(event) => handleFileImport(event.target.files?.[0] ?? null)} />
            </label>
            <label className="local-backup-file">
              <span>Modo de restauração</span>
              <select value={restoreMode} onChange={(event) => setRestoreMode(event.target.value as 'merge' | 'replace')}>
                <option value="merge">Mesclar com dados atuais</option>
                <option value="replace">Substituir dados locais do OrçaOS</option>
              </select>
            </label>
            <div className="local-backup-actions">
              <button className="secondary-action inline-action" type="button" onClick={previewImport}>Verificar backup</button>
              <button className="primary-action inline-action" type="button" onClick={restoreImport}>Restaurar</button>
            </div>
          </article>
        </div>

        <label className="local-backup-textarea">
          <span>Conteúdo do backup JSON</span>
          <textarea value={backupText} placeholder="Cole aqui um backup JSON do OrçaOS ou gere um backup para visualizar." onChange={(event) => setBackupText(event.target.value)} />
        </label>

        {importPreview && (
          <div className="local-backup-preview">
            <strong>Prévia do backup</strong>
            <small>Exportado em: {new Date(importPreview.exportedAt).toLocaleString('pt-BR')} · {Object.keys(importPreview.keys).length} grupo(s)</small>
            <ul>
              {Object.keys(importPreview.keys).slice(0, 12).map((key) => <li key={key}>{key}</li>)}
            </ul>
          </div>
        )}

        <div className="local-backup-warning">
          <strong>Atenção</strong>
          <p>Este backup salva apenas os dados locais deste navegador/dispositivo. Fotos grandes e arquivos externos podem precisar de estratégia própria no futuro.</p>
        </div>

        {feedback && <div className="guided-cart-feedback">{feedback}</div>}
      </section>
    </>
  );
}
