import { memo } from "react";
import {
  MapPin,
  User,
  CalendarDays,
  Clock,
  AlertTriangle,
  Activity,
  Terminal,
  ArrowRight
} from "lucide-react";
import type { AppTab } from "../appTypes";
import { useHomeAttentionStack } from "../hooks/useHomeAttentionStack";

// ── Unified UI Architecture ──────────────────────────────────────────────────
import { 
  ScreenContainer, 
  SurfaceCard, 
  SectionLabel,
  SemanticBadge,
  AppHeader,
  OpsChip,
  InteractiveRow,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Value
} from '../../ui/system';
import { MoneyValue } from '../components/ui';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: { id: string }) => void;
}

/**
 * AFERIX HOME V25 (EXECUTIVE COCKPIT)
 * Directly connected to route 'pulse'.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export const HomeScreen = memo(function HomeScreen({
  onNavigate,
  onSelectBudget,
}: HomeScreenProps) {
  const { p0, p1, p2, commandStatus, nextEvent } = useHomeAttentionStack();

  const chips = (
    <>
      <OpsChip icon={<Activity size={11} />} label={`${p2.executingCount} ao vivo`} accent={p2.executingCount > 0 ? "orange" : false} />
      <OpsChip icon={<CalendarDays size={11} />} label={`${p2.todayJobsCount} hoje`} accent={p2.todayJobsCount > 0 ? "blue" : false} />
      <OpsChip icon={<Clock size={11} />} label="09:42 uptime" accent={false} />
    </>
  );

  return (
    <ScreenContainer className="pb-32">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[124px] scrollbar-none">
        
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Bom dia, Mateus."
          action={
            <button 
              onClick={() => onNavigate('settings')}
              className="grid h-[42px] w-[42px] place-items-center rounded-[16px] bg-white/[0.04] border border-white/[0.04] text-[#808080] hover:bg-white/10 active:scale-95 transition-all shadow-[var(--shadow-soft)]"
              title="Menu Executivo"
            >
              <User size={18} strokeWidth={2} />
            </button>
          }
          chips={chips}
        />

        <div className="px-4 flex flex-col gap-12">
          
          {/* 1. MISSION BRIEFING (P0 - URGENCIES) */}
          <Section className="gap-3">
            <SectionLabel className="ml-2">Missão do Dia</SectionLabel>
            {p0.length === 0 ? (
               <SurfaceCard variant="cinematic" padding="lg">
                  <div className="flex items-center justify-between mb-8">
                     <SectionLabel>Status Global</SectionLabel>
                     <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
                  </div>
                  <Title className="text-[28px] leading-[1.1]">
                     Tudo sob controle.
                  </Title>
                  <Body className="text-[var(--accent-gold)] mt-3">
                     Nenhuma urgência detectada no radar.
                  </Body>
               </SurfaceCard>
            ) : (
               p0.map((alert) => (
                <SurfaceCard key={alert.id} variant="cinematic" padding="lg" className="border-l-4 border-l-[var(--accent-red)]">
                  <div className="flex items-center justify-between mb-8">
                    <SemanticBadge label={alert.type.toUpperCase()} variant="danger" />
                    <AlertTriangle className="h-3 w-3 text-[var(--accent-red)]" />
                  </div>
                  <Title>{alert.title}</Title>
                  <Subtitle className="mt-3 opacity-40">{alert.subtitle}</Subtitle>
                </SurfaceCard>
               ))
            )}
          </Section>

          {/* 2. COMMAND STREAM (P1 - FRICTIONS) */}
          <Section className="gap-3">
             <SurfaceCard padding="none">
                <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px]">
                   <SectionLabel>Atritos na Fila</SectionLabel>
                   <Terminal size={12} className="text-[#3A3A3A]" />
                </div>
                
                {p1.length === 0 ? (
                  <div className="py-8 px-5 text-center">
                    <Body className="text-[#3C3C3C] font-mono text-[11px] uppercase">FILA_LIMPA</Body>
                  </div>
                ) : (
                  p1.map((item, idx) => (
                    <InteractiveRow 
                      key={item.id}
                      onClick={() => onNavigate('base')}
                      className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
                      leftSlot={
                        <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center">
                           <span className="text-lg leading-none">{item.type === 'viewed_proposal' ? "👁️" : "⚠️"}</span>
                        </div>
                      }
                    >
                       <Stack className="gap-0.5">
                          <Body className="truncate">{item.title}</Body>
                          <Subtitle className="text-[11.5px]">{item.subtitle}</Subtitle>
                       </Stack>
                    </InteractiveRow>
                  ))
                )}
                <div className="h-1" />
             </SurfaceCard>
          </Section>

          {/* 3. CONTINUITY (P2 - NEXT) */}
          <Section className="gap-3">
             <SectionLabel className="ml-2">Próximo na Agenda</SectionLabel>
             {nextEvent ? (
                <SurfaceCard padding="lg" onClick={() => onNavigate('base')} className="group active:scale-[0.98]">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-[#D4A94E]/10 border border-[#D4A94E]/20 flex items-center justify-center">
                         <MapPin size={18} className="text-[var(--accent-gold)]" />
                      </div>
                      <Stack className="gap-0.5">
                         <Title className="text-base uppercase">{nextEvent.title}</Title>
                         <SectionLabel className="text-[#505050] tracking-widest">{nextEvent.subtitle}</SectionLabel>
                      </Stack>
                   </div>
                   <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/5">
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Abrir Roteiro</span>
                      <ArrowRight size={14} className="text-[var(--accent-gold)] group-hover:translate-x-1 transition-transform" />
                   </div>
                </SurfaceCard>
             ) : (
                <SurfaceCard padding="lg" className="opacity-50">
                   <p className="text-center font-mono text-[10px] font-bold text-[#3C3C3C]">AGENDA_LIVRE</p>
                </SurfaceCard>
             )}
          </Section>

        </div>
      </div>
    </ScreenContainer>
  );
});
