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
  DollarSign
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
  Stack
} from "../../../ui/system";
import { 
  Modal,
  ContextBanner,
  MonetaryInput,
  TextArea
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

interface FieldWorkspaceProps {
  onNavigate?: (tab: string) => void;
}

/**
 * FieldWorkspace: Unified operational center for SOLO profile.
 * Consolidates Agenda, Rota and Execution Cockpit in one screen.
 */
export const FieldWorkspace: React.FC<FieldWorkspaceProps> = ({ onNavigate }) => {
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [activeChecklistClientName, setActiveChecklistClientName] = useState<string>('');
  const [checkoutDraft, setCheckoutDraft] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<any | null>(null);
  const [wowCelebration, setWowCelebration] = useState<any | null>(null);

  const triggerCelebration = async (type: 'os_completed' | 'payment_received', value: number) => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      const health = await BusinessHealthService.getBusinessHealth();
      
      const prevRecord = Number(localStorage.getItem('aferix_record_monthly_revenue')) || 2000;
      const isRecordBroken = health.revenueThisMonth > prevRecord;
      if (isRecordBroken) {
        localStorage.setItem('aferix_record_monthly_revenue', String(health.revenueThisMonth));
      }
      
      const isGoalAchieved = health.metaAtingidaPercent >= 100;

      setWowCelebration({
        type,
        value,
        monthlyRevenue: health.revenueThisMonth,
        monthlyGoalProgress: health.metaAtingidaPercent,
        dailyRevenue: health.totalReceivedToday,
        isRecordBroken,
        isGoalAchieved
      });
    } catch (e) {
      console.error(e);
    }
  };

  const data = useLiveQuery(async () => {
    const [agenda, sites, clients] = await Promise.all([
      workOrderQueryService.getAgendaItems(),
      db.sites.toArray(),
      db.clients.toArray()
    ]);

    return { ...agenda, sites, clients };
  });

  if (!data) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Carregando operações..." /></ScreenContainer>;

  const { awaiting, scheduled, inProgress, done, cancelled, sites, clients } = data;
  const nextService = inProgress[0] || scheduled[0] || awaiting[0];

  const getClient = (id: string) => clients.find(c => c.id === id);
  const getSite = (id: string) => sites.find(s => s.id === id);
  const parseAmount = (val: string) => Number(val) || 0;

  // Actions handlers
  const handleStartService = async (os: WorkOrder) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const updated = { 
        ...os, 
        status: 'in-progress' as const, 
        scheduledDate: os.scheduledDate || todayStr,
        updatedAt: new Date().toISOString() 
      };
      await operationalFacade.updateWorkOrder(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePauseService = async (os: WorkOrder) => {
    try {
      const updated = { 
        ...os, 
        status: 'scheduled' as const, 
        updatedAt: new Date().toISOString() 
      };
      await operationalFacade.updateWorkOrder(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleToday = async (os: WorkOrder) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const updated = { 
        ...os, 
        status: 'scheduled' as const, 
        scheduledDate: todayStr,
        updatedAt: new Date().toISOString() 
      };
      await operationalFacade.updateWorkOrder(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivate = async (os: WorkOrder) => {
    try {
      const updated = { 
        ...os, 
        status: 'awaiting_schedule' as const, 
        scheduledDate: undefined,
        updatedAt: new Date().toISOString() 
      };
      await operationalFacade.updateWorkOrder(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutDraft) return;
    try {
      const val = parseAmount(checkoutDraft.executedValue);
      await operationalFacade.completeWorkOrder(
        checkoutDraft.workOrderId, 
        val, 
        parseAmount(checkoutDraft.receivedValue), 
        checkoutDraft.notes
      );
      setCheckoutDraft(null);
      await triggerCelebration('os_completed', val);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmCheckoutWithPayment = async (method: string) => {
    if (!checkoutDraft) return;
    try {
      let finalNotes = checkoutDraft.notes || '';
      let receivedValue = checkoutDraft.executedValue;
      if (method === 'PENDENTE') {
        receivedValue = '0';
      } else {
        finalNotes = `[Pagamento via ${method}] ${finalNotes}`.trim();
      }

      const val = parseAmount(checkoutDraft.executedValue);
      const recVal = parseAmount(receivedValue);
      await operationalFacade.completeWorkOrder(
        checkoutDraft.workOrderId, 
        val, 
        recVal, 
        finalNotes
      );
      setCheckoutDraft(null);
      if (recVal > 0) {
        await triggerCelebration('payment_received', recVal);
      } else {
        await triggerCelebration('os_completed', val);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = awaiting.length + scheduled.length + inProgress.length;

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      <AppHeader 
        title="Agenda / OS" 
        subtitle="Radar Operacional" 
        chips={
          <OpsChip 
            icon={<Clock size={11} />} 
            label={`${activeCount} Serviços Ativos`} 
            accent={activeCount > 0 ? "orange" : false} 
          />
        } 
      />

      <div className="px-6 py-8 flex flex-col gap-6">
        
        {/* HERO CARD - MAIN ACTION ZONE */}
        <Section>
          {nextService ? (
            <div className="w-full bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/20 rounded-[28px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 blur-[45px] pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold font-mono tracking-[0.2em] text-[var(--accent-gold)] uppercase">
                  PRÓXIMA MISSÃO
                </span>
                <span className="text-[10px] font-black text-white/50 font-mono">
                  OS #{nextService.id.substring(0, 6).toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {getClient(nextService.clientId)?.name || 'Cliente'}
                </h3>
                <p className="text-xs text-text-secondary mt-1 font-mono">{nextService.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-2">
                  <MapPin size={12} className="text-[var(--accent-gold)]" />
                  <span className="truncate">{getSite(nextService.siteId)?.fullAddress || 'Endereço não definido'}</span>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <DollarSign size={12} className="text-[var(--accent-green)]" />
                    <span className="font-mono font-bold text-white">{formatCurrencyBRL(nextService.executedValue || 0)}</span>
                  </div>
                  {nextService.scheduledDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                      <Clock size={12} className="text-[var(--accent-blue)]" />
                      <span className="font-mono">{new Date(nextService.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {nextService.status === 'in-progress' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setActiveChecklistId(nextService.id);
                        setActiveChecklistClientName(getClient(nextService.clientId)?.name || 'Cliente');
                      }}
                      className="flex-1 bg-[var(--accent-gold)] text-black font-black text-[10px] tracking-widest rounded-xl py-3.5 flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase"
                    >
                      <Play size={14} className="fill-black" /> CHECKLIST
                    </button>
                    <button 
                      onClick={() => handlePauseService(nextService)}
                      className="bg-white/5 border border-white/10 text-white font-bold text-[10px] tracking-widest rounded-xl px-4 py-3.5 active:scale-95 transition-all uppercase"
                    >
                      <Pause size={14} />
                    </button>
                    <button 
                      onClick={() => setCheckoutDraft({
                        workOrderId: nextService.id,
                        title: nextService.title,
                        clientId: nextService.clientId,
                        siteId: nextService.siteId,
                        originalBudget: nextService.executedValue || 0,
                        executedValue: String(nextService.executedValue || 0),
                        receivedValue: '0',
                        notes: ''
                      })}
                      className="bg-[var(--accent-green)]/15 border border-[var(--accent-green)]/30 text-[var(--accent-green)] font-black text-[10px] tracking-widest rounded-xl px-4 py-3.5 active:scale-95 transition-all uppercase"
                    >
                      CONCLUIR
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleStartService(nextService)}
                    className="w-full bg-[var(--accent-blue)] text-white font-black text-[10px] tracking-widest rounded-xl py-3.5 flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase shadow-[0_4px_20px_rgba(42,139,242,0.25)]"
                  >
                    <Play size={14} className="fill-white" /> INICIAR SERVIÇO
                  </button>
                )}
              </div>
            </div>
          ) : (
            <SurfaceCard className="p-8 text-center opacity-40">
              <Body className="font-mono text-xs font-black uppercase tracking-widest">NENHUMA_OS_OPERACIONAL</Body>
            </SurfaceCard>
          )}

          <button 
            onClick={() => onNavigate?.('new-quick-service')}
            className="w-full bg-white/[0.03] border border-white/[0.08] text-white/60 rounded-2xl py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:bg-white/5 transition-all"
          >
            <Zap size={14} className="text-[var(--accent-gold)]" /> NOVO ATENDIMENTO EXPRESSO
          </button>
        </Section>

        {/* 1. EM EXECUÇÃO */}
        {inProgress.length > 0 && (
          <Section>
            <SectionLabel className="text-[10px] font-black tracking-wider uppercase text-[var(--accent-gold)]">Em Execução ({inProgress.length})</SectionLabel>
            <div className="flex flex-col gap-3">
              {inProgress.map(os => (
                <SurfaceCard key={os.id} padding="lg" className="flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-gold)]"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-black text-white uppercase tracking-widest truncate max-w-[70%]">{getClient(os.clientId)?.name || 'Cliente'}</span>
                    <span className="text-[9px] font-bold font-mono text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">EXECUÇÃO</span>
                  </div>
                  <div className="text-[11px] text-text-secondary leading-tight truncate">{os.title}</div>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => {
                        setActiveChecklistId(os.id);
                        setActiveChecklistClientName(getClient(os.clientId)?.name || 'Cliente');
                      }}
                      className="flex-1 py-3.5 bg-[var(--accent-gold)] text-black rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 min-h-[48px]"
                    >
                      <Play size={10} className="fill-black" /> Checklist
                    </button>
                    <button 
                      onClick={() => handlePauseService(os)}
                      className="px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider min-h-[48px]"
                    >
                      Pausar
                    </button>
                    <button 
                      onClick={() => setCheckoutDraft({
                        workOrderId: os.id,
                        title: os.title,
                        clientId: os.clientId,
                        siteId: os.siteId,
                        originalBudget: os.executedValue || 0,
                        executedValue: String(os.executedValue || 0),
                        receivedValue: '0',
                        notes: ''
                      })}
                      className="px-4 py-3.5 bg-[var(--accent-green)]/15 text-[var(--accent-green)] rounded-lg text-[9px] font-black uppercase tracking-wider min-h-[48px]"
                    >
                      Concluir
                    </button>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </Section>
        )}

        {/* 2. AGENDADAS */}
        {scheduled.length > 0 && (
          <Section>
            <SectionLabel>Agendadas ({scheduled.length})</SectionLabel>
            <div className="flex flex-col gap-3">
              {scheduled.map(os => (
                <SurfaceCard key={os.id} padding="lg" className="flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)]"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-black text-white uppercase tracking-widest truncate max-w-[70%]">{getClient(os.clientId)?.name || 'Cliente'}</span>
                    <span className="text-xs font-bold text-[var(--accent-blue)] font-mono">{os.scheduledDate}</span>
                  </div>
                  <div className="text-[11px] text-text-secondary leading-tight truncate">{os.title}</div>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => handleStartService(os)}
                      className="flex-1 py-3.5 bg-[var(--accent-blue)] text-white rounded-lg text-[9px] font-black uppercase tracking-wider min-h-[48px]"
                    >
                      Iniciar Serviço
                    </button>
                    <button 
                      onClick={() => handleReactivate(os)}
                      className="px-4 py-3.5 bg-white/5 border border-white/10 text-white/50 rounded-lg text-[9px] font-bold uppercase tracking-wider min-h-[48px]"
                    >
                      Desmarcar
                    </button>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </Section>
        )}

        {/* 3. AGUARDANDO AGENDAMENTO */}
        {awaiting.length > 0 && (
          <Section>
            <SectionLabel>Aguardando Agendamento ({awaiting.length})</SectionLabel>
            <div className="flex flex-col gap-3">
              {awaiting.map(os => (
                <SurfaceCard key={os.id} padding="lg" className="flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-black text-white uppercase tracking-widest truncate max-w-[70%]">{getClient(os.clientId)?.name || 'Cliente'}</span>
                    <span className="text-[9px] font-bold font-mono text-white/30 uppercase">SEM DATA</span>
                  </div>
                  <div className="text-[11px] text-text-secondary leading-tight truncate">{os.title}</div>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => handleScheduleToday(os)}
                      className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 min-h-[48px]"
                    >
                      <Calendar size={10} /> Agendar p/ Hoje
                    </button>
                    <button 
                      onClick={() => handleStartService(os)}
                      className="flex-1 py-3.5 bg-[var(--accent-blue)] text-white rounded-lg text-[9px] font-black uppercase tracking-wider min-h-[48px]"
                    >
                      Iniciar Agora
                    </button>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </Section>
        )}

        {/* 4. CONCLUÍDAS */}
        {done.length > 0 && (
          <Section>
            <SectionLabel>Concluídas (Histórico)</SectionLabel>
            <div className="flex flex-col gap-3">
              {done.map(os => (
                <div key={os.id} className="bg-[var(--accent-green)]/5 border border-[var(--accent-green)]/20 rounded-[24px] p-5 flex items-center justify-between">
                  <div className="flex flex-col flex-1 min-w-0 mr-4">
                    <span className="text-sm font-black text-[var(--accent-green)] uppercase tracking-widest truncate">
                      {getClient(os.clientId)?.name || 'Cliente'}
                    </span>
                    <span className="text-[9px] text-[var(--accent-green)]/60 font-bold uppercase tracking-widest mt-1">
                      Finalizada em {os.updatedAt ? new Date(os.updatedAt).toLocaleDateString() : 'S/D'} • R$ {(os.executedValue || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-[var(--accent-green)]" />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 5. CANCELADAS */}
        {cancelled.length > 0 && (
          <Section>
            <SectionLabel>Canceladas</SectionLabel>
            <div className="flex flex-col gap-3">
              {cancelled.map(os => (
                <div key={os.id} className="bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 rounded-[24px] p-5 flex items-center justify-between">
                  <div className="flex flex-col flex-1 min-w-0 mr-4">
                    <span className="text-sm font-black text-[var(--accent-red)]/70 uppercase tracking-widest truncate">
                      {getClient(os.clientId)?.name || 'Cliente'}
                    </span>
                    <span className="text-[9px] text-[var(--accent-red)]/40 font-bold uppercase tracking-widest mt-1">
                      OS #{os.id.substring(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleReactivate(os)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-lg text-[8px] font-bold uppercase tracking-wider"
                  >
                    Reativar
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* COCKPIT DE EXECUÇÃO / CHECKLIST INTERNO */}
      {activeChecklistId && (
        <ExecutionCockpit 
          workOrderId={activeChecklistId}
          clientName={activeChecklistClientName}
          onExit={() => setActiveChecklistId(null)}
          onNavigate={onNavigate}
          onCheckout={() => {
            const os = inProgress.find(o => o.id === activeChecklistId) || 
                       scheduled.find(o => o.id === activeChecklistId) ||
                       awaiting.find(o => o.id === activeChecklistId);
            if (os) {
              setCheckoutDraft({
                workOrderId: os.id,
                title: os.title,
                clientId: os.clientId,
                siteId: os.siteId,
                originalBudget: os.executedValue || 0,
                executedValue: String(os.executedValue || 0),
                receivedValue: '0',
                notes: ''
              });
            }
            setActiveChecklistId(null);
          }}
        />
      )}

      {/* MODAL DE CHECKOUT / PAGAMENTO */}
      <Modal 
        isOpen={!!checkoutDraft} 
        onClose={() => setCheckoutDraft(null)} 
        title="Checkout de Execução" 
        confirmLabel={checkoutDraft?.hasPaid === false ? "Gerar Pendência" : "Encerrar OS"} 
        onConfirm={checkoutDraft?.hasPaid ? undefined : handleConfirmCheckout}
      >
        {checkoutDraft && (
          <div className="flex flex-col gap-8 py-2" style={{ paddingBottom: 'calc(env(keyboard-inset-height, 0px) + 120px)' }}>
            <ContextBanner 
              title="Validação de Receita" 
              meta={`Orçado: R$ ${checkoutDraft.originalBudget.toLocaleString()}. Verifique os valores finais para o faturamento.`} 
              icon={<ShieldCheck size={16} />} 
            />
            <div className="flex flex-col gap-6">
               <MonetaryInput label="Valor Real Executado" value={parseAmount(checkoutDraft.executedValue)} onChange={(val: number) => setCheckoutDraft({ ...checkoutDraft, executedValue: String(val) })} />
               
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
                        className="py-4 rounded-[16px] bg-[var(--accent-gold)] text-black text-[11px] font-black tracking-wider transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[var(--glow-gold)]"
                      >PIX</button>
                      <button 
                        onClick={() => handleConfirmCheckoutWithPayment('DINHEIRO')}
                        className="py-4 rounded-[16px] bg-[var(--accent-gold)] text-black text-[11px] font-black tracking-wider transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[var(--glow-gold)]"
                      >DINHEIRO</button>
                      <button 
                        onClick={() => handleConfirmCheckoutWithPayment('CARTÃO')}
                        className="py-4 rounded-[16px] bg-[var(--accent-gold)] text-black text-[11px] font-black tracking-wider transition-all active:scale-95 flex flex-col items-center gap-1 shadow-[var(--glow-gold)]"
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

               <div className="flex flex-col gap-3">
                  <SectionLabel className="ml-1">Evidências de Campo</SectionLabel>
                  <div className="flex gap-2">
                     <button className="flex-1 py-3 rounded-[16px] border bg-white/5 border-white/10 text-white flex items-center justify-center gap-2 font-bold text-[11px]"><CheckSquare size={14} /> LAUDO GERADO</button>
                  </div>
               </div>

               <TextArea label="Relatório de Campo (Opcional)" value={checkoutDraft.notes} onChange={(v: string) => setCheckoutDraft({ ...checkoutDraft, notes: v })} placeholder="Relate algo específico da execução..." rows={2} />
            </div>
          </div>
        )}
      </Modal>

      {confirmDialog && (
        <Modal 
          isOpen={confirmDialog.isOpen} 
          onClose={() => setConfirmDialog(null)} 
          title={confirmDialog.title} 
          confirmLabel={confirmDialog.confirmLabel} 
          onConfirm={confirmDialog.onConfirm}
        >
          <div className="py-4 text-center text-[13px] text-white/80 leading-relaxed font-medium px-4">
            {confirmDialog.message}
          </div>
        </Modal>
      )}

      {/* WOW CELEBRATION MODAL */}
      {wowCelebration && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md p-6 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center mb-8 shadow-[var(--glow-green)] animate-bounce">
            <CheckCircle2 size={48} className="text-[var(--accent-green)]" strokeWidth={3} />
          </div>
          
          <h1 className="text-[28px] font-black text-white tracking-widest text-center uppercase mb-2">
            {wowCelebration.type === 'os_completed' ? 'SERVIÇO CONCLUÍDO!' : 'PAGAMENTO RECEBIDO!'}
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-widest text-center mb-8">Conquista Registrada com Sucesso</p>
          
          <SurfaceCard padding="lg" className="w-full max-w-sm border border-white/[0.08] mb-10 flex flex-col gap-4">
            {wowCelebration.isGoalAchieved && (
              <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-[var(--accent-gold)]/40 rounded-[14px] p-3.5 text-center shadow-[0_0_15px_rgba(212,169,78,0.15)]">
                <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-gold)] uppercase block">
                  🏆 META MENSAL ATINGIDA! 🏆
                </span>
                <span className="text-[11px] text-white/90 font-semibold mt-1 block">
                  Você completou 100% da sua meta de faturamento!
                </span>
              </div>
            )}

            {wowCelebration.isRecordBroken && (
              <div className="w-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-[var(--accent-green)]/40 rounded-[14px] p-3.5 text-center shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-green)] uppercase block">
                  🚀 NOVO RECORDE DE FATURAMENTO! 🚀
                </span>
                <span className="text-[11px] text-white/90 font-semibold mt-1 block">
                  Este mês é o maior faturamento da história do seu negócio!
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">
                {wowCelebration.type === 'os_completed' ? 'Valor Faturado' : 'Valor Recebido'}
              </span>
              <span className="text-[18px] font-mono font-black text-[var(--accent-green)]">
                {formatCurrencyBRL(wowCelebration.value)}
              </span>
            </div>
            
            {wowCelebration.type === 'payment_received' && wowCelebration.dailyRevenue !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Recebido Hoje</span>
                <span className="text-[15px] font-mono font-bold text-white/90">
                  {formatCurrencyBRL(wowCelebration.dailyRevenue)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Receita do Mês</span>
              <span className="text-[15px] font-mono font-bold text-white/90">
                {formatCurrencyBRL(wowCelebration.monthlyRevenue)}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Meta Atingida</span>
                <span className="text-xs font-mono font-black text-[var(--accent-gold)]">
                  {wowCelebration.monthlyGoalProgress}%
                </span>
              </div>
              <div className="w-full bg-surface-700 h-2 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-[var(--accent-gold)] transition-all duration-700"
                  style={{ width: `${wowCelebration.monthlyGoalProgress}%` }}
                />
              </div>
            </div>
          </SurfaceCard>
          
          <button 
            onClick={() => setWowCelebration(null)}
            className="w-full max-w-sm py-4 rounded-xl bg-[var(--accent-gold)] text-black font-black tracking-widest text-[13px] shadow-[var(--glow-gold)] transition-colors active:scale-95 uppercase"
          >
            CONTINUAR
          </button>
        </div>
      )}

    </ScreenContainer>
  );
};
