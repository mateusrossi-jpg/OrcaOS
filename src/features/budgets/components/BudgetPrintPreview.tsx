import { useMemo, useState } from 'react';
import type { BudgetItem, BudgetTemplateId, BusinessProfile } from '../../../core/types/business';
import { budgetCalculator } from '../../../services/BudgetCalculatorService';
import { hasBlockingBudgetIssues, type BudgetValidationIssue } from '../../../core/pricing/budgetValidation';
import { roundTechnical } from '../../../core/format/number';
import type { BudgetStatus } from '../../../core/types/business';
import './BudgetPrintPreview.css';

interface BudgetPrintPreviewProps {
  clientName: string;
  budgetTitle: string;
  status: BudgetStatus;
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

function statusLabel(status: BudgetStatus): string {
  const labels: Partial<Record<BudgetStatus, string>> = {
    iniciado: 'Orçamento iniciado',
    em_revisao: 'Em revisão',
    enviado: 'Orçamento enviado',
    autorizado: 'Autorizado',
    em_execucao: 'Em execução',
    finalizado: 'Finalizado',
    recusado: 'Orçamento recusado',
    cancelado: 'Cancelado',
  };

  return labels[status] ?? 'Orçamento iniciado';
}

function printBudget() {
  window.print();
}

function safeBudgetItemTotal(item: BudgetItem): number {
  try {
    return budgetCalculator.calculateItemTotal(item);
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
    <section className="min-h-screen">
      <div className="no-print mb-8">
        <PageTitle 
          eyebrow="Visualização"
          title={isPremiumReport ? 'Relatório Premium' : 'Orçamento Simples'}
          subtitle="Confira a formatação do documento antes de gerar o PDF."
          action={
            <PrimaryButton disabled={hasBlockingIssues} onClick={printBudget}>
              <FileDown className="h-5 w-5" /> Imprimir / PDF
            </PrimaryButton>
          }
        />
      </div>

      {validationIssues.length > 0 && (
        <div className="no-print mb-8 p-6 rounded-2xl bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 shadow-soft" role="status">
          <strong className="text-[14px] font-bold text-[var(--accent-red)] block mb-3">
            {hasBlockingIssues ? 'Revise antes de gerar o documento' : 'Atenção antes do envio'}
          </strong>
          <ul className="flex flex-col gap-2">
            {validationIssues.map((issue) => (
              <li className={cn("text-[13px] font-medium opacity-80", issue.severity === 'error' ? "text-[var(--accent-red)]" : "text-[var(--accent-gold)]")} key={`${issue.code}-${issue.message}`}>
                • {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="no-print mb-10 p-5 rounded-2xl bg-[var(--bg-surface-glass)] border var(--border-soft) flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Ajuste de Zoom</span>
          <div className="flex items-center gap-2 bg-white/[0.04] p-1 rounded-xl border var(--border-subtle)">
            <button type="button" className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5 transition-all text-white font-bold" onClick={() => setZoom(prev => Math.max(0.45, prev - 0.1))}>-</button>
            <span className="num text-[13px] font-bold w-12 text-center text-[var(--accent-gold)]">{Math.round(zoom * 100)}%</span>
            <button type="button" className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5 transition-all text-white font-bold" onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}>+</button>
          </div>
        </div>
        <SecondaryButton onClick={() => setZoom(defaultZoom)} className="min-h-[40px] px-4 rounded-xl text-[12px]">Reset</SecondaryButton>
      </div>

      <div className="document-preview-container budget-preview-container-layout">
        <div className="budget-preview-inner-layout">
          <article
            className={'print-document budget-preview-scale-host ' + (isPremiumReport ? 'report-premium-layout' : 'budget-simple-layout')}
            aria-label="Prévia impressa"
            style={{ maxWidth: Math.max(320, Math.round(880 * zoom)) }}
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
            <div className="print-client-box budget-print-client-highlight">
              <span>Diagnóstico e Escopo Técnico</span>
              <p className="budget-print-prewrap">{technicalNotes || 'Análise detalhada da necessidade registrada.'}</p>
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
              {commercialNotes && <p className="budget-print-prewrap">{commercialNotes}</p>}
              {guarantee && <p><strong>Garantia:</strong> {guarantee}</p>}
              {executionDeadline && <p><strong>Prazo de Execução:</strong> {executionDeadline}</p>}
            </div>
            <footer className="print-footer budget-print-footer-grid">
              <div className="signature-line">Assinatura Técnica</div>
              <div className="signature-line">Aceite do Cliente</div>
            </footer>
          </section>
        ) : (
          <section className="budget-simple-footer">
            <div className="print-client-box">
              <span>Observações</span>
              <p className="budget-print-prewrap">{commercialNotes || 'Valores sujeitos à alteração sem aviso prévio.'}</p>
              {paymentTerms && <p><strong>Pagamento:</strong> {paymentTerms}</p>}
            </div>
            <footer className="print-footer budget-print-footer-top-sm">
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
