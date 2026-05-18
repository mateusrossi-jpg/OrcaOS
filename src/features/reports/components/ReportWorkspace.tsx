import { useState } from 'react';
import type { Client, ReportTemplateId, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { getReportCaptureMetrics, isClientPurchaseMaterial } from '../../workflow/utils/captureWorkflow';
import { loadBusinessProfile } from '../../budgets/storage/businessProfileStorage';
import { loadSavedBudgets } from '../../budgets/storage/savedBudgetsStorage';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import type { Budget } from '../../../core/types/business';
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
    'in-progress': 'Em execução',
    done: 'Concluído',
    cancelled: 'Cancelado',
  };
  return labels[status];
}

function itemTypeLabel(itemType: CalculationCapture['itemType']): string {
  if (itemType === 'diagnostic') return 'Análise';
  if (itemType === 'service') return 'Serviço';
  if (itemType === 'material') return 'Material';
  if (itemType === 'projectSpecification') return 'Especificação';
  return 'Observação';
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
  if (templateId === 'technicalDetailed') return 'Relatório de serviço';
  if (templateId === 'managerial') return 'Relatório financeiro';
  return 'Relatório comercial';
}

const AFERIX_LOGO_LIGHT_URL = '/icons/aferix-wordmark-document.svg';

export function ReportWorkspace({ captures, activeClient = null, activeWorkOrder = null }: ReportWorkspaceProps) {
  const [zoom, setZoom] = useState(1);
  const { reportItems, itemsWithImage, diagnostics } = getReportCaptureMetrics(captures);
  const businessProfile = loadBusinessProfile();
  const reportTemplateId = businessProfile.defaultReportTemplateId;
  const profileName = businessProfile.businessName || businessProfile.responsibleName || 'Aferix';
  const contactLine = [businessProfile.phone, businessProfile.email].filter(Boolean).join(' · ');
  const logoSource = businessProfile.logoDataUrl || businessProfile.logoUrl || AFERIX_LOGO_LIGHT_URL;
  const serviceItems = reportItems.filter((capture) => capture.itemType === 'service');
  const materialItems = reportItems.filter((capture) => capture.itemType === 'material');
  const clientPurchaseItems = reportItems.filter(isClientPurchaseMaterial);
  const notesAndRecommendations = reportItems.filter((capture) => capture.technicalNote?.trim());
  const savedBudgets = loadSavedBudgets();
  const approvedBudgets = savedBudgets.filter((budget) => budget.status === 'approved');
  const totalApproved = approvedBudgets.reduce((sum, budget) => sum + budgetRecordTotal(budget), 0);
  const averageTicket = approvedBudgets.length > 0 ? totalApproved / approvedBudgets.length : 0;
  const approvalRate = savedBudgets.length > 0 ? (approvedBudgets.length / savedBudgets.length) * 100 : 0;
  const readyChecks = [
    { label: 'Cliente vinculado', ready: Boolean(activeClient) },
    { label: 'Serviço identificado', ready: Boolean(activeWorkOrder?.title) },
    { label: 'Itens adicionados', ready: reportItems.length > 0 },
    { label: 'Análise ou observação', ready: diagnostics > 0 || notesAndRecommendations.length > 0 },
  ];

  return (
    <>
      <div className="aferix-panel-card report-command-panel no-print">
        <header>
          <div>
            <h2>Prévia do documento</h2>
            <p>{reportTemplateLabel(reportTemplateId)}</p>
          </div>
          <button className="ghost-action" type="button" onClick={printReport} disabled={reportItems.length === 0}>
            Imprimir / PDF
          </button>
        </header>
      </div>

      <div className="dashboard-finance-tiles no-print" style={{ margin: '1rem 0' }}>
        {readyChecks.map((check) => (
          <article className="finance-tile" key={check.label} style={{ borderLeft: check.ready ? '3px solid #f59e0b' : '3px solid #444' }}>
            <span style={{ fontSize: '0.65rem' }}>{check.label}</span>
            <strong>{check.ready ? 'Pronto' : 'Pendente'}</strong>
          </article>
        ))}
      </div>


      {reportItems.length > 0 && (
        <div className="aferix-preview-toolbar no-print">
          <span className="toolbar-label">Ajustar Visualização</span>
          <div className="toolbar-actions">
            <button type="button" className="toolbar-btn" onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))} aria-label="Diminuir zoom">
              -
            </button>
            <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
            <button type="button" className="toolbar-btn" onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))} aria-label="Aumentar zoom">
              +
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setZoom(1)} aria-label="Restaurar zoom">
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="document-preview-container" style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <article 
          className={`report-document report-template-${reportTemplateId}`}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            margin: '12px auto',
            marginBottom: zoom > 1 ? `${(zoom - 1) * 800}px` : '12px'
          }}
        >
        <header className="report-document-header">
          {profileName === 'Aferix' ? (
            <div className="report-document-brand-centered">
              <img src={logoSource} alt="AFERIX" />
            </div>
          ) : (
            <div className="report-company-row">
              <img src={logoSource} alt={`Logo ${profileName}`} />
              <div>
                <strong>{profileName}</strong>
                {businessProfile.documentNumber && <small>{businessProfile.documentNumber}</small>}
                {contactLine && <small>{contactLine}</small>}
                {businessProfile.address && <small>{businessProfile.address}</small>}
              </div>
            </div>
          )}
          <h1>{activeWorkOrder?.title || 'Relatório de atendimento'}</h1>
          <p>{activeWorkOrder?.description || 'Prévia comercial para envio ao cliente.'}</p>
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
            <strong>Nenhum item para relatório</strong>
            <p>Adicione serviços, observações ou materiais antes de gerar o documento.</p>
          </section>
        ) : (
          <section className="report-item-list">
            {reportItems.map((capture) => (
              <article className="report-item-card" key={capture.id}>
                <div className="report-item-content">
                  <header>
                    <span>{itemTypeLabel(capture.itemType)}</span>
                    <h2>{capture.editableDescription || capture.summary}</h2>
                    <small>{capture.calculatorLabel} · {formatDateTime(capture.createdAt)}</small>
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
          <p>Documento preparado para envio comercial ao cliente.</p>
          <div className="signature-line">Responsável técnico / aceite</div>
        </footer>
      </article>
      </div>

      {reportItems.length > 0 && (
        <details className="aferix-panel-card report-management-panel no-print" style={{ marginTop: "1.5rem" }}>
          <summary>Visão gerencial e contadores</summary>
          <div className="report-management-grid">
            <article><span>Itens</span><strong>{reportItems.length}</strong></article>
            <article><span>Imagens</span><strong>{itemsWithImage}</strong></article>
            <article><span>Diagnósticos</span><strong>{diagnostics}</strong></article>
            <article><span>Aprovado</span><strong>{money(totalApproved)}</strong></article>
            <article><span>Ticket</span><strong>{money(averageTicket)}</strong></article>
            <article><span>Conversão</span><strong>{approvalRate.toFixed(0)}%</strong></article>
          </div>
        </details>
      )}
    </>
  );
}
