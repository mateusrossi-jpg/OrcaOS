import { useMemo, useState } from 'react';
import {
  clientProposalStatusLabel,
  createClientProposalDraft,
  deleteClientProposal,
  loadClientProposals,
  upsertClientProposal,
  type ClientProposal,
  type ClientProposalStatus,
} from '../storage/clientProposalStorage';
import { loadProfessionalProfile } from '../../settings/storage/professionalProfileStorage';
import './ClientProposalWorkspace.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function statusTimestampPatch(status: ClientProposalStatus): Partial<ClientProposal> {
  const timestamp = new Date().toISOString();
  if (status === 'sent') return { status, sentAt: timestamp };
  if (status === 'viewed') return { status, viewedAt: timestamp };
  if (status === 'approved' || status === 'rejected') return { status, decidedAt: timestamp };
  return { status };
}

export function ClientProposalWorkspace() {
  const [proposals, setProposals] = useState<ClientProposal[]>(() => loadClientProposals());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filteredProposals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return proposals;
    return proposals.filter((proposal) => [proposal.title, proposal.clientName, proposal.professionalDisplayName, proposal.summary, proposal.publicNotes].join(' ').toLowerCase().includes(normalizedQuery));
  }, [proposals, query]);

  function refresh() {
    setProposals(loadClientProposals());
  }

  function createExampleProposal() {
    const profile = loadProfessionalProfile();
    const proposal = createClientProposalDraft({
      professionalId: profile.professionalId,
      companyId: profile.companyId,
      professionalDisplayName: profile.businessName || profile.professionalName || 'Profissional OrçaOS',
      professionalContact: [profile.phone, profile.email].filter(Boolean).join(' · '),
      title: 'Proposta exemplo para cliente',
      clientName: 'Cliente exemplo',
      summary: 'Exemplo de proposta pública separando serviços cobrados e materiais que podem ser comprados pelo cliente.',
      items: [
        { id: 'item-service-example', description: 'Mão de obra para instalação de tomadas e acabamento', quantity: 1, unitLabel: 'serviço', unitPrice: 450, totalPrice: 450, category: 'service', visibleToClient: true, notes: 'Inclui instalação e testes básicos.' },
      ],
      clientPurchaseMaterials: [
        { id: 'client-material-example', description: 'Tomadas, placas e chassis conforme especificação definida em visita', quantity: 1, referenceUnitValue: 180, referenceTotalValue: 180, specificationNotes: 'Cliente pode adquirir os materiais seguindo a lista orientativa.', requiredBeforeService: true },
      ],
      subtotal: 450,
      discount: 0,
      total: 450,
      validityText: '7 dias',
      paymentTerms: '50% de sinal e 50% na entrega, ajustável conforme negociação.',
      publicNotes: 'Materiais listados para compra do cliente não fazem parte do total cobrado pelo profissional.',
    });
    upsertClientProposal(proposal);
    refresh();
    setFeedback('Proposta exemplo criada.');
  }

  function updateProposalStatus(proposal: ClientProposal, status: ClientProposalStatus) {
    upsertClientProposal({ ...proposal, ...statusTimestampPatch(status) });
    refresh();
    setFeedback(`Proposta marcada como ${clientProposalStatusLabel(status).toLowerCase()}.`);
  }

  function removeProposal(id: string) {
    setProposals(deleteClientProposal(id));
    setFeedback('Proposta removida.');
  }

  return (
    <section className="client-proposal-workspace">
      <div className="client-proposal-header">
        <div>
          <span className="orca-kicker">OrçaOS Cliente</span>
          <h2>Propostas públicas do cliente</h2>
          <p>Base inicial para gerar visão simplificada do cliente, com preço final, materiais que ele compra, status e aceite.</p>
        </div>
        <strong>{proposals.length} proposta(s)</strong>
      </div>

      <div className="client-proposal-card">
        <div>
          <strong>Controle inicial</strong>
          <small>Esta tela prepara link público, QR Code, área cliente e aceite digital no futuro.</small>
        </div>
        <div className="client-proposal-actions">
          <button className="primary-action inline-action" type="button" onClick={createExampleProposal}>Criar proposta exemplo</button>
          <button className="secondary-action inline-action" type="button" onClick={refresh}>Atualizar lista</button>
        </div>
        <label className="client-proposal-search">
          <span>Buscar proposta</span>
          <input value={query} placeholder="Cliente, título, profissional..." onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      <div className="client-proposal-list">
        {filteredProposals.length === 0 ? (
          <div className="client-proposal-empty">Nenhuma proposta pública criada ainda.</div>
        ) : filteredProposals.map((proposal) => (
          <article className="client-proposal-item" key={proposal.id}>
            <header>
              <div>
                <span>{clientProposalStatusLabel(proposal.status)}</span>
                <strong>{proposal.title}</strong>
                <small>{proposal.clientName} · {proposal.professionalDisplayName}</small>
                <small>Criada em {formatDate(proposal.createdAt)} · token futuro: {proposal.publicToken}</small>
              </div>
              <b>{money(proposal.total)}</b>
            </header>

            <p>{proposal.summary}</p>

            <div className="client-proposal-columns">
              <section>
                <strong>Itens cobrados</strong>
                {proposal.items.length === 0 ? <small>Nenhum item público cobrado.</small> : proposal.items.map((item) => <small key={item.id}>{item.quantity}× {item.description} · {money(item.totalPrice ?? 0)}</small>)}
              </section>
              <section>
                <strong>Materiais para o cliente comprar</strong>
                {proposal.clientPurchaseMaterials.length === 0 ? <small>Nenhum material separado para compra do cliente.</small> : proposal.clientPurchaseMaterials.map((item) => <small key={item.id}>{item.quantity}× {item.description} · referência {money(item.referenceTotalValue ?? 0)}</small>)}
              </section>
            </div>

            <div className="client-proposal-meta">
              <span>Validade: {proposal.validityText}</span>
              <span>Pagamento: {proposal.paymentTerms}</span>
            </div>

            <div className="client-proposal-actions">
              <button className="secondary-action inline-action" type="button" onClick={() => updateProposalStatus(proposal, 'sent')}>Marcar enviada</button>
              <button className="secondary-action inline-action" type="button" onClick={() => updateProposalStatus(proposal, 'viewed')}>Visualizada</button>
              <button className="primary-action inline-action" type="button" onClick={() => updateProposalStatus(proposal, 'approved')}>Aprovada</button>
              <button className="secondary-action inline-action" type="button" onClick={() => updateProposalStatus(proposal, 'rejected')}>Recusada</button>
              <button className="danger-action" type="button" onClick={() => removeProposal(proposal.id)}>Remover</button>
            </div>
          </article>
        ))}
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
