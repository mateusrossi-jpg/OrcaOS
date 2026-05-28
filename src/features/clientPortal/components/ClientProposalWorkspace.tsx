import { useMemo, useState } from 'react';
import type { Client, WorkOrder } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { buildClientProposal } from '../../../services/clientProposalBuilderService';
import { professionalProfileService } from '../../../services/professionalProfileService';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import { buildClientProposalShareText, buildClientProposalWhatsAppUrl } from '../storage/clientProposalShareText';
import { useClientProposals } from '../../../hooks/useClientProposals';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import {
  clientProposalStatusLabel,
  createClientProposalDraft,
  type ClientProposal,
  type ClientProposalStatus,
} from '../storage/clientProposalStorage';
import { operationalFacade } from '../../workflow/operationalFacade';
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



export function ClientProposalWorkspace({ technicalCaptures = [], activeClient = null, activeWorkOrder = null }: ClientProposalWorkspaceProps) {
  const { proposals, refresh, addOrUpdateProposal, removeProposal: removeProposalHook } = useClientProposals();
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

  async function createProposalFromCurrentBudget() {
    if (proposalReadyCaptures.length === 0) {
      setFeedback('Nenhum item técnico disponível para gerar orçamento do cliente. Envie serviços ou materiais ao orçamento primeiro.');
      return;
    }

    const proposal = await buildClientProposal({ captures: proposalReadyCaptures, activeClient, activeWorkOrder });
    const timestamp = new Date().toISOString();
    const updatedProposal = { ...proposal, updatedAt: timestamp };
    await addOrUpdateProposal(updatedProposal);
    setPreviewProposal(updatedProposal);
    setFeedback(`Orçamento criado a partir de ${proposalReadyCaptures.length} item(ns) técnico(s).`);
  }

  async function createExampleProposal() {
    const profile = await professionalProfileService.getProfile();
    const proposal = createClientProposalDraft({
      professionalId: profile.professionalId,
      companyId: profile.companyId,
      professionalDisplayName: profile.businessName || profile.professionalName || 'Profissional Aferix',
      professionalContact: [profile.phone, profile.email].filter(Boolean).join(' · '),
      title: 'Orçamento exemplo para cliente',
      clientName: 'Cliente exemplo',
      summary: 'Exemplo de orçamento público separando serviços cobrados e materiais que podem ser comprados pelo cliente.',
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
    const timestamp = new Date().toISOString();
    const updatedProposal = { ...proposal, updatedAt: timestamp };
    await addOrUpdateProposal(updatedProposal);
    setPreviewProposal(updatedProposal);
    setFeedback('Orçamento exemplo criado.');
  }

  async function updateProposalStatus(proposal: ClientProposal, status: ClientProposalStatus) {
    await operationalFacade.changeProposalStatus(proposal.id, status);
    await refresh();
    setPreviewProposal((current) => (current?.id === proposal.id ? { ...current, status } : current));
    setFeedback(`Orçamento marcado como ${clientProposalStatusLabel(status).toLowerCase()}.`);
  }

  async function copyProposalText(proposal: ClientProposal) {
    const text = buildClientProposalShareText(proposal);
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Texto do orçamento copiado para envio ao cliente.');
    } catch {
      setFeedback('Falha ao copiar automaticamente. Abra o WhatsApp ou selecione o texto manualmente em uma próxima etapa.');
    }
  }

  async function openWhatsApp(proposal: ClientProposal) {
    window.open(buildClientProposalWhatsAppUrl(proposal), '_blank', 'noopener,noreferrer');
    await updateProposalStatus(proposal, 'sent');
  }

  async function removeProposal(id: string) {
    await removeProposalHook(id);
    setPreviewProposal((current) => (current?.id === id ? null : current));
    setFeedback('Orçamento removido.');
  }

  return (
    <section className="client-proposal-workspace">
      <div className="client-proposal-header">
        <div>
          <h2>Orçamentos públicos do cliente</h2>
          <p>Base inicial para gerar visão simplificada do cliente, com preço final, materiais que ele compra, status e aceite.</p>
        </div>
        <strong>{proposals.length} orçamento(s)</strong>
      </div>

      <div className="client-proposal-card">
        <div>
          <strong>Gerar orçamento do cliente</strong>
          <small>{proposalReadyCaptures.length} item(ns) técnico(s) disponíveis para transformar em orçamento público.</small>
        </div>
        <div className="client-proposal-actions">
          <button className="primary-action inline-action" type="button" onClick={() => void createProposalFromCurrentBudget()}>Criar orçamento do orçamento atual</button>
          <button className="secondary-action inline-action" type="button" onClick={() => void createExampleProposal()}>Criar orçamento exemplo</button>
          <button className="secondary-action inline-action" type="button" onClick={refresh}>Atualizar lista</button>
        </div>
        <label className="client-proposal-search">
          <span>Buscar orçamento</span>
          <input value={query} placeholder="Cliente, título, profissional..." onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      {previewProposal && <ClientProposalPreview proposal={previewProposal} onClose={() => setPreviewProposal(null)} />}

      <div className="client-proposal-list">
        {filteredProposals.length === 0 ? (
          <div className="client-proposal-empty">Nenhuma orçamento público criada ainda.</div>
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
