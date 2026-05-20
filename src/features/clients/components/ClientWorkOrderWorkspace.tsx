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

const CLIENT_OS_VISIBLE_LIMIT = 10;

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
  if (!value) return 'Sem data agendada';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function statusLabel(status?: WorkOrder['status']): string {
  if (!status) return 'Sem status';
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

export function ClientWorkOrderWorkspace({ initialSection, sectionRequestKey, onContextChange, onOpenBudgets }: ClientWorkOrderWorkspaceProps) {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [activeSection, setActiveSection] = useState<ClientOsSection>(initialSection ?? 'dashboard');

  const [clientSearch, setClientSearch] = useState('');
  const [workOrderSearch, setWorkOrderSearch] = useState('');
  const [clientPickerSearch, setClientPickerSearch] = useState('');

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingWorkOrderId, setEditingWorkOrderId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'removeClient' | 'removeWorkOrder' | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const [clientDraft, setClientDraft] = useState<ClientDraft>(emptyClientDraft);
  const [workOrderDraft, setWorkOrderDraft] = useState<WorkOrderDraft>(emptyWorkOrderDraft);

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection, sectionRequestKey]);

  useEffect(() => { saveClients(clients); onContextChange?.(clients, workOrders, activeWorkOrderId); }, [clients]);
  useEffect(() => { saveWorkOrders(workOrders); onContextChange?.(clients, workOrders, activeWorkOrderId); }, [workOrders]);
  useEffect(() => { saveActiveWorkOrderId(activeWorkOrderId); onContextChange?.(clients, workOrders, activeWorkOrderId); }, [activeWorkOrderId]);

  const activeWorkOrder = useMemo(() => workOrders.find((w) => w.id === activeWorkOrderId) ?? null, [activeWorkOrderId, workOrders]);
  const activeClient = useMemo(() => (activeWorkOrder?.clientId ? clients.find((c) => c.id === activeWorkOrder.clientId) ?? null : null), [activeWorkOrder, clients]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.toLowerCase().trim();
    if (!query) return clients;
    return clients.filter((c) => [c.name, c.email, c.phone, c.address].some((v) => v?.toLowerCase().includes(query)));
  }, [clients, clientSearch]);

  const filteredWorkOrders = useMemo(() => {
    const query = workOrderSearch.toLowerCase().trim();
    if (!query) return workOrders;
    return workOrders.filter((w) => {
      const client = w.clientId ? clients.find((c) => c.id === w.clientId) : null;
      return [w.title, client?.name, w.status, w.description].some((v) => v?.toLowerCase().includes(query));
    });
  }, [workOrders, clients, workOrderSearch]);

  const clientPickerResults = useMemo(() => {
    const query = clientPickerSearch.toLowerCase().trim();
    if (!query) return clients.slice(0, 5);
    return clients.filter((c) => [c.name, c.email, c.phone].some((v) => v?.toLowerCase().includes(query))).slice(0, 5);
  }, [clients, clientPickerSearch]);

  const visibleClients = filteredClients.slice(0, CLIENT_OS_VISIBLE_LIMIT);
  const visibleWorkOrders = filteredWorkOrders.slice(0, CLIENT_OS_VISIBLE_LIMIT);
  
  const openWorkOrders = workOrders.filter((w) => w.status === 'in-progress').length;
  const doneWorkOrders = workOrders.filter((w) => w.status === 'done').length;

  function updateClientDraft<K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) {
    setClientDraft((current) => ({ ...current, [key]: value }));
  }

  function updateWorkOrderDraft<K extends keyof WorkOrderDraft>(key: K, value: WorkOrderDraft[K]) {
    setWorkOrderDraft((current) => ({ ...current, [key]: value }));
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

  function addClient() {
    const now = new Date().toISOString();
    const client: Client = {
      id: editingClientId ?? createId('client'),
      name: clientDraft.name || 'Sem nome',
      documentNumber: clientDraft.documentNumber,
      phone: clientDraft.phone,
      email: clientDraft.email,
      address: clientDraft.address,
      street: clientDraft.street,
      addressNumber: clientDraft.addressNumber,
      complement: clientDraft.complement,
      district: clientDraft.district,
      city: clientDraft.city,
      state: clientDraft.state,
      postalCode: clientDraft.postalCode,
      stateRegistration: clientDraft.stateRegistration,
      contributorType: clientDraft.contributorType,
      creditLimit: String(clientDraft.creditLimit),
      additionalContacts: clientDraft.additionalContacts,
      salesHistoryNotes: clientDraft.salesHistoryNotes,
      notes: clientDraft.notes,
      createdAt: editingClientId ? clients.find(c => c.id === editingClientId)?.createdAt ?? now : now,
      updatedAt: now,
    };

    if (editingClientId) {
      setClients((current) => current.map((c) => (c.id === editingClientId ? client : c)));
    } else {
      setClients((current) => [client, ...current]);
    }

    setEditingClientId(null);
    setClientDraft(emptyClientDraft);
    setActiveSection('clients');
  }

  function confirmRemoveClient(clientId: string) {
    setItemToRemove(clientId);
    setModalType('removeClient');
  }

  function executeRemoveClient() {
    if (!itemToRemove) return;
    const clientId = itemToRemove;
    setClients((current) => current.filter((c) => c.id !== clientId));
    setWorkOrders((current) => current.map((w) => (w.clientId === clientId ? { ...w, clientId: undefined } : w)));
    setItemToRemove(null);
    setModalType(null);
  }

  function addWorkOrder() {
    const now = new Date().toISOString();
    const selectedClient = clients.find((c) => c.id === workOrderDraft.clientId);
    
    const workOrder: WorkOrder = {
      id: editingWorkOrderId ?? createId('os'),
      clientId: workOrderDraft.clientId || undefined,
      title: workOrderDraft.title,
      description: workOrderDraft.description,
      address: workOrderDraft.address,
      priority: workOrderDraft.priority,
      status: workOrderDraft.status,
      scheduledDate: workOrderDraft.scheduledDate || undefined,
      paymentStatus: workOrderDraft.paymentStatus,
      createdAt: editingWorkOrderId ? workOrders.find(w => w.id === editingWorkOrderId)?.createdAt ?? now : now,
      updatedAt: now,
    };

    if (editingWorkOrderId) {
      setWorkOrders((current) => current.map((w) => (w.id === editingWorkOrderId ? workOrder : w)));
    } else {
      setWorkOrders((current) => [workOrder, ...current]);
    }

    setActiveWorkOrderId(workOrder.id);
    setEditingWorkOrderId(null);
    setWorkOrderDraft(emptyWorkOrderDraft);
    setActiveSection('workOrders');
  }

  function confirmRemoveWorkOrder(workOrderId: string) {
    setItemToRemove(workOrderId);
    setModalType('removeWorkOrder');
  }

  function executeRemoveWorkOrder() {
    if (!itemToRemove) return;
    const workOrderId = itemToRemove;
    setWorkOrders((current) => current.filter((w) => w.id !== workOrderId));
    if (activeWorkOrderId === workOrderId) setActiveWorkOrderId(null);
    setItemToRemove(null);
    setModalType(null);
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

  const isWorkOrderTab = activeSection === 'workOrders' || activeSection === 'newWorkOrder';
  const isClientTab = activeSection === 'clients' || activeSection === 'newClient' || activeSection === 'dashboard';

  return (
    <div className="client-os-workspace refined-client-os">
      <header className="screen-header">
        <h1>{isWorkOrderTab ? 'Atendimentos' : 'Clientes'}</h1>
      </header>

      {/* Context Banner: Only show when there is an active context */}
      {activeWorkOrder && (
        <ContextBanner
          title={activeWorkOrder.title}
          description={`${activeClient?.name ?? 'Cliente Avulso'} · ${statusLabel(activeWorkOrder.status)}`}
          actionLabel="Limpar Contexto"
          onAction={() => setActiveWorkOrderId(null)}
        />
      )}

      {/* Metrics specialized by context */}
      <div className="dashboard-finance-tiles" style={{ marginBottom: '1.5rem' }}>
        {isClientTab ? (
          <>
            <MetricCard label="Clientes Totais" value={clients.length} />
            <MetricCard label="Recém Adicionados" value={clients.filter(c => recentTimestamp(c).includes(new Date().toISOString().slice(0, 7))).length} tone="brand" />
          </>
        ) : (
          <>
            <MetricCard label="Em execução" value={openWorkOrders} tone={openWorkOrders > 0 ? 'brand' : 'default'} />
            <MetricCard label="Concluídos" value={doneWorkOrders} />
          </>
        )}
      </div>

      <div className="home-action-toolbar">
        {isClientTab ? (
          <>
            <button className={`ghost-action ${activeSection === 'clients' || activeSection === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('clients')}>Lista de Clientes</button>
            <button className={`ghost-action ${activeSection === 'newClient' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('newClient')}>+ Novo Cliente</button>
          </>
        ) : (
          <>
            <button className={`ghost-action ${activeSection === 'workOrders' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('workOrders')}>Lista de Atendimentos</button>
            <button className={`ghost-action ${activeSection === 'newWorkOrder' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('newWorkOrder')}>+ Novo Atendimento</button>
          </>
        )}
      </div>

      {(activeSection === 'dashboard' || activeSection === 'clients') && isClientTab && (
        <div className="client-os-indicator-grid">
          <div className="aferix-panel-card">
            <header>
              <div>
                <h2>Sua Base de Clientes</h2>
                <p>Gerencie os contatos para seus orçamentos.</p>
              </div>
            </header>
            
            <div className="budget-list-search-bar" style={{ marginBottom: '1rem' }}>
              <input 
                placeholder="Buscar cliente por nome, telefone ou e-mail..." 
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--aferix-border)', background: 'var(--aferix-bg)', color: 'var(--aferix-text)' }}
              />
            </div>

            <div className="continuous-list">
              {visibleClients.length === 0 ? (
                <div className="continuous-list-empty">Nenhum cliente encontrado.</div>
              ) : (
                visibleClients.map((client) => (
                  <article className="continuous-list-item" key={client.id}>
                    <div className="client-col">
                      <strong>{client.name}</strong>
                      <small>{client.phone} · {client.email}</small>
                      {client.address && <small style={{ display: 'block', marginTop: '4px', opacity: 0.8 }}>{client.address}</small>}
                    </div>
                    <div className="value-col" style={{ display: 'flex', gap: '8px' }}>
                      <button className="ghost-action icon-btn" title="Editar" onClick={() => openClientForEdit(client)}>✎</button>
                      <button className="ghost-action icon-btn danger-text" title="Remover" onClick={() => confirmRemoveClient(client.id)}>✕</button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'workOrders' && isWorkOrderTab && (
        <div className="client-os-indicator-grid">
          <div className="aferix-panel-card">
            <header>
              <div>
                <h2>Serviços e Atendimentos</h2>
                <p>Acompanhe a execução e os prazos dos seus serviços.</p>
              </div>
            </header>

            <div className="continuous-list">
              {visibleWorkOrders.length === 0 ? (
                <div className="continuous-list-empty">Nenhum atendimento registrado.</div>
              ) : (
                visibleWorkOrders.map((workOrder) => {
                  const client = clients.find((c) => c.id === workOrder.clientId);
                  const isContext = activeWorkOrderId === workOrder.id;
                  return (
                    <article className={`continuous-list-item ${isContext ? 'active-context-item' : ''}`} key={workOrder.id}>
                      <div className="client-col">
                        <strong>{workOrder.title}</strong>
                        <small>{client?.name ?? 'Cliente Avulso'} · {statusLabel(workOrder.status)}</small>
                        <small style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>{formatDateTime(workOrder.scheduledDate)}</small>
                      </div>
                      <div className="value-col" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {!isContext && <button className="secondary-action inline-action" onClick={() => setActiveWorkOrderId(workOrder.id)}>Selecionar</button>}
                        <button className="ghost-action icon-btn" title="Editar" onClick={() => openWorkOrderForEdit(workOrder)}>✎</button>
                        <button className="ghost-action icon-btn danger-text" title="Remover" onClick={() => confirmRemoveWorkOrder(workOrder.id)}>✕</button>
                      </div>
                    </article>
                  );
                })
              )}
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
            <button className="secondary-action full-cta" type="button" onClick={() => { setEditingWorkOrderId(null); setWorkOrderDraft(emptyWorkOrderDraft); setActiveSection('workOrders'); }}>
              Cancelar
            </button>
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
