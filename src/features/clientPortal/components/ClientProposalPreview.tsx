import type { ClientProposal } from '../storage/clientProposalStorage';
import './ClientProposalPreview.css';

interface ClientProposalPreviewProps {
  proposal: ClientProposal;
  onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number | undefined): string {
  return currencyFormatter.format(Number.isFinite(value ?? 0) ? value ?? 0 : 0);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export function ClientProposalPreview({ proposal, onClose }: ClientProposalPreviewProps) {
  return (
    <section className="client-proposal-preview-shell">
      <div className="client-proposal-preview-actions no-print">
        <button className="secondary-action inline-action" type="button" onClick={onClose}>Fechar prévia</button>
        <button className="primary-action inline-action" type="button" onClick={() => window.print()}>Imprimir / salvar PDF</button>
      </div>

      <article className="client-proposal-preview-document">
        <header className="client-proposal-preview-header">
          <div>
            <span>Proposta comercial</span>
            <h1>{proposal.title}</h1>
            <p>{proposal.summary}</p>
          </div>
          <aside>
            <strong>{money(proposal.total)}</strong>
            <small>Total da proposta</small>
          </aside>
        </header>

        <section className="client-proposal-preview-identification">
          <div>
            <span>Cliente</span>
            <strong>{proposal.clientName}</strong>
          </div>
          <div>
            <span>Profissional / empresa</span>
            <strong>{proposal.professionalDisplayName}</strong>
            {proposal.professionalContact && <small>{proposal.professionalContact}</small>}
          </div>
          <div>
            <span>Emissão</span>
            <strong>{formatDate(proposal.createdAt)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{proposal.status}</strong>
          </div>
        </section>

        <section className="client-proposal-preview-section">
          <h2>Itens incluídos no valor</h2>
          {proposal.items.length === 0 ? (
            <p>Nenhum item cobrado informado nesta proposta.</p>
          ) : (
            <div className="client-proposal-preview-table">
              <div className="table-row table-head">
                <span>Descrição</span>
                <span>Qtd.</span>
                <span>Valor</span>
              </div>
              {proposal.items.map((item) => (
                <div className="table-row" key={item.id}>
                  <span>
                    <strong>{item.description}</strong>
                    {item.notes && <small>{item.notes}</small>}
                  </span>
                  <span>{item.quantity}</span>
                  <span>{money(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {proposal.clientPurchaseMaterials.length > 0 && (
          <section className="client-proposal-preview-section client-materials">
            <h2>Materiais para o cliente comprar</h2>
            <p>Os materiais abaixo são uma lista orientativa e não fazem parte do total cobrado pelo profissional, salvo combinação posterior.</p>
            <div className="client-proposal-preview-table">
              <div className="table-row table-head">
                <span>Descrição</span>
                <span>Qtd.</span>
                <span>Referência</span>
              </div>
              {proposal.clientPurchaseMaterials.map((item) => (
                <div className="table-row" key={item.id}>
                  <span>
                    <strong>{item.description}</strong>
                    {item.specificationNotes && <small>{item.specificationNotes}</small>}
                  </span>
                  <span>{item.quantity}</span>
                  <span>{money(item.referenceTotalValue)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="client-proposal-preview-totals">
          <div>
            <span>Subtotal</span>
            <strong>{money(proposal.subtotal)}</strong>
          </div>
          {proposal.discount > 0 && (
            <div>
              <span>Desconto</span>
              <strong>{money(proposal.discount)}</strong>
            </div>
          )}
          <div className="grand-total">
            <span>Total</span>
            <strong>{money(proposal.total)}</strong>
          </div>
        </section>

        <section className="client-proposal-preview-notes">
          <div>
            <h3>Validade</h3>
            <p>{proposal.validityText}</p>
          </div>
          <div>
            <h3>Pagamento</h3>
            <p>{proposal.paymentTerms}</p>
          </div>
          <div>
            <h3>Observações</h3>
            <p>{proposal.publicNotes}</p>
          </div>
        </section>

        <footer className="client-proposal-preview-footer">
          <p>Para aprovar, responda confirmando a aprovação da proposta. A execução deve ser validada pelo profissional responsável antes do início do serviço.</p>
          <div className="acceptance-line">Assinatura / aceite do cliente</div>
        </footer>
      </article>
    </section>
  );
}
