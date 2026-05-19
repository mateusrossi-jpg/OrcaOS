import { useEffect, useMemo, useState } from 'react';
import type { Client, Service as WorkOrder } from '../../../core/types/business';
import {
  loadActiveWorkOrderId,
  loadClients,
  loadWorkOrders,
  saveActiveWorkOrderId,
  saveClients,
  saveWorkOrders,
} from '../storage/clientWorkOrderStorage';
import { loadSavedBudgets } from '../../budgets/storage/savedBudgetsStorage';
import { ContextBanner, MetricCard, Modal, TextArea, MonetaryInput } from '../../../app/components/ui';
import './ClientWorkOrderWorkspace.css';

type ClientOsSection = 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';

interface ClientWorkOrderWorkspaceProps {
  initialSection?: ClientOsSection;
  sectionRequestKey?: number;
  onContextChange?: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets?: () => void;
}

interface ClientDraft {
  name: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  street: string;
  addressNumber: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  stateRegistration: string;
  contributorType: NonNullable<Client['contributorType']>;
  creditLimit: number;
  additionalContacts: string;
  salesHistoryNotes: string;
  notes: string;
}

interface WorkOrderDraft {
  clientId: string;
  title: string;
  description: string;
  address: string;
  priority: NonNullable<WorkOrder['priority']>;
  status: WorkOrder['status'];
  scheduledDate: string;
  paymentStatus: WorkOrder['paymentStatus'];
}

const CLIENT_OS_VISIBLE_LIMIT = 5;

function recentTimestamp(item: { updatedAt?: string; createdAt?: string }): string {
  return item.updatedAt ?? item.createdAt ?? '';
}

const emptyClientDraft: ClientDraft = {
  name: '',
  documentNumber: '',
  phone: '',
  email: '',
  address: '',
  street: '',
  addressNumber: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  postalCode: '',
  stateRegistration: '',
  contributorType: 'not-informed',
  creditLimit: 0,
  additionalContacts: '',
  salesHistoryNotes: '',
  notes: '',
};

const emptyWorkOrderDraft: WorkOrderDraft = {
  clientId: '',
  title: '',
  description: '',
  address: '',
  priority: 'normal',
  status: 'in-progress',
  scheduledDate: '',
  paymentStatus: 'pending',
};

function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function formatDateTime(value?: string): string {
  if (!value) return 'Sem data';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status: WorkOrder['status']): string {
  const labels: Record<WorkOrder['status'], string> = {
    'in-progress': 'Em execução',
    done: 'Concluído',
    cancelled: 'Cancelado',
  };

  return labels[status];
}

function paymentStatusLabel(status: WorkOrder['paymentStatus']): string {
  const labels: Record<WorkOrder['paymentStatus'], string> = {
    pending: 'Pendente',
    partial: 'Parcial',
    paid: 'Pago',
  };

  return labels[status];
}

function priorityLabel(priority?: WorkOrder['priority']): string {
  const labels: Record<NonNullable<WorkOrder['priority']>, string> = {
    low: 'Baixa',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
  };

  return labels[priority ?? 'normal'];
}

function budgetStatusLabel(status: string): string {
  if (status === 'sent') return 'Enviado';
  if (status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Recusado';
  if (status === 'expired') return 'Vencido';
  if (status === 'cancelled') return 'Cancelado';
  return 'Rascunho';
}

function buildClientAddress(draft: ClientDraft): string {
  const line1 = [draft.street.trim(), draft.addressNumber.trim()].filter(Boolean).join(', ');
  const line2 = [draft.complement.trim(), draft.district.trim()].filter(Boolean).join(' - ');
  const line3 = [draft.city.trim(), draft.state.trim()].filter(Boolean).join(' / ');
  const line4 = draft.postalCode.trim();
  return [draft.address.trim(), line1, line2, line3, line4].filter(Boolean).join(' · ');
}

function clientSearchText(client: Client): string {
  return [
    client.name,
    client.documentNumber,
    client.phone,
    client.email,
    client.address,
    client.street,
    client.district,
    client.city,
    client.state,
    client.postalCode,
    client.stateRegistration,
    client.additionalContacts,
    client.salesHistoryNotes,
    client.notes,
  ].filter(Boolean).join(' ').toLowerCase();
}

function clientToDraft(client: Client): ClientDraft {
  return {
    name: client.name,
    documentNumber: client.documentNumber ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    address: client.address ?? '',
    street: client.street ?? '',
    addressNumber: client.addressNumber ?? '',
    complement: client.complement ?? '',
    district: client.district ?? '',
    city: client.city ?? '',
    state: client.state ?? '',
    postalCode: client.postalCode ?? '',
    stateRegistration: client.stateRegistration ?? '',
    contributorType: client.contributorType ?? 'not-informed',
    creditLimit: Number(client.creditLimit) || 0,
    additionalContacts: client.additionalContacts ?? '',
    salesHistoryNotes: client.salesHistoryNotes ?? '',
    notes: client.notes ?? '',
  };
}

export function ClientWorkOrderWorkspace({ initialSection = 'dashboard', sectionRequestKey = 0, onContextChange, onOpenBudgets }: ClientWorkOrderWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<ClientOsSection>('dashboard');
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [editingWorkOrderId, setEditingWorkOrderId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientDraft, setClientDraft] = useState<ClientDraft>(emptyClientDraft);
  const [workOrderDraft, setWorkOrderDraft] = useState<WorkOrderDraft>(emptyWorkOrderDraft);
  const [clientSearch, setClientSearch] = useState('');
  const [workOrderSearch, setWorkOrderSearch] = useState('');
  const [clientPickerSearch, setClientPickerSearch] = useState('');
  const [savedBudgets, setSavedBudgets] = useState(() => loadSavedBudgets());
  
  // Modals
  const [modalType, setModalType] = useState<'removeClient' | 'removeWorkOrder' | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const activeWorkOrder = workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null;
  const activeClient = activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null;

  const sortedWorkOrders = useMemo(
    () => [...workOrders].sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? '')),
    [workOrders],
  );
  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    const source = query ? clients.filter((client) => clientSearchText(client).includes(query)) : [];
    return [...source].sort((a, b) => recentTimestamp(b).localeCompare(recentTimestamp(a)));
  }, [clientSearch, clients]);
  const filteredWorkOrders = useMemo(() => {
    const query = workOrderSearch.trim().toLowerCase();
    if (!query) return [];
    return sortedWorkOrders.filter((workOrder) => {
      const client = workOrder.clientId ? clients.find((item) => item.id === workOrder.clientId) : null;
      return [workOrder.title, workOrder.description, workOrder.address, statusLabel(workOrder.status), priorityLabel(workOrder.priority), client?.name, client?.phone, client?.email].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [clients, sortedWorkOrders, workOrderSearch]);
  const clientPickerResults = useMemo(() => {
    const query = clientPickerSearch.trim().toLowerCase();
    const source = query ? clients.filter((client) => clientSearchText(client).includes(query)) : [];
    return source.slice(0, 6);
  }, [clientPickerSearch, clients]);
  const visibleClients = filteredClients.slice(0, CLIENT_OS_VISIBLE_LIMIT);
  const hiddenClientCount = Math.max(filteredClients.length - visibleClients.length, 0);
  const visibleWorkOrders = filteredWorkOrders.slice(0, CLIENT_OS_VISIBLE_LIMIT);
  const hiddenWorkOrderCount = Math.max(filteredWorkOrders.length - visibleWorkOrders.length, 0);

  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled').length;
  const doneWorkOrders = workOrders.filter((workOrder) => workOrder.status === 'done').length;
  const nextWorkOrders = useMemo(
    () => sortedWorkOrders
      .filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled')
      .sort((a, b) => {
        if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
        if (a.scheduledDate) return -1;
        if (b.scheduledDate) return 1;
        return (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? '');
      })
      .slice(0, 3),
    [sortedWorkOrders],
  );
  const pendingBudgetList = useMemo(
    () => savedBudgets
      .filter((budget) => budget.status === 'draft' || budget.status === 'sent')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3),
    [savedBudgets],
  );

  useEffect(() => {
    const refreshBudgets = () => setSavedBudgets(loadSavedBudgets());
    refreshBudgets();
    window.addEventListener('focus', refreshBudgets);
    window.addEventListener('storage', refreshBudgets);

    return () => {
      window.removeEventListener('focus', refreshBudgets);
      window.removeEventListener('storage', refreshBudgets);
    };
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection, sectionRequestKey]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    saveWorkOrders(workOrders);
  }, [workOrders]);

  useEffect(() => {
    saveActiveWorkOrderId(activeWorkOrderId);
  }, [activeWorkOrderId]);

  useEffect(() => {
    onContextChange?.(clients, workOrders, activeWorkOrderId);
  }, [activeWorkOrderId, clients, onContextChange, workOrders]);

  function updateClientDraft<K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) {
    setClientDraft((current) => ({ ...current, [key]: value }));
  }

  function updateWorkOrderDraft<K extends keyof WorkOrderDraft>(key: K, value: WorkOrderDraft[K]) {
    setWorkOrderDraft((current) => ({ ...current, [key]: value }));
  }

  function addClient() {
    const now = new Date().toISOString();
    const address = buildClientAddress(clientDraft);
    const existingClient = editingClientId ? clients.find((client) => client.id === editingClientId) : null;
    const client: Client = {
      id: existingClient?.id ?? createId('client'),
      name: clientDraft.name.trim() || 'Cliente',
      documentNumber: clientDraft.documentNumber.trim() || undefined,
      phone: clientDraft.phone.trim() || undefined,
      email: clientDraft.email.trim() || undefined,
      address: address || undefined,
      street: clientDraft.street.trim() || undefined,
      addressNumber: clientDraft.addressNumber.trim() || undefined,
      complement: clientDraft.complement.trim() || undefined,
      district: clientDraft.district.trim() || undefined,
      city: clientDraft.city.trim() || undefined,
      state: clientDraft.state.trim() || undefined,
      postalCode: clientDraft.postalCode.trim() || undefined,
      stateRegistration: clientDraft.stateRegistration.trim() || undefined,
      contributorType: clientDraft.contributorType,
      creditLimit: String(clientDraft.creditLimit) || undefined,
      additionalContacts: clientDraft.additionalContacts.trim() || undefined,
      salesHistoryNotes: clientDraft.salesHistoryNotes.trim() || undefined,
      notes: clientDraft.notes.trim() || undefined,
      createdAt: existingClient?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingClient) {
      setClients((current) => current.map((currentClient) => (currentClient.id === existingClient.id ? client : currentClient)));
      setWorkOrderDraft((current) => ({ ...current, clientId: client.id, address: current.address || client.address || '' }));
      setEditingClientId(null);
      setClientDraft(emptyClientDraft);
      setActiveSection('clients');
      return;
    }

    setClients((current) => [client, ...current]);
    setWorkOrderDraft((current) => ({ ...current, clientId: client.id, address: client.address ?? current.address }));
    setClientDraft(emptyClientDraft);
    setActiveSection('newWorkOrder');
  }

  function confirmRemoveClient(clientId: string) {
    setItemToRemove(clientId);
    setModalType('removeClient');
  }

  function executeRemoveClient() {
    if (!itemToRemove) return;
    const clientId = itemToRemove;
    setClients((current) => current.filter((client) => client.id !== clientId));
    setWorkOrders((current) => current.map((workOrder) => (workOrder.clientId === clientId ? { ...workOrder, clientId: undefined, updatedAt: new Date().toISOString() } : workOrder)));
    setItemToRemove(null);
    setModalType(null);
  }

  function addWorkOrder() {
    if (!workOrderDraft.title.trim()) return;

    const now = new Date().toISOString();
    const selectedClient = clients.find((client) => client.id === workOrderDraft.clientId);
    if (editingWorkOrderId) {
      setWorkOrders((current) => current.map((workOrder) => (workOrder.id === editingWorkOrderId ? {
        ...workOrder,
        clientId: workOrderDraft.clientId || undefined,
        title: workOrderDraft.title.trim(),
        description: workOrderDraft.description.trim() || undefined,
        address: workOrderDraft.address.trim() || selectedClient?.address || undefined,
        priority: workOrderDraft.priority,
        status: workOrderDraft.status,
        scheduledDate: workOrderDraft.scheduledDate || undefined,
        paymentStatus: workOrderDraft.paymentStatus,
        updatedAt: now,
      } : workOrder)));
      setActiveWorkOrderId(editingWorkOrderId);
      setEditingWorkOrderId(null);
      setWorkOrderDraft({ ...emptyWorkOrderDraft, clientId: workOrderDraft.clientId || '', address: selectedClient?.address ?? '' });
      setActiveSection('workOrders');
      return;
    }

    const workOrder: WorkOrder = {
      id: createId('service'),
      clientId: workOrderDraft.clientId || undefined,
      title: workOrderDraft.title.trim(),
      description: workOrderDraft.description.trim() || undefined,
      address: workOrderDraft.address.trim() || selectedClient?.address || undefined,
      priority: workOrderDraft.priority,
      status: workOrderDraft.status,
      scheduledDate: workOrderDraft.scheduledDate || undefined,
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    setWorkOrders((current) => [workOrder, ...current]);
    setActiveWorkOrderId(workOrder.id);
    setEditingWorkOrderId(null);
    setWorkOrderDraft({ ...emptyWorkOrderDraft, clientId: workOrder.clientId ?? '', address: selectedClient?.address ?? '' });
    setActiveSection('dashboard');
  }

  function confirmRemoveWorkOrder(workOrderId: string) {
    setItemToRemove(workOrderId);
    setModalType('removeWorkOrder');
  }

  function executeRemoveWorkOrder() {
    if (!itemToRemove) return;
    const workOrderId = itemToRemove;
    setWorkOrders((current) => current.filter((workOrder) => workOrder.id !== workOrderId));
    if (activeWorkOrderId === workOrderId) setActiveWorkOrderId(null);
    setItemToRemove(null);
    setModalType(null);
  }

  function updateWorkOrderStatus(workOrderId: string, status: WorkOrder['status']) {
    setWorkOrders((current) => current.map((workOrder) => (workOrder.id === workOrderId ? { ...workOrder, status, updatedAt: new Date().toISOString() } : workOrder)));
  }

  function openWorkOrderForEdit(workOrder: WorkOrder) {
    setWorkOrderDraft({
      clientId: workOrder.clientId ?? '',
      title: workOrder.title,
      description: workOrder.description ?? '',
      address: workOrder.address ?? '',
      scheduledDate: workOrder.scheduledDate ?? '',
      priority: workOrder.priority ?? 'normal',
      status: workOrder.status,
      paymentStatus: workOrder.paymentStatus,
    });
    setEditingWorkOrderId(workOrder.id);
    setActiveWorkOrderId(workOrder.id);
    setActiveSection('newWorkOrder');
  }

  function openClientForEdit(client: Client) {
    setClientDraft(clientToDraft(client));
    setEditingClientId(client.id);
    setActiveSection('newClient');
  }

  function cancelClientEdit() {
    setEditingClientId(null);
    setClientDraft(emptyClientDraft);
    setActiveSection('clients');
  }

  function fillWorkOrderAddressFromClient(clientId: string) {
    const selectedClient = clients.find((client) => client.id === clientId);
    updateWorkOrderDraft('clientId', clientId);

    if (selectedClient?.address && !workOrderDraft.address.trim()) {
      updateWorkOrderDraft('address', selectedClient.address);
    }
  }

  return (
    <div className="client-os-workspace refined-client-os">
      <header className="screen-header">
        <h1>Gestão de Clientes</h1>
      </header>

      <ContextBanner
        title={activeWorkOrder ? activeWorkOrder.title : 'Nenhum atendimento ativo'}
        description={activeWorkOrder ? `${activeClient?.name ?? 'Cliente não vinculado'} · ${statusLabel(activeWorkOrder.status)}` : 'Selecione um atendimento para usar como contexto.'}
        actionLabel={activeWorkOrder ? 'Limpar contexto' : 'Novo atendimento'}
        onAction={activeWorkOrder ? () => setActiveWorkOrderId(null) : () => setActiveSection('newWorkOrder')}
      />

      <div className="dashboard-finance-tiles" style={{ marginBottom: '1.5rem' }}>
        <MetricCard label="Clientes" value={clients.length} />
        <MetricCard label="Em execução" value={openWorkOrders} tone={openWorkOrders > 0 ? 'brand' : 'default'} />
        <MetricCard label="Concluídos" value={doneWorkOrders} />
      </div>

      <div className="home-action-toolbar">
        <button className={`ghost-action ${activeSection === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('dashboard')}>Painel</button>
        <button className={`ghost-action ${activeSection === 'clients' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('clients')}>Clientes</button>
        <button className={`ghost-action ${activeSection === 'workOrders' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('workOrders')}>Atendimentos</button>
      </div>

      {activeSection === 'dashboard' && (
        <div className="client-os-indicator-grid">
          <div className="aferix-panel-card">
            <header>
              <div>
                <h2>Atendimentos Recentes</h2>
              </div>
              <button className="ghost-action" type="button" onClick={() => setActiveSection('workOrders')}>Ver Todos</button>
            </header>
            <div className="continuous-list">
              {nextWorkOrders.length === 0 ? <div className="continuous-list-empty">Nenhum atendimento registrado.</div> : nextWorkOrders.map((workOrder) => {
                const client = workOrder.clientId ? clients.find((item) => item.id === workOrder.clientId) : null;
                const isActive = workOrder.id === activeWorkOrderId;
                return (
                  <article className={`continuous-list-item ${isActive ? 'active' : ''}`} key={workOrder.id} onClick={() => setActiveWorkOrderId(workOrder.id)} style={{ cursor: 'pointer' }}>
                    <div className="client-col">
                      <strong>{workOrder.title}</strong>
                      <small>{client?.name ?? 'S/ Cliente'} · {statusLabel(workOrder.status)} · {paymentStatusLabel(workOrder.paymentStatus)}</small>
                    </div>
                    <div className="value-col" style={{ fontSize: '0.7rem' }}>{formatDateTime(workOrder.scheduledDate)}</div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="aferix-panel-card">
            <header>
              <div>
                <h2>Orçamentos Pendentes</h2>
              </div>
              <button className="ghost-action" type="button" onClick={onOpenBudgets}>Ver Todos</button>
            </header>
            <div className="continuous-list">
              {pendingBudgetList.length === 0 ? <div className="continuous-list-empty">Nenhum orçamento pendente.</div> : pendingBudgetList.map((budget) => (
                <article className="continuous-list-item" key={budget.id}>
                  <div className="client-col">
                    <strong>{budget.title || 'S/ Título'}</strong>
                    <small>{budget.clientName || 'S/ Cliente'} · {budgetStatusLabel(budget.status)}</small>
                  </div>
                  <div className="value-col" style={{ fontSize: '0.7rem' }}>{formatDateTime(budget.updatedAt)}</div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'newClient' && (
        <div className="aferix-panel-card">
          <header>
            <div>
              <h2>{editingClientId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            </div>
          </header>

          <div className="client-os-grid">
            <div className="client-form-section client-os-wide">
              <div className="client-form-section-head"><strong>Identificação</strong><small>Dados para localizar cliente, proposta e faturamento gerencial.</small></div>
            </div>
            <label className="budget-field client-os-wide"><span>Nome / razão social</span><input value={clientDraft.name} placeholder="Opcional" onChange={(event) => updateClientDraft('name', event.target.value)} /></label>
            <label className="budget-field"><span>CPF / CNPJ</span><input value={clientDraft.documentNumber} placeholder="Opcional" onChange={(event) => updateClientDraft('documentNumber', event.target.value)} /></label>
            <label className="budget-field"><span>Telefone / WhatsApp</span><input inputMode="tel" value={clientDraft.phone} onChange={(event) => updateClientDraft('phone', event.target.value)} /></label>
            <label className="budget-field"><span>E-mail</span><input type="email" value={clientDraft.email} placeholder="Opcional" onChange={(event) => updateClientDraft('email', event.target.value)} /></label>
            <label className="budget-field client-os-wide"><span>Contatos adicionais</span><TextArea value={clientDraft.additionalContacts} placeholder="Ex.: comprador, síndico, financeiro, segundo telefone..." onChange={(value) => updateClientDraft('additionalContacts', value)} /></label>

            <div className="client-form-section client-os-wide">
              <div className="client-form-section-head"><strong>Endereço completo</strong><small>Preencha por partes ou use o campo livre se estiver na visita.</small></div>
            </div>
            <label className="budget-field client-os-wide"><span>Endereço livre</span><input value={clientDraft.address} placeholder="Rua, número, bairro, cidade..." onChange={(event) => updateClientDraft('address', event.target.value)} /></label>
            <label className="budget-field client-os-wide"><span>Logradouro</span><input value={clientDraft.street} placeholder="Rua, avenida, estrada..." onChange={(event) => updateClientDraft('street', event.target.value)} /></label>
            <label className="budget-field"><span>Número</span><input value={clientDraft.addressNumber} placeholder="Opcional" onChange={(event) => updateClientDraft('addressNumber', event.target.value)} /></label>
            <label className="budget-field"><span>Complemento</span><input value={clientDraft.complement} placeholder="Casa, apto, bloco..." onChange={(event) => updateClientDraft('complement', event.target.value)} /></label>
            <label className="budget-field"><span>Bairro</span><input value={clientDraft.district} placeholder="Opcional" onChange={(event) => updateClientDraft('district', event.target.value)} /></label>
            <label className="budget-field"><span>CEP</span><input inputMode="numeric" value={clientDraft.postalCode} placeholder="Opcional" onChange={(event) => updateClientDraft('postalCode', event.target.value)} /></label>
            <label className="budget-field"><span>Cidade</span><input value={clientDraft.city} placeholder="Opcional" onChange={(event) => updateClientDraft('city', event.target.value)} /></label>
            <label className="budget-field"><span>UF</span><input value={clientDraft.state} placeholder="Ex.: SP" onChange={(event) => updateClientDraft('state', event.target.value.toUpperCase().slice(0, 2))} /></label>

            <div className="client-form-section client-os-wide">
              <div className="client-form-section-head"><strong>Fiscal e comercial</strong><small>Preparado para ERP leve; nenhum campo é obrigatório.</small></div>
            </div>
            <label className="budget-field"><span>Inscrição Estadual</span><input value={clientDraft.stateRegistration} placeholder="Opcional" onChange={(event) => updateClientDraft('stateRegistration', event.target.value)} /></label>
            <label className="budget-field"><span>Tipo de contribuinte</span><select value={clientDraft.contributorType} onChange={(event) => updateClientDraft('contributorType', event.target.value as ClientDraft['contributorType'])}><option value="not-informed">Não informado</option><option value="individual">Pessoa física</option><option value="taxpayer">Contribuinte ICMS</option><option value="exempt">Isento</option><option value="non-taxpayer">Não contribuinte</option></select></label>
            <MonetaryInput label="Limite de crédito" value={clientDraft.creditLimit} onChange={(value) => updateClientDraft('creditLimit', value)} />
            <label className="budget-field client-os-wide"><span>Histórico / vendas</span><TextArea value={clientDraft.salesHistoryNotes} placeholder="Resumo manual de compras, atendimentos recorrentes, preferências ou restrições." onChange={(value) => updateClientDraft('salesHistoryNotes', value)} /></label>
            <label className="budget-field client-os-wide"><span>Observações gerais</span><TextArea value={clientDraft.notes} placeholder="Informações úteis para atendimento e relacionamento." onChange={(value) => updateClientDraft('notes', value)} /></label>
          </div>

          <div className="client-os-form-actions">
            <button className="ghost-action" type="button" onClick={addClient}>{editingClientId ? 'Salvar' : 'Continuar'}</button>
            {editingClientId ? (
              <button className="ghost-action" type="button" onClick={cancelClientEdit}>Cancelar</button>
            ) : (
              <button className="ghost-action" type="button" onClick={() => { setWorkOrderDraft((current) => ({ ...current, clientId: '' })); setActiveSection('newWorkOrder'); }}>Pular</button>
            )}
          </div>
        </div>
      )}

      {activeSection === 'newWorkOrder' && (
        <div className="aferix-panel-card work-order-form-panel">
          <header className="form-header">
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingWorkOrderId ? 'Editar Atendimento/Serviço' : 'Novo Atendimento/Serviço'}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--aferix-text-muted)' }}>Defina os detalhes da execução e vínculo.</p>
            </div>
          </header>

          <div className="client-os-vertical-form">
            <div className="form-section-block">
              <div className="client-picker-wrapper">
                <label className="form-label-top">Cliente vinculado</label>
                <div className={`selected-client-display ${!workOrderDraft.clientId ? 'empty' : 'active'}`}>
                  {workOrderDraft.clientId ? (
                    <>
                      <strong>{clients.find((client) => client.id === workOrderDraft.clientId)?.name}</strong>
                      <small>Cliente selecionado para este atendimento/serviço</small>
                    </>
                  ) : (
                    <>
                      <strong>Sem cliente vinculado</strong>
                      <small>Este atendimento ficará avulso ou aguardando seleção</small>
                    </>
                  )}
                </div>

                <label className="form-label-top" style={{ marginTop: '1.5rem' }}>Buscar cliente</label>
                <div className="search-input-wrapper">
                  <input 
                    className="premium-input"
                    value={clientPickerSearch} 
                    placeholder="Nome, telefone ou endereço" 
                    onChange={(event) => setClientPickerSearch(event.target.value)} 
                  />
                </div>
                
                {clientPickerSearch.trim() && (
                  <div className="client-picker-results mini-picker">
                    <button className={!workOrderDraft.clientId ? 'active' : ''} type="button" onClick={() => { fillWorkOrderAddressFromClient(''); setClientPickerSearch(''); }}>
                      <strong>Remover vínculo</strong>
                    </button>
                    {clientPickerResults.map((client) => (
                      <button className={workOrderDraft.clientId === client.id ? 'active' : ''} key={client.id} type="button" onClick={() => { fillWorkOrderAddressFromClient(client.id); setClientPickerSearch(''); }}>
                        <strong>{client.name}</strong>
                        <small>{[client.phone, client.email].filter(Boolean).join(' · ')}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-grid-split">
              <label className="catalog-field">
                <span>Status da execução</span>
                <select value={workOrderDraft.status} onChange={(event) => updateWorkOrderDraft('status', event.target.value as WorkOrder['status'])}>
                  <option value="in-progress">Em execução</option>
                  <option value="done">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </label>
              <label className="catalog-field">
                <span>Pagamento</span>
                <select value={workOrderDraft.paymentStatus} onChange={(event) => updateWorkOrderDraft('paymentStatus', event.target.value as WorkOrder['paymentStatus'])}>
                  <option value="pending">Pendente</option>
                  <option value="partial">Parcial</option>
                  <option value="paid">Pago</option>
                </select>
              </label>
            </div>

            <label className="catalog-field">
              <span>Título do atendimento/serviço</span>
              <input value={workOrderDraft.title} placeholder="Ex.: Instalação de tomadas no quarto" onChange={(event) => updateWorkOrderDraft('title', event.target.value)} />
            </label>

            <label className="catalog-field">
              <span>Descrição inicial</span>
              <TextArea 
                value={workOrderDraft.description} 
                placeholder="Ex.: Cliente quer adicionar 3 pontos e revisar tomada antiga." 
                onChange={(value) => updateWorkOrderDraft('description', value)} 
              />
            </label>

            <div className="form-grid-split">
              <label className="catalog-field">
                <span>Prioridade</span>
                <select value={workOrderDraft.priority} onChange={(event) => updateWorkOrderDraft('priority', event.target.value as NonNullable<WorkOrder['priority']>)}>
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
              <label className="catalog-field">
                <span>Data agendada</span>
                <input type="datetime-local" value={workOrderDraft.scheduledDate} onChange={(event) => updateWorkOrderDraft('scheduledDate', event.target.value)} />
              </label>
            </div>

            <label className="catalog-field">
              <span>Endereço do atendimento/serviço</span>
              <input value={workOrderDraft.address} placeholder="Local da execução..." onChange={(event) => updateWorkOrderDraft('address', event.target.value)} />
            </label>
          </div>

          <div className="client-os-form-actions-premium">
            <button className="primary-action full-cta" type="button" disabled={!workOrderDraft.title.trim()} onClick={addWorkOrder}>
              {editingWorkOrderId ? 'Salvar Alterações' : 'Criar Atendimento/Serviço'}
            </button>
            {editingWorkOrderId && (
              <button className="secondary-action full-cta" type="button" onClick={() => { setEditingWorkOrderId(null); setWorkOrderDraft(emptyWorkOrderDraft); setActiveSection('workOrders'); }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {activeSection === 'clients' && (
        <div className="aferix-panel-card">
          <header className="client-os-section-header">
            <div>
              <h2>Clientes</h2>
              <p>Cadastro e consulta de clientes.</p>
            </div>
            <button className="ghost-action" type="button" onClick={() => setActiveSection('newClient')}>Novo cliente</button>
          </header>
          <div className="continuous-list">
            <div className="continuous-list-item" style={{ padding: '0.5rem' }}>
              <input value={clientSearch} placeholder="Buscar por nome, telefone ou endereço..." onChange={(event) => setClientSearch(event.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
            {clients.length === 0 ? <div className="continuous-list-empty">Nenhum cliente cadastrado.</div> : filteredClients.length === 0 && clientSearch.trim() ? <div className="continuous-list-empty">Nenhum resultado para "{clientSearch}".</div> : visibleClients.map((client) => (
              <article className="continuous-list-item" key={client.id}>
                <div className="client-col">
                  <strong>{client.name}</strong>
                  <small>{[client.phone, client.email].filter(Boolean).join(' · ') || 'Sem contato'}</small>
                  <small>{client.address || 'Sem endereço'}</small>
                </div>
                <div className="catalog-row-actions">
                  <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => openClientForEdit(client)}>Editar</button>
                  <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => { setWorkOrderDraft((current) => ({ ...current, clientId: client.id, address: client.address ?? current.address })); setActiveSection('newWorkOrder'); }}>Novo Atendimento</button>
                  <button className="ghost-action danger-ghost" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => confirmRemoveClient(client.id)}>Excluir</button>
                </div>
              </article>
            ))}
            {hiddenClientCount > 0 && <div className="continuous-list-empty">+{hiddenClientCount} clientes.</div>}
          </div>
        </div>
      )}

      {activeSection === 'workOrders' && (
        <div className="aferix-panel-card">
          <header className="client-os-section-header">
            <div>
              <h2>Atendimentos/Serviços</h2>
              <p>Histórico de execuções.</p>
            </div>
            {activeWorkOrder && (
              <button className="ghost-action" type="button" onClick={() => setActiveSection('newWorkOrder')}>Novo atendimento</button>
            )}
          </header>
          <div className="continuous-list">
            <div className="continuous-list-item" style={{ padding: '0.5rem' }}>
              <input value={workOrderSearch} placeholder="Buscar por título, cliente ou status..." onChange={(event) => setWorkOrderSearch(event.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
            {workOrders.length === 0 ? <div className="continuous-list-empty">Nenhum atendimento registrado.</div> : filteredWorkOrders.length === 0 && workOrderSearch.trim() ? <div className="continuous-list-empty">Nenhum resultado para "{workOrderSearch}".</div> : visibleWorkOrders.map((workOrder) => {
              const client = workOrder.clientId ? clients.find((item) => item.id === workOrder.clientId) : null;
              const isActive = workOrder.id === activeWorkOrderId;
              return (
                <article className={`continuous-list-item ${isActive ? 'active' : ''}`} key={workOrder.id}>
                  <div className="client-col">
                    <strong>{workOrder.title}</strong>
                    <small>{client?.name ?? 'S/ Cliente'} · {statusLabel(workOrder.status)} · {paymentStatusLabel(workOrder.paymentStatus)}</small>
                    <small>{formatDateTime(workOrder.scheduledDate)}</small>
                  </div>
                  <div className="catalog-row-actions">
                    <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => setActiveWorkOrderId(workOrder.id)}>{isActive ? 'Ativo' : 'Ativar'}</button>
                    <button className="ghost-action" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => openWorkOrderForEdit(workOrder)}>Editar</button>
                    <button className="ghost-action danger-ghost" style={{ minHeight: '32px', fontSize: '0.7rem' }} type="button" onClick={() => confirmRemoveWorkOrder(workOrder.id)}>Excluir</button>
                  </div>
                </article>
              );
            })}
            {hiddenWorkOrderCount > 0 && <div className="continuous-list-empty">+{hiddenWorkOrderCount} atendimentos.</div>}
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <Modal
        isOpen={modalType === 'removeClient'}
        title="Remover Cliente?"
        confirmLabel="Remover"
        tone="danger"
        onClose={() => setModalType(null)}
        onConfirm={executeRemoveClient}
      >
        <p>Os atendimentos vinculados continuam salvos, mas ficarão sem cliente associado. Esta ação não pode ser desfeita.</p>
      </Modal>

      <Modal
        isOpen={modalType === 'removeWorkOrder'}
        title="Remover Atendimento?"
        confirmLabel="Remover"
        tone="danger"
        onClose={() => setModalType(null)}
        onConfirm={executeRemoveWorkOrder}
      >
        <p>Cálculos, orçamentos e relatórios vinculados a este atendimento continuarão salvos. Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}
