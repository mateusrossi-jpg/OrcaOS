import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { getReportCaptureMetrics } from '../../workflow/utils/captureWorkflow';
import { loadBusinessProfile } from '../../budgets/storage/businessProfileStorage';
import { ProfessionalIdentityCard } from '../../settings/components/ProfessionalIdentityCard';
import './ReportWorkspace.css';

interface ReportWorkspaceProps {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
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

function formatOptionalDateTime(value?: string): string {
  if (!value) return 'Sem data agendada';
  return formatDateTime(value);
}

function statusLabel(status?: WorkOrder['status']): string {
  if (!status) return 'Sem status';
  const labels: Record<WorkOrder['status'], string> = {
    open: 'Aberta',
    scheduled: 'Agendada',
    'in-progress': 'Em execução',
    done: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status];
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

export function ReportWorkspace({ captures, activeClient = null, activeWorkOrder = null }: ReportWorkspaceProps) {
  const { reportItems, itemsWithImage, diagnostics } = getReportCaptureMetrics(captures);
  const businessProfile = loadBusinessProfile();
  const profileName = businessProfile.businessName || businessProfile.responsibleName || 'OrçaOS';
  const contactLine = [businessProfile.phone, businessProfile.email].filter(Boolean).join(' · ');
  const logoSource = businessProfile.logoDataUrl || businessProfile.logoUrl;

  return (
    <div className="report-workspace">
      <ProfessionalIdentityCard contextLabel="Identidade do relatório" />

      <section className="report-summary-panel no-print">
        <div>
          <span className="orca-kicker">Prévia do documento</span>
          <h2>Relatório técnico</h2>
          <p>Revise os itens técnicos, confirme o cliente/OS ativa e só então imprima ou salve em PDF.</p>
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
          <div className="report-company-row">
            {logoSource ? <img src={logoSource} alt={`Logo ${profileName}`} /> : <span>OrçaOS</span>}
            <div>
              <strong>{profileName}</strong>
              {businessProfile.documentNumber && <small>{businessProfile.documentNumber}</small>}
              {contactLine && <small>{contactLine}</small>}
              {businessProfile.address && <small>{businessProfile.address}</small>}
            </div>
          </div>
          <h1>{activeWorkOrder?.title || 'Relatório técnico de visita'}</h1>
          <p>{activeWorkOrder?.description || 'Documento preliminar gerado a partir dos registros técnicos de campo.'}</p>
          <small>Emitido em {formatDateTime(new Date().toISOString())}</small>
        </header>

        {(activeClient || activeWorkOrder) && (
          <section className="report-context-box">
            <div><span>Cliente</span><strong>{activeClient?.name ?? 'Cliente não vinculado'}</strong></div>
            <div><span>Contato</span><strong>{[activeClient?.phone, activeClient?.email].filter(Boolean).join(' · ') || 'Não informado'}</strong></div>
            <div><span>Endereço</span><strong>{activeWorkOrder?.address || activeClient?.address || 'Não informado'}</strong></div>
            <div><span>Status / data</span><strong>{statusLabel(activeWorkOrder?.status)} · {formatOptionalDateTime(activeWorkOrder?.scheduledDate)}</strong></div>
          </section>
        )}

        {reportItems.length === 0 ? (
          <section className="report-empty-state">
            <strong>Nenhum item técnico para relatório ainda.</strong>
            <p>Crie blocos manuais no Campo com destino “Campo” ou “Campo e orçamento”, ou envie diagnósticos e observações dos cálculos.</p>
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
