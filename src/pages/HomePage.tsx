import React, { memo, useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Target, 
  Users, 
  DollarSign, 
  Zap, 
  Clock, 
  Calendar, 
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Send,
  Sparkles,
  Phone,
  CheckCircle2,
  Receipt
} from "lucide-react";
import { cn } from '../utils/ui';
import { workOrderQueryService } from '../services/WorkOrderQueryService';
import { professionalProfileService } from '../services/professionalProfileService';
import { BusinessHealthService, BusinessHealth } from '../services/BusinessHealthService';
import { SimpleFinanceService } from '../services/SimpleFinanceService';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { clientService } from '../services/clientService';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { SimpleFinanceRecord } from '../domain/finance';
import { WorkOrder, Client } from '../core/types/business';
import { ScreenContainer, SurfaceCard, OpsChip } from '../ui/system';
import { formatCurrencyBRL, safeMoneyValue } from '../utils/formatters';
import { useCloudSyncState } from '../hooks/useCloudSyncState';
import { openWhatsApp } from '../utils/mobility';

interface HomePageProps {
  onNavigate: (tab: any) => void;
}

interface HomeCockpitData {
  profileName: string;
  health: BusinessHealth;
  toReceive: number;
  toReceiveCount: number;
  potentialRevenue: number;
  potentialRevenueCount: number;
  openOSCount: number;
  todayOSCount: number;
  todayScheduledWOs: WorkOrder[];
  pendingBudgets: Budget[];
  recentClients: Client[];
  urgentDebts: SimpleFinanceRecord[];
}

// Sentinel de UI — estado zerado que permite render imediato sem spinner bloqueante.
// Os valores reais hidratam via Promise.all no background; nenhuma tela em branco é exibida.
const EMPTY_COCKPIT: HomeCockpitData = {
  profileName: '',
  health: {
    status: 'healthy', title: '...', reasons: [],
    osDelayedCount: 0, pendingPaymentsCount: 0, unansweredBudgetsCount: 0,
    revenueTrend: 'stable', revenueThisMonth: 0, metaAtingidaPercent: 0, totalReceivedToday: 0,
  },
  toReceive: 0, toReceiveCount: 0,
  potentialRevenue: 0, potentialRevenueCount: 0,
  openOSCount: 0, todayOSCount: 0,
  todayScheduledWOs: [], pendingBudgets: [], recentClients: [], urgentDebts: [],
};

/**
 * HomePage (V14.1 — P1/P2/P3): AUTHORITATIVE OPERATIONAL COCKPIT.
 * Conforms strictly to PRODUCT_HOME_HEADER_CONSTITUTION.md and Dark Premium V12.
 * Core Mandate: "Tudo gira em torno do orçamento".
 * P1: Sem spinner bloqueante — render imediato com EMPTY_COCKPIT, dados hidratam em background.
 * P2: SearchBar movida para abaixo do Hero Card.
 * P3: Card "Atenção" navega para 'money' se há pagamentos pendentes, 'budgets' caso contrário.
 */
export const HomePage = memo(function HomePage({ onNavigate }: HomePageProps) {
  const [data, setData] = useState<HomeCockpitData>(EMPTY_COCKPIT);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isOnline, pendingCount } = useCloudSyncState();

  const loadCockpitData = useCallback(async () => {
    try {
      const financeService = new SimpleFinanceService();
      const budgetPersistence = new BudgetPersistenceService();

      const [
        profile,
        health,
        allFinance,
        allBudgets,
        allClients,
        agenda
      ] = await Promise.all([
        professionalProfileService.getProfile(),
        BusinessHealthService.getBusinessHealth(),
        financeService.listRecords(),
        budgetPersistence.listBudgets(),
        clientService.getAll(),
        workOrderQueryService.getAgendaItems()
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);

      // 1. Contas a Receber (SimpleFinanceRecords não pagos de OS)
      const pendingFinance = allFinance.filter(f => f.status !== 'paid' && safeMoneyValue(f.openBalance) > 0);
      const toReceive = pendingFinance.reduce((acc, f) => acc + safeMoneyValue(f.openBalance), 0);
      const toReceiveCount = pendingFinance.length;
      const urgentDebts = pendingFinance.slice(0, 2);

      // 2. Receita Potencial (Propostas enviadas aguardando autorização)
      const waitingBudgets = allBudgets.filter(b => b.status === BUDGET_STATUS.ENVIADO);
      const potentialRevenue = waitingBudgets.reduce((acc, b) => acc + safeMoneyValue(b.chargedValue), 0);
      const potentialRevenueCount = waitingBudgets.length;

      // 3. Ordens de Serviço em Fluxo
      const openOSCount = agenda.awaiting.length + agenda.scheduled.length + agenda.inProgress.length;
      const todayScheduledWOs = agenda.scheduled.filter(wo => !wo.scheduledDate || wo.scheduledDate.startsWith(todayStr));
      const todayOSCount = todayScheduledWOs.length;

      // 4. Propostas Recentes / Aguardando
      const pendingBudgets = allBudgets
        .filter(b => [BUDGET_STATUS.ENVIADO, BUDGET_STATUS.INICIADO, BUDGET_STATUS.EM_REVISAO].includes(b.status as any))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
        .slice(0, 3);

      // 5. Clientes Recentes
      const recentClients = [...allClients]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
        .slice(0, 3);

      const profileName = profile?.professionalName?.split(' ')[0] || "Profissional";

      setData({
        profileName,
        health,
        toReceive,
        toReceiveCount,
        potentialRevenue,
        potentialRevenueCount,
        openOSCount,
        todayOSCount,
        todayScheduledWOs,
        pendingBudgets,
        recentClients,
        urgentDebts
      });
    } catch (err) {
      console.error("[HomePage] Failed to load cockpit data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCockpitData();
    // Revalidar dados quando o usuário retornar para a Home
    window.addEventListener('focus', loadCockpitData);
    return () => window.removeEventListener('focus', loadCockpitData);
  }, [loadCockpitData]);


  const nextOS = data.todayScheduledWOs[0];

  return (
    <div className="pb-36 bg-gradient-to-b from-[#2C2C2E] to-[#262628] text-white min-h-screen">
      <div className="px-5 pt-4 flex flex-col gap-5 max-w-md mx-auto w-full">
        
        {/* 1. HERO CARD — MISSÃO EM FOCO & CTA DO CORE MANDATE */}
        {/* P2: Hero primeiro — o operador vê a ação imediata antes de qualquer utilitário */}
        <div className={cn("bg-[#3A3A3C] border border-white/10 rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.16)] flex flex-col gap-4", loading && "animate-pulse")}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A]">
                <Target size={13} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Comando Operacional
              </span>
            </div>
            
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
              data.health.status === 'healthy' ? "text-[#30D158] bg-[#30D158]/10" :
              data.health.status === 'attention' ? "text-[#FFD60A] bg-[#FFD60A]/10" :
              "text-[#FF453A] bg-[#FF453A]/10"
            )}>
              {data.health.title}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-[26px] font-black text-white font-mono leading-tight tracking-tight">
              {data.todayOSCount > 0 ? `${data.todayOSCount} OS para Hoje` : 'Agenda Livre'}
            </h1>
            <p className="text-[13px] text-[#C7C7CC] leading-relaxed">
              {nextOS 
                ? `Próxima: ${nextOS.title}` 
                : 'Nenhum chamado pendente agora. Ideal para fechar novos orçamentos.'}
            </p>
          </div>

          {/* CTA PRINCIPAL — Alinhado estritamente ao Core Mandate: "+ NOVO ATENDIMENTO / ORÇAMENTO" */}
          <button
            type="button"
            onClick={() => onNavigate('new-budget')}
            className="w-full min-h-[52px] py-3.5 px-4 bg-white text-[#2C2C2E] font-bold text-[14px] rounded-full active:scale-[0.975] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-1 select-none"
          >
            <Plus size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="text-center tracking-tight">NOVO ATENDIMENTO / ORÇAMENTO</span>
          </button>
        </div>

        {/* 2. BUSCA TÁTICA SLIM (Estilo ChatGPT iOS - Dark Premium V12) */}
        {/* P2: Movida para cá — utilitário abaixo da ação principal */}
        <div className="bg-[#3A3A3C] border border-white/5 h-12 rounded-[14px] px-4 text-white w-full flex items-center gap-3 shadow-sm">
          <Search size={17} className="text-[#8E8E93] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                onNavigate({ tab: 'relationships', query: searchQuery });
              }
            }}
            placeholder="Buscar cliente, serviço, orçamento..."
            className="w-full bg-transparent text-[14px] outline-none border-none p-0 m-0 placeholder:text-[#8E8E93] text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-[#8E8E93] hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* 3. PAINEL DE LIQUIDEZ E ATENÇÃO (Grid 2x2 Dark Premium #363638) */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* A Receber */}
          <div 
            onClick={() => onNavigate('money')}
            className="bg-[#363638] border border-white/5 rounded-[18px] p-4 flex flex-col gap-1 shadow-sm cursor-pointer hover:border-white/10 active:scale-[0.98] transition-all"
            title="Abrir Financeiro & Caixa"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">A Receber</span>
              <ArrowUpRight size={14} className="text-[#30D158]" />
            </div>
            <span className="text-[18px] font-mono font-bold text-[#30D158] my-0.5 truncate">
              {formatCurrencyBRL(data.toReceive)}
            </span>
            <span className="text-[10px] text-[#8E8E93] font-medium">
              {data.toReceiveCount} {data.toReceiveCount === 1 ? 'pendência' : 'pendências'}
            </span>
          </div>

          {/* Receita Potencial */}
          <div 
            onClick={() => onNavigate('budgets')}
            className="bg-[#363638] border border-white/5 rounded-[18px] p-4 flex flex-col gap-1 shadow-sm cursor-pointer hover:border-white/10 active:scale-[0.98] transition-all"
            title="Abrir Pipeline de Orçamentos"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Potencial</span>
              <TrendingUp size={14} className="text-[#FFD60A]" />
            </div>
            <span className="text-[18px] font-mono font-bold text-[#FFD60A] my-0.5 truncate">
              {formatCurrencyBRL(data.potentialRevenue)}
            </span>
            <span className="text-[10px] text-[#8E8E93] font-medium">
              {data.potentialRevenueCount} {data.potentialRevenueCount === 1 ? 'proposta enviada' : 'propostas enviadas'}
            </span>
          </div>

          {/* OS em Andamento */}
          <div 
            onClick={() => onNavigate('agenda')}
            className="bg-[#363638] border border-white/5 rounded-[18px] p-4 flex flex-col gap-1 shadow-sm cursor-pointer hover:border-white/10 active:scale-[0.98] transition-all"
            title="Abrir Agenda Operacional"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">OS em Fluxo</span>
              <Calendar size={14} className="text-white/60" />
            </div>
            <span className="text-[18px] font-mono font-bold text-white my-0.5">
              {data.openOSCount}
            </span>
            <span className="text-[10px] text-[#8E8E93] font-medium">
              {data.todayOSCount} agendadas hoje
            </span>
          </div>

          {/* Saúde & Follow-ups */}
          {/* P3: navega para 'money' se há pagamentos pendentes, 'budgets' se há orçamentos sem resposta */}
          <div 
            onClick={() => onNavigate(data.health.pendingPaymentsCount > 0 ? 'money' : 'budgets')}
            className="bg-[#363638] border border-white/5 rounded-[18px] p-4 flex flex-col gap-1 shadow-sm cursor-pointer hover:border-white/10 active:scale-[0.98] transition-all"
            title={data.health.pendingPaymentsCount > 0 ? 'Ver Financeiro' : 'Ver Ações Prioritárias'}
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Atenção</span>
              <AlertTriangle size={14} className={data.health.reasons.length > 0 ? "text-[#FFD60A]" : "text-[#30D158]"} />
            </div>
            <span className="text-[18px] font-mono font-bold text-white my-0.5">
              {data.health.unansweredBudgetsCount + data.health.pendingPaymentsCount}
            </span>
            <span className="text-[10px] text-[#8E8E93] font-medium truncate">
              {data.health.reasons[0] || 'Tudo em dia'}
            </span>
          </div>
        </div>

        {/* 4. SEÇÃO: AGENDA OPERACIONAL DE HOJE */}
        <div className="bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">
          <div className="p-4 px-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#30D158]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Agenda de Hoje
              </span>
            </div>
            <button 
              onClick={() => onNavigate('agenda')} 
              className="text-[11px] font-bold text-[#FFD60A] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          <div className="flex flex-col">
            {data.todayScheduledWOs.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-[13px] font-bold text-white">Nenhum chamado agendado para hoje</span>
                <span className="text-[11px] text-[#8E8E93]">Sua agenda está livre para novos serviços ou propostas.</span>
              </div>
            ) : (
              data.todayScheduledWOs.slice(0, 3).map((wo, idx) => (
                <div 
                  key={wo.id}
                  onClick={() => onNavigate({ tab: 'operations', workOrderId: wo.id })}
                  className={cn(
                    "p-4 px-5 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer",
                    idx !== Math.min(data.todayScheduledWOs.length, 3) - 1 && "border-b border-white/5"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-[14px] font-bold text-white leading-tight truncate">
                      {wo.title}
                    </span>
                    <span className="text-[11px] text-[#8E8E93] truncate mt-0.5">
                      {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário livre'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-[#8E8E93] shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. SEÇÃO: ORÇAMENTOS & PROPOSTAS EM ANDAMENTO */}
        <div className="bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">
          <div className="p-4 px-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-[#FFD60A]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Propostas Aguardando
              </span>
            </div>
            <button 
              onClick={() => onNavigate('budgets')} 
              className="text-[11px] font-bold text-[#FFD60A] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Pipeline
            </button>
          </div>

          <div className="flex flex-col">
            {data.pendingBudgets.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
                  <FileText size={20} />
                </div>
                <span className="text-[13px] font-bold text-white">Nenhum orçamento pendente</span>
                <span className="text-[11px] text-[#8E8E93]">Crie uma nova proposta para alimentar seu fluxo de caixa.</span>
              </div>
            ) : (
              data.pendingBudgets.map((b, idx) => (
                <div 
                  key={b.id}
                  onClick={() => onNavigate({ tab: 'revenue', budgetId: b.id })}
                  className={cn(
                    "p-4 px-5 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer",
                    idx !== data.pendingBudgets.length - 1 && "border-b border-white/5"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-[14px] font-bold text-white leading-tight truncate">
                      {b.title || 'Orçamento sem título'}
                    </span>
                    <span className="text-[11px] text-[#8E8E93] truncate mt-0.5">
                      {b.clientName || 'Cliente'} • {b.status === BUDGET_STATUS.ENVIADO ? 'Enviado' : 'Em elaboração'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[14px] font-mono font-bold text-[#FFD60A]">
                      {formatCurrencyBRL(b.chargedValue || 0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. SEÇÃO: CLIENTES RECENTES (Atalho 1-Toque) */}
        <div className="bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">
          <div className="p-4 px-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-[#30D158]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Clientes Recentes
              </span>
            </div>
            <button 
              onClick={() => onNavigate('relationships')} 
              className="text-[11px] font-bold text-[#FFD60A] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Ver Base
            </button>
          </div>

          <div className="flex flex-col">
            {data.recentClients.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93]">
                  <Users size={20} />
                </div>
                <span className="text-[13px] font-bold text-white">Nenhum cliente cadastrado</span>
                <span className="text-[11px] text-[#8E8E93]">Clientes são cadastrados automaticamente ao criar propostas.</span>
              </div>
            ) : (
              data.recentClients.map((c, idx) => (
                <div 
                  key={c.id}
                  onClick={() => onNavigate({ tab: 'relationships', clientId: c.id })}
                  className={cn(
                    "p-4 px-5 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer",
                    idx !== data.recentClients.length - 1 && "border-b border-white/5"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[13px] font-bold text-white shrink-0 uppercase">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-bold text-white leading-tight truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-[#8E8E93] truncate mt-0.5">
                        {c.phone ? `WhatsApp: ${c.phone}` : 'Cadastrado'}
                      </span>
                    </div>
                  </div>

                  {c.phone && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp(c.phone || '', `Olá ${c.name}! Aqui é ${data.profileName} da equipe técnica. Como podemos ajudar hoje?`);
                      }}
                      className="w-8 h-8 rounded-[10px] bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] active:scale-90 transition-all shrink-0"
                      title="Abrir WhatsApp"
                    >
                      <Send size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
});
