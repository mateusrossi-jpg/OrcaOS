import { useEffect, useMemo, useState, memo } from 'react';
import { 
  Users, 
  MapPin, 
  Plus, 
  ShieldCheck, 
  TrendingUp,
  History,
  ChevronRight,
  User,
  Activity,
  ArrowLeft,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Boxes,
  Settings,
  Package,
  FileSignature,
  Building,
  Wrench,
  FileBadge,
  UserCheck,
  UserPlus,
  Star
} from "lucide-react";
import { 
  SearchInput,
  MoneyValue,
  Modal,
  QueueEmptyState,
  ContextBanner,
  MonetaryInput,
  Select,
  Input,
  TextArea,
  PrimaryButton,
  DangerButton
} from '../../../app/components/ui';
import { 
  SemanticBadge,
  SurfaceCard,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  ScreenContainer,
  AppHeader,
  OpsChip,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Heading,
  Value,
  FinancialValue,
  ERPLoader
} from '../../../ui/system';
import { clientService } from '../../../services/clientService';
import { siteService } from '../../../services/siteService';
import { assetService } from '../../../services/assetService';
import { contractService } from '../../../services/contractService';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { ClientCRMProjection, CRMAlertHubProjection } from '../../../domain/operationalProjections';
import { Site } from '../../../domain/site';
import { Asset, AssetType } from '../../../domain/asset';
import { Contract, BillingFrequency } from '../../../domain/contract';
import { Client } from '../../../domain/client';
import { Asset360Modal } from './Asset360Modal';
import { cn } from '../../../utils/ui';

/**
 * ClientsWorkspace: Strategic Asset Hub.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export function ClientsWorkspace({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const [crmList, setCrmList] = useState<ClientCRMProjection[]>([]);
  const [alertHub, setAlertHub] = useState<CRMAlertHubProjection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientTimeline, setClientTimeline] = useState<any[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<'resumo' | 'patrimonio' | 'contratos' | 'cadastro'>('resumo');
  const [fullClientData, setFullClientData] = useState<Client | null>(null);
  
  const [sites, setSites] = useState<Site[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingPatrimony, setIsLoadingPatrimony] = useState(false);
  
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState({ name: '', email: '', phone: '' });

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[ClientsWorkspace] Loading intelligence...');
      const [list, hub] = await Promise.all([
        operationalReadModelService.getCRMProjection(),
        operationalReadModelService.getCRMAlertHubProjection()
      ]);
      console.log('[ClientsWorkspace] Intelligence loaded:', { listCount: list?.length });
      setCrmList(list || []);
      setAlertHub(hub);
    } catch (err) { 
      console.error('CRM Load Failed:', err); 
      setError('Não foi possível carregar a inteligência de base. Verifique sua conexão local.');
    } finally { 
      setIsLoading(false); 
    }
  }

  useEffect(() => { 
    let mounted = true;
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleCreateClient = async () => {
    if (!clientDraft.name.trim()) return;
    try {
      await clientService.add({
        ...clientDraft,
      });
      setIsCreatingClient(false);
      setClientDraft({ name: '', email: '', phone: '' });
      await loadData();
    } catch (e) { 
      console.error('Client Creation Failed:', e);
      alert('Erro ao cadastrar cliente.');
    }
  };

  const selectedClientSummary = useMemo(() => crmList.find(c => c.clientId === selectedClientId) || null, [crmList, selectedClientId]);

  async function openClient360(clientId: string) {
    setSelectedClientId(clientId);
    setActiveDossierTab('resumo');
    setIsLoadingTimeline(true);
    try {
      const [timeline, client] = await Promise.all([
        operationalReadModelService.getClientTimeline(clientId),
        clientService.getById(clientId)
      ]);
      setClientTimeline(timeline || []);
      setFullClientData(client || null);
    } catch (err) { 
      console.error('Timeline/Client Load Failed:', err); 
      setClientTimeline([]);
      setFullClientData(null);
    } finally { 
      setIsLoadingTimeline(false); 
    }
  }

  const handleSaveFullClient = async () => {
    if (!fullClientData) return;
    try {
      await clientService.update(fullClientData.id, fullClientData);
      await loadData(); // refresh summary list
    } catch(err) {
      console.error('Failed to update client', err);
    }
  };

  async function refreshPatrimony() {
    if (!selectedClientId) return;
    setIsLoadingPatrimony(true);
    try {
      const [s, a, c] = await Promise.all([
        siteService.getByClientId(selectedClientId),
        assetService.getByClientId(selectedClientId),
        contractService.getByClientId(selectedClientId)
      ]);
      setSites(s || []);
      setAssets(a || []);
      setContracts(c || []);
    } catch (e) { 
      console.error('Patrimony Load Failed:', e); 
    } finally { 
      setIsLoadingPatrimony(false); 
    }
  }

  useEffect(() => {
    if (selectedClientId && (activeDossierTab === 'patrimonio' || activeDossierTab === 'contratos')) {
      refreshPatrimony();
    }
  }, [selectedClientId, activeDossierTab]);

  const filteredCRM = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return crmList;
    return crmList.filter(c => (c.clientName || '').toLowerCase().includes(q));
  }, [crmList, search]);

  const chips = (
    <>
      <OpsChip icon={<UserCheck size={11} />} label={`${crmList.length} ativos`} accent={false} />
      <OpsChip icon={<AlertTriangle size={11} />} label={`${alertHub?.debtors.length || 0} inadimplentes`} accent={(alertHub?.debtors.length || 0) > 0 ? "red" : false} />
      <OpsChip icon={<Star size={11} />} label="Fidelity 360º" accent={false} />
    </>
  );

  if (isLoading) return <ScreenContainer className="items-center justify-center min-h-[400px]"><ERPLoader message="Mapeando rede..." /></ScreenContainer>;
  
  if (error) {
    return (
      <ScreenContainer className="items-center justify-center p-8 text-center gap-6">
         <AlertTriangle className="h-12 w-12 text-[var(--accent-red)] opacity-20" />
         <Body className="text-[var(--text-secondary)]">{error}</Body>
         <PrimaryButton onClick={loadData}>TENTAR NOVAMENTE</PrimaryButton>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="pb-32">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[124px] scrollbar-none">
        
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Relacionamento."
          action={
            <button 
              onClick={() => setIsCreatingClient(true)}
              className="flex h-[42px] items-center gap-2 px-3 rounded-[14px] bg-[var(--accent-gold)] text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-[var(--shadow-primary)]"
              title="Novo Cliente Estratégico"
            >
              <UserPlus size={18} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">Cliente</span>
            </button>
          }
          chips={chips}
        />

        <div className="px-6 flex flex-col gap-8">
          
          {/* 1. CRM HUB HERO */}
          <Section className="gap-4">
            <SectionLabel className="ml-1">Saúde da Rede</SectionLabel>
            <SurfaceCard variant="cinematic" padding="lg" className="glow-gold">
               <div className="flex items-center justify-between mb-8">
                  <SectionLabel className="text-[var(--accent-gold)] !opacity-100">Estratégia de Base</SectionLabel>
                  <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] px-3 py-1.5 rounded-xl">
                     <Activity size={12} className="text-[var(--accent-green)]" />
                     <Value className="text-[11px] font-bold">SCORE: 84%</Value>
                  </div>
               </div>
               
               <Heading className="text-[34px] mb-3 leading-none">
                  {crmList.length} Contatos
               </Heading>
               <Body className="text-[var(--accent-gold)] font-bold tracking-tight uppercase text-[10px] opacity-80">
                  Base Estratégica Mapeada
               </Body>

               <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-3 mt-8">
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[9px]">Saldo Devedor Ativo</SectionLabel>
                     <FinancialValue value={crmList.reduce((acc, c) => acc + (c.openBalance || 0), 0)} className="text-[15px] text-[var(--accent-red)] font-bold" />
                  </div>
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[9px]">LTV Acumulado</SectionLabel>
                     <FinancialValue value={crmList.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)} className="text-[15px] text-white font-bold" />
                  </div>
               </div>
            </SurfaceCard>
          </Section>

          {/* 2. SEARCH & LIST */}
          <Section className="gap-4">
             <SearchInput value={search} onChange={setSearch} placeholder="Localizar contato estrategico..." />
             
             <SurfaceCard padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-[22px] pb-[18px]">
                   <SectionLabel>Base de Dados</SectionLabel>
                   <TrendingUp size={14} className="text-[var(--text-tertiary)] opacity-30" />
                </div>

                {filteredCRM.length === 0 ? (
                  <div className="py-24 px-6 text-center">
                     <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] grid place-items-center mx-auto mb-6 opacity-20">
                        <Users size={32} className="text-white" />
                     </div>
                     <Body className="font-mono text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mb-8">SEM_INTELIGÊNCIA_DE_BASE</Body>
                     <PrimaryButton 
                        onClick={() => setIsCreatingClient(true)}
                        className="mt-6 mx-auto w-auto px-8"
                     >
                        Cadastrar Primeiro Cliente
                     </PrimaryButton>
                  </div>
                ) : (
                  <Stack className="gap-0">
                    {filteredCRM.map((crm, idx) => (
                      <InteractiveRow 
                        key={crm.clientId}
                        onClick={() => openClient360(crm.clientId)}
                        leftSlot={
                          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] grid place-items-center">
                            <span className="text-xl leading-none">
                              {crm.relationshipStatus.includes('VIP') ? "👑" : "👤"}
                            </span>
                          </div>
                        }
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                <Body className="truncate leading-tight uppercase font-bold text-[13px]">
                                  {crm.clientName || 'Cliente sem nome'}
                                </Body>
                                {crm.relationshipScore > 80 && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shrink-0 shadow-[0_0_8px_var(--accent-green)]" />}
                             </div>
                             <Subtitle className="text-[10px] truncate opacity-50 uppercase font-mono tracking-widest">
                                SCORE: {crm.relationshipScore}% · {crm.daysInactive === 0 ? 'INTERAÇÃO_HOJE' : `${crm.daysInactive}D_INATIVO`}
                             </Subtitle>
                          </div>
                          <Stack className="items-end gap-1.5 shrink-0">
                             <FinancialValue 
                               value={crm.openBalance > 0 ? crm.openBalance : crm.totalRevenue} 
                               compact 
                               className={cn("text-[14px] font-bold", crm.openBalance > 0 ? "text-[var(--accent-red)]" : "text-white")} 
                             />
                             <SectionLabel className="!text-[8px] !text-[var(--text-tertiary)] uppercase tracking-tighter">{crm.openBalance > 0 ? 'DEVEDOR' : 'LTV_ACUM'}</SectionLabel>
                          </Stack>
                        </div>
                      </InteractiveRow>
                    ))}
                  </Stack>
                )}
                <div className="h-2" />
             </SurfaceCard>
          </Section>

          <ContextBanner 
            title="Inteligência de Base" 
            meta="O Aferix monitora o silêncio dos seus clientes VIPs para sugerir follow-ups proativos." 
            icon={<ShieldCheck size={18} />} 
          />
        </div>
      </div>

      <Asset360Modal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />

      <Modal isOpen={!!selectedClientId} onClose={() => setSelectedClientId(null)} title={(selectedClientSummary?.clientName || "Dossiê").toUpperCase()} confirmLabel="Fechar" onConfirm={() => setSelectedClientId(null)}>
         <Section className="gap-6 pt-4">
            <ExecutiveSummaryGrid>
               <ValueBlock label="LTV Total" value={formatCurrencyBRL(selectedClientSummary?.totalRevenue || 0)} />
               <ValueBlock label="Saldo Aberto" value={formatCurrencyBRL(selectedClientSummary?.openBalance || 0)} variant={selectedClientSummary?.openBalance ? "danger" : "default"} />
               <ValueBlock label="Fidelity Score" value={`${selectedClientSummary?.relationshipScore || 0}%`} variant={(selectedClientSummary?.relationshipScore || 0) > 70 ? "success" : "default"} />
               <ValueBlock label="Histórico" value={`${selectedClientSummary?.totalWorkOrders} OSs`} />
            </ExecutiveSummaryGrid>

            <div className="flex gap-6 border-b border-white/[0.07] px-1 overflow-x-auto scrollbar-none">
               {['resumo', 'patrimonio', 'contratos', 'cadastro'].map(t => (
                 <button 
                   key={t} 
                   onClick={() => setActiveDossierTab(t as any)} 
                   className={cn(
                     "pb-3 text-[11px] font-black tracking-widest transition-all whitespace-nowrap",
                     activeDossierTab === t ? "border-b-2 border-[var(--accent-gold)] text-white" : "text-[var(--text-secondary)]"
                   )}
                 >
                   {t.toUpperCase()}
                 </button>
               ))}
            </div>

            {activeDossierTab === 'resumo' && (
              <div className="flex flex-col gap-6 pl-2 relative">
                 <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.07]" />
                 {clientTimeline.map((evt) => (
                    <div key={evt.id} className="flex gap-4 relative">
                       <div className={cn(
                         "w-3.5 h-3.5 rounded-full bg-[#050505] border-2 z-10 mt-1 shrink-0",
                         evt.severity === 'critical' ? "border-[var(--accent-red)]" : "border-[var(--accent-gold)]"
                       )} />
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <Body className="font-bold">{evt.title}</Body>
                             <SectionLabel className="!text-[9px] mt-1">{new Date(evt.timestamp).toLocaleDateString('pt-BR')}</SectionLabel>
                          </div>
                          <Subtitle className="mt-1 opacity-60 leading-relaxed">{evt.description}</Subtitle>
                       </div>
                    </div>
                 ))}
              </div>
            )}
            
            {activeDossierTab === 'patrimonio' && (
              <Stack className="gap-4">
                 <div className="flex justify-between items-center px-1">
                    <SectionLabel>Ativos do Cliente</SectionLabel>
                    <button onClick={() => {}} className="text-[10px] text-[var(--accent-gold)] font-black font-mono tracking-wider">+ CADASTRAR</button>
                 </div>
                 <SurfaceCard padding="none">
                    <Stack className="gap-0">
                      {assets.map(a => (
                        <InteractiveRow key={a.id} hasChevron onClick={() => setSelectedAssetId(a.id)}>
                          <div className="flex items-center gap-4">
                            <Package size={14} className="text-[var(--accent-gold)]" />
                            <Stack className="gap-0.5">
                              <Body className="font-bold">{a.name}</Body>
                              <SectionLabel className="!text-[10px] opacity-30">TAG_{a.tag} · {a.category}</SectionLabel>
                            </Stack>
                          </div>
                        </InteractiveRow>
                      ))}
                    </Stack>
                 </SurfaceCard>
              </Stack>
            )}

            {activeDossierTab === 'cadastro' && fullClientData && (
              <div className="flex flex-col gap-6 py-2">
                 <div className="flex flex-col gap-4">
                    <Input label="Razão Social / Nome Completo" value={fullClientData.name} onChange={e => setFullClientData({...fullClientData, name: e.target.value})} />
                    <div className="flex gap-4">
                       <Input label="CPF/CNPJ" value={fullClientData.documentNumber || ''} onChange={e => setFullClientData({...fullClientData, documentNumber: e.target.value})} className="flex-1" />
                       <Input label="Telefone" value={fullClientData.phone || ''} onChange={e => setFullClientData({...fullClientData, phone: e.target.value})} className="flex-1" />
                    </div>
                    <Input label="E-mail principal" value={fullClientData.email || ''} onChange={e => setFullClientData({...fullClientData, email: e.target.value})} />
                 </div>

                 <Section className="gap-4 pt-4 border-t border-white/[0.05]">
                    <SectionLabel>Endereço Oficial</SectionLabel>
                    <div className="flex gap-4">
                       <Input label="CEP" value={fullClientData.postalCode || ''} onChange={e => setFullClientData({...fullClientData, postalCode: e.target.value})} className="w-1/3" />
                       <Input label="Logradouro" value={fullClientData.street || ''} onChange={e => setFullClientData({...fullClientData, street: e.target.value})} className="flex-1" />
                    </div>
                    <div className="flex gap-4">
                       <Input label="Número" value={fullClientData.addressNumber || ''} onChange={e => setFullClientData({...fullClientData, addressNumber: e.target.value})} className="w-1/3" />
                       <Input label="Bairro" value={fullClientData.district || ''} onChange={e => setFullClientData({...fullClientData, district: e.target.value})} className="flex-1" />
                    </div>
                    <div className="flex gap-4">
                       <Input label="Cidade" value={fullClientData.city || ''} onChange={e => setFullClientData({...fullClientData, city: e.target.value})} className="flex-[2]" />
                       <Input label="UF" value={fullClientData.state || ''} onChange={e => setFullClientData({...fullClientData, state: e.target.value})} className="flex-1" />
                    </div>
                    <Input label="Complemento" value={fullClientData.complement || ''} onChange={e => setFullClientData({...fullClientData, complement: e.target.value})} />
                 </Section>

                 <Section className="gap-4 pt-4 border-t border-white/[0.05]">
                    <SectionLabel>Informações Financeiras</SectionLabel>
                    <div className="flex gap-4">
                       <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase ml-1">Contribuinte</label>
                          <Select 
                             value={fullClientData.contributorType || 'not-informed'} 
                             onChange={e => setFullClientData({...fullClientData, contributorType: e.target.value as any})}
                          >
                             <option value="not-informed">Não Informado</option>
                             <option value="individual">Pessoa Física</option>
                             <option value="taxpayer">Contrib. ICMS</option>
                             <option value="exempt">Isento</option>
                             <option value="non-taxpayer">Não Contribuinte</option>
                          </Select>
                       </div>
                       <Input label="Inscrição Estadual" value={fullClientData.stateRegistration || ''} onChange={e => setFullClientData({...fullClientData, stateRegistration: e.target.value})} className="flex-1" />
                    </div>
                    <Input label="Limite de Crédito (R$)" value={fullClientData.creditLimit || ''} onChange={e => setFullClientData({...fullClientData, creditLimit: e.target.value})} />
                 </Section>

                 <Section className="gap-4 pt-4 border-t border-white/[0.05]">
                    <SectionLabel>Inteligência</SectionLabel>
                    <TextArea 
                       label="Notas e Comportamento" 
                       value={fullClientData.notes || ''} 
                       onChange={e => setFullClientData({...fullClientData, notes: e.target.value})}
                       placeholder="Informações relevantes sobre restrições de horários, comportamento, nível de exigência..."
                       rows={4}
                    />
                 </Section>

                 <div className="mt-4 flex gap-4">
                    <PrimaryButton onClick={handleSaveFullClient} className="flex-1">ATUALIZAR CADASTRO</PrimaryButton>
                 </div>
              </div>
            )}
         </Section>
      </Modal>

      <Modal 
        isOpen={isCreatingClient} 
        onClose={() => setIsCreatingClient(false)} 
        title="Novo Cliente Estratégico" 
        confirmLabel="Cadastrar" 
        onConfirm={handleCreateClient}
      >
        <div className="flex flex-col gap-6 py-2">
           <Input label="Nome Completo" value={clientDraft.name} onChange={e => setClientDraft({ ...clientDraft, name: e.target.value })} placeholder="Razão Social ou Nome..." autoFocus />
           <Input label="WhatsApp / Telefone" value={clientDraft.phone} onChange={e => setClientDraft({ ...clientDraft, phone: e.target.value })} placeholder="(00) 00000-0000" />
           <Input label="E-mail (Opcional)" value={clientDraft.email} onChange={e => setClientDraft({ ...clientDraft, email: e.target.value })} placeholder="email@exemplo.com" />
        </div>
      </Modal>

    </ScreenContainer>
  );
}
