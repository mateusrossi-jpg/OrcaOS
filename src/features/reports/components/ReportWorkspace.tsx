import type { CalculationCapture } from '../../../core/types/workflow';
import './ReportWorkspace.css';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function itemTypeLabel(itemType: CalculationCapture['itemType']): string {
  if (itemType === 'diagnostic') return 'Diagnóstico';
  if (itemType === 'service') return 'Serviço';
  if (itemType === 'material') return 'Material';
  if (itemType === 'projectSpecification') return 'Especificação';
  return 'Observação técnica';
}

function printReport() {
  window.print();
}

export function ReportWorkspace({ captures }: ReportWorkspaceProps) {
  const reportItems = captures.filter(
    (capture) =>
      capture.reportReady ||
      capture.destination === 'survey' ||
      capture.destination === 'both' ||
      capture.itemType === 'diagnostic' ||
      capture.itemType === 'projectSpecification',
  );

  const itemsWithImage = reportItems.filter((capture) => Boolean(capture.imageDataUrl)).length;
  const diagnostics = reportItems.filter((capture) => capture.itemType === 'diagnostic').length;

  return (
    <div className="report-workspace">
      <section className="report-summary-panel no-print">
        <div>
          <h2>Relatório técnico</h2>
          <p>Use os itens do levantamento, diagnósticos, observações e fotos para montar uma prévia técnica para o cliente.</p>
        </div>
        <button className="primary-action inline-action" type="button" onClick={printReport} disabled={reportItems.length === 0}>
          Imprimir / salvar PDF
        </button>
      </section>

      <div className="report-metrics-grid no-print">
        <article><span>Itens no relatório</span><strong>{reportItems.length}</strong></article>
        <article><span>Com imagem</span><strong>{itemsWithImage}</strong></article>
        <article><span>Diagnósticos</span><strong>{diagnostics}</strong></article>
      </div>

      <article className="report-document">
        <header className="report-document-header">
          <span>OrçaOS</span>
          <h1>Relatório técnico de visita</h1>
          <p>Documento preliminar gerado a partir do levantamento técnico em campo.</p>
          <small>Emitido em {formatDateTime(new Date().toISOString())}</small>
        </header>

        {reportItems.length === 0 ? (
          <section className="report-empty-state">
            <strong>Nenhum item técnico para relatório ainda.</strong>
            <p>Crie blocos manuais no Levantamento com destino “Levantamento” ou “Levantamento e orçamento”, ou envie diagnósticos e observações dos cálculos.</p>
          </section>
        ) : (
          <section className="report-item-list">
            {reportItems.map((capture, index) => (
              <article className="report-item-card" key={capture.id}>
                <div className="report-item-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="report-item-content">
                  <header>
                    <span>{itemTypeLabel(capture.itemType)}</span>
                    <h2>{capture.editableDescription || capture.summary}</h2>
                    <small>{capture.moduleLabel} · {capture.calculatorLabel} · {formatDateTime(capture.createdAt)}</small>
                  </header>

                  {capture.imageDataUrl && (
                    <figure className="report-item-image">
                      <img src={capture.imageDataUrl} alt={`Imagem de ${capture.editableDescription || capture.summary}`} />
                    </figure>
                  )}

                  {capture.technicalNote && <p className="report-technical-note">{capture.technicalNote}</p>}

                  <ul>
                    {capture.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="report-document-footer">
          <p>Este relatório é uma base técnica preliminar e deve ser validado pelo profissional responsável antes de entrega final ao cliente.</p>
          <div className="signature-line">Responsável técnico / aceite</div>
        </footer>
      </article>
    </div>
  );
}
