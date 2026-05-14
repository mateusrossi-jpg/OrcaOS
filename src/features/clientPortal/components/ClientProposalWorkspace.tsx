import { useMemo, useState } from 'react';
import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { loadProfessionalProfile } from '../../settings/storage/professionalProfileStorage';
import { buildClientProposalFromCaptures } from '../storage/buildClientProposalFromCaptures';
import { buildClientProposalShareText, buildClientProposalWhatsAppUrl } from '../storage/clientProposalShareText';
import {
  clientProposalStatusLabel,
  createClientProposalDraft,
  deleteClientProposal,
  loadClientProposals,
  upsertClientProposal,
  type ClientProposal,
  type ClientProposalStatus,
} from '../storage/clientProposalStorage';
import { ClientProposalPreview } from './ClientProposalPreview';
import './ClientProposalWorkspace.css';

interface ClientProposalWorkspaceProps {
  technicalCaptures?: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}

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

export function ClientProposalWorkspace({ technicalCaptures = [], activeClient = null, activeWorkOrder = null }: ClientProposalWorkspaceProps) {
  const [proposals, setProposals] = useState<ClientProposal[]>(() => loadClientProposals());
  const [previewProposal, setPreviewProposal] = useState<ClientProposal | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filteredProposals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return proposals;
    return proposals.filter((proposal) => [proposal.title, proposal.clientName, proposal.professionalDisplayName, proposal.summary, proposal.publicNotes].join(' ').toLowerCase().includes(normalizedQuery));
  }, [proposals, query]);

  const proposalReadyCaptures = useMemo(() => {
    return technicalCaptures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both' || capture.itemType === 'service' || capture.itemType === 'material');
  }, [technicalCaptures]);

  function refresh() {
    setProposals(loadClientProposals());
  }

  function createProposalFromCurrentBudget() {
    if (proposalReadyCaptures.length === 0) {
      setFeedback('Nenhum item técnico disponível para gerar proposta do cliente. Envie serviços ou materiais ao orçamento primeiro.');
      return;
    }

    const proposal = buildClientProposalFromCaptures({ captures: proposalReadyCaptures, activeClient, activeWorkOrder });
    upsertClientProposal(proposal);
    refresh();
    setPreviewProposal(proposal);
    setFeedback(`Proposta criada a partir de ${proposalReadyCaptures.length} item(ns) técnico(s).`);
  }

  function createExampleProposal() {
    const profile = loadProfessionalProfile();
    const proposal = createClientProposalDraft({
      professionalId: profile.professionalId,
      companyId: profile.companyId,
      professionalDisplayName: profile.businessName || profile.professionalName || 'Profissional Aferix',
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
    setPreviewProposal(proposal);
    setFeedback('Proposta exemplo criada.');
  }

  function updateProposalStatus(proposal: ClientProposal, status: ClientProposalStatus) {
    const updatedProposal = upsertClientProposal({ ...proposal, ...statusTimestampPatch(status) });
    refresh();
    setPreviewProposal((current) => (current?.id === proposal.id ? updatedProposal : current));
    setFeedback(`Proposta marcada como ${clientProposalStatusLabel(status).toLowerCase()}.`);
  }

  async function copyProposalText(proposal: ClientProposal) {
    const text = buildClientProposalShareText(proposal);
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Texto da proposta copiado para envio ao cliente.');
    } catch {
      setFeedback('Não foi possível copiar automaticamente. Abra o WhatsApp ou selecione o texto manualmente em uma próxima etapa.');
    }
  }

  function openWhatsApp(proposal: ClientProposal) {
    window.open(buildClientProposalWhatsAppUrl(proposal), '_blank', 'noopener,noreferrer');
    updateProposalStatus(proposal, 'sent');
  }

  function removeProposal(id: string) {
    setProposals(deleteClientProposal(id));
    setPreviewProposal((current) => (current?.id === id ? null : current));
    setFeedback('Proposta removida.');
  }

  return (
    <section className="client-proposal-workspace">
      <div className="client-proposal-header">
        <div>
          <span className="orca-kicker">Aferix Cliente</span>
          <h2>Propostas públicas do cliente</h2>
          <p>Base inicial para gerar visão simplificada do cliente, com preço final, materiais que ele compra, status e aceite.</p>
        </div>
        <strong>{proposals.length} proposta(s)</strong>
      </div>

      <div className="client-proposal-card">
        <div>
          <strong>Gerar proposta do cliente</strong>
          <small>{proposalReadyCaptures.length} item(ns) técnico(s) disponíveis para transformar em proposta pública.</small>
        </div>
        <div className="client-proposal-actions">
          <button className="primary-action inline-action" type="button" onClick={createProposalFromCurrentBudget}>Criar proposta do orçamento atual</button>
          <button className="secondary-action inline-action" type="button" onClick={createExampleProposal}>Criar proposta exemplo</button>
          <button className="secondary-action inline-action" type="button" onClick={refresh}>Atualizar lista</button>
        </div>
        <label className="client-proposal-search">
          <span>Buscar proposta</span>
          <input value={query} placeholder="Cliente, título, profissional..." onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      {previewProposal && <ClientProposalPreview proposal={previewProposal} onClose={() => setPreviewProposal(null)} />}

      <div className="client-proposal-list">
        {filteredProposals.length === 0 ? (
          <div className="client-proposal-empty">Nenhuma proposta pública criada ainda.</div>
        ) : filteredProposals.map((proposal) => (
          <article className={previewProposal?.id === proposal.id ? 'client-proposal-item is-previewing' : 'client-proposal-item'} key={proposal.id}>
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
              <button className="primary-action inline-action" type="button" onClick={() => setPreviewProposal(proposal)}>Ver prévia / PDF</button>
              <button className="primary-action inline-action" type="button" onClick={() => copyProposalText(proposal)}>Copiar texto</button>
              <button className="secondary-action inline-action" type="button" onClick={() => openWhatsApp(proposal)}>Abrir WhatsApp</button>
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
