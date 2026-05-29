import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Users, Mail, Phone, MapPin, Plus, Star, ShieldCheck, Target } from "lucide-react";
import type { Client, Service as WorkOrder } from '../../../core/types/business';
import { clientService } from '../../../services/clientService';
import { 
  QueueEmptyState, 
  ActionMenu, 
  Card,
  Input,
  Select,
  MonetaryInput,
  TextArea,
  SecondaryButton,
  PrimaryButton,
  Modal
} from '../../../app/components/ui';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../../ui/runtime';
import { OperationalFlowLayout, SplitMetricLayout } from '../../../ui/layouts';
import { Priority } from '../../../ui/attention';
import { AppHeader, MetricCard, SectionTitle, SurfaceCard } from '../../../ui/primitives';

interface ClientWorkOrderWorkspaceProps {
  initialSection?: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders';
  initialClientId?: string | null;
  sectionRequestKey?: number;
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
  onNewClientRequest?: (cb: () => void) => void;
}

type ClientSection = 'clients' | 'newClient' | 'removeClient';

const CLIENT_OS_VISIBLE_LIMIT = 8;

interface ClientDraft {
  name: string;
  phone: string;
  email: string;
  documentNumber: string;
  address: string;
  notes: string;
  contributorType: 'individual' | 'taxpayer' | 'not-informed';
  creditLimit: number;
}

const emptyClient = (): ClientDraft => ({
  name: '',
  phone: '',
  email: '',
  documentNumber: '',
  address: '',
  notes: '',
  contributorType: 'not-informed',
  creditLimit: 0,
});

/**
 * ClientWorkOrderWorkspace: Relationship Intelligence.
 * Mission: Executive Composition (Hero Bio-Cards, Narrative HUD).
 */
export function ClientWorkOrderWorkspace({ 
  initialSection = 'clients', 
  sectionRequestKey,
  onContextChange,
  onNewClientRequest
}: ClientWorkOrderWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<ClientSection>(initialSection === 'newClient' ? 'newClient' : 'clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showAllClients, setShowAllClients] = useState(false);
  const [clientDraft, setClientDraft] = useState<ClientDraft>(emptyClient());
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [modalType, setModalType] = useState<'removeClient' | null>(null);

  async function loadData() {
    try {
      const allClients = await clientService.getAll();
      setClients(allClients);
      onContextChange(allClients, [], null);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, [sectionRequestKey]);

  useEffect(() => {
    if (onNewClientRequest) {
      onNewClientRequest(() => {
        setEditingClientId(null);
        setClientDraft(emptyClient());
        setActiveSection('newClient');
      });
    }
  }, [onNewClientRequest]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.phone || '').includes(q) || 
      (c.email || '').toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  const visibleClients = showAllClients ? filteredClients : filteredClients.slice(0, CLIENT_OS_VISIBLE_LIMIT);

  function updateClientDraft<K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) {
    setClientDraft(prev => ({ ...prev, [key]: value }));
  }

  function openClientForEdit(client: Client) {
    setEditingClientId(client.id);
    setClientDraft({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      documentNumber: client.documentNumber || '',
      address: client.address || '',
      notes: client.notes || '',
      contributorType: client.contributorType || 'not-informed',
      creditLimit: Number(client.creditLimit || 0),
    });
    setActiveSection('newClient');
  }

  async function addClient() {
    if (!clientDraft.name.trim()) return;
    const clientData: Partial<Client> = {
      ...clientDraft,
      id: editingClientId || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    if (!editingClientId) clientData.createdAt = new Date().toISOString();

    await clientService.save(clientData as Client);
    await loadData();
    setActiveSection('clients');
    setClientDraft(emptyClient());
    setEditingClientId(null);
  }

  async function removeClient() {
    if (!itemToRemove || confirmInput !== 'EXCLUIR') return;
    await clientService.delete(itemToRemove);
    await loadData();
    setItemToRemove(null);
    setModalType(null);
  }

  return (
    <SemanticScreen type="workspace">
      <OperationalFlowLayout
        header={
          <AppHeader 
            eyebrow="CLIENT_INTELLIGENCE"
            title="Sua Carteira"
            subtitle="Gestão estratégica de relacionamentos e monitoramento de retenção."
            action={
              <button 
                onClick={() => setActiveSection('newClient')}
                className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] transition-all active:scale-[0.9] hover:brightness-110"
              >
                <Plus className="h-5 w-5" strokeWidth={3} />
              </button>
            }
          />
        }
      >
        {activeSection === 'clients' && (
          <>
            {/* 1. HERO DOMINANCE: CRM INTELLIGENCE HUD */}
            <Priority.P1>
              <SurfaceCard className="mb-6 bg-gradient-to-br from-white/[0.05] to-transparent relative overflow-hidden group shadow-card" padding="lg">
                <div className="flex justify-between items-start relative z-10">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.25em] flex items-center gap-2 mb-2 uppercase">
                        <Target className="h-3 w-3" /> RELACIONAMENTOS_ATIVOS
                      </span>
                      <div className="num text-[48px] font-bold text-[var(--text-primary)] tracking-tighter leading-none">
                        {clients.length}
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-black text-[var(--accent-gold)] tracking-[0.2em] block mb-1">RATING_BETA</span>
                      <span className="text-h2 font-bold text-[var(--accent-gold)] shadow-glow">A+</span>
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                   <Users className="h-24 w-24" />
                </div>
              </SurfaceCard>

              <SplitMetricLayout>
                <MetricCard 
                  label="Retenção" 
                  value="100%" 
                  trend={<ShieldCheck className="h-4 w-4 text-[var(--accent-green)] opacity-60" />}
                />
                <MetricCard 
                  label="Novos (Mês)" 
                  value={clients.filter(c => (c.createdAt || '').includes(new Date().toISOString().slice(0, 7))).length} 
                />
              </SplitMetricLayout>
            </Priority.P1>

            {/* 2. SEARCH HUD (Reduced card count) */}
            <Priority.P2 className="mb-4">
              <SearchInput 
                value={clientSearch}
                onChange={(val) => { setClientSearch(val); setShowAllClients(false); }}
                placeholder="Pesquisar inteligência de contatos..." 
              />
            </Priority.P2>

            {/* 3. INTELLIGENCE BIO-CARDS (Object-first) */}
            <Priority.P2 className="flex flex-col">
              <SectionTitle 
                 action={<span className="text-[10px] font-black text-[var(--text-muted)] opacity-30 tracking-widest uppercase">RANK: REVENUE_VOLUME</span>}
              >
                Base de Dados de Inteligência
              </SectionTitle>
              
              <div className="flex flex-col gap-md pb-40">
                {visibleClients.length === 0 ? (
                  <QueueEmptyState 
                    title="Nenhum contato estratégico" 
                    meta="Comece populando sua base para desbloquear o CRM Intelligence."
                    icon={<Users className="h-8 w-8" />}
                  />
                ) : (
                  visibleClients.map((client) => {
                    const initials = client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CX';
                    return (
                      <SurfaceCard key={client.id} className="flex flex-col gap-md group hover:bg-white/[0.08] relative overflow-hidden transition-all duration-300 shadow-soft" padding="md">
                        <div className="flex items-center gap-lg relative z-10">
                          <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center text-[var(--text-primary)] font-bold text-h2 border border-[var(--border-soft)] shadow-inner shrink-0 group-hover:bg-[var(--accent-gold)]/10 group-hover:border-[var(--accent-gold)]/20 group-hover:text-[var(--accent-gold)] transition-all">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <strong className="block text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors tracking-tight leading-tight">{client.name.toUpperCase()}</strong>
                            <div className="flex flex-col gap-1 mt-2">
                               <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[var(--text-muted)]">
                                  <Phone className="h-2.5 w-2.5" /> {client.phone || 'SEM_TELEFONE'}
                               </div>
                               <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[var(--text-muted)] opacity-60">
                                  <Mail className="h-2.5 w-2.5" /> {client.email?.toUpperCase() || 'SEM_VÍNCULO_DIGITAL'}
                               </div>
                            </div>
                          </div>
                          <ActionMenu
                            label="…"
                            items={[
                              { id: 'edit', label: 'Editar Inteligência', onSelect: () => openClientForEdit(client) },
                              { id: 'remove', label: 'Purgar Registro', tone: 'danger', onSelect: () => { setItemToRemove(client.id); setConfirmInput(''); setModalType('removeClient'); } },
                            ]}
                          />
                        </div>

                        {(client.address || (client.creditLimit && Number(client.creditLimit) > 0)) && (
                          <div className="mt-2 pt-4 border-t var(--border-subtle) flex flex-col gap-3 relative z-10">
                            {client.address && (
                               <div className="flex items-start gap-2 text-[10px] text-[var(--text-secondary)] opacity-60 font-black tracking-wider uppercase">
                                  <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                                  <span className="truncate">{client.address}</span>
                               </div>
                            )}
                            {client.creditLimit && Number(client.creditLimit) > 0 && (
                              <div className="flex items-center justify-between mt-1 bg-white/[0.03] border var(--border-subtle) p-3 rounded-xl">
                                 <span className="text-[9px] font-black tracking-widest text-[var(--text-muted)]">CRÉDITO_ESTRATÉGICO</span>
                                 <span className="text-ui-xs font-bold text-[var(--accent-green)]">
                                    R$ {Number(client.creditLimit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                 </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Rating Star Watermark */}
                        <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                           <Star className="h-12 w-12 text-[var(--accent-gold)]" />
                        </div>
                      </SurfaceCard>
                    );
                  })
                )}

                {filteredClients.length > CLIENT_OS_VISIBLE_LIMIT && !showAllClients && (
                  <button 
                    onClick={() => setShowAllClients(true)}
                    className="mt-4 w-full h-14 rounded-[var(--radius-button)] border var(--border-soft) bg-white/[0.02] text-ui-xs font-black tracking-widest text-[var(--text-muted)] transition-all hover:bg-white/[0.04] active:scale-[0.98]"
                  >
                    VER CARTEIRA INTEGRAL ({filteredClients.length})
                  </button>
                )}
              </div>
            </Priority.P2>
          </>
        )}

        {activeSection === 'newClient' && (
          <Priority.P1 className="flex flex-col gap-lg pb-32">
            <button 
              onClick={() => setActiveSection('clients')}
              className="flex items-center gap-sm text-ui-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-fit font-black tracking-widest"
            >
              <ChevronLeft className="h-4 w-4" /> VOLTAR AO DASHBOARD
            </button>

            <div className="flex flex-col gap-lg">
              <Card className="p-card">
                <SectionTitle className="mt-0 mb-8">Informações de Identidade</SectionTitle>
                <div className="flex flex-col gap-lg">
                  <Input 
                    label="NOME INTEGRAL OU RAZÃO SOCIAL"
                    value={clientDraft.name} 
                    onChange={(e) => updateClientDraft('name', e.target.value)} 
                    placeholder="JOÃO DA SILVA"
                  />
                  <div className="grid grid-cols-2 gap-md">
                    <Input label="CPF / CNPJ" value={clientDraft.documentNumber} onChange={(e) => updateClientDraft('documentNumber', e.target.value)} placeholder="000.000.000-00" />
                    <Input label="TELEFONE_CONTATO" value={clientDraft.phone} onChange={(e) => updateClientDraft('phone', e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
                  <Input label="VÍNCULO_DIGITAL" value={clientDraft.email} onChange={(e) => updateClientDraft('email', e.target.value)} placeholder="EMAIL@EMPRESA.COM" />
                </div>
              </Card>

              <Card className="p-card">
                <SectionTitle className="mt-0 mb-8">Logística e Localização</SectionTitle>
                <Input label="LOGRADOURO_BASE" value={clientDraft.address} onChange={(e) => updateClientDraft('address', e.target.value)} placeholder="RUA, NÚMERO, BAIRRO..." />
              </Card>

              <Card className="p-card border-l-4 border-l-[var(--accent-gold)]">
                <SectionTitle className="mt-0 mb-8">Parâmetros de Auditoria</SectionTitle>
                <div className="grid grid-cols-2 gap-md mb-8">
                  <Select label="TIPO_CLIENTE" value={clientDraft.contributorType} onChange={(val) => updateClientDraft('contributorType', val as ClientDraft['contributorType'])}>
                    <option value="not-informed">Não informado</option>
                    <option value="individual">Pessoa física</option>
                    <option value="taxpayer">Empresa / Contribuinte</option>
                  </Select>
                  <MonetaryInput label="LIMITE_CRÉDITO" value={clientDraft.creditLimit} onChange={(v) => updateClientDraft('creditLimit', v)} />
                </div>
                <TextArea label="NOTAS_ESTRATÉGICAS" value={clientDraft.notes} onChange={(v) => updateClientDraft('notes', v)} placeholder="DETALHES ÚTEIS PARA O RELACIONAMENTO..." rows={4} />
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <SecondaryButton className="h-16 font-black tracking-widest" onClick={() => setActiveSection('clients')}>DESCARTAR</SecondaryButton>
              <PrimaryButton className="h-16 font-black tracking-widest" onClick={addClient}>{editingClientId ? 'SALVAR INTELIGÊNCIA' : 'CONFIRMAR REGISTRO'}</PrimaryButton>
            </div>
          </Priority.P1>
        )}

        {/* Confirmation Modals */}
        <Modal
          isOpen={modalType === 'removeClient'}
          title="EXCLUSÃO DE REGISTRO"
          confirmLabel="PURGAR AGORA"
          tone="danger"
          onClose={() => { setModalType(null); setItemToRemove(null); }}
          onConfirm={removeClient}
        >
          <div className="flex flex-col gap-lg py-4">
            <p className="text-ui-base font-medium text-[var(--text-secondary)] leading-relaxed">
              O registro selecionado e todas as suas correlações operacionais serão **deletados permanentemente**.
            </p>
            <div className="bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 p-shell rounded-xl">
               <label className="block mb-2 text-ui-xs text-[var(--accent-red)] font-black tracking-widest">DIGITE 'EXCLUIR' PARA PURGAR</label>
               <input 
                value={confirmInput} 
                onChange={(e) => setConfirmInput(e.target.value.toUpperCase())} 
                placeholder="TOKEN DE SEGURANÇA" 
                autoFocus 
                className="w-full bg-white/[0.04] border var(--border-subtle) rounded-xl px-4 py-4 text-ui-base font-black text-[var(--accent-red)] focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      </OperationalFlowLayout>
    </SemanticScreen>
  );
}
