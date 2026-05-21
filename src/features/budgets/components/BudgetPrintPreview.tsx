import { useMemo, useState } from 'react';
import type { BudgetItem, BudgetTemplateId, BusinessProfile } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';
import { hasBlockingBudgetIssues, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { roundTechnical } from '../../../core/format/number';
import type { SavedBudgetStatus } from '../storage/savedBudgetsStorage';
import './BudgetPrintPreview.css';

interface BudgetPrintPreviewProps {
  clientName: string;
  budgetTitle: string;
  status: SavedBudgetStatus;
  items: BudgetItem[];
  discount: number;
  travelCost: number;
  additionalFees: number;
  subtotal: number;
  commercialSubtotal: number;
  total: number;
  businessProfile?: BusinessProfile;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  commercialNotes?: string;
  technicalNotes?: string;
  templateId?: BudgetTemplateId;
  validationIssues?: BudgetValidationIssue[];
}

const AFERIX_LOGO_LIGHT_URL = '/icons/aferix-wordmark-document.svg';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(roundTechnical(value));
}

function categoryLabel(category: BudgetItem['category']): string {
  if (category === 'labor') return 'Mão de obra';
  if (category === 'material') return 'Material';
  return 'Outro';
}

function statusLabel(status: SavedBudgetStatus): string {
  const labels: Partial<Record<SavedBudgetStatus, string>> = {
    iniciado: 'Orçamento iniciado',
    em_revisao: 'Em revisão',
    enviado: 'Orçamento enviado',
    autorizado: 'Autorizado',
    em_execucao: 'Em execução',
    finalizado: 'Finalizado',
    recusado: 'Orçamento recusado',
    cancelado: 'Cancelado',
    draft: 'Orçamento iniciado',
    sent: 'Orçamento enviado',
    approved: 'Autorizado',
    rejected: 'Orçamento recusado',
    expired: 'Orçamento recusado',
    cancelled: 'Cancelado',
  };

  return labels[status] ?? 'Orçamento iniciado';
}

function printBudget() {
  window.print();
}

function safeBudgetItemTotal(item: BudgetItem): number {
  try {
    return calculateBudgetItemTotal(item);
  } catch {
    return 0;
  }
}

export function BudgetPrintPreview({
  clientName,
  budgetTitle,
  status,
  items,
  discount,
  travelCost,
  additionalFees,
  subtotal,
  commercialSubtotal,
  total,
  businessProfile,
  paymentTerms,
  validity,
  guarantee,
  executionDeadline,
  commercialNotes,
  technicalNotes,
  templateId = 'simple',
  validationIssues = [],
}: BudgetPrintPreviewProps) {
  const defaultZoom = useMemo(() => {
    if (typeof window === 'undefined') return 0.6;
    const width = window.innerWidth;
    if (width <= 430) return 0.45;
    if (width <= 768) return 0.55;
    if (width <= 1024) return 0.7;
    return 0.82;
  }, []);

  const [zoom, setZoom] = useState(defaultZoom);
  const hasBlockingIssues = hasBlockingBudgetIssues(validationIssues);
  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const isPremiumReport = templateId === 'premiumDetailed';
  
  const profileName = businessProfile?.businessName?.trim() || businessProfile?.responsibleName?.trim() || 'Profissional';
  const documentNumber = businessProfile?.documentNumber?.trim();
  const contactLine = [businessProfile?.phone, businessProfile?.email].filter(Boolean).join(' · ');
  const address = businessProfile?.address?.trim();
  const logoSource = businessProfile?.logoDataUrl?.trim() || businessProfile?.logoUrl?.trim() || AFERIX_LOGO_LIGHT_URL;

  return (
    <section className="print-preview-shell">
      <div className="print-preview-header no-print">
        <div>
          <h3>{isPremiumReport ? '✨ Prévia do Relatório Premium' : '📄 Prévia do Orçamento Simples'}</h3>
          <p>Confira os dados antes de enviar ao cliente.</p>
        </div>
        <button type="button" className="primary-action inline-action" disabled={hasBlockingIssues} onClick={printBudget}>
          Imprimir / salvar PDF
        </button>
      </div>

      {validationIssues.length > 0 && (
        <div className="print-validation-alert no-print" role="status">
          <strong>{hasBlockingIssues ? 'Revise antes de gerar o documento' : 'Atenção antes do envio'}</strong>
          <ul>
            {validationIssues.map((issue) => (
              <li className={issue.severity} key={`${issue.code}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="aferix-preview-toolbar no-print">
        <span className="toolbar-label">Zoom</span>
        <div className="toolbar-actions">
          <button type="button" className="toolbar-btn" onClick={() => setZoom(prev => Math.max(0.45, prev - 0.1))}>-</button>
          <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
          <button type="button" className="toolbar-btn" onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}>+</button>
          <button type="button" className="toolbar-btn" onClick={() => setZoom(defaultZoom)}>Reset</button>
        </div>
      </div>

      <div className="document-preview-container" style={{ width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '12px 0 4px', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ width: '100%', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <article 
            className={`print-document ${isPremiumReport ? 'report-premium-layout' : 'budget-simple-layout'}`} 
            aria-label="Prévia impressa"
            style={{ width: '100%', maxWidth: Math.max(320, Math.round(880 * zoom)), margin: '0 auto', flexShrink: 0 }}
          >
        
        <header className="print-document-top">
          <div className="print-company-block">
            {isPremiumReport ? <img className="print-logo" src={logoSource} alt="Logo" /> : <span className="print-brand">Orçamento</span>}
            <h2>{isPremiumReport ? 'Relatório de Atendimento' : (budgetTitle || 'Orçamento Comercial')}</h2>
            <p>{profileName}</p>
            {isPremiumReport && documentNumber && <p>{documentNumber}</p>}
            {contactLine && <p>{contactLine}</p>}
            {address && <p>{address}</p>}
          </div>
          <div className="print-status-box">
            <span>{isPremiumReport ? 'Ref. Técnica' : 'Status'}</span>
            <strong>{statusLabel(status)}</strong>
            <small>Data: {issuedAt}</small>
            {validity && <small>Válido até: {validity}</small>}
          </div>
        </header>

        <section className="print-client-box">
          <span>Dados do Cliente</span>
          <strong>{clientName || 'Cliente não informado'}</strong>
        </section>

        {isPremiumReport && (
          <section className="print-technical-focus">
            <div className="print-client-box" style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <span>Diagnóstico e Escopo Técnico</span>
              <p style={{ whiteSpace: 'pre-wrap' }}>{technicalNotes || 'Análise detalhada da necessidade registrada.'}</p>
            </div>
          </section>
        )}

        <section className="print-table-wrap">
          <table className="print-table">
            <thead>
              <tr>
                <th>Descrição</th>
                {isPremiumReport && <th>Categoria</th>}
                <th>Qtd.</th>
                <th>V. Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={isPremiumReport ? 5 : 4}>Nenhum item informado.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    {isPremiumReport && <td>{categoryLabel(item.category)}</td>}
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(safeBudgetItemTotal(item))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="print-total-box">
          <div><span>Subtotal de Itens</span><strong>{formatCurrency(subtotal)}</strong></div>
          {(travelCost > 0 || additionalFees > 0) && (
            <div><span>Encargos e Deslocamento</span><strong>{formatCurrency(travelCost + additionalFees)}</strong></div>
          )}
          {discount > 0 && <div><span>Desconto</span><strong>- {formatCurrency(discount)}</strong></div>}
          <div className="print-grand-total">
            <span>Investimento Final</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </section>

        {isPremiumReport ? (
          <section className="print-premium-footer">
            <div className="print-client-box">
              <span>Termos, Garantia e Prazos</span>
              {commercialNotes && <p style={{ whiteSpace: 'pre-wrap' }}>{commercialNotes}</p>}
              {guarantee && <p><strong>Garantia:</strong> {guarantee}</p>}
              {executionDeadline && <p><strong>Prazo de Execução:</strong> {executionDeadline}</p>}
            </div>
            <footer className="print-footer" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div className="signature-line">Assinatura Técnica</div>
              <div className="signature-line">Aceite do Cliente</div>
            </footer>
          </section>
        ) : (
          <section className="budget-simple-footer">
            <div className="print-client-box">
              <span>Observações</span>
              <p style={{ whiteSpace: 'pre-wrap' }}>{commercialNotes || 'Valores sujeitos à alteração sem aviso prévio.'}</p>
              {paymentTerms && <p><strong>Pagamento:</strong> {paymentTerms}</p>}
            </div>
            <footer className="print-footer" style={{ marginTop: '30px' }}>
              <div className="signature-line">Assinatura / Aceite</div>
            </footer>
          </section>
        )}
      </article>
      </div>
      </div>
    </section>
  );
}
