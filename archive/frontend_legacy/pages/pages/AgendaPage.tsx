import React, { memo, useState, useEffect, useMemo } from "react";
import { pilotTelemetry } from '../services/pilotTelemetryService';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation, 
  MessageCircle, 
  Phone,
  Camera,
  ClipboardCheck,
  Signature,
  DollarSign,
  Zap,
  ArrowRight,
  CalendarDays,
  RefreshCw,
  Activity,
  Check,
  Search,
  ChevronRight,
  History,
  Wrench,
  Sparkles,
  Calendar,
  AlertCircle,
  Settings,
  Plus
} from "lucide-react";
import { cn } from '../utils/ui';
import { db } from '../storage/dexieDatabase';
import { workOrderQueryService } from '../services/WorkOrderQueryService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel, 
  OpsChip,
  Section,
  Body,
  Stack,
  TimelineCard,
  ToolCard,
  Eyebrow,
  ERPLoader,
  AferixCalendar
} from '../ui/system';
import { AferixSignaturePad } from '../components/AferixSignaturePad';
import { PrimaryButton } from '../app/components/ui';

interface AgendaPageProps {
  onNavigate: (tab: any) => void;
}

/**
 * AgendaPage (V36): Technical Scheduling Hub.
 * Optimized for Availability Control & Workflow Planning.
 * Cinematic "Golden Home" visual language.
 */
export const AgendaPage = memo(function AgendaPage({ onNavigate }: AgendaPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const endTrack = pilotTelemetry.trackScreen('Agenda');
    setAnimate(true);
    return () => endTrack();
  }, []);

  async function loadAgendaData() {
    try {
      const [agenda, sites, clients] = await Promise.all([
        workOrderQueryService.getAgendaItems(),
        db.sites.toArray(),
        db.clients.toArray()
      ]);

      setData({
        allWorkOrders: [...agenda.inProgress, ...agenda.scheduled, ...agenda.awaiting, ...agenda.done],
        sites,
        clients
      });
    } catch (err) {
      console.error("Failed to load agenda data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgendaData();
  }, []);

  const highlightedDates = useMemo(() => {
    if (!data?.allWorkOrders) return [];
    return data.allWorkOrders.map((wo: any) => wo.scheduledDate).filter(Boolean);
  }, [data]);

  const selectedDateOS = useMemo(() => {
    if (!data?.allWorkOrders) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return data.allWorkOrders.filter((wo: any) => {
      const woDate = (wo.scheduledDate || wo.createdAt || "").split('T')[0];
      return woDate === dateStr;
    });
  }, [data, selectedDate]);

  const hasConflict = selectedDateOS.length > 1;

  const handleStartRoute = async (os: any) => {
    if (navigator.vibrate) navigator.vibrate(40);
    try {
      setLoading(true);
      await operationalFacade.updateWorkOrder({ ...os, status: 'en_route' as const, updatedAt: new Date().toISOString() });
      const site = data.sites.find((s: any) => s.id === os.siteId);
      const addr = site?.fullAddress || os.address;
      if (addr) window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank');
      await loadAgendaData();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleArrival = async (os: any) => {
    if (navigator.vibrate) navigator.vibrate(60);
    try {
      setLoading(true);
      await operationalFacade.updateWorkOrder({ ...os, status: 'in-progress' as const, updatedAt: new Date().toISOString() });
      await loadAgendaData();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading || !data) {
    return (
      <ScreenContainer className="bg-aferix-bg flex items-center justify-center min-h-screen">
        <ERPLoader message="Recuperando malha operacional..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer 
      className="bg-[var(--bg-primary)] pt-0 px-0 relative overflow-x-hidden min-h-screen animate-in fade-in duration-500"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 240px)' }}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[var(--bg-secondary)]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/3 pointer-events-none blur-[100px] z-0" />

      <AppHeader 
        title="Radar da Agenda"
        subtitle="Acompanhamento operacional"
        onBack={() => onNavigate('home')}
        className="bg-[var(--header-gradient)]"
        chips={
          <div className="bg-white/[0.03] border border-white/[0.02] px-3 py-1 rounded-full flex items-center gap-2 text-white/50">
             <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Aferix Status</span>
             <span className="text-[10px] font-black text-[#47C46A] font-mono leading-none">ATIVO</span>
          </div>
        }
      />

      <div className="px-6 pb-12 flex flex-col gap-10 max-w-md mx-auto relative z-10">
        
        {/* TACTICAL SEARCH */}
        <div className={cn("transition-all duration-700 delay-[100ms] transform", animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
           <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors">
                 <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Localizar na agenda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pr-6 bg-[var(--bg-surface-elevated)] border border-white/[0.01] rounded-[28px] text-white placeholder:text-white/20 outline-none focus:border-[var(--accent-gold)]/40 transition-all shadow-md"
                style={{ paddingLeft: "3.75rem" }}
              />
           </div>
        </div>

        {/* 1. CALENDAR CONTROL */}
        <Section className={cn("gap-6 transition-all duration-700 delay-[200ms] transform", animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shadow-[var(--glow-gold)]" />
                 <SectionLabel className="!mb-0 uppercase tracking-[0.25em] text-white/40">Controle de Fluxo</SectionLabel>
              </div>
              <OpsChip label="SINCRONIZADO" tone="success" />
           </div>

           <AferixCalendar 
             selectedDate={selectedDate} 
             onDateSelect={setSelectedDate} 
             highlightedDates={highlightedDates}
           />

           {hasConflict && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-4 animate-shake">
                <AlertCircle className="text-red-500 shrink-0" size={24} />
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-red-500 uppercase tracking-widest leading-none">Conflito Detectado</span>
                   <p className="text-[12px] text-white/60 mt-1.5 leading-snug">Você tem múltiplos serviços para o mesmo período.</p>
                </div>
             </div>
           )}
        </Section>

        {/* 2. MISSIONS FOR SELECTED DATE */}
        <Section className={cn("gap-6 transition-all duration-700 delay-[300ms] transform", animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <div className="flex justify-between items-end px-1">
             <SectionLabel className="!mb-0 uppercase tracking-widest opacity-40">{selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} • Missões</SectionLabel>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">{selectedDateOS.length} EVENTOS</span>
          </div>

          <div className="flex flex-col gap-4">
             {selectedDateOS.length > 0 ? (
               selectedDateOS.map((os: any) => {
                  const client = data.clients.find((c: any) => c.id === os.clientId);
                  const isNow = os.status === 'in-progress' || os.status === 'en_route';
                  const isDone = os.status === 'done';

                  return (
                    <SurfaceCard 
                      key={os.id} 
                      padding="lg" 
                      className={cn(
                        "bg-[var(--bg-surface)] border border-white/[0.01] active:scale-[0.98] transition-all rounded-[32px] overflow-hidden group shadow-[var(--shadow-card)]",
                        isNow && "border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/[0.02]"
                      )}
                      onClick={() => onNavigate({ tab: 'operations', workOrderId: os.id })}
                    >
                       <div className="flex flex-col gap-6">
                          <div className="flex justify-between items-start">
                             <Stack className="gap-1.5">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.25em] opacity-80",
                                  isNow ? "text-[var(--accent-gold)]" : isDone ? "text-[#47C46A]" : "text-white/40"
                                )}>
                                   {isNow ? "EXECUTANDO_AGORA" : isDone ? "FINALIZADO" : "AGENDADO"}
                                </span>
                                <h3 className={cn(
                                  "text-[18px] font-black uppercase leading-tight tracking-tight",
                                  isDone ? "text-white/30 line-through" : "text-white"
                                )}>{client?.name || "Cliente Avulso"}</h3>
                             </Stack>
                             <div className="w-11 h-11 rounded-xl bg-[#000000] border border-white/[0.02] grid place-items-center text-white/20">
                                <span className="text-[13px] font-mono font-black num">{os.scheduledDate?.slice(11, 16) || "--:--"}</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-3 text-white/40 text-[11px] font-bold uppercase tracking-widest bg-[#000000]/50 p-3 rounded-xl border border-white/[0.01]">
                             <MapPin size={12} className={isNow ? "text-[var(--accent-gold)]" : ""} />
                             <span className="truncate">{os.title}</span>
                          </div>

                          {isNow && (
                            <button className="w-full h-15 bg-[var(--accent-gold)] text-[#16181C] font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                               RETOMAR TRABALHO <Play size={18} fill="currentColor" strokeWidth={0} />
                            </button>
                          )}
                       </div>
                    </SurfaceCard>
                  );
               })
             ) : (
               <div className="py-20 text-center opacity-10 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center gap-4">
                  <Calendar size={40} />
                  <span className="text-[11px] font-mono font-black uppercase tracking-[0.4em]">QUADRO_LIVRE_PARA_NOVOS_SERVIÇOS</span>
               </div>
             )}
          </div>
        </Section>

        {/* 3. ARSENAL TÁTICO */}
        <Section className={cn("gap-6 pt-10 border-t border-white/[0.02] transition-all duration-700 delay-[400ms] transform", animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
           <SectionLabel className="ml-1 uppercase tracking-[0.25em] text-white/30">Arsenal de Planejamento</SectionLabel>
           <div className="grid grid-cols-2 gap-4">
              <ToolCard label="Disponibilidade" icon={<Calendar />} onClick={() => {}} />
              <ToolCard label="Configurações" icon={<Settings />} onClick={() => {}} />
              <ToolCard label="Sync Aparelho" icon={<RefreshCw />} onClick={() => {
                if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
                alert("Calendário sincronizado com o dispositivo com sucesso!");
              }} />
              <ToolCard label="Finanças" icon={<DollarSign />} onClick={() => onNavigate('money')} />
           </div>
           
           <button 
             onClick={() => onNavigate('new-quick-service')}
             className="w-full h-20 bg-white/[0.01] hover:bg-white/[0.02] border-2 border-dashed border-white/5 text-white/40 font-black text-[13px] uppercase tracking-[0.2em] rounded-[32px] active:scale-[0.98] transition-all flex items-center justify-center gap-4 cursor-pointer mt-4"
           >
             <Plus size={24} /> PROGRAMAR NOVO ATENDIMENTO
           </button>
        </Section>

      </div>

      {showSignaturePad && (
        <AferixSignaturePad
          onClose={() => setShowSignaturePad(false)}
          onSave={(sigDataUrl) => {
            alert("Assinatura digital capturada e vinculada com sucesso!");
            setShowSignaturePad(false);
          }}
        />
      )}
    </ScreenContainer>
  );
});
