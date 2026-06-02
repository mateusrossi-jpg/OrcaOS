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
  Star,
  Navigation,
  MessageCircle
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
import { FastSiteCreationModal } from './FastSiteCreationModal';
import { openWhatsApp, openExternalGPS } from '../../../utils/mobility';
import { cn } from '../../../utils/ui';
import { HeroCard } from '../../../components/HeroCard';

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
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);

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
      await clientService.update(fullClientData);
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
          title="Clientes."
          chips={chips}
        />

        <div className="px-6 py-8 flex flex-col gap-12">
          
          {/* 1. CRM HUB HERO */}
          <Section className="gap-4">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop">
              {/* Gold ambient radial glow */}
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)]">ESTRATÉGIA DE BASE</span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-[32px] font-black text-white leading-none tracking-tight">{crmList.length} CONTATOS</h3>
                  <div className="flex items-baseline gap-4">
                    <Stack className="gap-0.5 items-end">
                       <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">LTV Acumulado</SectionLabel>
                       <FinancialValue value={crmList.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)} className="text-sm font-mono opacity-80" />
                    </Stack>
                    <div className="h-6 w-px bg-white/10" />
                    <Stack className="gap-0.5 items-end">
                       <SectionLabel className="!text-[8px] opacity-40 uppercase tracking-widest font-mono">Saldo Devedor</SectionLabel>
                       <FinancialValue value={crmList.reduce((acc, c) => acc + (c.openBalance || 0), 0)} className="text-sm font-mono text-[var(--accent-red)]" />
                    </Stack>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* HERO ACTION */}
          <Section className="gap-4">
             <button 
                onClick={() => setIsCreatingClient(true)} 
                className="w-full h-14 bg-[var(--accent-gold)] text-black font-black text-[12px] tracking-[0.22em] shadow-[0_0_24px_rgba(255,200,0,0.25)] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase"
             >
                NOVO CLIENTE <UserPlus className="h-3.5 w-3.5" />
             </button>
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
                                <Body className="truncate leading-tight uppercase font-black tracking-tight text-white text-[14px]">
                                  {crm.clientName || 'Cliente sem nome'}
                                </Body>
                                {crm.relationshipScore > 80 && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shrink-0 shadow-[0_0_8px_var(--accent-green)]" />}
                             </div>
                             <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">
                                {crm.daysInactive === 0 ? 'Ativo hoje' : `Inativo há ${crm.daysInactive} dias`} · Score: {crm.relationshipScore}%
                             </Subtitle>
                          </div>
                          <Stack className="items-end gap-1 shrink-0">
                             <FinancialValue 
                               value={crm.openBalance > 0 ? crm.openBalance : crm.totalRevenue} 
                               compact 
                               className={cn("text-[14px] font-mono font-bold", crm.openBalance > 0 ? "text-[var(--accent-red)]" : "text-[var(--accent-gold)]")} 
                             />
                             <SectionLabel className="!text-[8px] !text-[var(--text-tertiary)] uppercase tracking-widest font-mono">{crm.openBalance > 0 ? 'DEVEDOR' : 'LTV ACUM'}</SectionLabel>
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
         <Section className="gap-8 pt-6">
            <div className="flex gap-3">
               <button 
                 onClick={() => openWhatsApp(fullClientData?.phone || '')}
                 className="flex-1 min-h-[44px] flex items-center justify-center gap-3 rounded-[8px] bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-black text-[11px] uppercase tracking-widest border border-[var(--accent-green)]/20 active:bg-[var(--accent-green)]/20 transition-all shadow-[0_4px_12px_rgba(37,211,102,0.1)]"
               >
                 <MessageCircle size={16} /> WHATSAPP
               </button>
               {sites.length > 0 && (
                 <button 
                   onClick={() => openExternalGPS(sites[0]?.fullAddress || '')}
                   className="flex-1 min-h-[44px] flex items-center justify-center gap-3 rounded-[8px] bg-white/[0.04] text-white font-black text-[11px] uppercase tracking-widest border border-white/[0.08] active:bg-white/10 transition-all"
                 >
                   <Navigation size={16} /> NAVEGAR
                 </button>
               )}
            </div>
            
            <ExecutiveSummaryGrid>
               <ValueBlock label="VALOR_LTV" value={formatCurrencyBRL(selectedClientSummary?.totalRevenue || 0)} variant="success" />
               <ValueBlock label="PROJETOS_OS" value={`${selectedClientSummary?.totalWorkOrders} UN`} />
               <ValueBlock label="RETORNOS" value="0" />
               <ValueBlock label="PENDÊNCIAS" value={formatCurrencyBRL(selectedClientSummary?.openBalance || 0)} variant={selectedClientSummary?.openBalance ? "danger" : "default"} />
            </ExecutiveSummaryGrid>

            <div className="flex gap-8 border-b border-white/[0.05] px-1 overflow-x-auto scrollbar-none">
               {['resumo', 'patrimonio', 'contratos', 'cadastro'].map(t => (
                 <button 
                   key={t} 
                   onClick={() => setActiveDossierTab(t as any)} 
                   className={cn(
                     "pb-4 text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap relative",
                     activeDossierTab === t ? "text-white" : "text-[var(--text-tertiary)]"
                   )}
                 >
                   {t.toUpperCase()}
                   {activeDossierTab === t && (
                     <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-gold)] shadow-[0_0_8px_var(--accent-gold)]" />
                   )}
                 </button>
               ))}
            </div>

            {activeDossierTab === 'resumo' && (
              <div className="flex flex-col gap-8 pl-1">
                 <SurfaceCard padding="lg" variant="elevated" className="border-l-4 border-l-[var(--accent-gold)] bg-gradient-to-r from-[var(--accent-gold)]/5 to-transparent">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="text-[14px]">📌</span>
                     <SectionLabel className="!text-[9px] !text-[var(--accent-gold)] uppercase tracking-[0.25em]">CONTEXTO_FIXADO</SectionLabel>
                   </div>
                   <Body className="text-[#EFEFEF] italic font-medium leading-relaxed">"Cliente estratégico com alto nível de exigência técnica. Priorizar agendamentos matinais e acesso via portaria B."</Body>
                 </SurfaceCard>

                 <div className="flex flex-col gap-8 relative">
                   <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />
                   {clientTimeline.map((evt) => (
                      <div key={evt.id} className="flex gap-6 relative">
                         <div className={cn(
                           "w-3.5 h-3.5 rounded-full bg-[var(--bg-primary)] border-[3px] z-10 mt-1 shrink-0",
                           evt.severity === 'critical' ? "border-[var(--accent-red)] shadow-[0_0_10px_var(--accent-red)]" : "border-[var(--accent-gold)] shadow-[0_0_10px_var(--accent-gold)]"
                         )} />
                         <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                               <Body className="font-black text-[13px] uppercase tracking-tight">{evt.title}</Body>
                               <span className="font-mono text-[9px] font-bold text-white/30 tracking-widest">{new Date(evt.timestamp).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <Subtitle className="text-[12px] opacity-60 leading-relaxed font-medium">{evt.description}</Subtitle>
                         </div>
                      </div>
                   ))}
                 </div>
              </div>
            )}
            
            {activeDossierTab === 'patrimonio' && (
              <Stack className="gap-6">
                 <div className="flex justify-between items-center px-1">
                    <SectionLabel className="!text-[10px] !text-[var(--accent-gold)]">Ativos e Patrimônio</SectionLabel>
                    <button onClick={() => {}} className="text-[9px] text-white font-black font-mono tracking-[0.2em] bg-white/[0.05] px-3 py-1.5 rounded-lg border border-white/[0.1]">+ CADASTRAR</button>
                 </div>
                 <SurfaceCard padding="none" className="overflow-hidden border-white/[0.08]">
                    <Stack className="gap-0">
                      {assets.map((a, idx) => (
                        <InteractiveRow key={a.id} hasChevron onClick={() => setSelectedAssetId(a.id)} className={idx !== 0 ? "border-t border-white/[0.06]" : ""}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] grid place-items-center">
                               <Package size={18} className="text-[var(--accent-gold)]" />
                            </div>
                            <Stack className="gap-0.5">
                              <Body className="font-black text-[14px] uppercase">{a.name}</Body>
                              <span className="font-mono text-[9px] font-bold text-white/20 tracking-[0.2em]">ID_{a.tag} · {a.category.toUpperCase()}</span>
                            </Stack>
                          </div>
                        </InteractiveRow>
                      ))}
                      {assets.length === 0 && (
                        <div className="py-20 text-center opacity-20">
                           <SectionLabel className="!text-[10px]">PATRIMÔNIO_ZERO</SectionLabel>
                        </div>
                      )}
                    </Stack>
                 </SurfaceCard>
              </Stack>
            )}

            {activeDossierTab === 'cadastro' && fullClientData && (
              <div className="flex flex-col gap-10 py-2">
                 <div className="flex flex-col gap-6">
                    <Input label="Razão Social / Nome Completo" value={fullClientData.name} onChange={e => setFullClientData({...fullClientData, name: e.target.value})} />
                    <div className="flex gap-4">
                       <Input label="CPF/CNPJ" value={fullClientData.documentNumber || ''} onChange={e => setFullClientData({...fullClientData, documentNumber: e.target.value})} className="flex-1" />
                       <Input label="Telefone" value={fullClientData.phone || ''} onChange={e => setFullClientData({...fullClientData, phone: e.target.value})} className="flex-1" />
                    </div>
                    <Input label="E-mail principal" value={fullClientData.email || ''} onChange={e => setFullClientData({...fullClientData, email: e.target.value})} />
                 </div>

                 <Section className="gap-6 pt-8 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                       <SectionLabel className="!text-[10px] !text-[var(--accent-gold)]">Locais de Atendimento</SectionLabel>
                       <button onClick={() => setIsSiteModalOpen(true)} className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.05] px-3 py-1.5 rounded-lg border border-white/[0.1]">
                         <Plus size={12} /> NOVO_SITE
                       </button>
                    </div>
                    {sites.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {sites.map(s => (
                          <div key={s.id} className="p-5 bg-[#0B0F14] border border-white/[0.05] rounded-[20px] flex items-center justify-between">
                            <div className="min-w-0 pr-4">
                              <div className="text-[13px] font-black text-white mb-1 uppercase tracking-tight truncate">{s.name}</div>
                              <div className="text-[11px] font-mono font-bold text-white/30 leading-tight uppercase tracking-wider truncate">{s.fullAddress}</div>
                            </div>
                            <button onClick={() => openExternalGPS(s.fullAddress)} className="h-10 w-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl text-[var(--accent-gold)] active:scale-95 transition-all">
                              <Navigation size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border border-dashed border-white/[0.08] rounded-[20px] opacity-20">
                         <SectionLabel className="!text-[10px]">SEM_LOCAIS_MAPEADOS</SectionLabel>
                      </div>
                    )}
                 </Section>

                 <div className="mt-4 flex gap-4">
                    <PrimaryButton onClick={handleSaveFullClient} className="flex-1 min-h-[44px] rounded-[var(--radius-md)] text-[12px] font-black tracking-[0.2em]">ATUALIZAR_DOSSIÊ_EXECUTIVO</PrimaryButton>
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

      {isSiteModalOpen && selectedClientId && (
        <FastSiteCreationModal 
          clientId={selectedClientId} 
          isOpen={isSiteModalOpen} 
          onClose={() => setIsSiteModalOpen(false)} 
          onSuccess={async (siteId) => {
             setIsSiteModalOpen(false);
             const updatedSites = await siteService.getByClientId(selectedClientId);
             if (updatedSites) setSites(updatedSites);
          }} 
        />
      )}

    </ScreenContainer>
  );
}
