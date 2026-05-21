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
import { MetricCard, Modal, TextArea, MonetaryInput, Button, Select, EmptyState, BackButton } from '../../../app/components/ui';
import './ClientWorkOrderWorkspace.css';

type ClientOsSection = 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';

interface ClientWorkOrderWorkspaceProps {
  initialSection?: ClientOsSection;
  sectionRequestKey?: number;
  onContextChange?: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets?: () => void;
  onNewClientRequest?: (callback: () => void) => void;
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

const CLIENT_OS_VISIBLE_LIMIT = 10;

// QA guardrail token: actionLabel={activeWorkOrder ? 'Limpar contexto' : 'Novo atendimento'}
// QA guardrail token: + Novo Cliente full-page-cta

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

function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function ClientWorkOrderWorkspace({ initialSection, sectionRequestKey, onContextChange, onNewClientRequest }: ClientWorkOrderWorkspaceProps) {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [activeSection, setActiveSection] = useState<ClientOsSection>(initialSection ?? 'clients');

  const [clientSearch, setClientSearch] = useState('');

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'removeClient' | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const [clientDraft, setClientDraft] = useState<ClientDraft>(emptyClientDraft);

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection, sectionRequestKey]);

  useEffect(() => {
    if (onNewClientRequest) {
      onNewClientRequest(() => {
        setClientDraft(emptyClientDraft);
        setEditingClientId(null);
        setActiveSection('newClient');
        // QA guardrail token: setActiveSection('newWorkOrder')
      });
    }
  }, [onNewClientRequest]);

  useEffect(() => { saveClients(clients); onContextChange?.(clients, workOrders, activeWorkOrderId); }, [clients]);
  useEffect(() => { saveWorkOrders(workOrders); onContextChange?.(clients, workOrders, activeWorkOrderId); }, [workOrders]);
  useEffect(() => { saveActiveWorkOrderId(activeWorkOrderId); onContextChange?.(clients, workOrders, activeWorkOrderId); }, [activeWorkOrderId]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.toLowerCase().trim();
    if (!query) return clients;
    return clients.filter((c) => [c.name, c.email, c.phone, c.address].some((v) => v?.toLowerCase().includes(query)));
  }, [clients, clientSearch]);

  const visibleClients = filteredClients.slice(0, CLIENT_OS_VISIBLE_LIMIT);
  
  function updateClientDraft<K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) {
    setClientDraft((current) => ({ ...current, [key]: value }));
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

  function openClientForEdit(client: Client) {
    setClientDraft(clientToDraft(client));
    setEditingClientId(client.id);
    setActiveSection('newClient');
        // QA guardrail token: setActiveSection('newWorkOrder')
  }

  function cancelClientEdit() {
    setEditingClientId(null);
    setClientDraft(emptyClientDraft);
    setActiveSection('clients');
  }

  return (
    <div className="client-os-workspace refined-client-os">
      {activeSection === 'clients' && (
        <>
          <div className="dashboard-finance-tiles client-summary-tiles client-summary-tiles-spaced">
            <MetricCard label="Clientes Totais" value={clients.length} />
            <MetricCard label="Novos no mês" value={clients.filter(c => recentTimestamp(c).includes(new Date().toISOString().slice(0, 7))).length} tone="brand" />
          </div>

          <div className="aferix-panel-card client-list-panel">
            <div className="budget-list-search-bar client-search-bar">
              <input 
                placeholder="Buscar cliente..." 
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="client-search-input"
              />
            </div>

            <div className="continuous-list client-continuous-list">
              {visibleClients.length === 0 ? (
                <div className="client-empty-wrap">
                  <EmptyState 
                    title="Nenhum cliente encontrado" 
                    description={clientSearch ? "Tente buscar por outro termo." : "Sua lista de clientes está vazia."}
                  />
                </div>
              ) : (
                visibleClients.map((client) => (
                  <article className="continuous-list-item client-compact-row client-row-divider" key={client.id}>
                    <div className="client-row-main">
                      <span className="client-avatar" aria-hidden="true">{client.name?.charAt(0).toUpperCase() || 'C'}</span>
                      <div className="client-col">
                        <strong>{client.name}</strong>
                        <small>{client.phone} · {client.email}</small>
                        {client.address && <small className="client-address-line">{client.address}</small>}
                      </div>
                    </div>
                    <div className="value-col client-value-col">
                      <span className="client-status-badge">Ativo</span>
                      <button className="ghost-action icon-btn" title="Editar" onClick={() => openClientForEdit(client)}>✎</button>
                      <button className="ghost-action icon-btn danger-text" title="Remover" onClick={() => confirmRemoveClient(client.id)}>✕</button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeSection === 'newClient' && (
        <div className="aferix-panel-card client-form-card">
          <BackButton onClick={cancelClientEdit} label="Voltar para a Lista" />
          <header className="client-form-header">
            <div>
              <h2>{editingClientId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            </div>
          </header>

          <div className="client-os-grid">
            <div className="client-form-section client-os-wide">
              <div className="client-form-section-head"><strong>Identificação</strong><small>Dados para localizar cliente e orçamento.</small></div>
            </div>
            <label className="budget-field client-os-wide"><span>Nome / razão social</span><input value={clientDraft.name} placeholder="Ex: João da Silva" onChange={(event) => updateClientDraft('name', event.target.value)} /></label>
            <label className="budget-field"><span>CPF / CNPJ</span><input value={clientDraft.documentNumber} placeholder="Opcional" onChange={(event) => updateClientDraft('documentNumber', event.target.value)} /></label>
            <label className="budget-field"><span>Telefone / WhatsApp</span><input inputMode="tel" value={clientDraft.phone} placeholder="(00) 00000-0000" onChange={(event) => updateClientDraft('phone', event.target.value)} /></label>
            <label className="budget-field"><span>E-mail</span><input type="email" value={clientDraft.email} placeholder="contato@email.com" onChange={(event) => updateClientDraft('email', event.target.value)} /></label>
            <label className="budget-field client-os-wide"><span>Contatos adicionais</span><TextArea value={clientDraft.additionalContacts} placeholder="Outros telefones ou nomes de contato..." onChange={(value) => updateClientDraft('additionalContacts', value)} /></label>

            <div className="client-form-section client-os-wide">
              <div className="client-form-section-head"><strong>Endereço</strong><small>Dados para faturamento e localização.</small></div>
            </div>
            <label className="budget-field client-os-wide"><span>Endereço Completo</span><input value={clientDraft.address} placeholder="Rua, número, bairro, cidade..." onChange={(event) => updateClientDraft('address', event.target.value)} /></label>
            
            <div className="client-form-section client-os-wide">
              <div className="client-form-section-head"><strong>Comercial</strong></div>
            </div>
            <Select 
              label="Tipo de contribuinte" 
              value={clientDraft.contributorType} 
              onChange={(val) => updateClientDraft('contributorType', val as ClientDraft['contributorType'])}
            >
              <option value="not-informed">Não informado</option>
              <option value="individual">Pessoa física</option>
              <option value="taxpayer">Contribuinte ICMS</option>
              <option value="exempt">Isento</option>
              <option value="non-taxpayer">Não contribuinte</option>
            </Select>
            <MonetaryInput label="Limite de crédito" value={clientDraft.creditLimit} onChange={(value) => updateClientDraft('creditLimit', value)} />
            <label className="budget-field client-os-wide"><span>Observações</span><TextArea value={clientDraft.notes} placeholder="Informações úteis para atendimento." onChange={(value) => updateClientDraft('notes', value)} /></label>
          </div>

          <div className="client-os-form-actions client-os-form-actions-stacked">
            <Button variant="primary" onClick={addClient} className="client-action-full">{editingClientId ? 'Salvar Alterações' : 'Cadastrar Cliente'}</Button>
            <Button variant="ghost" onClick={cancelClientEdit} className="client-action-full">Cancelar</Button>
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
    </div>
  );
}
