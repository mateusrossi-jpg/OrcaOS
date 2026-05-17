import { useState } from 'react';
import type { BudgetItem, BudgetTemplateId, BusinessProfile } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';
import { hasBlockingBudgetIssues, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { roundTechnical } from '../../../core/calculations/electrical';
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
  const labels: Record<SavedBudgetStatus, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Recusado',
    expired: 'Vencido',
    cancelled: 'Cancelado',
  };

  return labels[status];
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
  const [zoom, setZoom] = useState(1);
  const hasBlockingIssues = hasBlockingBudgetIssues(validationIssues);
  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const isSimpleTemplate = templateId === 'simple';
  const isTechnicalTemplate = templateId === 'technical' || templateId === 'premiumDetailed';
  const isPremiumTemplate = templateId === 'premiumModern' || templateId === 'premiumDetailed';
  const profileName = businessProfile?.businessName?.trim() || businessProfile?.responsibleName?.trim() || 'Profissional';
  const documentNumber = businessProfile?.documentNumber?.trim();
  const contactLine = [businessProfile?.phone, businessProfile?.email].filter(Boolean).join(' · ');
  const address = businessProfile?.address?.trim();
  const responsibleName = businessProfile?.responsibleName?.trim();
  const logoSource = businessProfile?.logoDataUrl?.trim() || businessProfile?.logoUrl?.trim() || AFERIX_LOGO_LIGHT_URL;
  const categoryTotals = {
    labor: items.filter((item) => item.category === 'labor').reduce((sum, item) => sum + safeBudgetItemTotal(item), 0),
    material: items.filter((item) => item.category === 'material').reduce((sum, item) => sum + safeBudgetItemTotal(item), 0),
    other: items.filter((item) => item.category === 'other').reduce((sum, item) => sum + safeBudgetItemTotal(item), 0),
  };

  return (
    <section className="print-preview-shell">
      <div className="print-preview-header no-print">
        <div>
          <h3>Prévia para cliente</h3>
          <p>Use imprimir para salvar em PDF pelo navegador.</p>
        </div>
        <button type="button" className="primary-action inline-action" disabled={hasBlockingIssues} onClick={printBudget}>
          Imprimir / salvar PDF
        </button>
      </div>

      {validationIssues.length > 0 && (
        <div className="print-validation-alert no-print" role="status">
          <strong>{hasBlockingIssues ? 'Revise antes de gerar o PDF' : 'Atenção antes do envio'}</strong>
          <ul>
            {validationIssues.map((issue) => (
              <li className={issue.severity} key={`${issue.code}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

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

      <div className="document-preview-container" style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <article 
          className={`print-document print-template-${templateId}`} 
          aria-label="Prévia impressa do orçamento"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            margin: '12px auto',
            marginBottom: zoom > 1 ? `${(zoom - 1) * 800}px` : '12px'
          }}
        >
        {isPremiumTemplate && (
          <section className="print-cover-page">
            <span>Proposta premium</span>
            <h1>{budgetTitle || 'Proposta técnica e comercial'}</h1>
            <p>{clientName ? `Preparada para ${clientName}` : 'Preparada para o cliente'}</p>
            <strong>{formatCurrency(total)}</strong>
          </section>
        )}
        <header className="print-document-top">
          <div className="print-company-block">
            {!isSimpleTemplate ? <img className="print-logo" src={logoSource} alt={`Logo ${profileName}`} /> : <span className="print-brand">Orçamento</span>}
            <h2>{budgetTitle || 'Orçamento sem título'}</h2>
            <p>{profileName}</p>
            {!isSimpleTemplate && documentNumber && <p>{documentNumber}</p>}
            {contactLine && <p>{contactLine}</p>}
            {address && <p>{address}</p>}
          </div>
          <div className="print-status-box">
            <span>Status</span>
            <strong>{statusLabel(status)}</strong>
            <small>Emitido em {issuedAt}</small>
            {validity && <small>Validade: {validity}</small>}
          </div>
        </header>

        <section className="print-client-box">
          <span>Cliente</span>
          <strong>{clientName || 'Cliente não informado'}</strong>
        </section>

        {isPremiumTemplate && (
          <section className="print-client-box print-proposal-summary">
            <span>Resumo da proposta</span>
            <p>Problema identificado: necessidade registrada no atendimento/orçamento.</p>
            <p>Solução proposta: execução dos serviços e fornecimento dos itens listados abaixo.</p>
            <p>Benefícios: clareza no escopo, valores organizados e próximos passos documentados.</p>
          </section>
        )}

        <section className="print-table-wrap">
          <table className="print-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Qtd.</th>
                <th>Unitário</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhum item informado.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{categoryLabel(item.category)}</td>
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
          <div>
            <span>Itens</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          {travelCost > 0 && (
            <div>
              <span>Deslocamento</span>
              <strong>{formatCurrency(travelCost)}</strong>
            </div>
          )}
          {additionalFees > 0 && (
            <div>
              <span>Taxas adicionais</span>
              <strong>{formatCurrency(additionalFees)}</strong>
            </div>
          )}
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(commercialSubtotal)}</strong>
          </div>
          <div>
            <span>Desconto</span>
            <strong>{formatCurrency(discount)}</strong>
          </div>
          <div className="print-grand-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </section>

        {isTechnicalTemplate && (
          <section className="print-client-box print-technical-section">
            <span>Detalhamento técnico</span>
            <div className="print-category-totals">
              <p>Mão de obra: <strong>{formatCurrency(categoryTotals.labor)}</strong></p>
              <p>Materiais: <strong>{formatCurrency(categoryTotals.material)}</strong></p>
              <p>Outros: <strong>{formatCurrency(categoryTotals.other)}</strong></p>
            </div>
            <p>Diagnóstico: {technicalNotes || 'Diagnóstico técnico a validar conforme visita, medições e condições reais do local.'}</p>
            <p>Recomendações: confirmar medidas, disponibilidade de material e condições de execução antes do início.</p>
            <p>Incluso: itens descritos no orçamento. Não incluso: serviços, materiais ou adequações não listados.</p>
          </section>
        )}

        {isSimpleTemplate ? (
          <section className="print-client-box">
            <span>Observações</span>
            {commercialNotes ? <p>{commercialNotes}</p> : <p>Valores sujeitos à confirmação conforme escopo final aprovado pelo cliente.</p>}
          </section>
        ) : (
          <section className="print-client-box">
            <span>Condições</span>
            {paymentTerms && <p>{paymentTerms}</p>}
            {validity && <p>Validade da proposta: {validity}</p>}
            {guarantee && <p>Garantia: {guarantee}</p>}
            {executionDeadline && <p>Prazo de execução: {executionDeadline}</p>}
            {commercialNotes && <p>Observações comerciais: {commercialNotes}</p>}
            {technicalNotes && <p>Observações técnicas: {technicalNotes}</p>}
          </section>
        )}

        {!isSimpleTemplate && (
          <section className="print-client-box print-acceptance-box">
            <span>Aceite</span>
            <p>Ao aprovar esta proposta, o cliente autoriza a continuidade do atendimento para geração da OS e execução conforme escopo descrito.</p>
          </section>
        )}

        <footer className="print-footer">
          <p>{responsibleName ? `Responsável técnico/comercial: ${responsibleName}` : 'Orçamento gerado pelo Aferix.'}</p>
          <div className="signature-line">Assinatura / aceite do cliente</div>
        </footer>
      </article>
      </div>
    </section>
  );
}
