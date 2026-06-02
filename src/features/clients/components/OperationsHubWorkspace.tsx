// src/features/clients/components/OperationsHubWorkspace.tsx
import { useEffect, useMemo, useState, memo } from 'react';
import { cn } from '../../../utils/ui';
import { 
  MapPin, 
  ShieldCheck, 
  Zap,
  Activity,
  CheckCircle2,
  CalendarDays,
  Clock,
  Navigation,
  Wrench,
  Terminal,
  MessageCircle,
  Check,
  XCircle,
  Play,
  Phone
} from "lucide-react";
import type { Client, Service as WorkOrder } from '../../../core/types/business';
import { clientService } from '../../../services/clientService';
import { workOrderService } from '../../../services/workOrderService';
import { siteService } from '../../../services/siteService';
import { assetService } from "../../../services/assetService";
import { db } from '../../../storage/dexieDatabase';
import { Attendance } from '../../../domain/attendance';
import { trustLayer } from "../../../core/trust/TrustLayer";
import { 
  SurfaceCard,
  SectionLabel,
  InteractiveRow,
  ScreenContainer,
  StatusPill,
  AppHeader,
  OpsChip,
  Stack,
  Section,
  Subtitle,
  Body,
  Value,
  FinancialValue,
  ERPLoader
} from '../../../ui/system';
import { 
  SearchInput,
  Modal,
  MonetaryInput,
  ContextBanner,
  TextArea
} from '../../../app/components/ui';

import { openExternalGPS, openWhatsApp } from '../../../utils/mobility';
import { operationalFacade } from '../../workflow/operationalFacade';
import { Site } from '../../../domain/site';
import { Asset } from '../../../domain/asset';
import { AssetCaptureModal } from '../../execution/components/AssetCaptureModal';
import { HeroCard } from '../../../components/HeroCard';

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
  clientId: string;
  siteId: string;
  originalBudget: number;
  executedValue: string;
  receivedValue: string;
  notes: string;
  hasPaid?: boolean;
  paymentMethod?: string;
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
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [clientSites, setClientSites] = useState<Site[]>([]);
  const [clientAssets, setClientAssets] = useState<Asset[]>([]);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft | null>(null);
  const [assetCaptureContext, setAssetCaptureContext] = useState<{ clientId: string, siteId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FASE 4D: Tactical Action Handling
  useEffect(() => {
    if (initialAction === 'new-os') {
      if (onActionConsummated) onActionConsummated();
    }
  }, [initialAction, onActionConsummated]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [clientData, osData, sitesData, assetsData, attendancesData] = await Promise.all([
        clientService.getAll(),
        workOrderService.getAll(),
        siteService.getAll(),
        assetService.getAll(),
        db.attendances.toArray()
      ]);
      setClients(clientData);
      setWorkOrders(osData);
      setClientSites(sitesData);
      setClientAssets(assetsData);
      setAttendances(attendancesData);
      onContextChange(clientData, osData, null);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const activeOS = useMemo(() => {
    return workOrders.filter(wo => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att ? att.status === 'em_execucao' : wo.status === 'in-progress';
    });
  }, [workOrders, attendances]);

  const scheduledOS = useMemo(() => {
    return workOrders.filter(wo => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att ? att.status === 'autorizado' : wo.status === 'scheduled';
    });
  }, [workOrders, attendances]);

  const draftOS = useMemo(() => {
    return workOrders.filter(wo => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att ? att.status === 'iniciado' : wo.status === 'draft';
    });
  }, [workOrders, attendances]);

  const doneOS = useMemo(() => {
    return workOrders.filter(wo => {
      const att = attendances.find(a => a.id === wo.attendanceId);
      return att ? (att.status === 'finalizado' || att.status === 'concluido') : wo.status === 'done';
    }).slice(0, 5);
  }, [workOrders, attendances]);

  const parseAmount = (val: string) => Number(val) || 0;

  async function handleConfirmCheckout() {
    if (!checkoutDraft) return;
    try {
      await operationalFacade.completeWorkOrder(checkoutDraft.workOrderId, parseAmount(checkoutDraft.executedValue), parseAmount(checkoutDraft.receivedValue), checkoutDraft.notes);
      
      const clientId = checkoutDraft.clientId;
      const siteId = checkoutDraft.siteId;
      setCheckoutDraft(null);
      await loadData();
      
      setAssetCaptureContext({ clientId, siteId });

      trustLayer.emit({
        type: 'success',
        title: 'OS Encerrada',
        description: `Ordem de Serviço finalizada com sucesso.`,
        status: 'synced'
      });
    } catch (e) { console.error(e); }
  }

  async function handleConfirmCheckoutWithPayment(method: string) {
    if (!checkoutDraft) return;
    try {
      let finalNotes = checkoutDraft.notes || '';
      
      if (method === 'PENDENTE') {
         checkoutDraft.receivedValue = '0';
      } else {
         checkoutDraft.receivedValue = checkoutDraft.executedValue;
         finalNotes = `[Pagamento via ${method}] ${finalNotes}`.trim();
      }

      await operationalFacade.completeWorkOrder(checkoutDraft.workOrderId, parseAmount(checkoutDraft.executedValue), parseAmount(checkoutDraft.receivedValue), finalNotes);
      
      const clientId = checkoutDraft.clientId;
      const siteId = checkoutDraft.siteId;
      setCheckoutDraft(null);
      await loadData();
      
      setAssetCaptureContext({ clientId, siteId });

      trustLayer.emit({
        type: 'success',
        title: 'OS Encerrada',
        description: method === 'PENDENTE' ? 'Cobrança pendente gerada.' : `Pagamento via ${method} registrado.`,
        status: 'synced'
      });
    } catch (e) { console.error(e); }
  }

  async function handleStartService(os: WorkOrder) {
    if (confirm(`Iniciar a execução do serviço "${os.title}"?`)) {
      try {
        const updated = { ...os, status: 'in-progress' as const, updatedAt: new Date().toISOString() };
        await operationalFacade.updateWorkOrder(updated);
        await loadData();
        trustLayer.emit({
          type: 'success',
          title: 'Serviço Iniciado',
          description: `Ordem de Serviço "${os.title}" está em execução.`,
          status: 'synced'
        });
      } catch (err) {
        console.error(err);
        alert('Erro ao iniciar serviço: ' + (err as Error).message);
      }
    }
  }

  async function handleFastCheckout(os: WorkOrder) {
    if (confirm(`Encerrar a OS "${os.title}" e faturar integralmente o valor orçado (R$ ${(os.executedValue || 0).toLocaleString('pt-BR')})?`)) {
      try {
        await operationalFacade.completeWorkOrder(os.id, os.executedValue || 0, os.executedValue || 0, 'Fast Checkout (Pagamento Integral na Hora)');
        await loadData();
        setAssetCaptureContext({ clientId: os.clientId, siteId: os.siteId });
        trustLayer.emit({
          type: 'success',
          title: 'Fast Checkout Concluído',
          description: `R$ ${(os.executedValue || 0).toLocaleString('pt-BR')} faturado e OS encerrada.`,
          status: 'synced'
        });
      } catch (e) { console.error(e); }
    }
  }

  const handleSaveAsset = async (assetData: any) => {
    try {
      await assetService.add({
        ...assetData,
        name: assetData.name.trim(),
        category: assetData.category.trim()
      });
      setAssetCaptureContext(null);
      await loadData();
      trustLayer.emit({
        type: 'success',
        title: 'Ativo Criado',
        description: `${assetData.name.trim()} registrado no cliente.`,
        status: 'synced'
      });
    } catch(e) {
      console.error(e);
      alert('Erro ao salvar equipamento: ' + (e as Error).message);
    }
  };


  
  function getClientName(clientId: string) {
    return clients.find(c => c.id === clientId)?.name || 'Cliente Desconhecido';
  }
  const renderOSCard = (os: WorkOrder, isDone: boolean = false) => {
    const site = clientSites.find(s => s.id === os.siteId);
    const client = clients.find(c => c.id === os.clientId);
    const clientName = getClientName(os.clientId);
    const att = attendances.find(a => a.id === os.attendanceId);
    const attStatus = att ? att.status : os.status;
    const isExecuting = attStatus === 'em_execucao';

    return (
      <div key={os.id} className="relative group">
        <InteractiveRow 
          onClick={() => !isDone && setCheckoutDraft({
            workOrderId: os.id,
            title: os.title,
            clientId: os.clientId,
            siteId: os.siteId,
            originalBudget: os.executedValue || 0,
            executedValue: String(os.executedValue || 0),
            receivedValue: '0',
            notes: ''
          })}
          className={cn(isDone && "opacity-50")}
          leftSlot={
            <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center shrink-0">
              {isDone ? (
                <CheckCircle2 size={16} className="text-[var(--accent-green)]" />
              ) : isExecuting ? (
                <Zap size={16} className="text-[var(--accent-gold)] animate-pulse" />
              ) : (
                <CalendarDays size={16} className="text-white/50" />
              )}
            </div>
          }
        >
          <div className="flex items-center gap-4 w-full pr-[182px]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Body className="truncate leading-tight uppercase font-black tracking-tight text-white">
                  {clientName}
                </Body>
                {isExecuting && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0 animate-pulse" />
                )}
              </div>
              <Subtitle className="text-[11px] truncate text-[var(--text-secondary)] font-medium">
                 {os.title} {site ? `· ${site.name}` : ''}
                 {att && att.totalWorkOrders && att.totalWorkOrders > 0 ? (
                   ` · Progresso: ${att.completedWorkOrders || 0}/${att.totalWorkOrders} OS (${att.progress || 0}%)`
                 ) : ''}
                 {att && att.revenuePlanned ? (
                   ` · Receita: R$ ${(att.revenueExecuted || 0).toLocaleString('pt-BR', {maximumFractionDigits: 0})} de R$ ${(att.revenuePlanned || 0).toLocaleString('pt-BR', {maximumFractionDigits: 0})}`
                 ) : ''}
              </Subtitle>
            </div>
            <Stack className="items-end gap-1 shrink-0">
               <FinancialValue value={os.executedValue || 0} compact className="text-[13px] font-mono text-[var(--accent-gold)] font-bold" />
               <StatusPill status={attStatus} className="scale-90 origin-right" />
            </Stack>
          </div>
        </InteractiveRow>
        
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2 gap-1 bg-gradient-to-l from-[#0D0D0D] via-[#0D0D0D] to-transparent pl-8 pointer-events-auto">
          {!isExecuting && !isDone && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStartService(os); }}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] active:bg-[var(--accent-gold)]/20 transition-colors"
              title="Iniciar Serviço"
            >
              <Play fill="var(--accent-gold)" strokeWidth={0} size={14} />
            </button>
          )}
          {isExecuting && !isDone && (
            <button
              onClick={(e) => { e.stopPropagation(); handleFastCheckout(os); }}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 text-[var(--accent-green)] active:bg-[var(--accent-green)]/20 transition-colors"
              title="Finalizar Serviço"
            >
              <Check strokeWidth={3} size={16} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); openExternalGPS(site?.fullAddress || ''); }}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-[var(--accent-gold)] active:bg-white/10"
            title="GPS Navegação"
          >
            <Navigation size={16} />
          </button>
          {client?.phone && (
            <button
              onClick={(e) => { e.stopPropagation(); window.open(`tel:${client.phone}`); }}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-[var(--accent-gold)] active:bg-white/10"
              title="Ligar para Cliente"
            >
              <Phone size={15} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); openWhatsApp(client?.phone || '', `Olá! Referente a OS: ${os.title}.`); }}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-[var(--accent-gold)] active:bg-white/10"
            title="Enviar WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
    );
  };
  const chips = (
    <>
      <OpsChip icon={<Zap size={11} />} label={`${activeOS.length} ao vivo`} accent={activeOS.length > 0 ? "orange" : false} />
      <OpsChip icon={<CalendarDays size={11} />} label={`${scheduledOS.length} agendados`} accent={false} />
    </>
  );

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Sincronizando campo..." /></ScreenContainer>;

  return (
    <ScreenContainer className="pb-32">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[124px] scrollbar-none">
        
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Execução."
          chips={chips}
        />

        <div className="px-4 py-3 flex flex-col gap-3.5">
          
          {/* 1. EXECUTION HUB HERO */}
          <Section className="gap-2">
            <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/15 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_0_16px_rgba(212,169,78,0.02)] px-4 py-3 animate-scale-pop">
              {/* Gold ambient radial glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--accent-gold)]/5 blur-[45px] pointer-events-none" />
              
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
                  <span className="text-[7.5px] font-bold font-mono tracking-[0.2em] text-[var(--accent-gold)] uppercase opacity-80">PAINEL DE OPERAÇÕES</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[var(--accent-gold)] animate-ping" />
                    <span className="text-[7px] font-bold font-mono text-[var(--accent-gold)] uppercase tracking-wider">Aferix Live</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-bold font-mono text-white/40 uppercase tracking-wider">Ao Vivo</span>
                    <span className={cn("text-sm font-black font-mono leading-none mt-1", activeOS.length > 0 ? "text-[var(--accent-gold)]" : "text-white/60")}>
                      {activeOS.length}
                    </span>
                  </div>
                  <div className="w-px h-5 bg-white/10 self-center justify-self-center" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-bold font-mono text-white/40 uppercase tracking-wider">Agenda</span>
                    <span className="text-sm font-black font-mono leading-none mt-1 text-white/80">
                      {scheduledOS.length}
                    </span>
                  </div>
                  <div className="w-px h-5 bg-white/10 self-center justify-self-center" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-bold font-mono text-white/40 uppercase tracking-wider">Pausadas</span>
                    <span className="text-sm font-black font-mono leading-none mt-1 text-white/50">
                      {attendances.filter(a => a.status === 'cancelado').length}
                    </span>
                  </div>
                  <div className="w-px h-5 bg-white/10 self-center justify-self-center" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-bold font-mono text-white/40 uppercase tracking-wider">Livres</span>
                    <span className="text-sm font-black font-mono leading-none mt-1 text-emerald-400">
                      {draftOS.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* PRIMARY ACTIONS FOR COMMAND CENTER */}
          <Section className="gap-2">
            <div className="flex gap-2.5">
              <button 
                onClick={() => onNavigate('budgets')} 
                className="flex-1 h-9.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-white font-bold text-[8.5px] tracking-[0.1em] rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 uppercase"
              >
                VER AGENDA <CalendarDays className="h-3 w-3 text-white/50" />
              </button>
              <button 
                onClick={() => onOpenBudgets()} 
                className="flex-1 h-9.5 bg-[var(--accent-gold)] text-black font-black text-[8.5px] tracking-[0.11em] shadow-[0_0_12px_rgba(255,200,0,0.12)] rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 uppercase"
              >
                DESPACHAR OS <Navigation className="h-3 w-3 fill-black" />
              </button>
            </div>
          </Section>

          {/* 2. WORKFLOW QUEUE */}
          <Section className="gap-2">
             <SurfaceCard padding="none" className="border border-white/[0.04] overflow-hidden mt-1">
                <div className="flex items-center justify-between px-4 pt-[12px] pb-[8px]">
                   <SectionLabel className="font-mono tracking-wider !text-[8.5px] uppercase opacity-60">Fluxo de Trabalho</SectionLabel>
                   <Terminal size={10} className="text-[#3A3A3A]" />
                </div>
                
                {activeOS.length > 0 && (
                   <Stack className="gap-0">
                      <div className="px-4 py-1.5 bg-[var(--accent-gold)]/5 border-t border-white/[0.04]">
                         <span className="text-[7.5px] font-black text-[var(--accent-gold)] font-mono uppercase tracking-wider">ORDENS_EM_ANDAMENTO</span>
                      </div>
                      {activeOS.map((os) => renderOSCard(os))}
                   </Stack>
                )}

                {scheduledOS.length > 0 && (
                   <Stack className="gap-0">
                      <div className="px-4 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
                         <span className="text-[7.5px] font-black text-white/40 font-mono uppercase tracking-wider">Agenda Próxima</span>
                      </div>
                      {scheduledOS.map((os) => renderOSCard(os))}
                   </Stack>
                )}

                {draftOS.length > 0 && (
                   <Stack className="gap-0">
                      <div className="px-4 py-1.5 border-t border-white/[0.04]">
                         <span className="text-[7.5px] font-black text-white/30 font-mono uppercase tracking-wider">Fila de Atendimento</span>
                      </div>
                      {draftOS.map((os) => renderOSCard(os))}
                   </Stack>
                )}

                {activeOS.length === 0 && scheduledOS.length === 0 && draftOS.length === 0 && (
                  <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-2 bg-white/[0.005] border-t border-white/[0.04]">
                    <Wrench size={20} className="text-white/10 mb-0.5" />
                    <span className="text-white/80 font-black text-[10px] tracking-wider uppercase leading-none font-mono">Nenhuma missão ativa</span>
                    <span className="text-white/30 text-[8px] tracking-wide leading-none font-mono uppercase">Pronto para receber atendimento</span>
                  </div>
                )}
                <div className="h-0.5" />
             </SurfaceCard>
          </Section>

          {/* 3. OPERATIONAL HISTORY */}
          <Section className="gap-2.5">
             <div className="flex items-center justify-between px-1 mt-1">
                <SectionLabel className="font-mono tracking-wider !text-[8.5px] uppercase opacity-60">Histórico de Fechamentos</SectionLabel>
                <Clock size={10} className="text-[#3A3A3A]" />
             </div>
             <SurfaceCard padding="none" className="border border-white/[0.04] overflow-hidden">
                {doneOS.length > 0 ? (
                  doneOS.map((os) => renderOSCard(os, true))
                ) : (
                  <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-1.5 bg-white/[0.005]">
                    <CheckCircle2 size={15} className="text-white/10" />
                    <span className="text-white/30 text-[8.5px] font-mono tracking-wider uppercase">Nenhum encerramento recente registrado</span>
                  </div>
                )}
             </SurfaceCard>
          </Section>

        </div>
      </div>

      <Modal 
        isOpen={!!checkoutDraft} 
        onClose={() => setCheckoutDraft(null)} 
        title="Checkout de Execução" 
        confirmLabel={checkoutDraft?.hasPaid === false ? "Gerar Pendência" : "Encerrar OS"} 
        onConfirm={checkoutDraft?.hasPaid ? undefined : handleConfirmCheckout}
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
               
               <div className="flex flex-col gap-3">
                  <SectionLabel className="ml-1">Recebido no local?</SectionLabel>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => setCheckoutDraft({...checkoutDraft, receivedValue: checkoutDraft.executedValue, hasPaid: true})}
                       className={cn("flex-1 py-3 rounded-[16px] border text-sm font-bold transition-all flex items-center justify-center gap-2", checkoutDraft.hasPaid === true ? "bg-[var(--accent-green)]/20 border-[var(--accent-green)] text-[var(--accent-green)]" : "bg-white/5 border-white/10 text-white/50")}
                     ><CheckCircle2 size={16} /> SIM</button>
                     <button 
                       onClick={() => setCheckoutDraft({...checkoutDraft, receivedValue: '0', hasPaid: false})}
                       className={cn("flex-1 py-3 rounded-[16px] border text-sm font-bold transition-all flex items-center justify-center gap-2", checkoutDraft.hasPaid === false ? "bg-[var(--accent-red)]/20 border-[var(--accent-red)] text-[var(--accent-red)]" : "bg-white/5 border-white/10 text-white/50")}
                     ><XCircle size={16} /> NÃO</button>
                  </div>
               </div>

               {checkoutDraft.hasPaid && (
                 <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <SectionLabel className="ml-1">Forma de Pagamento (1-Toque)</SectionLabel>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleConfirmCheckoutWithPayment('PIX')}
                        className="py-4 rounded-[16px] bg-[var(--accent-gold)] text-black text-[11px] font-black tracking-wider transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(255,200,0,0.2)]"
                      >PIX</button>
                      <button 
                        onClick={() => handleConfirmCheckoutWithPayment('DINHEIRO')}
                        className="py-4 rounded-[16px] bg-[var(--accent-gold)] text-black text-[11px] font-black tracking-wider transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(255,200,0,0.2)]"
                      >DINHEIRO</button>
                      <button 
                        onClick={() => handleConfirmCheckoutWithPayment('CARTÃO')}
                        className="py-4 rounded-[16px] bg-[var(--accent-gold)] text-black text-[11px] font-black tracking-wider transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(255,200,0,0.2)]"
                      >CARTÃO</button>
                    </div>
                 </div>
               )}
               
               {checkoutDraft.hasPaid === false && (
                 <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                   <div className="p-4 bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-[16px]">
                     <p className="text-[13px] leading-relaxed text-[var(--accent-red)] font-medium">Será gerado um título pendente de cobrança no valor de R$ {parseAmount(checkoutDraft.executedValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}.</p>
                   </div>
                 </div>
               )}

               <TextArea label="Relatório de Campo (Opcional)" value={checkoutDraft.notes} onChange={(v) => setCheckoutDraft({ ...checkoutDraft, notes: v })} placeholder="Relate algo específico da execução..." rows={2} />
            </div>
          </div>
        )}
      </Modal>

      {assetCaptureContext && (
        <AssetCaptureModal 
          clientId={assetCaptureContext.clientId}
          siteId={assetCaptureContext.siteId}
          onClose={() => setAssetCaptureContext(null)}
          onSave={handleSaveAsset}
        />
      )}

    </ScreenContainer>
  );
}
