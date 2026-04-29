import type { BudgetItem } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';
import { roundTechnical } from '../../../core/calculations/electrical';
import type { SavedBudgetStatus } from '../storage/savedBudgetsStorage';
import './BudgetPrintPreview.css';

interface BudgetPrintPreviewProps {
  clientName: string;
  budgetTitle: string;
  status: SavedBudgetStatus;
  items: BudgetItem[];
  discount: number;
  subtotal: number;
  total: number;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(roundTechnical(value));
}

function categoryLabel(category: BudgetItem['category']): string {
  if (category === 'labor') {
    return 'Mão de obra';
  }

  if (category === 'material') {
    return 'Material';
  }

  return 'Outro';
}

function statusLabel(status: SavedBudgetStatus): string {
  const labels: Record<SavedBudgetStatus, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Recusado',
  };

  return labels[status];
}

function printBudget() {
  window.print();
}

export function BudgetPrintPreview({
  clientName,
  budgetTitle,
  status,
  items,
  discount,
  subtotal,
  total,
}: BudgetPrintPreviewProps) {
  const issuedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  return (
    <section className="print-preview-shell">
      <div className="print-preview-header no-print">
        <div>
          <h3>Prévia para cliente</h3>
          <p>Use imprimir para salvar em PDF pelo navegador.</p>
        </div>
        <button type="button" className="primary-action inline-action" onClick={printBudget}>
          Imprimir / salvar PDF
        </button>
      </div>

      <article className="print-document" aria-label="Prévia impressa do orçamento">
        <header className="print-document-top">
          <div>
            <span className="print-brand">OrçaOS</span>
            <h2>{budgetTitle || 'Orçamento sem título'}</h2>
            <p>Orçamento técnico para serviços profissionais</p>
          </div>
          <div className="print-status-box">
            <span>Status</span>
            <strong>{statusLabel(status)}</strong>
            <small>Emitido em {issuedAt}</small>
          </div>
        </header>

        <section className="print-client-box">
          <span>Cliente</span>
          <strong>{clientName || 'Cliente não informado'}</strong>
        </section>

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
                    <td>{formatCurrency(calculateBudgetItemTotal(item))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="print-total-box">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
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

        <footer className="print-footer">
          <p>
            Valores sujeitos à confirmação após vistoria, disponibilidade de materiais e validação técnica do serviço.
          </p>
          <div className="signature-line">Assinatura / aceite do cliente</div>
        </footer>
      </article>
    </section>
  );
}
