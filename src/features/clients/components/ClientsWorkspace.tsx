import { generateUUID } from '../../../core/utils/idGenerator';
import { useEffect, useMemo, useState, memo } from 'react';
import { trustLayer } from '../../../core/trust/TrustLayer';
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
  MessageCircle,
  Zap
  } from 'lucide-react';
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
import { clientMemoryEngine, ClientMemory } from '../../../services/ClientMemoryEngine';
import { operationalFacade } from '../../workflow/operationalFacade';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { ClientCRMProjection, CRMAlertHubProjection } from '../../../domain/operationalProjections';
import { Site } from '../../../domain/site';
import { Asset, AssetType } from '../../../domain/asset';
import { Contract, BillingFrequency } from '../../../domain/contract';
import { Client } from '../../../domain/client';
import { Asset360Modal } from './Asset360Modal';
import { FastSiteCreationModal } from './FastSiteCreationModal';
import { ClientZeroBottomSheet, ClientZeroResult } from './ClientZeroBottomSheet';
import { openWhatsApp, openExternalGPS } from '../../../utils/mobility';
import { cn } from '../../../utils/ui';
import { HeroCard } from '../../../components/HeroCard';
import { BUDGET_STATUS } from '../../../domain/budget';

/**
 * ClientsWorkspace: Strategic Asset Hub.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 * SCROLL-FIRST ENFORCED.
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
  const [fullClientData, setFullClientData] = useState<Client | null>(null);
  const [clientMemory, setClientMemory] = useState<ClientMemory | null>(null);
  
  const [sites, setSites] = useState<Site[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingPatrimony, setIsLoadingPatrimony] = useState(false);
  
  const [isClientZeroOpen, setIsClientZeroOpen] = useState(false);

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

  const handleCreateClientZero = async (result: ClientZeroResult) => {
    setIsClientZeroOpen(false);
    await loadData();
    // Auto-open the 360 view to allow progressive enrichment
    setTimeout(() => openClient360(result.clientId), 400);
  };

  const selectedClientSummary = useMemo(() => crmList.find(c => c.clientId === selectedClientId) || null, [crmList, selectedClientId]);

  async function openClient360(clientId: string) {
    setSelectedClientId(clientId);
    setIsLoadingTimeline(true);
    setIsLoadingPatrimony(true);
    try {
      const [timeline, client, s, a, c, memory] = await Promise.all([
        operationalReadModelService.getClientTimeline(clientId),
        clientService.getById(clientId),
        siteService.getByClientId(clientId),
        assetService.getByClientId(clientId),
        contractService.getByClientId(clientId),
        clientMemoryEngine.getClientMemory(clientId)
      ]);
      setClientTimeline(timeline || []);
      setFullClientData(client || null);
      setSites(s || []);
      setAssets(a || []);
      setContracts(c || []);
      setClientMemory(memory);
    } catch (err) { 
      console.error('Timeline/Client Load Failed:', err); 
      setClientTimeline([]);
      setFullClientData(null);
      setSites([]);
      setAssets([]);
      setContracts([]);
      setClientMemory(null);
    } finally { 
      setIsLoadingTimeline(false); 
      setIsLoadingPatrimony(false);
    }
  }

  const handleRepeatService = async () => {
    if (!clientMemory || !selectedClientId) return;
    
    try {
      let siteId = sites.length > 0 ? sites[0].id : null;
      
      if (!siteId) {
        const existingSites = await siteService.getByClientId(selectedClientId);
        if (existingSites && existingSites.length > 0) {
          siteId = existingSites[0].id;
        } else {
          const newSite = await siteService.add({
            clientId: selectedClientId,
            name: 'Local Principal',
            fullAddress: 'Endereço não informado',
            isMain: true
          });
          siteId = newSite.id;
        }
      }

      // Initialize Attendance session (P0 refactor)
      const attendanceId = await operationalFacade.initializeAttendance(selectedClientId, siteId || 'default-site');
      
      const budgetId = generateUUID();
      const budget = {
        id: budgetId,
        clientId: selectedClientId,
        siteId: siteId || 'default-site',
        attendanceId,
        title: clientMemory.lastServiceTitle || 'Serviço Recorrente',
        status: BUDGET_STATUS.INICIADO,
        chargedValue: clientMemory.lastExecutedValue || 0,
        materialCost: 0,
        travelCost: 0,
        helperCost: 0,
        fees: 0,
        discounts: 0,
        otherCosts: 0,
        items: clientMemory.lastBudgetItems || [
          {
            id: generateUUID(),
            description: clientMemory.lastServiceTitle || 'Mão de Obra',
            quantity: 1,
            unitPrice: clientMemory.lastExecutedValue || 0,
            category: 'labor' as const
          }
        ],
        notes: clientMemory.lastServiceDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await operationalFacade.saveBudget(budget as any);
      await operationalFacade.finalizeBudget(budgetId);
      
      setSelectedClientId(null); 
      onNavigate('budgets'); 
      
      window.dispatchEvent(new CustomEvent('aferix_toast', { 
        detail: { type: 'success', message: 'Proposta recorrente criada com sucesso!' } 
      }));
    } catch (err) {
      console.error('Failed to repeat service:', err);
    }
  };

  const handleSaveFullClient = async () => {
    if (!fullClientData) return;
    try {
      await clientService.update(fullClientData);
      await loadData(); // refresh summary list
    } catch(err) {
      console.error('Failed to update client', err);
    }
  };

  const groupedCRM = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = crmList.filter(c => (c.clientName || '').toLowerCase().includes(q));
    
    // Sort alphabetically
    const sorted = [...filtered].sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
    
    // Group by first letter
    return sorted.reduce((acc, client) => {
      const firstLetter = (client.clientName || '#')[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(client);
      return acc;
    }, {} as Record<string, ClientCRMProjection[]>);
  }, [crmList, search]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

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
      <div className="flex flex-col">
        
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
                onClick={() => setIsClientZeroOpen(true)} 
                className="w-full h-14 bg-[var(--accent-gold)] text-black font-black text-[12px] tracking-[0.22em] shadow-[0_0_24px_rgba(255,200,0,0.25)] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase"
             >
                NOVO CLIENTE <UserPlus className="h-3.5 w-3.5" />
             </button>
          </Section>

          {/* 2. SEARCH & LIST */}
          <Section className="gap-6">
             <SearchInput value={search} onChange={setSearch} placeholder="Localizar contato estrategico..." />
             
             <SurfaceCard padding="none" className="overflow-hidden border-white/[0.04]">
                <div className="flex items-center justify-between px-6 pt-[22px] pb-[18px]">
                   <SectionLabel>Base de Dados</SectionLabel>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{Object.keys(groupedCRM).length} Grupos</span>
                      <TrendingUp size={14} className="text-[var(--text-tertiary)] opacity-30" />
                   </div>
                </div>

                {Object.keys(groupedCRM).length === 0 ? (
                  <div className="py-24 px-6 text-center">
                     <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] grid place-items-center mx-auto mb-6 opacity-20">
                        <Users size={32} className="text-white" />
                     </div>
                     <Body className="font-mono text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mb-8">SEM_INTELIGÊNCIA_DE_BASE</Body>
                     <PrimaryButton 
                        onClick={() => setIsClientZeroOpen(true)}
                        className="mt-6 mx-auto w-auto px-8"
                     >
                        Cadastrar Primeiro Cliente
                     </PrimaryButton>
                  </div>
                ) : (
                  <div className="flex">
                    {/* LISTA AGRUPADA */}
                    <div className="flex-1 flex flex-col">
                      {Object.entries(groupedCRM).map(([letter, clients]) => (
                        <div key={letter} id={`letter-${letter}`}>
                           <div className="bg-white/[0.02] px-6 py-2 border-y border-white/[0.04]">
                              <span className="text-[11px] font-black text-[var(--accent-gold)] font-mono">{letter}</span>
                           </div>
                           <Stack className="gap-0">
                              {clients.map((crm) => (
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
                        </div>
                      ))}
                    </div>

                    {/* ALPHA INDEXER (SIDEBAR RÁPIDA) */}
                    <div className="w-8 flex flex-col items-center justify-center gap-0.5 py-4 border-l border-white/[0.03]">
                       {alphabet.map(letter => (
                         <button 
                           key={letter}
                           onClick={() => document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth' })}
                           className={cn(
                             "text-[9px] font-black w-full text-center py-0.5 transition-colors",
                             groupedCRM[letter] ? "text-[var(--accent-gold)]" : "text-white/5 pointer-events-none"
                           )}
                         >
                           {letter}
                         </button>
                       ))}
                    </div>
                  </div>
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
         <Section className="gap-8 pt-6 pb-12">
            
            {/* V7: DOSSIÊ EXECUTIVO (0 SCROLL) */}
            {clientMemory && (
              <div className="flex flex-col gap-6 animate-scale-pop">
                
                <SurfaceCard padding="lg" className="border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                   <div className="flex justify-between items-start mb-6">
                      <Stack className="gap-1">
                         <div className="flex items-center gap-2">
                            <span className="text-lg">{clientMemory.tier === 'DIAMANTE' ? '💎' : clientMemory.tier === 'OURO' ? '🥇' : clientMemory.tier === 'PRATA' ? '🥈' : '🥉'}</span>
                            <SectionLabel className="!text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">CLIENTE_{clientMemory.tier}</SectionLabel>
                         </div>
                         <Body className="text-[22px] font-black text-white leading-tight uppercase truncate max-w-[200px]">{fullClientData?.name}</Body>
                      </Stack>
                      <div className="flex flex-col items-end gap-1">
                         <FinancialValue value={clientMemory.totalRevenue} className="text-[20px] font-mono font-black text-[var(--accent-gold)]" />
                         <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">RECEITA_TOTAL_LTV</span>
                      </div>
                   </div>

                   <ExecutiveSummaryGrid className="!grid-cols-2 gap-4">
                      <ValueBlock label="Ticket Médio" value={formatCurrencyBRL(clientMemory.averageTicket)} compact />
                      <ValueBlock label="Frequência" value={clientMemory.serviceFrequencyDays ? `${clientMemory.serviceFrequencyDays} dias` : '--'} compact />
                      <ValueBlock label="Última Visita" value={clientMemory.lastAttendanceDate ? `${Math.floor((Date.now() - new Date(clientMemory.lastAttendanceDate).getTime()) / (1000 * 60 * 60 * 24))} dias` : '--'} compact />
                      <ValueBlock label="Saldo Devedor" value={formatCurrencyBRL(selectedClientSummary?.openBalance || 0)} variant={selectedClientSummary?.openBalance ? "danger" : "default"} compact />
                   </ExecutiveSummaryGrid>

                   {/* PRÓXIMA OPORTUNIDADE (P1) */}
                   {clientMemory.nextOpportunity && (
                     <button 
                       className="w-full mt-6 p-4 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-between group active:scale-[0.98] transition-all" 
                       onClick={handleRepeatService}
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
                              <TrendingUp size={18} className="text-[var(--accent-gold)]" />
                           </div>
                           <Stack className="gap-0.5 items-start text-left">
                              <span className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-widest">Ação Sugerida</span>
                              <Body className="text-[13px] font-black text-white uppercase">{clientMemory.nextOpportunity.title}</Body>
                           </Stack>
                        </div>
                        <div className="flex flex-col items-end">
                           <FinancialValue value={clientMemory.nextOpportunity.potentialValue} className="text-[13px] font-mono font-bold text-white" />
                           <span className="text-[9px] font-bold text-[var(--accent-gold)]">PROPOR</span>
                        </div>
                     </button>
                   )}
                </SurfaceCard>

                {/* AÇÕES DE IMPACTO */}
                <div className="flex gap-3">
                   <button 
                     onClick={() => openWhatsApp(fullClientData?.phone || '')}
                     className="flex-1 h-14 flex items-center justify-center gap-3 rounded-xl bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-black text-[11px] uppercase tracking-widest border border-[var(--accent-green)]/20 active:bg-[var(--accent-green)]/20 transition-all shadow-inner"
                   >
                     <MessageCircle size={16} /> WHATSAPP
                   </button>
                   <button 
                     onClick={handleRepeatService}
                     className="flex-1 h-14 bg-[var(--accent-gold)] text-black font-black text-[11px] tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase shadow-[0_8px_20px_rgba(255,200,0,0.15)]"
                   >
                     REPETIR SERVIÇO <Zap size={14} className="fill-black" />
                   </button>
                </div>
              </div>
            )}

            {/* SEÇÕES SECUNDÁRIAS (ACORDEÃO OU MINIMIZADAS) */}
            <div className="flex flex-col gap-6 pt-4">
               {sites.length > 0 && (
                 <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between">
                    <Stack className="gap-0.5">
                       <SectionLabel className="!text-[8px]">ENDEREÇO_PRINCIPAL</SectionLabel>
                       <Body className="text-[12px] font-bold text-white truncate max-w-[220px] uppercase tracking-tight">{sites[0].fullAddress}</Body>
                    </Stack>
                    <button onClick={() => openExternalGPS(sites[0].fullAddress)} className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 grid place-items-center text-[var(--accent-gold)]">
                       <Navigation size={18} />
                    </button>
                 </div>
               )}

               {clientTimeline.length > 0 && (
                 <div className="flex flex-col gap-4">
                    <SectionLabel className="!text-[10px] opacity-40 ml-1">Última Atividade</SectionLabel>
                    <div className="flex gap-4 p-4 rounded-xl border border-dashed border-white/10 opacity-60">
                       <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] mt-1.5 shadow-[0_0_8px_var(--accent-gold)]" />
                       <Stack className="gap-0.5">
                          <Body className="text-[12px] font-black text-white uppercase">{clientTimeline[0].title}</Body>
                          <Subtitle className="text-[11px]">{new Date(clientTimeline[0].timestamp).toLocaleDateString('pt-BR')} · {clientTimeline[0].description}</Subtitle>
                       </Stack>
                    </div>
                 </div>
               )}
            </div>
            
         </Section>
      </Modal>

      {/* CLIENT ZERO BOTTOM SHEET — Fase 1+2+3 (Progressive Profile) */}
      <ClientZeroBottomSheet
        isOpen={isClientZeroOpen}
        onClose={() => setIsClientZeroOpen(false)}
        onClientSelected={handleCreateClientZero}
      />

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
