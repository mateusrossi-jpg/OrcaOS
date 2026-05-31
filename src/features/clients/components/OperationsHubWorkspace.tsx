import { useEffect, useMemo, useState, memo } from 'react';
import { cn } from '../../../utils/ui';
import { 
  MapPin, 
  Plus, 
  ShieldCheck, 
  Zap,
  Activity,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileText,
  TrendingUp,
  User,
  Package,
  Navigation,
  ExternalLink,
  Wrench,
  AlertTriangle,
  Terminal,
  ChevronRight,
  Target
} from "lucide-react";
import type { Client, Service as WorkOrder } from '../../../core/types/business';
import { clientService } from '../../../services/clientService';
import { workOrderService } from '../../../services/workOrderService';
import { siteService } from '../../../services/siteService';
import { assetService } from '../../../services/assetService';
import { 
  SemanticBadge,
  SurfaceCard,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  ScreenContainer,
  StatusPill,
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
import { 
  QueueEmptyState, 
  SearchInput,
  Modal,
  MonetaryInput,
  ContextBanner,
  MoneyValue,
  TextArea,
  Select,
  Input,
  PrimaryButton,
  DangerButton
} from '../../../app/components/ui';

import { operationalFacade } from '../../workflow/operationalFacade';
import { Site } from '../../../domain/site';
import { Asset } from '../../../domain/asset';

interface OperationsHubWorkspaceProps {
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
  onNavigate: (tab: any) => void;
  initialAction?: string | null;
  onActionConsummated?: () => void;
}

interface CheckoutDraft {
  workOrderId: string;
  title: string;
  originalBudget: number;
  executedValue: string;
  receivedValue: string;
  notes: string;
}

/**
 * OperationsHubWorkspace: The Field Command Center.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export function OperationsHubWorkspace({ 
  onContextChange,
  onOpenBudgets,
  onNavigate,
  initialAction,
  onActionConsummated
}: OperationsHubWorkspaceProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isCreatingAvulsa, setIsCreatingAvulsa] = useState(false);
  const [avulsaDraft, setAvulsaDraft] = useState({ title: '', clientId: '', siteId: '', assetIds: [] as string[] });
  const [clientSites, setClientSites] = useState<Site[]>([]);
  const [clientAssets, setClientAssets] = useState<Asset[]>([]);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FASE 4D: Tactical Action Handling
  useEffect(() => {
    if (initialAction === 'new-os') {
      setIsCreatingAvulsa(true);
      if (onActionConsummated) onActionConsummated();
    }
  }, [initialAction, onActionConsummated]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [clientData, osData, sitesData, assetsData] = await Promise.all([
        clientService.getAll(),
        workOrderService.getAll(),
        siteService.getAll(),
        assetService.getAll()
      ]);
      setClients(clientData);
      setWorkOrders(osData);
      setClientSites(sitesData);
      setClientAssets(assetsData);
      onContextChange(clientData, osData, null);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const availableSitesForSelectedClient = useMemo(() => {
    if (!avulsaDraft.clientId) return [];
    return clientSites.filter(s => s.clientId === avulsaDraft.clientId);
  }, [clientSites, avulsaDraft.clientId]);

  const activeOS = useMemo(() => workOrders.filter(wo => wo.status === 'in-progress'), [workOrders]);
  const scheduledOS = useMemo(() => workOrders.filter(wo => wo.status === 'scheduled'), [workOrders]);
  const draftOS = useMemo(() => workOrders.filter(wo => wo.status === 'draft'), [workOrders]);
  const doneOS = useMemo(() => workOrders.filter(wo => wo.status === 'done').slice(0, 5), [workOrders]);

  const parseAmount = (val: string) => Number(val) || 0;

  async function handleConfirmCheckout() {
    if (!checkoutDraft) return;
    try {
      await operationalFacade.completeWorkOrder(checkoutDraft.workOrderId, parseAmount(checkoutDraft.executedValue), parseAmount(checkoutDraft.receivedValue), checkoutDraft.notes);
      setCheckoutDraft(null);
      await loadData();
    } catch (e) { console.error(e); }
  }

  async function handleCreateAvulsa() {
    if (!avulsaDraft.title || !avulsaDraft.clientId) return;
    try {
      const newOsId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `os-${Date.now()}`;
      await operationalFacade.createWorkOrder({
        id: newOsId, clientId: avulsaDraft.clientId, siteId: avulsaDraft.siteId || undefined, assetIds: avulsaDraft.assetIds.length > 0 ? avulsaDraft.assetIds : undefined,
        title: avulsaDraft.title, status: 'draft', paymentStatus: 'pending', executedValue: 0, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
      setIsCreatingAvulsa(false);
      setAvulsaDraft({ title: '', clientId: '', siteId: '', assetIds: [] });
      await loadData();
    } catch (e) { console.error(e); }
  }
  
  function getClientName(clientId: string) {
    return clients.find(c => c.id === clientId)?.name || 'Cliente Desconhecido';
  }

  const renderOSCard = (os: WorkOrder, isDone: boolean = false) => {
    const site = clientSites.find(s => s.id === os.siteId);
    return (
      <InteractiveRow 
        key={os.id} 
        onClick={() => !isDone && setCheckoutDraft({
          workOrderId: os.id,
          title: os.title,
          originalBudget: os.executedValue || 0,
          executedValue: String(os.executedValue || 0),
          receivedValue: '0',
          notes: ''
        })}
        className={cn(isDone && "opacity-50")}
        leftSlot={
          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center">
            <span className="text-lg leading-none">
              {isDone ? "✅" : os.status === 'in-progress' ? "⚡" : "📅"}
            </span>
          </div>
        }
      >
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Body className="truncate leading-tight uppercase font-bold">
                {os.title}
              </Body>
              {os.status === 'in-progress' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0 animate-pulse" />
              )}
            </div>
            <Subtitle className="text-[11px] truncate opacity-60 uppercase font-mono tracking-wider">
               {getClientName(os.clientId)} · {site ? site.name : 'LOCAL_NÃO_MAPEADO'}
            </Subtitle>
          </div>
          <Stack className="items-end gap-1 shrink-0">
             <FinancialValue value={os.executedValue || 0} compact className="text-[13px] text-white" />
             <StatusPill status={os.status} className="scale-75 origin-right" />
          </Stack>
        </div>
      </InteractiveRow>
    );
  };

  const chips = (
    <>
      <OpsChip icon={<Zap size={11} />} label={`${activeOS.length} ao vivo`} accent={activeOS.length > 0 ? "orange" : false} />
      <OpsChip icon={<CalendarDays size={11} />} label={`${scheduledOS.length} agendados`} accent={false} />
      <OpsChip icon={<Clock size={11} />} label={`${draftOS.length} rascunhos`} accent={false} />
    </>
  );

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Sincronizando campo..." /></ScreenContainer>;

  return (
    <ScreenContainer className="pb-32">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[124px] scrollbar-none">
        
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Operações."
          action={
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCreatingAvulsa(true)}
                className="flex h-[42px] items-center gap-2 px-3 rounded-[14px] bg-[var(--accent-gold)] text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-[var(--shadow-primary)]"
                title="Nova OS Avulsa"
              >
                <Zap size={18} strokeWidth={2.5} />
                <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">OS Avulsa</span>
              </button>
              <button 
                onClick={() => onNavigate('new-budget')}
                className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-white/[0.04] border border-white/[0.08] text-[var(--accent-gold)] hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
                title="Novo Orçamento"
              >
                <Target size={18} strokeWidth={2.5} />
              </button>
            </div>
          }
          chips={chips}
        />

        <div className="px-4 flex flex-col gap-8">
          
          {/* 1. EXECUTION HUB HERO */}
          <Section className="gap-3">
            <SectionLabel className="ml-2">Cockpit de Execução</SectionLabel>
            <SurfaceCard variant="cinematic" padding="lg">
               <div className="flex items-center justify-between mb-8">
                  <SectionLabel className="text-[var(--accent-gold)]">Atividade Técnica</SectionLabel>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                     <Activity size={11} className="text-[var(--accent-green)] animate-pulse" />
                     <Value className="text-[10px]">Status: Operacional</Value>
                  </div>
               </div>
               
               <Heading className="text-[32px] mb-3">
                  {activeOS.length} Serviços
               </Heading>
               <Body className="text-[var(--accent-gold)] font-bold tracking-tight">
                  Atendimentos em Curso Agora
               </Body>

               <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-2.5 mt-6">
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[8.5px]">Agendados para Hoje</SectionLabel>
                     <Value className="text-sm">{scheduledOS.length}</Value>
                  </div>
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[8.5px]">Pausados / Bloqueados</SectionLabel>
                     <Value className="text-sm text-[var(--accent-red)]">0</Value>
                  </div>
               </div>
            </SurfaceCard>
          </Section>

          {/* 2. COMMAND STREAM */}
          <Section className="gap-3">
             <SurfaceCard padding="none">
                <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px]">
                   <SectionLabel>Fluxo de Trabalho</SectionLabel>
                   <Terminal size={12} className="text-[#3A3A3A]" />
                </div>
                
                {activeOS.length > 0 && (
                   <Stack className="gap-0">
                      <div className="px-5 py-2 bg-[var(--accent-gold)]/5 border-t border-white/[0.07]">
                         <span className="text-[9px] font-black text-[var(--accent-gold)] font-mono uppercase tracking-wider">ORDENS_EM_ANDAMENTO</span>
                      </div>
                      {activeOS.map((os) => renderOSCard(os))}
                   </Stack>
                )}

                {scheduledOS.length > 0 && (
                   <Stack className="gap-0">
                      <div className="px-5 py-2 border-t border-white/[0.07]">
                         <SectionLabel className="!text-[8px]">Agenda Próxima</SectionLabel>
                      </div>
                      {scheduledOS.map((os) => renderOSCard(os))}
                   </Stack>
                )}

                {draftOS.length > 0 && (
                   <Stack className="gap-0">
                      <div className="px-5 py-2 border-t border-white/[0.07]">
                         <SectionLabel className="!text-[8px]">Fila de Preparação</SectionLabel>
                      </div>
                      {draftOS.map((os) => renderOSCard(os))}
                   </Stack>
                )}

                {workOrders.length === 0 && (
                  <div className="py-20 text-center opacity-30">
                    <Body className="font-mono text-[10px] font-black tracking-widest uppercase">FILA_DE_EXECUÇÃO_VAZIA</Body>
                  </div>
                )}
                <div className="h-1" />
             </SurfaceCard>
          </Section>

          {doneOS.length > 0 && (
            <Section className="gap-3 opacity-50">
               <SectionLabel className="ml-1">Histórico Recente</SectionLabel>
               <SurfaceCard padding="none">
                  {doneOS.map((os) => renderOSCard(os, true))}
               </SurfaceCard>
            </Section>
          )}

        </div>
      </div>

      <Modal 
        isOpen={!!checkoutDraft} 
        onClose={() => setCheckoutDraft(null)} 
        title="Checkout de Execução" 
        confirmLabel="Encerrar & Faturar" 
        onConfirm={handleConfirmCheckout}
      >
        {checkoutDraft && (
          <div className="flex flex-col gap-8 py-2">
            <ContextBanner 
              title="Validação de Receita" 
              meta={`Orçado: R$ ${checkoutDraft.originalBudget.toLocaleString()}. Verifique os valores finais para o faturamento.`} 
              icon={<ShieldCheck size={16} />} 
            />
            <div className="flex flex-col gap-6">
               <MonetaryInput label="Valor Real Executado" value={parseAmount(checkoutDraft.executedValue)} onChange={(val) => setCheckoutDraft({ ...checkoutDraft, executedValue: String(val) })} />
               <MonetaryInput label="Valor Recebido (Checkout)" value={parseAmount(checkoutDraft.receivedValue)} onChange={(val) => setCheckoutDraft({ ...checkoutDraft, receivedValue: String(val) })} />
               <TextArea label="Relatório de Campo" value={checkoutDraft.notes} onChange={(v) => setCheckoutDraft({ ...checkoutDraft, notes: v })} placeholder="Relate o que foi executado..." rows={3} />
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isCreatingAvulsa} 
        onClose={() => setIsCreatingAvulsa(false)} 
        title="Abertura de OS Avulsa" 
        confirmLabel="Criar na Fila" 
        onConfirm={handleCreateAvulsa}
      >
        <div className="flex flex-col gap-8 py-2">
          <ContextBanner 
            title="Vínculo Obrigatório" 
            meta="Toda Ordem de Serviço deve estar atrelada a um cliente para fins de BI e faturamento." 
            icon={<User size={16} />} 
          />
          <div className="flex flex-col gap-6">
            <Select label="Selecionar Contratante" value={avulsaDraft.clientId} onChange={(val) => setAvulsaDraft({ ...avulsaDraft, clientId: val, siteId: '', assetIds: [] })}>
              <option value="">Selecione um cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            {avulsaDraft.clientId && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <Select label="Local / Unidade" value={avulsaDraft.siteId} onChange={(val) => setAvulsaDraft({ ...avulsaDraft, siteId: val })}>
                  <option value="">Endereço principal...</option>
                  {availableSitesForSelectedClient.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
            )}
            <Input label="Título do Chamado" value={avulsaDraft.title} onChange={(e) => setAvulsaDraft({ ...avulsaDraft, title: e.target.value })} placeholder="Ex: Manutenção Preventiva..." />
          </div>
        </div>
      </Modal>

    </ScreenContainer>
  );
}
