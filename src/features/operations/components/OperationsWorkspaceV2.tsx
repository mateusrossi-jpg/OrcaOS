import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  CalendarDays,
  Wrench,
  AlertTriangle,
  Play,
  CheckCircle2
} from 'lucide-react';
import { 
  ScreenContainer, 
  ExecutiveHeader, 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Section, 
  Body, 
  Subtitle,
  OpsChip,
  ERPLoader,
  TimelineCard
} from '../../../ui/system';
import { db } from '../../../storage/dexieDatabase';
import { workOrderQueryService } from '../../../services/WorkOrderQueryService';
import { cn } from '../../../utils/ui';

interface OperationsWorkspaceV2Props {
  onNavigate: (tab: any) => void;
}

/**
 * OperationsWorkspaceV2: Field Execution Hub (RC14).
 * Primary Question: "O que preciso executar hoje?"
 * Strictly aligned with HOME & REVENUE visual protocol.
 */
export const OperationsWorkspaceV2: React.FC<OperationsWorkspaceV2Props> = ({ onNavigate }) => {
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [agenda, route] = await Promise.all([
        workOrderQueryService.getAgendaItems(),
        workOrderQueryService.getTodayRoute(),
      ]);

      setActiveMissions(agenda.inProgress);
      
      const timeline = [];
      for (const wo of route.doneToday) {
        timeline.push({ id: wo.id, time: wo.updatedAt?.slice(11, 16) || '00:00', title: wo.title, status: 'Concluído', state: 'done' as const });
      }
      for (const wo of agenda.inProgress) {
        timeline.push({ id: wo.id, time: wo.updatedAt?.slice(11, 16) || '00:00', title: wo.title, status: 'Em execução', state: 'active' as const });
      }
      for (const wo of agenda.scheduled.slice(0, 5)) {
        timeline.push({ id: wo.id, time: wo.scheduledDate?.slice(11, 16) || 'Agendado', title: wo.title, status: 'Próximo', state: 'upcoming' as const });
      }
      setTimelineItems(timeline.sort((a, b) => a.time.localeCompare(b.time)));
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <ScreenContainer className="items-center justify-center bg-aferix-bg"><ERPLoader message="Mapeando malha operacional..." /></ScreenContainer>;

  return (
    <ScreenContainer 
      className="bg-aferix-bg pt-0 px-0 relative overflow-x-hidden min-h-screen animate-in fade-in duration-700"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}
    >
      {/* ── ATMOSPHERIC LAYER ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#47C46A]/5 pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/3 pointer-events-none blur-[100px] z-0" />

      {/* ── HEADER ── */}
      <div className="relative z-10 w-full">
         <ExecutiveHeader userName="Mateus" score={94} />
      </div>

      <div className="relative z-10 px-6 py-10 flex flex-col gap-12 max-w-md mx-auto">
        
        {/* SECTION: HERO MISSIONS */}
        <Section className="gap-6">
           <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#47C46A] shadow-[0_0_10px_#47C46A]" />
              <SectionLabel className="!mb-0 uppercase tracking-widest text-[#47C46A]">Execução Prioritária</SectionLabel>
           </div>

           {activeMissions.length > 0 ? (
             <div className="flex flex-col gap-5">
                {activeMissions.map(os => (
                  <SurfaceCard 
                    key={os.id} 
                    padding="none" 
                    className="border-[#47C46A]/30 bg-[#47C46A]/[0.01] active:scale-[0.98] transition-all rounded-[32px] overflow-hidden shadow-2xl group" 
                    onClick={() => onNavigate({ tab: 'operations', workOrderId: os.id })}
                  >
                      <div className="p-7 flex flex-col gap-6">
                         <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-[#47C46A]/10 flex items-center justify-center relative border border-[#47C46A]/20">
                                  <Play size={24} className="text-[#47C46A] fill-[#47C46A]" />
                                  <div className="absolute inset-0 rounded-2xl bg-[#47C46A] animate-ping opacity-20" />
                               </div>
                               <Stack className="gap-1">
                                  <Body className="text-[19px] font-black text-white uppercase leading-none tracking-tight">{os.title}</Body>
                                  <span className="text-[10px] font-black text-[#47C46A] uppercase tracking-[0.2em] opacity-80">Ordem em andamento</span>
                               </Stack>
                            </div>
                         </div>
                         
                         <button 
                           onClick={(e) => { e.stopPropagation(); onNavigate({ tab: 'operations', workOrderId: os.id }); }}
                           className="w-full h-16 bg-[#47C46A] text-black font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(53,199,89,0.3)] group-active:scale-95 transition-all"
                         >
                            CONTINUAR TRABALHO <ChevronRight size={20} strokeWidth={4} />
                         </button>
                      </div>
                  </SurfaceCard>
                ))}
             </div>
           ) : (
             <SurfaceCard padding="xl" className="border-dashed border-white/5 bg-white/[0.01] rounded-[40px] text-center flex flex-col items-center gap-6 opacity-40">
                <Wrench size={32} className="text-white/20" />
                <Stack className="gap-2">
                   <span className="text-[15px] font-black text-white uppercase tracking-widest">Nenhuma missão ativa</span>
                   <p className="text-[11px] font-medium leading-relaxed max-w-[200px] mx-auto opacity-50">Inicie um atendimento via agenda para começar o trabalho.</p>
                </Stack>
             </SurfaceCard>
           )}
        </Section>

        {/* SECTION: ROUTE TIMELINE */}
        <Section className="gap-6">
           <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                 <MapPin size={14} className="text-white/30" />
                 <SectionLabel className="!mb-0 uppercase tracking-widest opacity-40">Linha do Tempo Hoje</SectionLabel>
              </div>
              <OpsChip label={`${timelineItems.length} EVENTOS`} tone="default" />
           </div>
           
           <div className="flex flex-col gap-0">
             {timelineItems.length > 0 ? (
               timelineItems.map((item, idx) => (
                 <TimelineCard 
                    key={item.id || idx}
                    time={item.time}
                    title={item.title}
                    status={item.status}
                    state={item.state}
                 />
               ))
             ) : (
               <div className="py-12 text-center opacity-20 border border-dashed border-white/10 rounded-3xl">
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase">ROTA_VIVA_VAZIA</span>
               </div>
             )}
           </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};
