import { memo, useState, useEffect } from "react";
import type { AppTab } from "../appTypes";
import { ScreenContainer, Title, Body, AppHeader, SurfaceCard, SectionLabel, OpsChip, Stack, Section, FinancialValue } from '../../ui/system';
import { db } from '../../storage/dexieDatabase';
import { Target, AlertTriangle, TrendingUp, CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from '../../utils/ui';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  account?: any;
}

export const HomeScreen = memo(function HomeScreen({
  onNavigate,
  account,
}: HomeScreenProps) {
  const [metrics, setMetrics] = useState({
    revenueToday: 0,
    osPending: 0,
    osDoneToday: 0,
    osDelayed: 0
  });

  useEffect(() => {
    async function loadMetrics() {
      const wos = await db.workOrders.toArray();
      const todayStr = new Date().toISOString().slice(0,10);
      
      let revenue = 0;
      let pending = 0;
      let doneToday = 0;
      let delayed = 0;

      for (const wo of wos) {
        // Very basic approximations for the dashboard
        if (wo.status === 'in-progress' || wo.status === 'draft') pending++;
        if (wo.status === 'done') {
          if (wo.updatedAt?.startsWith(todayStr)) {
            doneToday++;
            revenue += (wo.executedValue || 0);
          }
        }
        // simulate delayed
        if (wo.status === 'scheduled' && wo.scheduledTo && wo.scheduledTo < todayStr) {
           delayed++;
        }
      }

      setMetrics({ revenueToday: revenue, osPending: pending, osDoneToday: doneToday, osDelayed: delayed });
    }
    loadMetrics();
  }, []);

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      
      <AppHeader title="Aferix Pulse." />
      
      <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* REVENUE HERO */}
        <Section className="gap-4">
          <div onClick={() => onNavigate('money')} className="cursor-pointer relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop hover:brightness-110 transition-all">
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)]">RECEITA HOJE</span>
              <div className="flex items-baseline justify-between mt-1">
                <FinancialValue value={metrics.revenueToday} className="text-[32px] font-black text-white leading-none tracking-tight" />
              </div>
            </div>
          </div>
        </Section>

        {/* METRICS GRID */}
        <Section className="gap-4">
           <SectionLabel>Saúde da Operação</SectionLabel>
           <div className="grid grid-cols-2 gap-4">
              
              <SurfaceCard padding="lg" onClick={() => onNavigate('base')} className="cursor-pointer hover:bg-white/[0.04]">
                 <div className="flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
                       <Target size={14} className="text-[var(--accent-gold)]" />
                    </div>
                    <div>
                       <div className="text-[24px] font-black font-mono text-white leading-none">{metrics.osPending}</div>
                       <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Pendentes</div>
                    </div>
                 </div>
              </SurfaceCard>

              <SurfaceCard padding="lg" onClick={() => onNavigate('base')} className="cursor-pointer hover:bg-white/[0.04]">
                 <div className="flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center">
                       <CheckCircle2 size={14} className="text-[var(--accent-green)]" />
                    </div>
                    <div>
                       <div className="text-[24px] font-black font-mono text-white leading-none">{metrics.osDoneToday}</div>
                       <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Concluídas Hoje</div>
                    </div>
                 </div>
              </SurfaceCard>

              <SurfaceCard padding="lg" onClick={() => onNavigate('attendances')} className="col-span-2 cursor-pointer hover:bg-white/[0.04] border-[var(--accent-red)]/20 bg-[var(--accent-red)]/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center">
                          <AlertTriangle size={18} className="text-[var(--accent-red)]" />
                       </div>
                       <div>
                          <div className="text-[24px] font-black font-mono text-[var(--accent-red)] leading-none">{metrics.osDelayed}</div>
                          <div className="text-[10px] font-bold text-[var(--accent-red)]/60 uppercase tracking-wider mt-1">Ordens Atrasadas</div>
                       </div>
                    </div>
                    <div className="text-[10px] text-[var(--accent-red)] font-bold uppercase tracking-widest bg-[var(--accent-red)]/10 px-3 py-1.5 rounded-lg">VER_AGENDA</div>
                 </div>
              </SurfaceCard>

           </div>
        </Section>
        
        {/* SHORTCUTS */}
        <Section className="gap-4">
           <SectionLabel>Ações Rápidas</SectionLabel>
           <SurfaceCard padding="none">
             <Stack className="gap-0">
               <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between active:bg-white/5" onClick={() => onNavigate('new-quick-service')}>
                  <div className="flex items-center gap-3">
                     <Target size={16} className="text-[var(--accent-gold)]" />
                     <Body className="text-[13px] font-bold uppercase tracking-wide">Nova OS Expressa</Body>
                  </div>
               </div>
               <div className="px-4 py-4 flex items-center justify-between active:bg-white/5" onClick={() => onNavigate('new-budget')}>
                  <div className="flex items-center gap-3">
                     <TrendingUp size={16} className="text-white/60" />
                     <Body className="text-[13px] font-bold uppercase tracking-wide text-white/80">Novo Orçamento (Longo)</Body>
                  </div>
               </div>
             </Stack>
           </SurfaceCard>
        </Section>

      </div>
    </ScreenContainer>
  );
});
