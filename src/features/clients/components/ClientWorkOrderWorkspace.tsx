import { useEffect, useMemo, useState } from 'react';
import type { Client, WorkOrder } from '../../../core/types/business';
import {
  loadActiveWorkOrderId,
  loadClients,
  loadWorkOrders,
  saveActiveWorkOrderId,
  saveClients,
  saveWorkOrders,
} from '../storage/clientWorkOrderStorage';
import './ClientWorkOrderWorkspace.css';

interface ClientWorkOrderWorkspaceProps {
  onContextChange?: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
}

interface ClientDraft {
  name: string;
  phone: string;
  email: string;
  address: string;
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
}

const emptyClientDraft: ClientDraft = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const emptyWorkOrderDraft: WorkOrderDraft = {
  clientId: '',
  title: '',
  description: '',
  address: '',
  priority: 'normal',
  status: 'open',
  scheduledDate: '',
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
    open: 'Aberta',
    scheduled: 'Agendada',
    'in-progress': 'Em execução',
    done: 'Concluída',
    cancelled: 'Cancelada',
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

export function ClientWorkOrderWorkspace({ onContextChange }: ClientWorkOrderWorkspaceProps) {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [clientDraft, setClientDraft] = useState<ClientDraft>(emptyClientDraft);
  const [workOrderDraft, setWorkOrderDraft] = useState<WorkOrderDraft>(emptyWorkOrderDraft);

  const activeWorkOrder = workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null;
  const activeClient = activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null;

  const sortedWorkOrders = useMemo(
    () => [...workOrders].sort((a, b) => (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? '')),
    [workOrders],
  );

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
    if (!clientDraft.name.trim()) return;

    const now = new Date().toISOString();
    const client: Client = {
      id: createId('client'),
      name: clientDraft.name.trim(),
      phone: clientDraft.phone.trim() || undefined,
      email: clientDraft.email.trim() || undefined,
      address: clientDraft.address.trim() || undefined,
      notes: clientDraft.notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    setClients((current) => [client, ...current]);
    setWorkOrderDraft((current) => ({ ...current, clientId: client.id, address: client.address ?? current.address }));
    setClientDraft(emptyClientDraft);
  }

  function removeClient(clientId: string) {
    setClients((current) => current.filter((client) => client.id !== clientId));
    setWorkOrders((current) => current.map((workOrder) => (workOrder.clientId === clientId ? { ...workOrder, clientId: undefined, updatedAt: new Date().toISOString() } : workOrder)));
  }

  function addWorkOrder() {
    if (!workOrderDraft.title.trim()) return;

    const now = new Date().toISOString();
    const selectedClient = clients.find((client) => client.id === workOrderDraft.clientId);
    const workOrder: WorkOrder = {
      id: createId('os'),
      clientId: workOrderDraft.clientId || undefined,
      title: workOrderDraft.title.trim(),
      description: workOrderDraft.description.trim() || undefined,
      address: workOrderDraft.address.trim() || selectedClient?.address || undefined,
      priority: workOrderDraft.priority,
      status: workOrderDraft.status,
      scheduledDate: workOrderDraft.scheduledDate || undefined,
      createdAt: now,
      updatedAt: now,
    };

    setWorkOrders((current) => [workOrder, ...current]);
    setActiveWorkOrderId(workOrder.id);
    setWorkOrderDraft({ ...emptyWorkOrderDraft, clientId: workOrder.clientId ?? '', address: selectedClient?.address ?? '' });
  }

  function removeWorkOrder(workOrderId: string) {
    setWorkOrders((current) => current.filter((workOrder) => workOrder.id !== workOrderId));
    if (activeWorkOrderId === workOrderId) setActiveWorkOrderId(null);
  }

  function updateWorkOrderStatus(workOrderId: string, status: WorkOrder['status']) {
    setWorkOrders((current) => current.map((workOrder) => (workOrder.id === workOrderId ? { ...workOrder, status, updatedAt: new Date().toISOString() } : workOrder)));
  }

  function fillWorkOrderAddressFromClient(clientId: string) {
    const selectedClient = clients.find((client) => client.id === clientId);
    updateWorkOrderDraft('clientId', clientId);

    if (selectedClient?.address && !workOrderDraft.address.trim()) {
      updateWorkOrderDraft('address', selectedClient.address);
    }
  }

  return (
    <div className="client-os-workspace">
      <section className="active-os-panel">
        <div>
          <h2>OS ativa</h2>
          {activeWorkOrder ? (
            <p>
              <strong>{activeWorkOrder.title}</strong>
              <span>{activeClient?.name ?? 'Cliente não vinculado'} · {statusLabel(activeWorkOrder.status)} · Prioridade {priorityLabel(activeWorkOrder.priority)}</span>
            </p>
          ) : (
            <p>Nenhuma OS ativa. Cadastre ou selecione uma OS para usar como contexto do atendimento atual.</p>
          )}
        </div>
        {activeWorkOrder && <button className="secondary-action inline-action" type="button" onClick={() => setActiveWorkOrderId(null)}>Limpar OS ativa</button>}
      </section>

      <section className="client-os-panel">
        <div className="client-os-panel-header">
          <div>
            <h2>Cadastrar cliente</h2>
            <p>Guarde os dados básicos para vincular orçamentos, relatórios e OS futuramente.</p>
          </div>
        </div>

        <div className="client-os-grid">
          <label className="budget-field client-os-wide"><span>Nome do cliente</span><input value={clientDraft.name} onChange={(event) => updateClientDraft('name', event.target.value)} /></label>
          <label className="budget-field"><span>Telefone / WhatsApp</span><input value={clientDraft.phone} onChange={(event) => updateClientDraft('phone', event.target.value)} /></label>
          <label className="budget-field"><span>E-mail</span><input value={clientDraft.email} onChange={(event) => updateClientDraft('email', event.target.value)} /></label>
          <label className="budget-field client-os-wide"><span>Endereço</span><input value={clientDraft.address} onChange={(event) => updateClientDraft('address', event.target.value)} /></label>
          <label className="budget-field client-os-wide"><span>Observações</span><textarea value={clientDraft.notes} onChange={(event) => updateClientDraft('notes', event.target.value)} /></label>
        </div>

        <button className="primary-action inline-action" type="button" disabled={!clientDraft.name.trim()} onClick={addClient}>Salvar cliente</button>
      </section>

      <section className="client-os-panel">
        <div className="client-os-panel-header">
          <div>
            <h2>Criar OS</h2>
            <p>A OS organiza o atendimento atual e futuramente vai ligar levantamento, orçamento, relatório e execução.</p>
          </div>
        </div>

        <div className="client-os-grid">
          <label className="budget-field"><span>Cliente</span><select value={workOrderDraft.clientId} onChange={(event) => fillWorkOrderAddressFromClient(event.target.value)}><option value="">Sem cliente vinculado</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
          <label className="budget-field"><span>Status</span><select value={workOrderDraft.status} onChange={(event) => updateWorkOrderDraft('status', event.target.value as WorkOrder['status'])}><option value="open">Aberta</option><option value="scheduled">Agendada</option><option value="in-progress">Em execução</option><option value="done">Concluída</option><option value="cancelled">Cancelada</option></select></label>
          <label className="budget-field client-os-wide"><span>Título da OS</span><input value={workOrderDraft.title} placeholder="Ex.: Troca de tomadas e revisão de iluminação" onChange={(event) => updateWorkOrderDraft('title', event.target.value)} /></label>
          <label className="budget-field client-os-wide"><span>Descrição</span><textarea value={workOrderDraft.description} onChange={(event) => updateWorkOrderDraft('description', event.target.value)} /></label>
          <label className="budget-field"><span>Prioridade</span><select value={workOrderDraft.priority} onChange={(event) => updateWorkOrderDraft('priority', event.target.value as NonNullable<WorkOrder['priority']>)}><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
          <label className="budget-field"><span>Data agendada</span><input type="datetime-local" value={workOrderDraft.scheduledDate} onChange={(event) => updateWorkOrderDraft('scheduledDate', event.target.value)} /></label>
          <label className="budget-field client-os-wide"><span>Endereço da OS</span><input value={workOrderDraft.address} onChange={(event) => updateWorkOrderDraft('address', event.target.value)} /></label>
        </div>

        <button className="primary-action inline-action" type="button" disabled={!workOrderDraft.title.trim()} onClick={addWorkOrder}>Criar OS e ativar</button>
      </section>

      <section className="client-os-panel">
        <div className="client-os-panel-header">
          <div>
            <h2>Clientes salvos</h2>
            <p>{clients.length} cliente(s) cadastrados neste navegador.</p>
          </div>
        </div>
        <div className="client-os-list">
          {clients.length === 0 ? <div className="client-os-empty">Nenhum cliente cadastrado ainda.</div> : clients.map((client) => (
            <article className="client-os-card" key={client.id}>
              <div>
                <strong>{client.name}</strong>
                <small>{[client.phone, client.email].filter(Boolean).join(' · ') || 'Sem contato'}</small>
                <small>{client.address || 'Sem endereço'}</small>
              </div>
              <button className="danger-action" type="button" onClick={() => removeClient(client.id)}>Remover</button>
            </article>
          ))}
        </div>
      </section>

      <section className="client-os-panel">
        <div className="client-os-panel-header">
          <div>
            <h2>Ordens de serviço</h2>
            <p>{workOrders.length} OS cadastrada(s). Escolha uma para ser a OS ativa do atendimento.</p>
          </div>
        </div>
        <div className="client-os-list">
          {sortedWorkOrders.length === 0 ? <div className="client-os-empty">Nenhuma OS cadastrada ainda.</div> : sortedWorkOrders.map((workOrder) => {
            const client = workOrder.clientId ? clients.find((item) => item.id === workOrder.clientId) : null;
            const isActive = workOrder.id === activeWorkOrderId;

            return (
              <article className={isActive ? 'client-os-card active' : 'client-os-card'} key={workOrder.id}>
                <div>
                  <strong>{workOrder.title}</strong>
                  <small>{client?.name ?? 'Cliente não vinculado'} · {statusLabel(workOrder.status)} · Prioridade {priorityLabel(workOrder.priority)}</small>
                  <small>{workOrder.address || client?.address || 'Sem endereço'} · {formatDateTime(workOrder.scheduledDate)}</small>
                  {workOrder.description && <small>{workOrder.description}</small>}
                </div>
                <div className="client-os-actions">
                  <button className="secondary-action inline-action" type="button" onClick={() => setActiveWorkOrderId(workOrder.id)}>{isActive ? 'Ativa' : 'Ativar'}</button>
                  <select value={workOrder.status} onChange={(event) => updateWorkOrderStatus(workOrder.id, event.target.value as WorkOrder['status'])}>
                    <option value="open">Aberta</option>
                    <option value="scheduled">Agendada</option>
                    <option value="in-progress">Em execução</option>
                    <option value="done">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                  <button className="danger-action" type="button" onClick={() => removeWorkOrder(workOrder.id)}>Remover</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
