import { memo, useState, useEffect } from "react";
import type { AppTab } from "../appTypes";
import { ScreenContainer, Title, Body, AppHeader, SurfaceCard, SectionLabel, OpsChip, Stack, Section, FinancialValue } from '../../ui/system';
import { db } from '../../storage/dexieDatabase';
import { workOrderQueryService } from '../../services/WorkOrderQueryService';
import { Target, AlertTriangle, TrendingUp, CalendarDays, CheckCircle2, Users, Zap, Play, DollarSign, Plus, ChevronRight } from "lucide-react";
import { cn } from '../../utils/ui';
import { BusinessHealthService, BusinessHealth } from '../../services/BusinessHealthService';
import { formatCurrencyBRL } from '../../utils/formatters';
import { BUDGET_STATUS } from '../../domain/budget';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  account?: any;
  role?: string;
}

/**
 * HomeScreen (Decision Command Center): The central intelligence hub.
 * Refactored for SOLO UX Hardening (V4).
 */
export const HomeScreen = memo(function HomeScreen({
  onNavigate,
  account,
  role,
}: HomeScreenProps) {
  const [metrics, setMetrics] = useState({
    revenueToday: 0,
    osPending: 0,
    osDoneToday: 0,
    osDelayed: 0,
    teamSize: 0,
    pendingPayments: 0,
    unansweredBudgets: 0
  });
  const [health, setHealth] = useState<BusinessHealth | null>(null);
  const [nextActionOS, setNextActionOS] = useState<any | null>(null);
  const [nextActionClient, setNextActionClient] = useState<any | null>(null);
  const [frequentClients, setFrequentClients] = useState<Array<{ id: string; name: string; phone?: string; totalServices: number; totalRevenue: number; lastDate?: string }>>([]);

  const isSolo = role === 'SOLO';

  useEffect(() => {
    async function loadMetrics() {
      const [agenda, route, team, healthData, budgets, finance, clients] = await Promise.all([
        workOrderQueryService.getAgendaItems(),
        workOrderQueryService.getTodayRoute(),
        db.teamMembers.toArray(),
        BusinessHealthService.getBusinessHealth(),
        db.budgets.toArray(),
        db.simpleFinanceRecords.toArray(),
        db.clients.toArray()
      ]);
      
      const todayStr = new Date().toISOString().slice(0, 10);
      const pending = agenda.inProgress.length + agenda.awaiting.length;
      const doneToday = route.doneToday.length;
      const revenue = route.doneToday.reduce((sum, wo) => sum + (wo.executedValue || 0), 0);
      const delayed = agenda.scheduled.filter(wo => wo.scheduledDate && wo.scheduledDate < todayStr).length;

      const unansweredCount = budgets.filter(b => 
        ([BUDGET_STATUS.INICIADO, BUDGET_STATUS.ENVIADO, BUDGET_STATUS.EM_REVISAO] as string[]).includes(b.status)
      ).length;

      const pendingCount = finance.filter(r => r.status !== 'paid').length;

      const allWOs = await workOrderQueryService.getAllValid();
      const activeWOs = allWOs.filter(wo => 
        ['awaiting_schedule', 'scheduled', 'in-progress'].includes(wo.status)
      );
      
      const sortedWOs = [...activeWOs].sort((a, b) => {
        if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
        if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return a.scheduledDate.localeCompare(b.scheduledDate);
      });

      const nextOS = sortedWOs[0] || null;
      let nextClient = null;
      if (nextOS) {
        nextClient = clients.find(c => c.id === nextOS.clientId) || null;
      }

      setMetrics({ 
        revenueToday: revenue, 
        osPending: pending, 
        osDoneToday: doneToday, 
        osDelayed: delayed,
        teamSize: team.length,
        pendingPayments: pendingCount,
        unansweredBudgets: unansweredCount
      });
      setNextActionOS(nextOS);
      setNextActionClient(nextClient);
      setHealth(healthData);

      // Frequent Clients calculation — Fase 5
      const allWOsFull = await workOrderQueryService.getAllValid();
      const clientServiceCount: Record<string, { count: number; revenue: number; lastDate?: string; name: string; phone?: string }> = {};
      for (const wo of allWOsFull) {
        if (!wo.clientId) continue;
        const c = clients.find(cl => cl.id === wo.clientId);
        if (!c || c.syncStatus === 'deleted') continue;
        if (!clientServiceCount[wo.clientId]) {
          clientServiceCount[wo.clientId] = { count: 0, revenue: 0, name: c.name, phone: c.phone };
        }
        clientServiceCount[wo.clientId].count++;
        clientServiceCount[wo.clientId].revenue += wo.executedValue || 0;
        const woDate = wo.scheduledDate || wo.updatedAt;
        if (woDate && (!clientServiceCount[wo.clientId].lastDate || woDate > clientServiceCount[wo.clientId].lastDate!)) {
          clientServiceCount[wo.clientId].lastDate = woDate;
        }
      }
      const sorted = Object.entries(clientServiceCount)
        .sort((a, b) => (b[1].count - a[1].count) || (b[1].revenue - a[1].revenue))
        .slice(0, 5)
        .map(([id, data]) => ({ id, name: data.name, phone: data.phone, totalServices: data.count, totalRevenue: data.revenue, lastDate: data.lastDate }));
      setFrequentClients(sorted);
    }
    loadMetrics();
  }, []);

  return (
    <ScreenContainer className="pb-32 bg-[var(--bg-primary)]">
      
      <AppHeader 
        title={isSolo ? "Meu Negócio." : "Aferix Pulse."} 
        subtitle={isSolo ? "Radar do Negócio" : undefined}
        action={isSolo ? (
          <button 
            onClick={() => onNavigate('settings')} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/10 active:scale-95 transition-all text-white/60 cursor-pointer"
            title="Menu"
          >
            <ChevronRight size={18} />
          </button>
        ) : undefined}
      />
      
      <div className="px-6 py-8 flex flex-col gap-6">

        {/* =========================================
            SOLO OPERATIONAL COMMAND CENTER
        =========================================== */}
        {isSolo && health && (
          <Section>
            <div className={cn(
              "w-full rounded-[24px] p-5 border transition-all relative overflow-hidden",
              health.status === 'healthy' && "bg-[var(--accent-green)]/5 border-[var(--accent-green)]/20 text-[var(--accent-green)] shadow-[0_4px_20px_rgba(34,197,94,0.05)]",
              health.status === 'attention' && "bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20 text-[var(--accent-gold)] shadow-[0_4px_20px_rgba(255,200,0,0.05)]",
              health.status === 'critical' && "bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20 text-[var(--accent-red)] shadow-[0_4px_20px_rgba(239,68,68,0.05)]"
            )}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-xl rounded-full bg-white pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  health.status === 'healthy' && "bg-[var(--accent-green)]",
                  health.status === 'attention' && "bg-[var(--accent-gold)]",
                  health.status === 'critical' && "bg-[var(--accent-red)]"
                )} />
                <span className="text-[9px] font-black font-mono tracking-[0.2em] uppercase opacity-75">Executive Health Radar</span>
              </div>
              
              <h2 className="text-[17px] font-black uppercase tracking-wider mb-2">
                {health.title}
              </h2>
              
              <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-white/5">
                {health.reasons.map((reason: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono font-medium">
                    <span className="opacity-90">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* HERO PRINCIPAL: PRÓXIMA AÇÃO */}
        {isSolo && (
          nextActionOS ? (
            <Section>
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1c2333] to-[#0e121a] border border-[var(--accent-gold)]/30 shadow-[0_0_24px_rgba(212,169,78,0.15)] p-6">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[var(--accent-gold)]/10 blur-[60px] pointer-events-none" />
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase">PRÓXIMA AÇÃO</span>
                  <div className="flex flex-col gap-1 mt-1">
                    <h3 className="text-xl font-black text-white leading-tight uppercase truncate">{nextActionOS.title}</h3>
                    <span className="text-xs text-[var(--text-secondary)] font-bold tracking-wide uppercase truncate">Cliente: {nextActionClient?.name || 'Cliente Avulso'}</span>
                    {nextActionOS.scheduledDate && (
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase mt-1">Agendamento: {new Date(nextActionOS.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => onNavigate('agenda')} 
                    className="w-full mt-4 py-3.5 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-[var(--glow-gold)] flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <Play size={12} className="fill-black" />
                    {nextActionOS.status === 'in-progress' ? 'CONTINUAR SERVIÇO' : 'INICIAR SERVIÇO'}
                  </button>
                </div>
              </div>
            </Section>
          ) : (
            <Section>
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#141924] to-[#080b11] border border-white/[0.08] p-6 text-center shadow-lg">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <CheckCircle2 size={24} className="text-[var(--accent-green)]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Tudo em dia</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Nenhuma ordem de serviço pendente no momento.</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('new-budget')} 
                    className="w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <Plus size={14} strokeWidth={3} />
                    NOVO ORÇAMENTO
                  </button>
                </div>
              </div>
            </Section>
          )
        )}

        {/* DECISION BOARD GRID FOR SOLO */}
        {isSolo && (
          <Section>
            <SectionLabel>Painel de Decisões</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              
              {/* OS Atrasadas */}
              <SurfaceCard padding="lg" onClick={() => onNavigate('agenda')} className={cn("cursor-pointer hover:bg-white/[0.04] transition-all border border-transparent min-h-[110px]", metrics.osDelayed > 0 ? "border-[var(--accent-red)]/35 bg-[var(--accent-red)]/5" : "opacity-80")}>
                <div className="flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center">
                    <AlertTriangle size={14} className={metrics.osDelayed > 0 ? "text-[var(--accent-red)]" : "text-white/40"} />
                  </div>
                  <div>
                    <div className={cn("text-[24px] font-black font-mono leading-none", metrics.osDelayed > 0 ? "text-[var(--accent-red)]" : "text-white")}>{metrics.osDelayed}</div>
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">OS ATRASADAS</div>
                  </div>
                </div>
              </SurfaceCard>

              {/* Propostas Sem Retorno */}
              <SurfaceCard padding="lg" onClick={() => onNavigate('budgets')} className={cn("cursor-pointer hover:bg-white/[0.04] transition-all border border-transparent min-h-[110px]", metrics.unansweredBudgets > 0 ? "border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/5" : "opacity-80")}>
                <div className="flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
                    <Target size={14} className={metrics.unansweredBudgets > 0 ? "text-[var(--accent-gold)]" : "text-white/40"} />
                  </div>
                  <div>
                    <div className="text-[24px] font-black font-mono text-white leading-none">{metrics.unansweredBudgets}</div>
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">AGUARDANDO RETORNO</div>
                  </div>
                </div>
              </SurfaceCard>

              {/* Recebimentos Pendentes */}
              <SurfaceCard padding="lg" onClick={() => onNavigate('money')} className={cn("cursor-pointer hover:bg-white/[0.04] transition-all border border-transparent min-h-[110px]", metrics.pendingPayments > 0 ? "border-[var(--accent-green)]/20 bg-[var(--accent-green)]/5" : "opacity-80")}>
                <div className="flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center">
                    <DollarSign size={14} className={metrics.pendingPayments > 0 ? "text-[var(--accent-green)]" : "text-white/40"} />
                  </div>
                  <div>
                    <div className="text-[24px] font-black font-mono text-white leading-none">{metrics.pendingPayments}</div>
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">RECEBIMENTOS EM ABERTO</div>
                  </div>
                </div>
              </SurfaceCard>

              {/* Faturamento Hoje */}
              <SurfaceCard padding="lg" onClick={() => onNavigate('money')} className="cursor-pointer hover:bg-white/[0.04] transition-all opacity-80 min-h-[110px]">
                <div className="flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <TrendingUp size={14} className="text-white/60" />
                  </div>
                  <div>
                    <div className="text-[18px] font-black font-mono text-white leading-none truncate">{formatCurrencyBRL(metrics.revenueToday)}</div>
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">FATURAMENTO HOJE</div>
                  </div>
                </div>
              </SurfaceCard>

            </div>
          </Section>
        )}

        {/* =========================================
            CORPORATE PULSE LAYOUT (UNCHANGED)
        =========================================== */}
        {!isSolo && (
          <>
            {/* REVENUE HERO */}
            <Section>
              <div onClick={() => onNavigate('money')} className="cursor-pointer relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_32px_rgba(212,169,78,0.06),0_20px_50px_rgba(0,0,0,0.9)] p-6 animate-scale-pop hover:brightness-110 transition-all">
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase">Faturamento Hoje</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <FinancialValue value={metrics.revenueToday} className="text-[32px] font-black text-white leading-none tracking-tight" />
                  </div>
                </div>
              </div>
            </Section>

            {/* METRICS GRID */}
            <Section>
               <SectionLabel>Saúde da Equipe</SectionLabel>
               <div className="grid grid-cols-2 gap-4">
                  <SurfaceCard padding="lg" onClick={() => onNavigate('base')} className="cursor-pointer hover:bg-white/[0.04]">
                     <div className="flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
                           <Target size={14} className="text-[var(--accent-gold)]" />
                        </div>
                        <div>
                           <div className="text-[24px] font-black font-mono text-white leading-none">{metrics.osPending}</div>
                           <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Em Aberto</div>
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
                           <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Concluídas</div>
                        </div>
                     </div>
                  </SurfaceCard>

                  <SurfaceCard padding="lg" onClick={() => onNavigate('team')} className="col-span-2 cursor-pointer hover:bg-white/[0.04] border-white/5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                              <Users size={18} className="text-white/60" />
                           </div>
                           <div>
                              <div className="text-[24px] font-black font-mono text-white leading-none">{metrics.teamSize}</div>
                              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Colaboradores Ativos</div>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-white/20" />
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
            
            {/* CLIENTES FREQUENTES — Fase 5 */}
            {frequentClients.length > 0 && (
              <Section>
                <SectionLabel>Clientes Frequentes</SectionLabel>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  {frequentClients.map(fc => (
                    <button
                      key={fc.id}
                      onClick={() => onNavigate('clients')}
                      className="shrink-0 flex flex-col gap-2 p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] active:scale-95 transition-all w-36 text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center">
                        <Users size={16} className="text-[var(--accent-gold)]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-black text-white leading-tight truncate">{fc.name}</span>
                        <span className="text-[9px] text-text-muted font-mono">{fc.totalServices} serv. · {formatCurrencyBRL(fc.totalRevenue)}</span>
                      </div>
                      {fc.lastDate && (
                        <span className="text-[8px] text-text-muted font-mono opacity-60">
                          {new Date(fc.lastDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* SHORTCUTS */}
            <Section>
               <SectionLabel>Minhas Ferramentas</SectionLabel>
               <SurfaceCard padding="none">
                 <Stack className="gap-0">
                   <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between active:bg-white/5 cursor-pointer" onClick={() => onNavigate('new-quick-service')}>
                      <div className="flex items-center gap-3">
                         <Target size={16} className="text-[var(--accent-gold)]" />
                         <Body className="text-[13px] font-bold uppercase tracking-wide">Nova OS Expressa</Body>
                      </div>
                   </div>
                   <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between active:bg-white/5 cursor-pointer" onClick={() => onNavigate('new-budget')}>
                      <div className="flex items-center gap-3">
                         <TrendingUp size={16} className="text-white/60" />
                         <Body className="text-[13px] font-bold uppercase tracking-wide text-white/80">Novo Orçamento Técnico</Body>
                      </div>
                   </div>
                   <div className="px-4 py-4 flex items-center justify-between active:bg-white/5 cursor-pointer" onClick={() => onNavigate('clients')}>
                      <div className="flex items-center gap-3">
                         <Users size={16} className="text-white/60" />
                         <Body className="text-[13px] font-bold uppercase tracking-wide text-white/80">Base de Clientes</Body>
                      </div>
                   </div>
                 </Stack>
               </SurfaceCard>
            </Section>
          </>
        )}

      </div>
    </ScreenContainer>
  );
});
