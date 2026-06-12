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
  Phone,
  Camera,
  CheckSquare,
  FileBadge,
  ArrowRight,
  ClipboardCheck,
  DollarSign,
  History
} from "lucide-react";
import type { Client, Service as WorkOrder } from '../../../core/types/business';
import { clientService } from '../../../services/clientService';
import { workOrderService } from '../../../services/workOrderService';
import { siteService } from '../../../services/siteService';
import { assetService } from "../../../services/assetService";
import { db } from '../../../storage/dexieDatabase';
import { Attendance } from '../../../domain/attendance';
import { workOrderQueryService } from '../../../services/WorkOrderQueryService';
import { trustLayer } from "../../../core/trust/TrustLayer";
import { 
  SurfaceCard,
  SectionLabel,
  InteractiveRow,
  ScreenContainer,
  StatusPill,
  OpsChip,
  Stack,
  Section,
  Subtitle,
  Body,
  Value,
  FinancialValue,
  ERPLoader,
  GlassTextarea,
  GlassInput,
  GlassCurrencyInput,
  HeroCard,
  ExecutiveSummaryGrid,
  ValueBlock,
  Eyebrow
} from '../../../ui/system';
import { 
  Modal,
  ContextBanner,
  PrimaryButton,
  SecondaryButton
} from '../../../app/components/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

import { openExternalGPS, openWhatsApp } from '../../../utils/mobility';
import { operationalFacade } from '../../workflow/operationalFacade';
import { Site } from '../../../domain/site';
import { Asset } from '../../../domain/asset';
import { AssetCaptureModal } from '../../execution/components/AssetCaptureModal';
import { ExecutionCockpit } from '../../execution/components/ExecutionCockpit';

interface OperationsHubWorkspaceProps {
  activeWorkOrderId: string | null;
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
 * OperationsHubWorkspace: The Tactical Field Command Center.
 * Aligned with AFERIX V32: Sequential Workflow Polish.
 * Optimized for High-Performance field execution.
 */
export function OperationsHubWorkspace({ 
  activeWorkOrderId,
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
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [activeChecklistClientName, setActiveChecklistClientName] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, confirmLabel: string, onConfirm: () => void } | null>(null);

  const [activeOS, setActiveOS] = useState<WorkOrder[]>([]);
  const [scheduledOS, setScheduledOS] = useState<WorkOrder[]>([]);
  const [draftOS, setDraftOS] = useState<WorkOrder[]>([]);
  const [doneOS, setDoneOS] = useState<WorkOrder[]>([]);

  useEffect(() => {
    if (activeWorkOrderId) {
      setActiveChecklistId(activeWorkOrderId);
      const os = workOrders.find(o => o.id === activeWorkOrderId);
      if (os) setActiveChecklistClientName(clients.find(c => c.id === os.clientId)?.name || 'Cliente');
    }
  }, [activeWorkOrderId, workOrders, clients]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [clientData, osData, sitesData, assetsData, attendancesData, agenda] = await Promise.all([
        clientService.getAll(),
        workOrderQueryService.getAllValid(),
        siteService.getAll(),
        assetService.getAll(),
        db.attendances.toArray(),
        workOrderQueryService.getAgendaItems()
      ]);
      setClients(clientData);
      setWorkOrders(osData);
      setClientSites(sitesData);
      setClientAssets(assetsData);
      setAttendances(attendancesData);
      setActiveOS(agenda.inProgress);
      setScheduledOS(agenda.scheduled);
      setDraftOS(agenda.awaiting);
      setDoneOS(agenda.done);
      onContextChange(clientData, osData, activeWorkOrderId);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const parseAmount = (val: string) => Number(val) || 0;

  async function handleConfirmCheckout() {
    if (!checkoutDraft) return;
    try {
      await operationalFacade.completeWorkOrder(checkoutDraft.workOrderId, parseAmount(checkoutDraft.executedValue), parseAmount(checkoutDraft.receivedValue), checkoutDraft.notes);
      const { clientId, siteId } = checkoutDraft;
      setCheckoutDraft(null);
      await loadData();
      setAssetCaptureContext({ clientId, siteId });
      trustLayer.emit({ type: 'success', title: 'OS Encerrada', description: `Finalizada com sucesso.`, status: 'synced' });
    } catch (e) { console.error(e); }
  }

  async function handleConfirmCheckoutWithPayment(method: string) {
    if (!checkoutDraft) return;
    if (navigator.vibrate) navigator.vibrate(60);
    try {
      let finalNotes = checkoutDraft.notes || '';
      let recVal = checkoutDraft.executedValue;
      if (method === 'PENDENTE') recVal = '0';
      else finalNotes = `[Pagamento via ${method}] ${finalNotes}`.trim();

      await operationalFacade.completeWorkOrder(checkoutDraft.workOrderId, parseAmount(checkoutDraft.executedValue), parseAmount(recVal), finalNotes);
      const { clientId, siteId } = checkoutDraft;
      setCheckoutDraft(null);
      await loadData();
      setAssetCaptureContext({ clientId, siteId });
      trustLayer.emit({ type: 'success', title: 'OS Encerrada', description: method === 'PENDENTE' ? 'Cobrança pendente gerada.' : `Pagamento via ${method} registrado.`, status: 'synced' });
    } catch (e) { console.error(e); }
  }

  async function handleStartService(os: WorkOrder) {
    if (navigator.vibrate) navigator.vibrate(40);
    setConfirmDialog({
      isOpen: true, title: "Iniciar Atendimento", message: `Deseja ativar a execução de "${os.title}" agora?`, confirmLabel: "Iniciar Agora",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await operationalFacade.updateWorkOrder({ ...os, status: 'in-progress' as const, updatedAt: new Date().toISOString() });
          await loadData();
          trustLayer.emit({ type: 'success', title: 'Serviço Iniciado', description: `Em execução: ${os.title}`, status: 'synced' });
        } catch (err) { console.error(err); }
      }
    });
  }

  async function handleFastCheckout(os: WorkOrder) {
    if (navigator.vibrate) navigator.vibrate(80);
    setConfirmDialog({
      isOpen: true, title: "Checkout Direto", message: `Encerrar "${os.title}" e registrar faturamento de ${formatCurrencyBRL(os.executedValue || 0)}?`, confirmLabel: "Encerrar Missão",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await operationalFacade.completeWorkOrder(os.id, os.executedValue || 0, os.executedValue || 0, 'Fast Checkout');
          await loadData();
          setAssetCaptureContext({ clientId: os.clientId || '', siteId: os.siteId || '' });
          trustLayer.emit({ type: 'success', title: 'Finalizado', description: 'OS encerrada com sucesso.', status: 'synced' });
        } catch (e) { console.error(e); }
      }
    });
  }

  const renderOSCard = (os: WorkOrder, isDone: boolean = false) => {
    const clientName = getClientName(os.clientId || '');
    const site = clientSites.find(s => s.id === os.siteId);
    const client = clients.find(c => c.id === os.clientId);
    const isExecuting = os.status === 'in-progress' || os.status === 'en_route';

    return (
      <div key={os.id} className="relative group border-t border-white/[0.04] first:border-t-0 flex flex-col bg-white/[0.005] overflow-hidden">
        <InteractiveRow 
          onClick={() => { if (!isDone) { if (isExecuting) setActiveChecklistId(os.id); else setCheckoutDraft({ workOrderId: os.id, title: os.title, clientId: os.clientId || '', siteId: os.siteId || '', originalBudget: os.executedValue || 0, executedValue: String(os.executedValue || 0), receivedValue: '0', notes: '' }); } }}
          className={cn(isDone && "opacity-50")}
          leftSlot={
            <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center shrink-0">
              {isDone ? <CheckCircle2 size={18} className="text-[#47C46A]" /> : isExecuting ? <Zap size={18} className="text-[var(--accent-gold)] animate-pulse" /> : <CalendarDays size={18} className="text-white/40" />}
            </div>
          }
          rightSlot={
             <Stack className="items-end gap-1.5 shrink-0">
                <FinancialValue value={os.executedValue || 0} compact className="text-[14px] font-mono text-[var(--accent-gold)] font-black" />
                <StatusPill status={os.status} className="scale-75 origin-right" />
             </Stack>
          }
        >
          <div className="flex flex-col min-w-0 pr-2 gap-0.5">
            <Body className="truncate leading-tight uppercase font-black tracking-tight text-white text-[15px]">{clientName}</Body>
            <Subtitle className="text-[10px] truncate text-white/30 font-bold uppercase tracking-widest">{os.title}</Subtitle>
          </div>
        </InteractiveRow>
        
        <div className="flex flex-wrap items-center justify-start gap-3 px-6 pb-7 pt-1">
          {!isExecuting && !isDone && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStartService(os); }} 
              className="h-14 px-8 flex items-center justify-center rounded-2xl bg-[var(--accent-gold)] text-black font-black text-[11px] tracking-[0.2em] active:scale-95 transition-all uppercase shadow-[0_10px_30px_rgba(212,169,74,0.3)] cursor-pointer"
            >
              <Play fill="currentColor" strokeWidth={0} size={14} className="mr-2" /> Iniciar
            </button>
          )}
          {isExecuting && !isDone && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleFastCheckout(os); }} 
              className="h-14 px-8 flex items-center justify-center rounded-2xl bg-[#47C46A] text-black font-black text-[11px] tracking-[0.2em] active:scale-95 transition-all uppercase shadow-[0_10px_30px_rgba(53,199,89,0.3)] cursor-pointer"
            >
              <Check strokeWidth={4} size={16} className="mr-2" /> Encerrar
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); openExternalGPS(site?.fullAddress || ''); }} className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[var(--accent-gold)] active:bg-white/10 transition-all cursor-pointer"><Navigation size={20} /></button>
            <button onClick={(e) => { e.stopPropagation(); openWhatsApp(client?.phone || ''); }} className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#47C46A] active:bg-white/10 transition-all cursor-pointer"><MessageCircle size={20} /></button>
            <button onClick={(e) => { e.stopPropagation(); onNavigate('base'); }} className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-blue-400 active:bg-white/10 transition-all cursor-pointer"><FileBadge size={20} /></button>
          </div>
        </div>
      </div>
    );
  };

  function getClientName(clientId: string) { return clients.find(c => c.id === clientId)?.name || 'Cliente'; }

  if (isLoading) return <ScreenContainer className="bg-aferix-bg flex items-center justify-center min-h-screen"><ERPLoader message="Sincronizando malha operacional..." /></ScreenContainer>;

  return (
    <ScreenContainer className="bg-[#0A0A0A] animate-in fade-in duration-500 overflow-x-hidden min-h-screen pb-40">
      {/* ── UNIFIED OPERATIONAL HEADER ── */}
      <div className="relative z-10 w-full px-6 pt-12 flex flex-col gap-6 max-w-md mx-auto">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
               <span className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
               </span>
               <div className="bg-[#47C46A]/5 border border-[#47C46A]/10 px-2 py-0.5 rounded-[4px] flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#47C46A] animate-pulse" />
                  <span className="text-[8px] font-black text-[#47C46A] uppercase tracking-widest">LIVE_RADAR</span>
               </div>
            </div>
            <h1 className="text-[24px] font-black text-white tracking-tight leading-none mt-1">
               Radar <span className="text-white/40">Operacional</span>
            </h1>
         </div>

         {/* INTEGRATED MISSION FOCUS */}
         <HeroCard 
            state={activeOS.length > 0 ? 'active' : 'upcoming'}
            title={activeOS.length > 0 ? activeOS[0].title : 'Próxima Missão'}
            client={activeOS.length > 0 ? getClientName(activeOS[0].clientId || '') : 'Aguardando Despacho'}
            time={activeOS.length > 0 ? activeOS[0].scheduledDate?.slice(11, 16) || '---' : 'Radar Limpo'}
            eta={activeOS.length > 0 ? "23 min de rota" : undefined}
            onAction={() => { if (navigator.vibrate) navigator.vibrate(40); if (activeOS.length > 0) setActiveChecklistId(activeOS[0].id); else onNavigate('budgets'); }}
         />
      </div>

      <div className="px-6 flex flex-col gap-8 max-w-md mx-auto relative z-10 mt-8">
        
        {/* UNIFIED KPI PANEL */}
        <div className="bg-[#14161A] border border-white/[0.05] rounded-[24px] overflow-hidden flex flex-col">
           <div className="px-6 pt-5 pb-2">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fluxo de Campo</span>
           </div>
           <div className="grid grid-cols-2">
              <div className="p-6 border-r border-b border-white/[0.03] flex flex-col gap-1">
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Em Campo</span>
                 <span className="text-[24px] font-bold text-[#FFB340] font-mono leading-none my-1">{activeOS.length}</span>
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">Execução ativa</span>
              </div>
              <div className="p-6 border-b border-white/[0.03] flex flex-col gap-1">
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Programadas</span>
                 <span className="text-[24px] font-bold text-white font-mono leading-none my-1">{scheduledOS.length}</span>
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">Sequência do dia</span>
              </div>
              <div className="p-6 border-r border-white/[0.03] flex flex-col gap-1 col-span-2">
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Histórico Hoje</span>
                 <span className="text-[24px] font-bold text-[#47C46A] font-mono leading-none my-1">{doneOS.length}</span>
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">OS Finalizadas no período</span>
              </div>
           </div>
        </div>

        {/* UNIFIED QUEUE PANEL */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <Terminal size={14} className="text-white/40" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Fila de Atendimento</span>
              </div>
              <OpsChip label={`${activeOS.length + scheduledOS.length} Chamados`} tone="default" className="scale-90" />
           </div>

           <div className="bg-[#14161A] border border-white/[0.05] rounded-[24px] overflow-hidden">
              {activeOS.length > 0 && (
                <div className="flex flex-col">
                   <div className="px-6 py-3 bg-[#FFB340]/5 border-b border-white/[0.03]">
                      <span className="text-[9px] font-black text-[#FFB340] uppercase tracking-[0.3em]">EXECUÇÃO_ATUAL</span>
                   </div>
                   {activeOS.map((os, i) => (
                     <div key={os.id} className={cn("flex flex-col", i !== activeOS.length - 1 && "border-b border-white/[0.03]")}>
                        {renderOSCard(os)}
                     </div>
                   ))}
                </div>
              )}
              {scheduledOS.length > 0 && (
                <div className="flex flex-col">
                   <div className="px-6 py-3 bg-white/[0.02] border-b border-white/[0.03]">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">SEQUÊNCIA_PROGRAMADA</span>
                   </div>
                   {scheduledOS.map((os, i) => (
                     <div key={os.id} className={cn("flex flex-col", i !== scheduledOS.length - 1 && "border-b border-white/[0.03]")}>
                        {renderOSCard(os)}
                     </div>
                   ))}
                </div>
              )}
              {activeOS.length === 0 && scheduledOS.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center gap-4 opacity-30">
                   <Wrench size={32} />
                   <span className="text-[11px] font-mono font-black uppercase tracking-widest">RADAR_LIMPO</span>
                </div>
              )}
           </div>
        </div>
      </div>

      <Modal isOpen={!!checkoutDraft} onClose={() => setCheckoutDraft(null)} title="Finalizar e Receber" confirmLabel="Confirmar" onConfirm={handleConfirmCheckout}>
        {checkoutDraft && (
          <div className="flex flex-col gap-10 py-6" style={{ paddingBottom: 'calc(env(keyboard-inset-height, 0px) + 80px)' }}>
             <ContextBanner title="Resumo Comercial" meta={`Orçado Original: ${formatCurrencyBRL(checkoutDraft.originalBudget)}`} icon={<DollarSign size={16} />} />
             <div className="flex flex-col gap-10">
                <GlassCurrencyInput label="VALOR FINAL EXECUTADO" value={parseAmount(checkoutDraft.executedValue)} onChange={e => setCheckoutDraft({ ...checkoutDraft, executedValue: e.target.value })} />
                <div className="flex flex-col gap-4">
                   <SectionLabel className="ml-1 uppercase tracking-widest opacity-40">Forma de Recebimento</SectionLabel>
                   <div className="grid grid-cols-3 gap-3">
                      {['PIX', 'CARTÃO', 'DINHEIRO'].map(m => (
                        <button key={m} onClick={() => handleConfirmCheckoutWithPayment(m)} className="h-18 bg-[var(--accent-gold)] text-black font-black text-[12px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_15px_35px_rgba(212,169,74,0.3)]">{m}</button>
                      ))}
                   </div>
                   <button onClick={() => handleConfirmCheckoutWithPayment('PENDENTE')} className="w-full h-15 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest rounded-2xl mt-2 active:bg-white/5 transition-colors">Gerar Cobrança Pendente</button>
                </div>
                <GlassTextarea label="RELATÓRIO DE CAMPO" value={checkoutDraft.notes} onChange={e => setCheckoutDraft({ ...checkoutDraft, notes: e.target.value })} placeholder="Dê um feedback técnico sobre o serviço..." />
             </div>
          </div>
        )}
      </Modal>

      {confirmDialog && <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(null)} title={confirmDialog.title} confirmLabel={confirmDialog.confirmLabel} onConfirm={confirmDialog.onConfirm}><div className="py-8 text-center text-white/80 font-black uppercase text-[11px] tracking-[0.2em] px-6 leading-relaxed">{confirmDialog.message}</div></Modal>}

      {activeChecklistId && (
        <ExecutionCockpit 
          workOrderId={activeChecklistId}
          clientName={activeChecklistClientName}
          onExit={() => setActiveChecklistId(null)}
          onNavigate={onNavigate}
          onCheckout={() => {
             const os = workOrders.find(o => o.id === activeChecklistId);
             if (os) setCheckoutDraft({ workOrderId: os.id, title: os.title, clientId: os.clientId || '', siteId: os.siteId || '', originalBudget: os.executedValue || 0, executedValue: String(os.executedValue || 0), receivedValue: '0', notes: '' });
             setActiveChecklistId(null);
          }}
        />
      )}
    </ScreenContainer>
  );
}
