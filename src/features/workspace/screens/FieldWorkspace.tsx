import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  Navigation, 
  Phone, 
  MessageCircle, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  CheckSquare, 
  CalendarDays,
  X,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { 
  ScreenContainer, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard, 
  OpsChip, 
  Body, 
  ERPLoader, 
  Stack,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  Subtitle,
  StatusPill,
  ExecutiveHeader
} from "../../../ui/system";
import { 
  Modal,
  MonetaryInput,
  TextArea,
  PrimaryButton,
  SecondaryButton
} from "../../../app/components/ui";
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { WorkOrder } from '../../../core/types/business';
import { cn } from '../../../utils/ui';
import { operationalFacade } from '../../workflow/operationalFacade';
import { workOrderQueryService } from '../../../services/WorkOrderQueryService';
import { ExecutionCockpit } from '../../execution/components/ExecutionCockpit';
import { BusinessHealthService } from '../../../services/BusinessHealthService';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { sendWhatsAppMessage } from '../../../utils/whatsapp';

interface FieldWorkspaceProps {
  onNavigate?: (tab: string) => void;
}

/**
 * FieldWorkspace: Unified operational center for SOLO profile.
 * High-Performance Tactical Control. Aligned with AFERIX V5.
 */
export const FieldWorkspace: React.FC<FieldWorkspaceProps> = ({ onNavigate }) => {
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [activeChecklistClientName, setActiveChecklistClientName] = useState<string>('');
  const [checkoutDraft, setCheckoutDraft] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<any | null>(null);
  const [wowCelebration, setWowCelebration] = useState<any | null>(null);

  const triggerCelebration = async (type: 'os_completed' | 'payment_received', value: number) => {
    try {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const health = await BusinessHealthService.getBusinessHealth();
      const prevRecord = Number(localStorage.getItem('aferix_record_monthly_revenue')) || 2000;
      if (health.revenueThisMonth > prevRecord) localStorage.setItem('aferix_record_monthly_revenue', String(health.revenueThisMonth));
      
      setWowCelebration({
        type, value,
        monthlyRevenue: health.revenueThisMonth,
        monthlyGoalProgress: health.metaAtingidaPercent,
        dailyRevenue: health.totalReceivedToday,
        isRecordBroken: health.revenueThisMonth > prevRecord,
        isGoalAchieved: health.metaAtingidaPercent >= 100
      });
    } catch (e) { console.error(e); }
  };

  const data = useLiveQuery(async () => {
    const [agenda, sites, clients] = await Promise.all([
      workOrderQueryService.getAgendaItems(),
      db.sites.toArray(),
      db.clients.toArray()
    ]);
    return { ...agenda, sites, clients };
  });

  if (!data) return <ScreenContainer className="items-center justify-center bg-aferix-bg"><ERPLoader message="Carregando operações..." /></ScreenContainer>;

  const { awaiting, scheduled, inProgress, done, sites, clients } = data;
  const nextService = inProgress[0] || scheduled[0] || awaiting[0];
  const getClient = (id: string) => clients.find(c => c.id === id);
  const getSite = (id: string) => sites.find(s => s.id === id);
  const parseAmount = (val: string) => Number(val) || 0;

  const handleStartRoute = async (os: WorkOrder) => {
    if (navigator.vibrate) navigator.vibrate(30);
    await operationalFacade.updateWorkOrder({ ...os, status: 'en_route' as const, updatedAt: new Date().toISOString() });
  };

  const handleArrival = async (os: WorkOrder) => {
    if (navigator.vibrate) navigator.vibrate(50);
    await operationalFacade.updateWorkOrder({ ...os, status: 'in-progress' as const, updatedAt: new Date().toISOString() });
  };

  const handleStartService = async (os: WorkOrder) => {
    if (navigator.vibrate) navigator.vibrate(40);
    const todayStr = new Date().toISOString().split('T')[0];
    await operationalFacade.updateWorkOrder({ ...os, status: 'in-progress' as const, scheduledDate: os.scheduledDate || todayStr, updatedAt: new Date().toISOString() });
  };

  const activeCount = awaiting.length + scheduled.length + inProgress.length;
  const stats = {
    todayCount: scheduled.filter(os => os.scheduledDate === new Date().toISOString().split('T')[0]).length + inProgress.length,
    activeCount,
    totalValue: inProgress.reduce((acc, os) => acc + (os.executedValue || 0), 0)
  };

  return (
    <ScreenContainer className="pb-32 bg-aferix-bg animate-in fade-in duration-500 overflow-x-hidden min-h-screen">
      {/* ── ATMOSPHERE ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/20 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#0A84FF]/3 pointer-events-none blur-[100px] z-0" />

      <div className="relative z-10">
        <AppHeader 
          title="Agenda." 
          subtitle="Radar Operacional de Campo" 
          chips={<><OpsChip icon={<Clock size={11} />} label={`${activeCount} Ativos`} accent="orange" /><OpsChip icon={<Zap size={11} />} label="Radar Hoje" accent={false} /></>} 
        />

        <div className="px-6 py-8 flex flex-col gap-12 max-w-md mx-auto">
          
          {/* 1. HERO COCKPIT */}
          <Section className="gap-6">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#47C46A] shadow-[0_0_10px_#47C46A]" />
               <SectionLabel className="!mb-0 uppercase tracking-widest text-[#47C46A]">Atendimento Prioritário</SectionLabel>
            </div>

            {nextService ? (
              <SurfaceCard padding="none" className="bg-gradient-to-br from-[#121520] via-[#0E1016] to-[#08090C] border border-white/[0.1] rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-gold)]/5 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="p-8 flex flex-col gap-8">
                  <div className="flex justify-between items-start">
                    <Stack className="gap-2">
                       <span className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] opacity-80">PRÓXIMA_MISSÃO</span>
                       <h3 className="text-[26px] font-black text-white uppercase leading-tight tracking-tight truncate max-w-[220px]">
                        {getClient(nextService.clientId || '')?.name || 'Cliente'}
                      </h3>
                    </Stack>
                    <StatusPill status={nextService.status === 'in-progress' ? 'execucao' : nextService.status} className="scale-90 origin-right" />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-white/80 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 shadow-inner">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <MapPin size={20} />
                      </div>
                      <span className="text-[13px] font-bold tracking-tight uppercase opacity-80 truncate">{getSite(nextService.siteId || '')?.fullAddress || 'Local não definido'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {nextService.status === 'in-progress' ? (
                      <button 
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(40); setActiveChecklistId(nextService.id); setActiveChecklistClientName(getClient(nextService.clientId || '')?.name || 'Cliente'); }}
                        className="w-full h-18 bg-[var(--accent-gold)] text-black font-black text-[13px] uppercase tracking-[0.25em] rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_45px_rgba(212,169,74,0.3)] cursor-pointer"
                      >
                        CONTINUAR TRABALHO <ArrowRight size={20} strokeWidth={4} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStartRoute(nextService)}
                        className="w-full h-18 bg-white text-black font-black text-[13px] uppercase tracking-[0.25em] rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_45px_rgba(255,255,255,0.15)] cursor-pointer"
                      >
                        INICIAR ROTA <Navigation size={20} fill="currentColor" />
                      </button>
                    )}
                  </div>
                </div>
              </SurfaceCard>
            ) : (
              <div className="py-20 text-center opacity-20 border border-dashed border-white/10 rounded-[40px]">
                 <Body className="font-mono text-[11px] font-black tracking-[0.3em] uppercase">LIVRO_DE_MISSÕES_LIMPO</Body>
              </div>
            )}
          </Section>

          {/* 2. FIELD RADAR SUMMARY */}
          <ExecutiveSummaryGrid>
             <ValueBlock label="Para Hoje" value={stats.todayCount} icon={<CalendarDays size={12} />} />
             <ValueBlock label="Ativos" value={stats.activeCount} icon={<Clock size={12} />} variant="warning" />
             <ValueBlock label="Receita Estimada" value={formatCurrencyBRL(stats.totalValue)} icon={<DollarSign size={12} />} variant="success" />
          </ExecutiveSummaryGrid>

          {/* 3. TACTICAL OS LIST */}
          <Section className="gap-6">
            <SectionLabel className="ml-1 uppercase tracking-widest opacity-40">Lista de Batalha</SectionLabel>
            <SurfaceCard padding="none" className="bg-[#15181D]/20 border border-white/[0.06] rounded-[32px] overflow-hidden">
               <Stack className="gap-0">
                  {[...inProgress, ...scheduled, ...awaiting].length === 0 ? (
                    <div className="py-20 text-center opacity-10">
                      <Body className="font-mono text-[10px] font-black uppercase tracking-widest">LIVRO_RAZÃO_VAZIO</Body>
                    </div>
                  ) : (
                    <>
                      {inProgress.map(os => (
                        <InteractiveRow key={os.id} onClick={() => setActiveChecklistId(os.id)} className="p-6 border-b border-white/[0.04] last:border-0"
                          leftSlot={<div className="w-10 h-10 rounded-xl bg-[#47C46A]/10 border border-[#47C46A]/20 grid place-items-center text-[#47C46A]"><Play size={16} fill="currentColor" /></div>}
                        >
                           <div className="flex items-center justify-between w-full">
                              <Stack className="gap-1 min-w-0 pr-4">
                                 <Body className="truncate font-black text-white uppercase text-[15px]">{getClient(os.clientId || '')?.name || 'Cliente'}</Body>
                                 <Subtitle className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{os.title}</Subtitle>
                              </Stack>
                              <StatusPill status="execucao" className="scale-75 origin-right" />
                           </div>
                        </InteractiveRow>
                      ))}
                      {scheduled.map(os => (
                        <InteractiveRow key={os.id} onClick={() => handleStartService(os)} className="p-6 border-b border-white/[0.04] last:border-0"
                          leftSlot={<div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white/30"><Clock size={16} /></div>}
                        >
                           <div className="flex items-center justify-between w-full">
                              <Stack className="gap-1 min-w-0 pr-4">
                                 <Body className="truncate font-black text-white uppercase text-[15px]">{getClient(os.clientId || '')?.name || 'Cliente'}</Body>
                                 <Subtitle className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{os.scheduledDate} · {os.title}</Subtitle>
                              </Stack>
                              <ChevronRight size={18} className="text-white/10" />
                           </div>
                        </InteractiveRow>
                      ))}
                    </>
                  )}
               </Stack>
            </SurfaceCard>
          </Section>

          <button 
            onClick={() => onNavigate?.('new-quick-service')}
            className="w-full h-18 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/20 text-white/40 font-black text-[11px] uppercase tracking-[0.2em] rounded-[24px] active:scale-[0.98] transition-all flex items-center justify-center gap-4 cursor-pointer"
          >
            <Zap size={20} className="text-[var(--accent-gold)]" /> NOVO ATENDIMENTO EXPRESSO
          </button>
        </div>
      </div>

      {activeChecklistId && (
        <ExecutionCockpit 
          workOrderId={activeChecklistId}
          clientName={activeChecklistClientName}
          onExit={() => setActiveChecklistId(null)}
          onNavigate={onNavigate || (() => {})}
          onCheckout={() => {
            const os = [...inProgress, ...scheduled, ...awaiting].find(o => o.id === activeChecklistId);
            if (os) setCheckoutDraft({ workOrderId: os.id, title: os.title, clientId: os.clientId, siteId: os.siteId, originalBudget: os.executedValue || 0, executedValue: String(os.executedValue || 0), receivedValue: '0', notes: '' });
            setActiveChecklistId(null);
          }}
        />
      )}

      {/* RE-USE MODAL DE CHECKOUT DO HUB */}
      <Modal isOpen={!!checkoutDraft} onClose={() => setCheckoutDraft(null)} title="Finalizar Atendimento" confirmLabel="Encerrar OS" onConfirm={handleConfirmCheckout}>
        {checkoutDraft && (
          <div className="flex flex-col gap-10 py-6" style={{ paddingBottom: 'calc(env(keyboard-inset-height, 0px) + 80px)' }}>
             <MonetaryInput label="Valor Final da Execução" value={parseAmount(checkoutDraft.executedValue)} onChange={(v: number) => setCheckoutDraft({ ...checkoutDraft, executedValue: String(v) })} />
             <div className="flex flex-col gap-4">
                <SectionLabel className="ml-1 uppercase tracking-widest opacity-40">Recebimento no Local</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                   {['PIX', 'CARTÃO', 'DINHEIRO'].map(m => (
                     <button key={m} onClick={() => handleConfirmCheckoutWithPayment(m)} className="py-5 bg-[var(--accent-gold)] text-black font-black text-[11px] tracking-widest rounded-xl active:scale-95 transition-all shadow-lg uppercase">{m}</button>
                   ))}
                </div>
                <button onClick={() => handleConfirmCheckoutWithPayment('PENDENTE')} className="w-full py-4 border border-white/10 text-white/40 font-black text-[10px] tracking-widest rounded-xl mt-2 uppercase">Gerar Pendência de Cobrança</button>
             </div>
          </div>
        )}
      </Modal>

      {wowCelebration && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-aferix-bg/98 backdrop-blur-xl p-8 animate-fade-in">
           <div className="w-24 h-24 rounded-3xl bg-[#47C46A]/20 border border-[#47C46A]/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(53,199,89,0.3)] animate-bounce">
              <CheckCircle2 size={48} className="text-[#47C46A]" strokeWidth={3} />
           </div>
           <h1 className="text-[32px] font-black text-white tracking-tight text-center uppercase mb-10 leading-none">
              {wowCelebration.type === 'os_completed' ? 'Missão Cumprida!' : 'Receita Garantida!'}
           </h1>
           <SurfaceCard className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                 <span className="text-[12px] font-black text-white/30 uppercase tracking-widest">Valor do Dia</span>
                 <span className="text-[20px] font-black text-[#47C46A] font-mono">{formatCurrencyBRL(wowCelebration.value)}</span>
              </div>
              <PrimaryButton onClick={() => setWowCelebration(null)} className="h-16 !rounded-2xl font-black tracking-[0.2em]">CONTINUAR</PrimaryButton>
           </SurfaceCard>
        </div>
      )}
    </ScreenContainer>
  );
};
