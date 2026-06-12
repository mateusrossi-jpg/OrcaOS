// src/app/screens/BudgetsScreen.tsx
import { useState, useMemo, memo, useEffect } from 'react';
import { cn } from '../../utils/ui';
import { openExternalGPS } from '../../utils/mobility';
import { Clock, Eye, MessageSquare, Target, TrendingUp, Zap, FileText, Download, Copy, Plus, Search, Users, ChevronRight } from "lucide-react";
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
// ── Unified UI Architecture ──────────────────────────────────────────────────
import {
  ScreenContainer,
  SurfaceCard,
  SectionLabel,
  StatusPill,
  ExecutiveHeader,
  OpsChip,
  InteractiveRow,
  Stack,
  Section,
  Subtitle,
  Body,
  Value,
  FinancialValue,
  ERPLoader,
  GlassSearchInput,
  HeroCard,
  ExecutiveSummaryGrid,
  ValueBlock
} from '../../ui/system';
import { FilterChips, PrimaryButton } from '../components/ui';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';
import { operationalReadModelService } from '../../services/operationalReadModelService';
import { clientProposalService } from '../../services/clientProposalService';
import { clientService } from '../../services/clientService';
import { siteService } from '../../services/siteService';
import { downloadCSV, generateFinanceCSV } from '../../utils/exportUtils';
import { operationalFacade } from '../../features/workflow/operationalFacade';
/* eslint-disable no-restricted-imports */
import { ClientProposal } from '../../features/clientPortal/storage/clientProposalStorage';
import { Client } from '../../domain/client';

interface BudgetsScreenProps {
  onSelectBudget: (budget: Budget) => void;
  onNewBudget: (type: 'quick' | 'project') => void;
}

const FILTER_ITEMS = [
  { id: 'all',                         label: 'TODOS'      },
  { id: 'viewed',                      label: 'VISUALIZADOS'},
  { id: BUDGET_STATUS.ENVIADO,         label: 'ENVIADOS'   },
  { id: BUDGET_STATUS.AUTORIZADO,      label: 'APROVADOS'  },
  { id: BUDGET_STATUS.FINALIZADO,      label: 'HISTÓRICO'  },
];

function formatCompactDate(dateStr: string | number | Date): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('pt-BR', { month: 'short' }).substring(0, 3).toUpperCase().replace('.', '');
  return `${day}.${month}`;
}

function getAgingText(dateStr?: string | number | Date): string {
  if (!dateStr) return '';
  try {
    const createdDate = new Date(dateStr);
    const now = new Date();
    createdDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `${diffDays}d atrás`;
  } catch (e) {
    return '';
  }
}

/**
 * BudgetsScreen: Sales Hub & Conversion Pipeline.
 * Refactored for absolute Home DNA parity (Phase 6 Hardening).
 */
export const BudgetsScreen = memo(function BudgetsScreen({ onSelectBudget, onNewBudget }: BudgetsScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [alertHub, setAlertHub] = useState<any>(null);

  const handleExportCSV = async () => {
    // Generate simple finance summary for budgets
    const csv = generateFinanceCSV(filteredBudgets.map(b => ({
      title: b.title,
      expectedValue: b.chargedValue,
      status: b.status === BUDGET_STATUS.FINALIZADO ? 'paid' : 'pending',
      clientName: b.clientName,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    })));
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    downloadCSV(`orcamentos_${timestamp}.csv`, csv);
  };

  async function loadAncillary() {
    const [props, hub, allClients, allSites] = await Promise.all([
      clientProposalService.getAll(),
      operationalReadModelService.getCRMAlertHubProjection(),
      clientService.getAll(),
      siteService.getAll()
    ]);
    setProposals(props);
    setAlertHub(hub);
    setClients(allClients);
    setSites(allSites);
  }

  useEffect(() => {
    loadAncillary();
  }, [budgets]);

  const proposalMap = useMemo(() => {
    const map = new Map<string, ClientProposal>();
    proposals.forEach(p => {
      if (p.budgetId) map.set(p.budgetId, p);
    });
    return map;
  }, [proposals]);

  const conversionData = useMemo(() => {
    const siteMap = new Map<string, string>();
    sites.forEach(s => siteMap.set(s.id, s.name));

    const list = (budgets || []).map(b => {
      const proposal = proposalMap.get(b.id);
      const siteName = b.siteId ? siteMap.get(b.siteId) : undefined;
      return {
        ...b,
        siteName,
        proposalStatus: proposal?.status || 'draft',
        isViewed: proposal?.status === 'viewed'
      };
    });

    const draft = list.filter(b => b.status === 'iniciado');
    const viewed = list.filter(b => b.proposalStatus === 'viewed');
    const sent = list.filter(b => b.status === 'enviado' && b.proposalStatus !== 'viewed');
    const negotiation = list.filter(b => b.status === 'em_revisao');
    const approved = list.filter(b => b.status === 'autorizado' || b.status === 'em_execucao');
    const rejected = list.filter(b => b.status === 'recusado');

    return { draft, viewed, sent, negotiation, approved, rejected, all: list };
  }, [budgets, proposalMap, sites]);

  const filteredBudgets = useMemo(() => {
    let list = conversionData.all;
    if (activeFilter === 'viewed') {
      list = conversionData.viewed;
    } else if (activeFilter !== 'all') {
      list = list.filter(b => b.status === activeFilter);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.clientName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversionData, search, activeFilter]);

  if (isLoading) {
    return (
      <ScreenContainer className="bg-aferix-bg flex items-center justify-center min-h-screen">
        <ERPLoader message="Recuperando pipeline comercial..." />
      </ScreenContainer>
    );
  }

  const renderBudgetCard = (budget: any, idx: number) => {
    const totals = calculateBudget(budget);
    const isHighPriority = budget.proposalStatus === 'viewed';
    const isHighValue = totals.totalComercial >= 5000;

    const getPriorityMeta = (b: any) => {
      const isFollowUp = alertHub?.commercialFollowUp?.some((x: any) => x.id === b.id);
      const isViewed = b.proposalStatus === 'viewed';

      if (b.status === BUDGET_STATUS.AUTORIZADO || b.status === BUDGET_STATUS.EM_EXECUCAO) {
        return {
          label: 'Aprovada',
          nextAction: 'Iniciar Execução',
          badgeStyle: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          iconColor: 'text-emerald-400',
          isUrgent: false
        };
      }

      if (isFollowUp) {
        return {
          label: 'Requer Follow-up',
          nextAction: 'Ligar para Cliente',
          badgeStyle: 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse',
          iconColor: 'text-red-400',
          isUrgent: true
        };
      }

      if (isViewed) {
        return {
          label: 'Visualizada',
          nextAction: 'Enviar Mensagem',
          badgeStyle: 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20',
          iconColor: 'text-[var(--accent-gold)]',
          isUrgent: true
        };
      }

      if (b.status === BUDGET_STATUS.ENVIADO) {
        return {
          label: 'Aguardando',
          nextAction: 'Cobrar Retorno',
          badgeStyle: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          iconColor: 'text-blue-400',
          isUrgent: false
        };
      }

      if (b.status === BUDGET_STATUS.INICIADO || b.status === BUDGET_STATUS.EM_REVISAO) {
        return {
          label: 'Rascunho',
          nextAction: 'Finalizar e Enviar',
          badgeStyle: 'bg-white/5 text-white/50 border border-white/10',
          iconColor: 'text-white/30',
          isUrgent: false
        };
      }

      if (b.status === BUDGET_STATUS.RECUSADO || b.status === BUDGET_STATUS.CANCELADO) {
        return {
          label: 'Morta/Cancelada',
          nextAction: 'Revisar Negociação',
          badgeStyle: 'bg-white/5 text-white/30 border border-white/5',
          iconColor: 'text-white/20',
          isUrgent: false
        };
      }

      return {
        label: 'Pendente',
        nextAction: 'Verificar Status',
        badgeStyle: 'bg-white/5 text-white/40 border border-white/10',
        iconColor: 'text-white/35',
        isUrgent: false
      };
    };

    const meta = getPriorityMeta(budget);

    return (
      <div key={budget.id} className="relative group">
        <InteractiveRow 
          onClick={() => onSelectBudget(budget)}
          className={cn(
            idx !== 0 ? "border-t border-white/[0.05] !py-3 !px-5" : "!py-3 !px-5",
            meta.isUrgent && "bg-[#E85D5D]/[0.02] hover:bg-[#E85D5D]/[0.05]"
          )}
          leftSlot={
            <div className={cn(
              "w-10 h-10 rounded-xl bg-white/[0.03] border grid place-items-center shrink-0 transition-colors",
              meta.isUrgent ? "border-[#E85D5D]/35 shadow-[0_0_12px_rgba(255,92,92,0.1)] bg-[#E85D5D]/[0.02]" : "border-white/[0.08]"
            )}>
              {isHighPriority ? (
                <Eye size={16} className={cn(meta.iconColor, meta.isUrgent && "animate-pulse")} />
              ) : (
                <FileText size={16} className={meta.iconColor} />
              )}
            </div>
          }
          rightSlot={
            <Stack className="items-end gap-1 shrink-0 ml-1">
               <div className="flex items-center leading-none">
                  {isHighValue && (
                    <span className="text-[7.5px] font-black text-black bg-[#D4AF37] px-1.5 py-0.5 rounded tracking-widest font-mono uppercase mr-1 shadow-[0_0_8px_rgba(212,169,74,0.4)]">HOT</span>
                  )}
                  <FinancialValue value={totals.totalComercial} compact className={cn("text-[13.5px] font-mono font-black leading-none", isHighValue ? "text-[#D4AF37]" : "text-white/80")} />
               </div>
               <StatusPill status={budget.status} className="scale-90 origin-right" />
            </Stack>
          }
        >
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2">
              <span className="truncate leading-none uppercase font-black tracking-tight text-white text-[12.5px]">
                {budget.clientName || 'CLIENTE_AVULSO'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Subtitle className="text-[10px] truncate text-[var(--text-secondary)] font-medium leading-none">
                 {budget.title || 'PROJETO_SEM_TÍTULO'} {budget.siteName ? `· ${budget.siteName}` : ''}
              </Subtitle>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-black tracking-[0.15em] leading-none">
              <span className="text-white/20 uppercase">PRÓXIMA AÇÃO:</span>
              <span className={cn(
                "uppercase",
                meta.isUrgent ? "text-[#E85D5D] animate-pulse" : "text-[#D4AF37]"
              )}>
                {meta.nextAction}
              </span>
            </div>
          </div>
        </InteractiveRow>
        
        {/* QUICK DUPLICATE ACTION */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            operationalFacade.duplicateBudget(budget.id).then(newId => {
              window.dispatchEvent(new CustomEvent('aferix_navigate', { detail: { tab: 'budgets', id: newId } }));
            });
          }}
          className="absolute right-0 top-0 bottom-0 px-8 bg-gradient-to-l from-[#0A84FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#0A84FF] cursor-pointer"
        >
           <Copy size={20} />
        </button>
      </div>
    );
  };

  const days = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
  const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  const now = new Date();

  const featuredBudget = conversionData.viewed[0] || conversionData.sent[0] || conversionData.all[0];
  const totalValue = conversionData.all.reduce((acc, b) => acc + (b.chargedValue || 0), 0);

  return (
    <ScreenContainer className="pb-32 bg-background-primary pt-0 px-0 relative overflow-x-hidden min-h-screen">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#0A84FF]/5 pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/3 pointer-events-none blur-[100px] z-0" />

      <div className="px-6 py-6 flex flex-col gap-10 relative z-10">
        
        {/* CUSTOM APPLE-STYLE DASHBOARD HEADER */}
        <div className="transition-all duration-700 delay-[100ms] transform flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06] mt-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">
                {days[now.getDay()]} • {now.getDate()} DE {months[now.getMonth()]}
              </span>
              <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full flex items-center gap-2 text-white/50">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Aferix Score</span>
                <span className="text-[10px] font-black text-[var(--accent-gold)] font-mono leading-none">94%</span>
              </div>
            </div>
            <h1 className="text-[24px] font-black text-white tracking-tight leading-none mt-1">
              Propostas & <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Orçamentos</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]"></span>
              </span>
              <span className="text-[11px] font-bold text-[#30D158] uppercase tracking-wider">
                Pipeline Comercial
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] text-white/40 font-medium">
                Local-first Ativo
              </span>
            </div>
          </div>
          
          <div className="w-full md:w-80 lg:w-[360px] shrink-0 relative flex items-center">
            <GlassSearchInput 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Pesquisar propostas..." 
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors active:scale-95 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* HERO ESTRATÉGICO: PIPELINE COMERCIAL */}
        <div className="flex flex-col gap-5">
           <div className="flex items-center justify-between px-1">
             <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.3em] text-[11px] font-black">Proposta Principal</SectionLabel>
             <span className="text-[9px] font-extrabold text-[#0A84FF] uppercase tracking-[0.2em] bg-[#0A84FF]/10 px-2.5 py-1 rounded-md border border-[#0A84FF]/25 flex items-center gap-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
                Pipeline Ativo
             </span>
           </div>
           
           {featuredBudget ? (
             <div className="bg-gradient-to-br from-[#1c1510] via-[#0E1016] to-[#08090C] border border-white/[0.08] rounded-[28px] p-6 md:p-8 shadow-[0_32px_70px_rgba(0,0,0,0.5)] flex flex-col gap-6 relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent-gold)]/10 blur-3xl pointer-events-none rounded-full animate-cinematic-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#30D158]/5 blur-3xl pointer-events-none rounded-full" />
                
                <div className="flex justify-between items-start z-10 gap-4">
                   <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.25em]">
                        {featuredBudget.proposalStatus === 'viewed' ? 'PROPOSTA VISUALIZADA (QUENTE)' : 'PROPOSTA EM DESTAQUE'}
                      </span>
                      <h3 className="text-[22px] font-black text-white tracking-tight leading-[1.2] mt-1 break-words">
                         {featuredBudget.title || 'Orçamento Sem Título'}
                      </h3>
                      <span className="text-[12px] text-white/50 uppercase tracking-widest font-black mt-1.5">
                         {featuredBudget.clientName || "Cliente Avulso"}
                      </span>
                   </div>
                   
                   <div className="flex flex-col items-end shrink-0">
                      <span className="text-[14px] font-mono font-black text-[#30D158] bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/[0.08] shadow-inner leading-none">
                         {formatCurrencyBRL(featuredBudget.chargedValue || 0)}
                      </span>
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider mt-1.5 mr-1">Valor</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 text-white/70 text-[13px] z-10 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 shadow-sm hover:bg-white/[0.04] transition-all duration-300">
                   <Clock size={16} className="shrink-0 text-[var(--accent-gold)]" />
                   <span className="truncate font-medium">Atualizado {getAgingText(featuredBudget.updatedAt)}</span>
                </div>

                <div className="flex flex-col gap-3 z-10 pt-4 border-t border-white/[0.06]">
                   {/* Primary CTA */}
                   <button 
                     onClick={() => onSelectBudget(featuredBudget)}
                     className="w-full h-14 bg-white hover:bg-white/95 text-black font-black text-[12px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_15px_35px_rgba(255,255,255,0.12)] cursor-pointer"
                   >
                      <Eye size={16} /> AVALIAR PROPOSTA
                   </button>
                </div>
             </div>
           ) : (
             <div className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06] rounded-[28px] py-12 px-6 text-center shadow-lg">
                <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-4 text-white/20">
                   <Zap size={20} />
                </div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">Sem Oportunidades Ativas</span>
                <button 
                  onClick={() => onNewBudget('project')}
                  className="px-6 h-12 bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-black uppercase tracking-widest rounded-xl text-white border border-white/[0.08] active:scale-95 transition-all cursor-pointer"
                >
                  Novo Orçamento
                </button>
             </div>
           )}
        </div>

        {/* SUMÁRIO EXECUTIVO COMERCIAL */}
        <div className="flex flex-col gap-5">
           <div className="flex items-center justify-between px-1">
             <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.3em] text-[11px] font-black">Radar Comercial</SectionLabel>
             <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em] bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.05]">Fluxos</span>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {/* Pipeline Total */}
              <div 
                className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.07] p-5 rounded-[24px] flex flex-col justify-between h-44 shadow-xl relative overflow-hidden group"
              >
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#30D158]/5 rounded-full blur-[30px] group-hover:bg-[#30D158]/10 transition-all duration-500" />
                 
                 <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center text-[#30D158] shadow-[0_0_15px_rgba(48,209,88,0.15)]">
                          <TrendingUp size={18} />
                       </div>
                       <span className="text-[10px] font-black text-white/35 uppercase tracking-widest leading-none">Total Pipeline</span>
                    </div>
                    <span className="text-[24px] font-mono font-black text-[#30D158] mt-4 leading-none">{formatCurrencyBRL(totalValue)}</span>
                 </div>
                 
                 <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-3">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Propostas ativas</span>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
                       <ChevronRight size={14} />
                    </div>
                 </div>
              </div>

              {/* Follow-ups */}
              <div 
                className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.07] p-5 rounded-[24px] flex flex-col justify-between h-44 shadow-xl relative overflow-hidden group"
              >
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--accent-gold)]/5 rounded-full blur-[30px] group-hover:bg-[var(--accent-gold)]/10 transition-all duration-500" />
                 
                 <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] shadow-[0_0_15px_rgba(212,169,78,0.15)]">
                          <Zap size={18} />
                       </div>
                       <span className="text-[10px] font-black text-white/35 uppercase tracking-widest leading-none">Atenção</span>
                    </div>
                    <span className="text-[24px] font-mono font-black text-[var(--accent-gold)] mt-4 leading-none">
                       {conversionData.viewed.length} / {alertHub?.commercialFollowUp?.length || 0}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-3">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Visualizadas / Follows</span>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
                       <ChevronRight size={14} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="flex gap-4">
            <button 
              onClick={() => onNewBudget('project')} 
              className="flex-1 h-14 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white font-black text-[11px] tracking-[0.2em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase cursor-pointer"
            >
               NOVO PROJETO <Target size={18} className="text-white/40" />
            </button>
            <button 
              onClick={() => onNewBudget('quick')} 
              className="flex-1 h-14 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/95 text-black font-black text-[11px] tracking-[0.2em] shadow-[0_15px_30px_rgba(212,169,74,0.15)] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase cursor-pointer"
            >
               ORÇAMENTO RÁPIDO <Zap size={18} className="fill-black" />
            </button>
        </div>

        {/* 2. OPERATIONAL CRM QUEUE */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-1">
             <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.3em] text-[11px] font-black">Fila de Conversão</SectionLabel>
             <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em] bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.05]">Lista</span>
          </div>

          <FilterChips 
            items={FILTER_ITEMS} 
            active={[activeFilter]} 
            onChange={(active) => setActiveFilter(active[0] || 'all')}
          />

          <div className="flex flex-col gap-4 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-[24px] p-5 shadow-md">
             <div className="flex items-center justify-between pb-3 border-b border-white/[0.03] mb-1">
                <SectionLabel className="font-mono tracking-widest text-[10px] uppercase opacity-60">Status das Propostas</SectionLabel>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={handleExportCSV}
                     className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 active:scale-95 transition-all cursor-pointer"
                     title="Exportar Planilha"
                   >
                     <Download size={14} />
                   </button>
                   <TrendingUp size={12} className="text-[#3A3A3A]" />
                </div>
             </div>
                {activeFilter === 'all' ? (
                  <>
                    {conversionData.viewed.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-6 py-2 bg-[#D4AF37]/5 border-t border-white/[0.05] rounded-lg mb-1">
                           <span className="text-[9px] font-black text-[#D4AF37] font-mono uppercase tracking-widest leading-none">PRIORIDADE MÁXIMA</span>
                        </div>
                        {conversionData.viewed.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {alertHub?.commercialFollowUp?.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-6 py-2 bg-[#E85D5D]/5 border-t border-white/[0.05] rounded-lg mb-1">
                           <span className="text-[9px] font-black text-[#E85D5D] font-mono uppercase tracking-widest leading-none">REQUER FOLLOW-UP</span>
                        </div>
                        {alertHub.commercialFollowUp.map((b: any, i: number) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {conversionData.sent.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-6 py-2 bg-blue-500/5 border-t border-white/[0.05] rounded-lg mb-1">
                           <span className="text-[9px] font-black text-blue-400 font-mono uppercase tracking-widest leading-none">ENVIADAS</span>
                        </div>
                        {conversionData.sent.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {conversionData.negotiation.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-6 py-2 bg-purple-500/5 border-t border-white/[0.05] rounded-lg mb-1">
                           <span className="text-[9px] font-black text-purple-400 font-mono uppercase tracking-widest leading-none">EM NEGOCIAÇÃO</span>
                        </div>
                        {conversionData.negotiation.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {conversionData.approved.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-6 py-2 bg-emerald-500/5 border-t border-white/[0.05] rounded-lg mb-1">
                           <span className="text-[9px] font-black text-emerald-400 font-mono uppercase tracking-widest leading-none">APROVADAS</span>
                        </div>
                        {conversionData.approved.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {conversionData.draft.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-6 py-2 border-t border-white/[0.05] rounded-lg mb-1">
                           <SectionLabel className="!text-[8px]">Rascunhos</SectionLabel>
                        </div>
                        {conversionData.draft.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}
                  </>
                ) : (
                  <Stack className="gap-0">
                    {filteredBudgets.length === 0 ? (
                      <div className="py-24 text-center flex flex-col items-center gap-6 animate-fade-in">
                         <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/10">
                            <FileText size={40} />
                          </div>
                          <div className="flex flex-col gap-2 max-w-[280px]">
                             <Body className="text-[17px] font-black text-white uppercase tracking-tight">Nenhum orçamento encontrado.</Body>
                             <Subtitle className="text-[13px] opacity-40">Transforme oportunidades em receita criando sua primeira proposta.</Subtitle>
                          </div>
                          <button 
                            onClick={() => onNewBudget('project')}
                            className="h-14 px-8 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-[0_12px_24px_rgba(255,255,255,0.1)] cursor-pointer"
                          >
                             + CRIAR ORÇAMENTO
                          </button>
                       </div>
                    ) : (
                      filteredBudgets.map((b, i) => renderBudgetCard(b, i))
                    )}
                  </Stack>
                )}
             </div>
          </div>
      </div>
    </ScreenContainer>
  );
});

function formatCurrencyBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}
