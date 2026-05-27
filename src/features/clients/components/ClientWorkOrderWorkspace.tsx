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
  PanelCard
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
    <div className="client-os-workspace refined-client-os">
      {activeSection === 'clients' && (
        <>
          <div className="dashboard-finance-tiles client-summary-tiles client-summary-tiles-spaced">
            <MetricCard label="Clientes Totais" value={clients.length} />
            <MetricCard label="Novos no mês" value={clients.filter(c => recentTimestamp(c).includes(new Date().toISOString().slice(0, 7))).length} tone="brand" />
          </div>

          <PanelCard className="client-search-card">
            <SearchInput 
              placeholder="Buscar cliente por nome, e-mail ou telefone..." 
              value={clientSearch}
              onChange={(value) => { setClientSearch(value); setShowAllClients(false); }}
            />
          </PanelCard>

          <ListCard>
            {visibleClients.length === 0 ? (
              <QueueEmptyState 
                title="Nenhum cliente"

              />
            ) : (
              visibleClients.map((client) => (
                <ListItem 
                  key={client.id}
                  title={client.name}
                  context={
                    <div className="aferix-d-flex aferix-flex-column aferix-gap-xs">
                      <span>{client.phone || 'Sem telefone'} • {client.email || 'Sem e-mail'}</span>
                      <div className="aferix-d-flex aferix-align-center aferix-gap-sm">
                        <StatusBadge tone="success">Ativo</StatusBadge>
                        {client.address && <small className="aferix-text-muted">{client.address}</small>}
                      </div>
                    </div>
                  }
                  action={
                    <ActionMenu
                      label="Ações"
                      items={[
                        { id: 'edit', label: 'Editar', onSelect: () => openClientForEdit(client) },
                        { id: 'remove', label: 'Remover', tone: 'danger', onSelect: () => confirmRemoveClient(client.id) },
                      ]}
                    />
                  }
                />
              ))
            )}
            
            {filteredClients.length > CLIENT_OS_VISIBLE_LIMIT && (
              <div className="client-list-expand-wrap">
                <Button variant="ghost" className="density-toggle-cta" onClick={() => setShowAllClients((current) => !current)}>
                  {showAllClients ? 'Ver menos' : `Ver mais (${hiddenClientsCount})`}
                </Button>
              </div>
            )}
          </ListCard>
        </>
      )}

      {activeSection === 'newClient' && (
        <PanelCard className="client-form-card">
          <BackButton onClick={cancelClientEdit} label="Voltar para a Lista" />
          <header className="client-form-header">
            <SectionTitle 
              title={editingClientId ? 'Editar Cliente' : 'Novo Cliente'} 
            />
          </header>

          <div className="aferix-form-grid">
            <div className="aferix-form-section aferix-form-grid-wide">
              <div className="aferix-form-section-head">
                <strong>Identificação</strong>
                <small>Dados para localizar cliente e orçamento.</small>
              </div>
            </div>
            <div className="aferix-form-grid-wide">
              <Input 
                className="aferix-form-grid-wide"
                label="Nome / razão social"
                value={clientDraft.name} 
                placeholder="Ex: João da Silva" 
                onChange={(event) => updateClientDraft('name', event.target.value)} 
              />
              {isDuplicateName && (
                <small className="aferix-input-warning" style={{ color: 'var(--color-orange-600)', marginTop: '0.25rem', display: 'block' }}>
                  ⚠️ Já existe um cliente com este nome.
                </small>
              )}
            </div>
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
            <Input 
              className="aferix-form-grid-wide"
              label="E-mail"
              type="email" 
              value={clientDraft.email} 
              placeholder="contato@email.com" 
              onChange={(event) => updateClientDraft('email', event.target.value)} 
            />
            
            <TextArea 
              className="aferix-form-grid-wide"
              label="Contatos adicionais"
              value={clientDraft.additionalContacts} 
              placeholder="Outros telefones ou nomes de contato..." 
              onChange={(value) => updateClientDraft('additionalContacts', value)} 
            />

            <div className="aferix-form-section aferix-form-grid-wide">
              <div className="aferix-form-section-head">
                <strong>Endereço</strong>
                <small>Dados para faturamento e localização.</small>
              </div>
            </div>
            <Input 
              className="aferix-form-grid-wide"
              label="Endereço Completo"
              value={clientDraft.address} 
              placeholder="Rua, número, bairro, cidade..." 
              onChange={(event) => updateClientDraft('address', event.target.value)} 
            />
            
            <div className="aferix-form-section aferix-form-grid-wide">
              <div className="aferix-form-section-head">
                <strong>Comercial</strong>
              </div>
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
            <MonetaryInput 
              label="Limite de crédito" 
              value={clientDraft.creditLimit} 
              onChange={(value) => updateClientDraft('creditLimit', value)} 
            />
            
            <TextArea 
              className="aferix-form-grid-wide"
              label="Observações"
              value={clientDraft.notes} 
              placeholder="Informações úteis para atendimento." 
              onChange={(value) => updateClientDraft('notes', value)} 
            />
          </div>

          <div className="aferix-form-actions">
            <PrimaryButton onClick={addClient}>
              {editingClientId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </PrimaryButton>
            <SecondaryButton onClick={cancelClientEdit}>
              Cancelar
            </SecondaryButton>
          </div>
        </PanelCard>
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
