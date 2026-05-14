export type ClientProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';

export interface ClientProposalPublicItem {
  id: string;
  description: string;
  quantity: number;
  unitLabel?: string;
  unitPrice?: number;
  totalPrice?: number;
  category: 'service' | 'material' | 'orientation' | 'other';
  visibleToClient: boolean;
  notes?: string;
}

export interface ClientPurchaseMaterialItem {
  id: string;
  description: string;
  quantity: number;
  referenceUnitValue?: number;
  referenceTotalValue?: number;
  specificationNotes?: string;
  requiredBeforeService?: boolean;
}

export interface ClientProposal {
  id: string;
  publicToken: string;
  status: ClientProposalStatus;
  professionalId?: string;
  companyId?: string;
  clientId?: string;
  workOrderId?: string;
  budgetId?: string;
  title: string;
  clientName: string;
  professionalDisplayName: string;
  professionalContact?: string;
  summary: string;
  items: ClientProposalPublicItem[];
  clientPurchaseMaterials: ClientPurchaseMaterialItem[];
  subtotal: number;
  discount: number;
  total: number;
  validityText: string;
  paymentTerms: string;
  publicNotes: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  decidedAt?: string;
}

const STORAGE_KEY = 'orcaos:client-proposals:v1';

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function isClientProposal(value: unknown): value is ClientProposal {
  if (!value || typeof value !== 'object') return false;
  const proposal = value as Partial<ClientProposal>;
  return (
    typeof proposal.id === 'string' &&
    typeof proposal.publicToken === 'string' &&
    typeof proposal.title === 'string' &&
    Array.isArray(proposal.items) &&
    Array.isArray(proposal.clientPurchaseMaterials)
  );
}

function safeParseProposals(value: string | null): ClientProposal[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isClientProposal);
  } catch {
    return [];
  }
}

export function loadClientProposals(): ClientProposal[] {
  if (typeof window === 'undefined') return [];
  return safeParseProposals(window.localStorage.getItem(STORAGE_KEY));
}

export function saveClientProposals(proposals: ClientProposal[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

export function createClientProposalDraft(input: Partial<ClientProposal> = {}): ClientProposal {
  const timestamp = new Date().toISOString();
  return {
    id: input.id ?? createId('client-proposal'),
    publicToken: input.publicToken ?? createId('public-token'),
    status: input.status ?? 'draft',
    professionalId: input.professionalId,
    companyId: input.companyId,
    clientId: input.clientId,
    workOrderId: input.workOrderId,
    budgetId: input.budgetId,
    title: input.title ?? 'Proposta de serviço',
    clientName: input.clientName ?? 'Cliente',
    professionalDisplayName: input.professionalDisplayName ?? 'Profissional',
    professionalContact: input.professionalContact,
    summary: input.summary ?? 'Proposta gerada pelo Aferix.',
    items: input.items ?? [],
    clientPurchaseMaterials: input.clientPurchaseMaterials ?? [],
    subtotal: input.subtotal ?? 0,
    discount: input.discount ?? 0,
    total: input.total ?? 0,
    validityText: input.validityText ?? '7 dias',
    paymentTerms: input.paymentTerms ?? 'Condições de pagamento a combinar.',
    publicNotes: input.publicNotes ?? 'Valores sujeitos à confirmação após vistoria e validação técnica.',
    internalNotes: input.internalNotes,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: timestamp,
    sentAt: input.sentAt,
    viewedAt: input.viewedAt,
    decidedAt: input.decidedAt,
  };
}

export function upsertClientProposal(proposal: ClientProposal): ClientProposal {
  const proposals = loadClientProposals();
  const timestamp = new Date().toISOString();
  const nextProposal = { ...proposal, updatedAt: timestamp };
  const exists = proposals.some((item) => item.id === proposal.id);
  const nextProposals = exists ? proposals.map((item) => (item.id === proposal.id ? nextProposal : item)) : [nextProposal, ...proposals];
  saveClientProposals(nextProposals);
  return nextProposal;
}

export function deleteClientProposal(id: string): ClientProposal[] {
  const nextProposals = loadClientProposals().filter((proposal) => proposal.id !== id);
  saveClientProposals(nextProposals);
  return nextProposals;
}

export function clientProposalStatusLabel(status: ClientProposalStatus): string {
  const labels: Record<ClientProposalStatus, string> = {
    draft: 'Rascunho',
    sent: 'Enviada',
    viewed: 'Visualizada',
    approved: 'Aprovada',
    rejected: 'Recusada',
    expired: 'Expirada',
  };
  return labels[status];
}
