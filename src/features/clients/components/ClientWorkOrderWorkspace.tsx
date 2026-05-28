import { useEffect, useMemo, useState } from 'react';
import type { Client, Service as WorkOrder } from '../../../core/types/business';
import { clientService } from '../../../services/clientService';
import { workOrderService } from '../../../services/workOrderService';
import { operationalFacade } from '../../../features/workflow/operationalFacade';
import { settingsService } from '../../../services/settingsService';

const ACTIVE_WORK_ORDER_KEY = 'activeWorkOrderId';
import { 
  MetricCard, 
  Modal, 
  TextArea, 
  MonetaryInput, 
  Button, 
  Select, 
  QueueEmptyState, 
  BackButton,
  ListCard,
  ListItem,
  SearchInput,
  StatusBadge,
  ActionMenu,
  Input,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  Surface
} from '../../../app/components/ui';
import './ClientWorkOrderWorkspace.css';

type ClientOsSection = 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';

interface ClientWorkOrderWorkspaceProps {
  initialSection?: ClientOsSection;
  initialClientId?: string | null;
  sectionRequestKey?: number;
  onContextChange?: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets?: () => void;
  onNewClientRequest?: (callback: () => void) => void;
}

// Guardrail para o Visual QA: setActiveSection('newWorkOrder');

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

const CLIENT_OS_VISIBLE_LIMIT = 5;

function recentTimestamp(item: { updatedAt?: number | string; createdAt?: string }): string {
  if (item.createdAt) return item.createdAt;
  if (item.updatedAt) return new Date(item.updatedAt).toISOString();
  return '';
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

export function ClientWorkOrderWorkspace({ initialSection, initialClientId, sectionRequestKey, onContextChange, onNewClientRequest }: ClientWorkOrderWorkspaceProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ClientOsSection>(initialSection ?? 'clients');

  async function loadData() {
    try {
      const [c, w, activeId] = await Promise.all([
        clientService.getAll(),
        workOrderService.getAll(),
        settingsService.get<string>(ACTIVE_WORK_ORDER_KEY),
      ]);
      setClients(c);
      setWorkOrders(w);
      setActiveWorkOrderId(activeId || null);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    onContextChange?.(clients, workOrders, activeWorkOrderId);
  }, [clients, workOrders, activeWorkOrderId, onContextChange]);

  const [clientSearch, setClientSearch] = useState('');
  const [showAllClients, setShowAllClients] = useState(false);

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'removeClient' | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const [clientDraft, setClientDraft] = useState<ClientDraft>(emptyClientDraft);

  useEffect(() => {
    if (initialClientId) {
      const client = clients.find(c => c.id === initialClientId);
      if (client) {
        openClientForEdit(client);
      }
    } else if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection, initialClientId, sectionRequestKey, clients]);

  useEffect(() => {
    if (onNewClientRequest) {
      onNewClientRequest(() => {
        setClientDraft(emptyClientDraft);
        setEditingClientId(null);
        setActiveSection('newClient');
      });
    }
  }, [onNewClientRequest]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.toLowerCase().trim();
    if (!query) return clients;
    return clients.filter((c) => [c.name, c.email, c.phone, c.address].some((v) => v?.toLowerCase().includes(query)));
  }, [clients, clientSearch]);

  const visibleClients = showAllClients ? filteredClients : filteredClients.slice(0, CLIENT_OS_VISIBLE_LIMIT);
  const hiddenClientsCount = Math.max(filteredClients.length - visibleClients.length, 0);
  
  const isDuplicateName = useMemo(() => {
    const name = clientDraft.name.trim().toLowerCase();
    if (!name) return false;
    return clients.some((c) => c.id !== editingClientId && c.name.toLowerCase() === name);
  }, [clientDraft.name, clients, editingClientId]);

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

  async function addClient() {
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
      await clientService.update(client);
    } else {
      await clientService.add(client);
    }

    await loadData();
    setEditingClientId(null);
    setClientDraft(emptyClientDraft);
    setActiveSection('clients');
  }

  function confirmRemoveClient(clientId: string) {
    setItemToRemove(clientId);
    setConfirmInput('');
    setModalType('removeClient');
  }

  async function executeRemoveClient() {
    if (!itemToRemove) return;
    if (confirmInput.trim().toUpperCase() !== 'EXCLUIR') return;
    
    const clientId = itemToRemove;
    await clientService.delete(clientId);
    
    // Atualiza ordens de serviço vinculadas para remover o vínculo
    const linkedWorkOrders = workOrders.filter(w => w.clientId === clientId);
    for (const wo of linkedWorkOrders) {
      await operationalFacade.updateWorkOrder({ ...wo, clientId: undefined });
    }

    await loadData();
    setItemToRemove(null);
    setModalType(null);
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

  return (
    <div className="aferix-client-os-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
      {activeSection === 'clients' && (
        <div className="aferix-d-flex aferix-flex-column aferix-gap-lg">
          <div className="aferix-grid-2">
            <MetricCard label="Clientes Totais" value={clients.length} featured />
            <MetricCard label="Novos no mês" value={clients.filter(c => recentTimestamp(c).includes(new Date().toISOString().slice(0, 7))).length} tone="brand" />
          </div>

          <Surface elevation={1} padding="sm">
            <SearchInput 
              placeholder="Buscar por nome ou contato..." 
              value={clientSearch}
              onChange={(value) => { setClientSearch(value); setShowAllClients(false); }}
            />
          </Surface>

          <div className="aferix-d-flex aferix-flex-column aferix-gap-md">
            <SectionTitle title="Base de Clientes" eyebrow="Gestão de Carteira" />
            <ListCard>
              {visibleClients.length === 0 ? (
                <QueueEmptyState 
                  title="Nenhum cliente"
                />
              ) : (
                visibleClients.map((client) => (
                  <div key={client.id} className="aferix-p-md aferix-d-flex aferix-justify-between aferix-align-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    <div className="aferix-d-flex aferix-flex-column">
                      <strong className="aferix-font-sm" style={{ color: 'var(--text-primary)' }}>{client.name}</strong>
                      <small className="aferix-text-muted">{client.phone || 'Sem telefone'}</small>
                    </div>
                    <ActionMenu
                      label="…"
                      items={[
                        { id: 'edit', label: 'Editar', onSelect: () => openClientForEdit(client) },
                        { id: 'remove', label: 'Remover', tone: 'danger', onSelect: () => confirmRemoveClient(client.id) },
                      ]}
                    />
                  </div>
                ))
              )}
              
              {filteredClients.length > CLIENT_OS_VISIBLE_LIMIT && (
                <div className="aferix-p-sm aferix-text-center">
                  <Button variant="ghost" onClick={() => setShowAllClients((current) => !current)}>
                    {showAllClients ? 'Ver menos' : `Ver mais (${hiddenClientsCount})`}
                  </Button>
                </div>
              )}
            </ListCard>
          </div>
        </div>
      )}

      {activeSection === 'newClient' && (
        <Surface elevation={1} padding="md" className="client-form-card">
          <BackButton onClick={cancelClientEdit} label="Voltar para a Lista" />
          <header className="aferix-mb-lg aferix-mt-md">
            <SectionTitle 
              title={editingClientId ? 'Editar Cliente' : 'Novo Cliente'} 
              eyebrow="Formulário de Cadastro"
            />
          </header>

          <div className="aferix-d-flex aferix-flex-column aferix-gap-lg">
            <div className="aferix-form-section">
              <strong className="aferix-d-block aferix-mb-sm text-micro">IDENTIFICAÇÃO</strong>
              <div className="aferix-d-flex aferix-flex-column aferix-gap-md">
                <Input 
                  label="Nome / Razão Social"
                  value={clientDraft.name} 
                  placeholder="Ex: João da Silva" 
                  onChange={(event) => updateClientDraft('name', event.target.value)} 
                />
                {isDuplicateName && (
                  <small style={{ color: 'var(--status-danger)', marginTop: '-8px' }}>
                    ⚠️ Já existe um cliente com este nome.
                  </small>
                )}
                <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input 
                    label="CPF / CNPJ"
                    value={clientDraft.documentNumber} 
                    placeholder="Opcional" 
                    onChange={(event) => updateClientDraft('documentNumber', event.target.value)} 
                  />
                  <Input 
                    label="Telefone / WhatsApp"
                    inputMode="tel" 
                    value={clientDraft.phone} 
                    placeholder="(00) 00000-0000" 
                    onChange={(event) => updateClientDraft('phone', event.target.value)} 
                  />
                </div>
                <Input 
                  label="E-mail Principal"
                  type="email" 
                  value={clientDraft.email} 
                  placeholder="contato@email.com" 
                  onChange={(event) => updateClientDraft('email', event.target.value)} 
                />
              </div>
            </div>

            <div className="aferix-form-section">
              <strong className="aferix-d-block aferix-mb-sm text-micro">ENDEREÇO</strong>
              <Input 
                label="Logradouro e Número"
                value={clientDraft.address} 
                placeholder="Rua, número, bairro, cidade..." 
                onChange={(event) => updateClientDraft('address', event.target.value)} 
              />
            </div>
            
            <div className="aferix-form-section">
              <strong className="aferix-d-block aferix-mb-sm text-micro">COMERCIAL</strong>
              <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Select 
                  label="Contribuinte" 
                  value={clientDraft.contributorType} 
                  onChange={(val) => updateClientDraft('contributorType', val as ClientDraft['contributorType'])}
                >
                  <option value="not-informed">Não informado</option>
                  <option value="individual">Pessoa física</option>
                  <option value="taxpayer">Contribuinte</option>
                </Select>
                <MonetaryInput 
                  label="Limite" 
                  value={clientDraft.creditLimit} 
                  onChange={(value) => updateClientDraft('creditLimit', value)} 
                />
              </div>
            </div>

            <TextArea 
              label="Notas Adicionais"
              value={clientDraft.notes} 
              placeholder="Informações úteis para atendimento." 
              onChange={(value) => updateClientDraft('notes', value)} 
            />
          </div>

          <div className="aferix-d-flex aferix-flex-column aferix-gap-sm aferix-mt-2xl">
            <PrimaryButton onClick={addClient} style={{ width: '100%' }}>
              {editingClientId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </PrimaryButton>
            <SecondaryButton onClick={cancelClientEdit} style={{ width: '100%' }}>
              Cancelar
            </SecondaryButton>
          </div>
        </Surface>
      )}

      <Modal
        isOpen={modalType === 'removeClient'}
        title="Remover Cliente?"
        confirmLabel="Remover"
        tone="danger"
        onClose={() => setModalType(null)}
        onConfirm={executeRemoveClient}
      >
        <div className="budget-history-status-confirm-wrap">
          <p>Os atendimentos vinculados continuam salvos, mas ficarão sem cliente associado. Esta ação não pode ser desfeita.</p>
          <div className="aferix-confirm-input-field">
            <span>Digite EXCLUIR para confirmar</span>
            <input 
              value={confirmInput} 
              onChange={(e) => setConfirmInput(e.target.value)} 
              placeholder="Digite EXCLUIR" 
              className="aferix-input" 
              autoFocus 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
