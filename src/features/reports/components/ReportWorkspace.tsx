import type { Client, ReportTemplateId, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { getReportCaptureMetrics, isClientPurchaseMaterial } from '../../workflow/utils/captureWorkflow';
import { loadBusinessProfile } from '../../budgets/storage/businessProfileStorage';
import { loadSavedBudgets } from '../../budgets/storage/savedBudgetsStorage';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import type { Budget } from '../../../core/types/business';
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
    open: 'Em orçamento',
    scheduled: 'Agendada',
    'in-progress': 'Execução autorizada',
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

function captureTitle(capture: CalculationCapture): string {
  return capture.editableDescription || capture.summary;
}

function compactList(items: CalculationCapture[], limit = 4): string {
  if (items.length === 0) return 'Nenhum item registrado ainda.';
  const visibleItems = items.slice(0, limit).map(captureTitle).join('; ');
  const remainingCount = items.length - limit;
  return remainingCount > 0 ? `${visibleItems}; +${remainingCount} item(ns).` : `${visibleItems}.`;
}

function budgetRecordTotal(record: ReturnType<typeof loadSavedBudgets>[number]): number {
  const budget: Budget = {
    id: record.id,
    title: record.title,
    status: record.status,
    discount: record.discount,
    travelCost: record.travelCost,
    additionalFees: record.additionalFees,
    items: record.items,
  };
  try {
    return calculateBudgetTotal(budget);
  } catch {
    return 0;
  }
}

function money(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);
}

function reportTemplateLabel(templateId: ReportTemplateId): string {
  if (templateId === 'technicalDetailed') return 'Relatório técnico detalhado';
  if (templateId === 'managerial') return 'Relatório gerencial';
  return 'Relatório técnico simples';
}

export function ReportWorkspace({ captures, activeClient = null, activeWorkOrder = null }: ReportWorkspaceProps) {
  const { reportItems, itemsWithImage, diagnostics } = getReportCaptureMetrics(captures);
  const businessProfile = loadBusinessProfile();
  const reportTemplateId = businessProfile.defaultReportTemplateId;
  const profileName = businessProfile.businessName || businessProfile.responsibleName || 'Aferix';
  const contactLine = [businessProfile.phone, businessProfile.email].filter(Boolean).join(' · ');
  const logoSource = businessProfile.logoDataUrl || businessProfile.logoUrl;
  const serviceItems = reportItems.filter((capture) => capture.itemType === 'service');
  const materialItems = reportItems.filter((capture) => capture.itemType === 'material');
  const clientPurchaseItems = reportItems.filter(isClientPurchaseMaterial);
  const notesAndRecommendations = reportItems.filter((capture) => capture.technicalNote?.trim());
  const savedBudgets = loadSavedBudgets();
  const approvedBudgets = savedBudgets.filter((budget) => budget.status === 'approved');
  const sentBudgets = savedBudgets.filter((budget) => budget.status === 'sent');
  const totalApproved = approvedBudgets.reduce((sum, budget) => sum + budgetRecordTotal(budget), 0);
  const averageTicket = approvedBudgets.length > 0 ? totalApproved / approvedBudgets.length : 0;
  const approvalRate = savedBudgets.length > 0 ? (approvedBudgets.length / savedBudgets.length) * 100 : 0;
  const mostUsedMaterial = materialItems[0]?.editableDescription || materialItems[0]?.summary || 'Sem material recorrente ainda';
  const mostSoldService = serviceItems[0]?.editableDescription || serviceItems[0]?.summary || 'Sem serviço recorrente ainda';
  const readyChecks = [
    { label: 'Cliente vinculado', ready: Boolean(activeClient) },
    { label: 'Atendimento identificado', ready: Boolean(activeWorkOrder?.title) },
    { label: 'Itens técnicos', ready: reportItems.length > 0 },
    { label: 'Diagnóstico ou observação técnica', ready: diagnostics > 0 || notesAndRecommendations.length > 0 },
  ];

  return (
    <div className="report-workspace">
      <ProfessionalIdentityCard contextLabel="Identidade do relatório" />

      <section className="report-summary-panel no-print">
        <div>
          <span className="orca-kicker">Prévia do documento</span>
          <h2>Relatório técnico</h2>
          <p>Revise os itens técnicos, confirme o cliente/atendimento ativo e só então imprima ou salve em PDF.</p>
        </div>
        <span className="report-template-chip">Modelo: {reportTemplateLabel(reportTemplateId)}</span>
        <button className="primary-action inline-action" type="button" onClick={printReport} disabled={reportItems.length === 0}>
          Imprimir / salvar PDF
        </button>
      </section>

      <section className="report-readiness-panel no-print" aria-label="Checklist do relatório">
        {readyChecks.map((check) => (
          <article className={check.ready ? 'ready' : ''} key={check.label}>
            <span>{check.ready ? 'OK' : 'Pendente'}</span>
            <strong>{check.label}</strong>
          </article>
        ))}
      </section>

      <div className="report-metrics-grid no-print">
        <article><span>Itens no relatório</span><strong>{reportItems.length}</strong></article>
        <article><span>Com imagem</span><strong>{itemsWithImage}</strong></article>
        <article><span>Diagnósticos</span><strong>{diagnostics}</strong></article>
        <article><span>Compra do cliente</span><strong>{clientPurchaseItems.length}</strong></article>
      </div>

      <section className="report-business-panel no-print">
        <div>
          <span className="orca-kicker">Visão do profissional</span>
          <h2>Relatório gerencial leve</h2>
          <p>Sinais locais para entender aprovação, ticket médio e itens recorrentes sem transformar a área em fiscal oficial.</p>
        </div>
        <div className="report-business-grid">
          <article><span>Faturamento aprovado</span><strong>{money(totalApproved)}</strong><small>{approvedBudgets.length} orçamento(s) aprovado(s)</small></article>
          <article><span>Ticket médio</span><strong>{money(averageTicket)}</strong><small>média dos aprovados salvos</small></article>
          <article><span>Taxa de aprovação</span><strong>{approvalRate.toFixed(0)}%</strong><small>{sentBudgets.length} enviado(s), {approvedBudgets.length} aprovado(s)</small></article>
          <article><span>Serviço recorrente</span><strong>{mostSoldService}</strong><small>baseado nos itens atuais</small></article>
          <article><span>Material recorrente</span><strong>{mostUsedMaterial}</strong><small>baseado nos itens atuais</small></article>
        </div>
      </section>

      <article className={`report-document report-template-${reportTemplateId}`}>
        <header className="report-document-header">
          <div className="report-company-row">
            {logoSource ? <img src={logoSource} alt={`Logo ${profileName}`} /> : <span>Aferix</span>}
            <div>
              <strong>{profileName}</strong>
              {businessProfile.documentNumber && <small>{businessProfile.documentNumber}</small>}
              {contactLine && <small>{contactLine}</small>}
              {businessProfile.address && <small>{businessProfile.address}</small>}
            </div>
          </div>
          <h1>{activeWorkOrder?.title || 'Relatório técnico de visita'}</h1>
          <p>{activeWorkOrder?.description || 'Documento preliminar gerado a partir dos registros técnicos do atendimento.'}</p>
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

        {reportItems.length > 0 && (
          <section className="report-executive-summary">
            <h2>Resumo do atendimento</h2>
            <div className="report-summary-grid">
              <article>
                <span>Serviços levantados</span>
                <p>{compactList(serviceItems)}</p>
              </article>
              <article>
                <span>Materiais identificados</span>
                <p>{compactList(materialItems)}</p>
              </article>
              <article>
                <span>Compra pelo cliente</span>
                <p>{compactList(clientPurchaseItems)}</p>
              </article>
              <article>
                <span>Notas e recomendações</span>
                <p>{compactList(notesAndRecommendations)}</p>
              </article>
            </div>
          </section>
        )}

        {reportItems.length === 0 ? (
          <section className="report-empty-state">
            <strong>Nenhum item técnico para relatório ainda.</strong>
            <p>Adicione itens técnicos ao atendimento ou envie diagnósticos e observações dos cálculos.</p>
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
