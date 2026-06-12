import { generateUUID } from '../../../core/utils/idGenerator';
import { useEffect, useMemo, useState, memo } from 'react';
import { trustLayer } from '../../../core/trust/TrustLayer';
import { 
  Plus, 
  ShieldCheck, 
  TrendingUp,
  History,
  ChevronRight,
  Activity,
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
  Zap,
  Phone,
  Map as MapIcon,
  Briefcase,
  Home,
  BookOpen,
  Download,
  Award,
  ArrowUpRight
  } from 'lucide-react';
import { 
  MoneyValue,
  Modal,
  QueueEmptyState,
  MonetaryInput,
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
  ERPLoader,
  GlassSearchInput,
  GlassInput,
  GlassSelect,
  GlassTextarea,
  HeroCard,
  TimelineCard,
  GlassPhoneInput,
  GlassFormCard,
  ExecutiveHeader
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
import { BUDGET_STATUS } from '../../../domain/budget';
import { downloadCSV, generateClientsCSV } from '../../../utils/exportUtils';
import { fetchAddressByCEP } from '../../../services/cepService';

/**
 * ClientsWorkspace: Strategic Asset Hub.
 * RC16: Evolved to Revenue Profile.
 */
export function ClientsWorkspace({ onNavigate, initialClientId }: { onNavigate: (tab: any) => void; initialClientId?: string | null }) {
  const [crmList, setCrmList] = useState<ClientCRMProjection[]>([]);
  const [alertHub, setAlertHub] = useState<CRMAlertHubProjection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
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

  const handleExportCSV = () => {
    const csv = generateClientsCSV(crmList);
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    downloadCSV(`clientes_${timestamp}.csv`, csv);
  };

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [list, hub] = await Promise.all([
        operationalReadModelService.getCRMProjection(),
        operationalReadModelService.getCRMAlertHubProjection()
      ]);
      setCrmList(list || []);
      setAlertHub(hub);
    } catch (err) { 
      console.error('CRM Load Failed:', err); 
      setError('Não foi possível carregar a inteligência de base.');
    } finally { 
      setIsLoading(false); 
    }
  }

  useEffect(() => { 
    loadData();
  }, []);

  useEffect(() => {
    if (initialClientId) {
      openClient360(initialClientId);
    }
  }, [initialClientId]);

  const handleCreateClientZero = async (result: ClientZeroResult) => {
    setIsClientZeroOpen(false);
    await loadData();
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
        const newSite = await siteService.add({ clientId: selectedClientId, name: 'Local Principal', fullAddress: 'Endereço não informado', isMain: true });
        siteId = newSite.id;
      }
      const attendanceId = await operationalFacade.initializeAttendance(selectedClientId, siteId || 'default-site');
      const budgetId = generateUUID();
      const budget = {
        id: budgetId, clientId: selectedClientId, siteId: siteId || 'default-site', attendanceId,
        title: clientMemory.lastServiceTitle || 'Serviço Recorrente',
        status: BUDGET_STATUS.INICIADO,
        chargedValue: clientMemory.lastExecutedValue || 0,
        items: clientMemory.lastBudgetItems || [{ id: generateUUID(), description: clientMemory.lastServiceTitle || 'Mão de Obra', quantity: 1, unitPrice: clientMemory.lastExecutedValue || 0, category: 'labor' as const }],
        notes: clientMemory.lastServiceDescription,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await operationalFacade.saveBudget(budget as any);
      await operationalFacade.finalizeBudget(budgetId);
      setSelectedClientId(null);
      onNavigate({ tab: 'revenue', budgetId });
    } catch (e) { console.error(e); }
  };

  const handleSaveFullClient = async () => {
    if (!fullClientData) return;
    try {
      await clientService.update(fullClientData);
      window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'success', message: 'Dossiê atualizado com sucesso.' } }));
      await loadData();
    } catch (e) { console.error(e); }
  };

  const groupedCRM = useMemo(() => {
    const sorted = [...crmList].filter(c => !search || c.clientName.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)).sort((a, b) => a.clientName.localeCompare(b.clientName));
    return sorted.reduce((acc, client) => {
      const firstLetter = client.clientName.substring(0, 1).toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!acc[key]) acc[key] = [];
      acc[key].push(client);
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-primary">
        <ERPLoader message="Mapeando rede..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-primary overflow-hidden relative">
      <main className="flex-1 overflow-y-auto scrollbar-none overscroll-none pb-32">
        <div className="px-5 pt-4 flex flex-col relative z-10 max-w-md mx-auto w-full gap-8">
          
          {/* BUSCA CONTEXTUAL (Estilo Home) */}
          <div className="bg-surface-secondary border border-white/[0.04] h-12 rounded-[14px] px-4 text-text-secondary w-full focus-within:border-accent-primary/20 transition-all flex items-center gap-3 shadow-inner">
            <Search size={18} className="text-white/20 shrink-0" />
            <input 
              type="text" 
              placeholder="Localizar contato..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-transparent text-[15px] outline-none border-none p-0 m-0 focus:ring-0 shadow-none placeholder:text-white/10 text-white" 
            />
          </div>

          {/* UNIFIED STRATEGIC PANEL */}
          <div className="bg-surface-primary border border-border-primary rounded-[24px] overflow-hidden flex flex-col p-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-[40px] pointer-events-none" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] relative z-10">Estratégia de Base</span>
            <div className="flex items-baseline justify-between mt-4 relative z-10">
               <h3 className="text-[28px] font-black text-white leading-none tracking-tight">{crmList.length} CONTATOS</h3>
               <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] opacity-30 uppercase tracking-widest font-mono">LTV Acumulado</span>
                  <FinancialValue value={crmList.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)} className="text-sm font-mono text-accent-primary font-bold" />
               </div>
            </div>
          </div>
          
          {/* ACTION BUTTON */}
          <button 
            onClick={() => setIsClientZeroOpen(true)} 
            className="w-full h-12 bg-white hover:bg-white/95 text-black font-black text-[12px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.975] transition-all shadow-[0_10px_25px_rgba(255,255,255,0.08)] cursor-pointer"
          >
             <UserPlus size={16} /> Novo Cliente
          </button>

          {/* UNIFIED CLIENT LIST PANEL */}
          <div className="flex flex-col gap-2.5">
             <SectionLabel className="!mb-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-1">Painel de Clientes</SectionLabel>
             
             <div className="bg-surface-primary border border-border-primary rounded-[24px] overflow-hidden flex flex-col">
                {Object.keys(groupedCRM).length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-4 opacity-30">
                     <Users size={32} className="text-white/20" />
                     <span className="text-[11px] font-mono font-black uppercase tracking-widest">Nenhum Contato</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {Object.entries(groupedCRM).map(([letter, clients]) => (
                      <div key={letter} id={`letter-${letter}`}>
                         <div className="bg-white/[0.01] px-6 py-2 border-b border-border-secondary flex items-center justify-between">
                            <span className="text-[10px] font-bold text-accent-primary font-mono">{letter}</span>
                            <span className="text-[8px] text-text-muted uppercase tracking-widest">{clients.length} itens</span>
                         </div>
                         {clients.map((crm, i) => (
                           <div 
                             key={crm.clientId} 
                             className={cn(
                               "p-4 px-6 flex items-center justify-between active:bg-white/[0.02] transition-colors cursor-pointer hover:bg-white/[0.01]",
                               (i !== clients.length - 1) && "border-b border-border-secondary"
                             )}
                             onClick={() => openClient360(crm.clientId)}
                           >
                              <div className="flex items-center gap-3.5">
                                 <div className="w-9 h-9 rounded-xl bg-surface-secondary border border-border-primary flex items-center justify-center text-[13px] font-bold text-accent-primary uppercase">
                                    {crm.clientName.charAt(0)}
                                 </div>
                                 <div className="flex flex-col gap-0.5">
                                    <span className="text-[14px] font-bold text-white tracking-tight leading-none uppercase">{crm.clientName}</span>
                                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-1">Status: {crm.relationshipStatus} • {crm.relationshipScore}% Score</span>
                                  </div>
                               </div>
                               <ChevronRight size={14} className="text-text-muted" />
                            </div>
                          ))}
                       </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
      <Asset360Modal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />

      {selectedClientId && (
        <div className="fixed inset-0 z-[1000] bg-background-primary overflow-y-auto animate-in slide-in-from-right-6 duration-500 pb-40">
           {/* Top Navigation */}
           <div className="animate-fade-in bg-background-primary/95 backdrop-blur-xl border-b border-border-secondary pt-[calc(env(safe-area-inset-top,0px)+6px)] pb-1.5 sticky top-0 z-[1000] shadow-2xl w-full">
              <div className="max-w-md mx-auto w-full px-5 flex items-center justify-between">
                 <button 
                   onClick={() => setSelectedClientId(null)}
                   className="aferix-header-btn"
                   aria-label="Voltar"
                 >
                   <ArrowUpRight size={19} strokeWidth={1.8} className="rotate-[225deg]" />
                 </button>
                 
                 <div className="flex items-center gap-1.5 select-none">
                   <span className="text-[13px] font-black tracking-[0.18em] text-white leading-none uppercase">
                     Dossiê Técnico
                   </span>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#47C46A] shadow-[0_0_6px_rgba(71,196,106,0.5)] animate-pulse" />
                 </div>

                 <div className="w-[38px] h-[38px]" /> {/* Spacer */}
              </div>
           </div>

           <div className="px-5 pt-4 flex flex-col gap-8 max-w-md mx-auto w-full">
              {clientMemory && (
                <div className="flex flex-col gap-8">
                  {/* UNIFIED IDENTITY PANEL */}
                  <div className="flex flex-col gap-4">
                    <h1 className="text-[24px] font-black text-white uppercase leading-[0.9] tracking-tight">{fullClientData?.name}</h1>
                    <div className="flex items-center gap-2">
                       <div className="bg-accent-primary/10 px-2 py-0.5 rounded-[4px] border border-accent-primary/20">
                          <span className="text-[9px] font-black text-accent-primary uppercase tracking-widest">PERFIL_{clientMemory.tier}</span>
                       </div>
                       <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">REG_ID_{selectedClientId.slice(0, 8)}</span>
                    </div>
                  </div>

                  {/* UNIFIED EXECUTIVE METRICS */}
                  <div className="grid grid-cols-2 gap-2.5">
                     <div className="bg-surface-primary border border-border-primary rounded-[20px] p-5 flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">Aprovação</span>
                        <span className="text-[20px] font-mono font-black text-gradient-premium leading-none my-1">{clientMemory.acceptanceRate}%</span>
                     </div>
                     <div className="bg-surface-primary border border-border-primary rounded-[20px] p-5 flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">Ticket Médio</span>
                        <span className="text-[20px] font-mono font-black text-gradient-premium leading-none my-1">{formatCurrencyBRL(clientMemory.averageTicket)}</span>
                     </div>
                     <div className="bg-surface-primary border border-border-primary rounded-[20px] p-5 flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">LTV Global</span>
                        <span className="text-[20px] font-mono font-black text-success leading-none my-1">{formatCurrencyBRL(clientMemory.totalRevenue)}</span>
                     </div>
                     <div className="bg-surface-primary border border-border-primary rounded-[20px] p-5 flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">Aberto</span>
                        <span className={cn("text-[20px] font-mono font-black leading-none my-1", clientMemory.openReceivables > 0 ? "text-danger" : "text-gradient-premium")}>{formatCurrencyBRL(clientMemory.openReceivables)}</span>
                     </div>
                  </div>

                  {/* UNIFIED ACTIONABLE INTELLIGENCE */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                       <Zap size={14} className="text-accent-primary" />
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sugestões de Ação</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {clientMemory.recommendations.map((rec, i) => (
                          <div 
                            key={i} 
                            className="bg-surface-primary border border-border-primary rounded-[20px] p-4 flex items-center justify-between cursor-pointer interactive-card"
                            onClick={() => { if (rec.type === 'REPEAT_SERVICE') handleRepeatService(); if (rec.type === 'FOLLOW_UP') onNavigate({ tab: 'revenue', id: rec.metadata?.budgetId }); }}
                          >
                             <div className="flex items-center gap-4.5">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", rec.type === 'COLLECT' ? "bg-danger/5 border-danger/10 text-danger" : "bg-accent-primary/5 border-accent-primary/10 text-accent-primary")}>
                                   {rec.type === 'COLLECT' ? <DollarSign size={20} /> : <Zap size={20} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                   <span className="text-[14px] font-bold text-white uppercase tracking-tight leading-tight">{rec.title}</span>
                                   <span className="text-[10.5px] text-text-secondary font-medium">{rec.description}</span>
                                </div>
                             </div>
                             <ChevronRight size={14} className="text-text-muted" />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* UNIFIED ASSET PANEL */}
                  {assets.length > 0 && (
                    <div className="flex flex-col gap-4">
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Malha de Ativos ({assets.length})</span>
                       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                          {assets.map(asset => (
                            <div 
                              key={asset.id} 
                              className="min-w-[180px] snap-start bg-surface-primary border border-border-primary rounded-[20px] p-5 flex flex-col gap-3 cursor-pointer shadow-md interactive-card"
                              onClick={() => setSelectedAssetId(asset.id)}
                            >
                               <span className="text-[8px] font-black text-accent-primary uppercase tracking-[0.2em]">{asset.tag || 'SEM_TAG'}</span>
                               <span className="text-[13px] font-bold text-white uppercase truncate">{asset.name}</span>
                               <div className="flex items-center gap-2 mt-1">
                                  <div className="w-1.5 h-1.5 rounded-full led-green" />
                                  <span className="text-[9px] text-text-muted font-bold uppercase">Operacional</span>
                                </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* UNIFIED TIMELINE PANEL */}
                  <div className="flex flex-col gap-4">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Histórico Técnico</span>
                      <div className="bg-surface-primary border border-border-primary rounded-[20px] overflow-hidden flex flex-col">
                        {clientTimeline.slice(0, 5).map((evt, idx) => (
                          <div 
                            key={evt.id} 
                            className={cn(
                              "p-4 px-6 flex items-center justify-between",
                              idx !== clientTimeline.slice(0, 5).length - 1 && "border-b border-border-secondary"
                            )}
                          >
                             <div className="flex flex-col gap-0.5">
                                <span className="text-[13.5px] font-bold text-white tracking-tight">{evt.title}</span>
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                   {new Date(evt.timestamp).toLocaleDateString('pt-BR')} • {evt.aggregateType === 'budget' ? 'ORÇAMENTO' : 'OS'}
                                </span>
                             </div>
                             {evt.metadata?.total && (
                               <span className="text-[11.5px] font-mono text-text-muted font-bold">{formatCurrencyBRL(evt.metadata.total)}</span>
                             )}
                          </div>
                        ))}
                      </div>
                  </div>
                </div>
              )}
           </div>

           {/* FOOTER ACTION BAR */}
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-[1100] flex gap-3 px-1">
              <button 
                onClick={() => openWhatsApp(fullClientData?.phone || '')} 
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-success/10 text-success font-bold text-[11px] uppercase tracking-[0.2em] border border-success/20 active:scale-95 transition-all backdrop-blur-md"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button 
                onClick={handleRepeatService} 
                className="flex-[1.5] h-12 bg-accent-primary text-black font-black text-[11px] tracking-[0.2em] rounded-xl active:scale-[0.975] hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 uppercase"
              >
                Repetir Serviço <Zap size={16} />
              </button>
           </div>
        </div>
      )}

      <ClientZeroBottomSheet isOpen={isClientZeroOpen} onClose={() => setIsClientZeroOpen(false)} onClientSelected={handleCreateClientZero} />
    </div>
  );
}
