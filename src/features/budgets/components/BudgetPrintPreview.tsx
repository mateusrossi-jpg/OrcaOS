import type { Budget, BusinessProfile } from '../../../core/types/business';
import { calculateBudgetItemTotal } from '../../../core/pricing/budget';
import './BudgetPrintPreview.css';

interface BudgetPrintPreviewProps {
  clientName: string;
  budgetTitle: string;
  status: string;
  items: any[];
  discount: number;
  travelCost: number;
  additionalFees: number;
  subtotal: number;
  commercialSubtotal: number;
  total: number;
  businessProfile: BusinessProfile;
  paymentTerms?: string;
  validity?: string;
  guarantee?: string;
  executionDeadline?: string;
  commercialNotes?: string;
  technicalNotes?: string;
  templateId?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function categoryLabel(category: string): string {
  if (category === 'labor') return 'Mão de obra';
  if (category === 'material') return 'Material';
  return 'Outro';
}

export function BudgetPrintPreview({
  clientName,
  budgetTitle,
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
}: BudgetPrintPreviewProps) {
  const profileName = businessProfile.businessName || businessProfile.responsibleName || 'Aferix';
  const logoSource = businessProfile.logoDataUrl || businessProfile.logoUrl;

  return (
    <div className="premium-print-preview">
      <div className="premium-preview-document">
        {/* Header */}
        <header className="premium-preview-header">
          <div className="company-branding">
            {logoSource ? (
              <img src={logoSource} alt="Logo" className="preview-logo" />
            ) : (
              <h2 className="preview-company-name">{profileName}</h2>
            )}
            <div className="company-details">
              {logoSource && <strong>{profileName}</strong>}
              {businessProfile.documentNumber && <span>{businessProfile.documentNumber}</span>}
              <span>{businessProfile.phone}</span>
              <span>{businessProfile.email}</span>
              {businessProfile.address && <span>{businessProfile.address}</span>}
            </div>
          </div>
          <div className="document-meta">
            <h1>Orçamento</h1>
            <span className="issue-date">Emitido em {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </header>

        {/* Info Blocks */}
        <div className="preview-info-grid">
          <div className="info-block">
            <span className="info-label">Para o Cliente</span>
            <strong className="info-value">{clientName || 'Não informado'}</strong>
          </div>
          <div className="info-block">
            <span className="info-label">Sobre o Serviço</span>
            <strong className="info-value">{budgetTitle || 'Proposta de Serviço'}</strong>
            {executionDeadline && <span className="info-sub">Prazo: {executionDeadline}</span>}
          </div>
        </div>

        {/* Table */}
        <table className="premium-preview-table">
          <thead>
            <tr>
              <th className="col-desc">Descrição</th>
              <th className="col-cat">Tipo</th>
              <th className="col-qty">Qtd</th>
              <th className="col-unit">Unitário</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-desc">
                  <div className="item-desc-wrapper">
                    <strong>{item.description}</strong>
                  </div>
                </td>
                <td className="col-cat">{categoryLabel(item.category)}</td>
                <td className="col-qty">{item.quantity}</td>
                <td className="col-unit">{formatCurrency(item.unitPrice)}</td>
                <td className="col-total"><strong>{formatCurrency(calculateBudgetItemTotal(item))}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="preview-financial-summary">
          <div className="summary-wrapper">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {travelCost > 0 && (
              <div className="summary-row">
                <span>Deslocamento</span>
                <span>{formatCurrency(travelCost)}</span>
              </div>
            )}
            {additionalFees > 0 && (
              <div className="summary-row">
                <span>Taxas Adicionais</span>
                <span>{formatCurrency(additionalFees)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Desconto aplicado</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="summary-row grand-total">
              <strong>Investimento Total</strong>
              <strong className="total-value">{formatCurrency(total)}</strong>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="preview-conditions">
          {paymentTerms && (
            <div className="condition-item">
              <span className="condition-label">Forma de Pagamento</span>
              <p>{paymentTerms}</p>
            </div>
          )}
          {validity && (
            <div className="condition-item">
              <span className="condition-label">Validade da Proposta</span>
              <p>{validity}</p>
            </div>
          )}
          {guarantee && (
            <div className="condition-item">
              <span className="condition-label">Garantia</span>
              <p>{guarantee}</p>
            </div>
          )}
          {commercialNotes && (
            <div className="condition-item">
              <span className="condition-label">Observações Adicionais</span>
              <p>{commercialNotes}</p>
            </div>
          )}
        </div>

        <footer className="preview-footer">
          <p>Documento comercial gerado via Aferix — Soluções para Profissionais Autônomos.</p>
        </footer>
      </div>
    </div>
  );
}
