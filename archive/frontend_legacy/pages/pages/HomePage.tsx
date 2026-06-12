import React, { memo, useState, useEffect } from "react";
import { 
  Plus,
  Menu,
  Search,
  ChevronRight,
  Target,
  Users,
  DollarSign,
  Zap,
  Clock,
  Calendar,
  FileText
} from "lucide-react";
import { cn } from '../utils/ui';
import { db } from '../storage/dexieDatabase';
import { workOrderQueryService } from '../services/WorkOrderQueryService';
import { professionalProfileService } from '../services/professionalProfileService';
import { BUDGET_STATUS } from '../domain/budget';
import { ScreenContainer, AppHeader, SurfaceCard } from '../ui/system';
import { AferixCard } from '../components/AferixCard';
import { AferixButton } from '../components/AferixButton';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

/**
 * HomePage (V13.0): UNIFIED OPERATIONAL PANEL.
 * High-density architecture with group containers.
 * Professional technical field software aesthetic.
 */
export const HomePage = memo(function HomePage({ onNavigate }: HomePageProps) {
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [agenda, budgets, finance, prof, recentClients] = await Promise.all([
          workOrderQueryService.getAgendaItems(),
          db.budgets.toArray(),
          db.simpleFinanceRecords.toArray(),
          professionalProfileService.getProfile(),
          db.clients.orderBy('updatedAt').reverse().limit(3).toArray()
        ]);

        setProfile(prof);

        // Metrics Calculation
        const potentialRevenue = budgets
          .filter(b => b.status === BUDGET_STATUS.ENVIADO)
          .reduce((acc, b) => acc + (b.totalValue || 0), 0);
        const potentialRevenueCount = budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO).length;
        
        const toReceive = finance
          .filter(f => f.status === 'pending')
          .reduce((acc, f) => acc + (f.value || 0), 0);
        const toReceiveCount = finance.filter(f => f.status === 'pending').length;
        
        const openOSCount = agenda.awaiting.length + agenda.scheduled.length + agenda.inProgress.length;
        const todayOSCount = agenda.scheduled.filter(wo => wo.scheduledDate?.startsWith(todayStr)).length;
        
        const pendingBudgets = budgets
          .filter(b => b.status === BUDGET_STATUS.ENVIADO || b.status === BUDGET_STATUS.RASCUNHO)
          .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime())
          .slice(0, 3);
        
        const followUpsCount = budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO).length + 
                               finance.filter(f => f.status === 'overdue').length;
        const overdueCount = finance.filter(f => f.status === 'overdue').length;

        setData({
          potentialRevenue,
          potentialRevenueCount,
          toReceive,
          toReceiveCount,
          openOSCount,
          todayOSCount,
          followUpsCount,
          overdueCount,
          syncStatus: 'ONLINE',
          recentClients,
          upcomingAppointments: agenda.scheduled.slice(0, 3),
          pendingBudgets
        });
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading || !data) {
    return (
      <ScreenContainer className="bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-[14px] bg-white/5 border border-white/10 animate-pulse" />
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Operacional Inicia...</span>
        </div>
      </ScreenContainer>
    );
  }

  const profileName = profile?.professionalName?.split(' ')[0] || "Mateus";

  return (
    <ScreenContainer className="bg-[#0A0A0A] pb-40">
        <AppHeader title="INÍCIO" notificationCount={4} onMenuToggle={() => window.dispatchEvent(new Event('aferix_open_menu'))} />
      {/* 1. HEADER - Identity Panel */}
      <div className="px-6 pt-14 pb-5 flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#14161A] to-[#2C323A] border border-white/10 flex items-center justify-center text-[18px] font-black text-[var(--accent-gold)] shadow-xl">
            {profileName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-black text-white tracking-tight leading-none">{profileName}</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#47C46A]/10 border border-[#47C46A]/20">
                <div className="w-1 h-1 rounded-full bg-[#47C46A]" />
                <span className="text-[8px] font-black text-[#47C46A] uppercase tracking-widest">{data.syncStatus}</span>
              </div>
            </div>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">SISTEMA OPERACIONAL</span>
          </div>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new Event('aferix_open_menu'))} 
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </div>

      {/* 2. GLOBAL SEARCH PANEL */}
      <div className="px-6 mb-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar cliente, OS, orçamento..."
            className="w-full h-14 bg-[#14161A] border border-white/[0.05] rounded-[16px] pl-12 pr-4 text-[14px] text-white font-medium placeholder:text-white/20 focus:outline-none focus:border-[var(--accent-gold)]/30 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="px-6 flex flex-col gap-6">
        
        {/* 3. MISSÃO EM FOCO - Tactical Container */}
        <AferixCard variant="b" padding="lg" className="flex flex-col gap-6 !rounded-[24px] !bg-[#14161A] border border-white/[0.06] relative overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)' }}>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-[var(--accent-gold)]" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Comando Operacional</span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-black text-white tracking-tight leading-[1.1]">
              {data.openOSCount > 0 ? `${data.openOSCount} OS pendentes` : "Nenhuma OS pendente"}
            </h1>
            <p className="text-[14px] text-white/40 font-medium tracking-tight">
              {data.todayOSCount > 0 ? `${data.todayOSCount} agendadas para hoje.` : "Agenda livre para novos chamados."}
            </p>
          </div>

          <AferixButton 
            className="w-[85%] h-14 mx-auto !rounded-[16px] text-[15px] font-semibold uppercase active:scale-95 transition-all aferix-home-primary-btn"
            onClick={() => onNavigate('new-budget')}
          >
            NOVA ORDEM DE SERVIÇO
          </AferixButton>
        </AferixCard>

        {/* 4. UNIFIED INDICATORS PANEL (2x2 Grid with Internal Borders) */}
        <div className="bg-[#14161A] border border-white/[0.05] rounded-[24px] overflow-hidden flex flex-col">
          <div className="px-6 pt-5 pb-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Painel de Indicadores</span>
          </div>
          <div className="grid grid-cols-2">
            {/* Receita Potencial */}
            <div className="p-6 border-r border-b border-white/[0.03] flex flex-col gap-1 active:bg-white/[0.02] transition-colors">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Receita Potencial</span>
              <span className="text-[22px] font-bold text-[#FFB340] font-mono leading-none tracking-tighter my-1">
                {formatCurrency(data.potentialRevenue)}
              </span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{data.potentialRevenueCount} propostas</span>
            </div>

            {/* A Receber */}
            <div className="p-6 border-b border-white/[0.03] flex flex-col gap-1 active:bg-white/[0.02] transition-colors">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">A Receber</span>
              <span className="text-[22px] font-bold text-[#47C46A] font-mono leading-none tracking-tighter my-1">
                {formatCurrency(data.toReceive)}
              </span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{data.toReceiveCount} cobranças</span>
            </div>

            {/* OS em Fluxo */}
            <div className="p-6 border-r border-white/[0.03] flex flex-col gap-1 active:bg-white/[0.02] transition-colors">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">OS em Fluxo</span>
              <span className="text-[22px] font-bold text-white font-mono leading-none tracking-tighter my-1">
                {data.openOSCount}
              </span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{data.todayOSCount} hoje</span>
            </div>

            {/* Follow Ups */}
            <div className="p-6 flex flex-col gap-1 active:bg-white/[0.02] transition-colors">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Follow Ups</span>
              <span className="text-[22px] font-bold text-white font-mono leading-none tracking-tighter my-1">
                {data.followUpsCount}
              </span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{data.overdueCount} vencidos</span>
            </div>
          </div>
        </div>

        {/* 5. UNIFIED MODULE LISTS */}
        
        {/* CLIENTES RECENTES PANEL */}
        <div className="bg-[#14161A] border border-white/[0.05] rounded-[24px] overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex justify-between items-center border-b border-white/[0.03]">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-white/40" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Clientes Recentes</span>
            </div>
            <button onClick={() => onNavigate('relationships')} className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-widest">Acessar Base</button>
          </div>
          <div className="flex flex-col">
             {data.recentClients.length > 0 ? data.recentClients.map((client: any, i: number) => (
               <div 
                 key={client.id} 
                 className={cn(
                   "p-4 px-6 flex items-center justify-between active:bg-white/[0.02] transition-colors cursor-pointer",
                   i !== data.recentClients.length - 1 && "border-b border-white/[0.03]"
                 )} 
                 onClick={() => onNavigate({ tab: 'relationships', clientId: client.id })}
               >
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[12px] font-bold text-white/30 border border-white/5 uppercase">
                     {client.name.charAt(0)}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[14px] font-bold text-white tracking-tight leading-none">{client.name}</span>
                     <span className="text-[10px] text-white/20 font-medium mt-1">Contato há {Math.floor((Date.now() - new Date(client.updatedAt || '').getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                   </div>
                 </div>
                 <ChevronRight size={14} className="text-white/10" />
               </div>
             )) : (
               <div className="p-6 flex items-center gap-4">
                 <Users size={16} className="text-white/10" />
                 <span className="text-[12px] text-white/20 font-medium">Nenhum cliente recente na base.</span>
               </div>
             )}
          </div>
        </div>

        {/* AGENDA OPERACIONAL PANEL */}
        <div className="bg-[#14161A] border border-white/[0.05] rounded-[24px] overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex justify-between items-center border-b border-white/[0.03]">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-white/40" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Agenda Operacional</span>
            </div>
            <button onClick={() => onNavigate('agenda')} className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-widest">Abrir Agenda</button>
          </div>
          <div className="flex flex-col">
             {data.upcomingAppointments.length > 0 ? data.upcomingAppointments.map((wo: any, i: number) => (
               <div 
                 key={wo.id} 
                 className={cn(
                   "p-4 px-6 flex flex-col gap-2 active:bg-white/[0.02] transition-colors cursor-pointer",
                   i !== data.upcomingAppointments.length - 1 && "border-b border-white/[0.03]"
                 )} 
                 onClick={() => onNavigate({ tab: 'operations', workOrderId: wo.id })}
               >
                 <div className="flex justify-between items-start">
                    <span className="text-[14px] font-bold text-white tracking-tight leading-tight truncate pr-4">{wo.title}</span>
                    <span className="text-[10px] font-mono font-bold text-white/50">
                      {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                 </div>
                 <div className="flex items-center gap-2 opacity-40">
                    <div className="w-1 h-1 rounded-full bg-[var(--accent-gold)]" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-widest">Local sob atendimento</span>
                 </div>
               </div>
             )) : (
               <div className="p-6 flex items-center gap-4">
                 <Calendar size={16} className="text-white/10" />
                 <span className="text-[12px] text-white/20 font-medium">Sem compromissos agendados para hoje.</span>
               </div>
             )}
          </div>
        </div>

        {/* ORÇAMENTOS AGUARDANDO PANEL */}
        <div className="bg-[#14161A] border border-white/[0.05] rounded-[24px] overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex justify-between items-center border-b border-white/[0.03]">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-white/40" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Orçamentos Aguardando</span>
            </div>
            <button onClick={() => onNavigate('budgets')} className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-widest">Pipeline</button>
          </div>
          <div className="flex flex-col">
             {data.pendingBudgets.length > 0 ? data.pendingBudgets.map((budget: any, i: number) => (
               <div 
                 key={budget.id} 
                 className={cn(
                   "p-4 px-6 flex items-center justify-between active:bg-white/[0.02] transition-colors cursor-pointer",
                   i !== data.pendingBudgets.length - 1 && "border-b border-white/[0.03]"
                 )} 
                 onClick={() => onNavigate({ tab: 'revenue', budgetId: budget.id })}
               >
                 <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <span className="text-[14px] font-bold text-white tracking-tight truncate leading-none">{budget.title || 'Sem Título'}</span>
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">Enviado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')}</span>
                 </div>
                 <span className="text-[14px] font-bold text-[var(--accent-gold)] font-mono leading-none whitespace-nowrap">{formatCurrency(budget.totalValue || 0)}</span>
               </div>
             )) : (
               <div className="p-6 flex items-center gap-4">
                 <FileText size={16} className="text-white/10" />
                 <span className="text-[12px] text-white/20 font-medium">Nenhum orçamento pendente.</span>
               </div>
             )}
          </div>
        </div>

      </div>
    </ScreenContainer>
  );
});
