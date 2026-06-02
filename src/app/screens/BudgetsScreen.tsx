// src/app/screens/BudgetsScreen.tsx
import { useState, useMemo, memo, useEffect } from 'react';
import { cn } from '../../utils/ui';
import { openExternalGPS } from '../../utils/mobility';
import { Clock, Eye, MessageSquare, Target, TrendingUp, Zap, FileText } from "lucide-react";
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
// ── Unified UI Architecture ──────────────────────────────────────────────────
import {
  ScreenContainer,
  SurfaceCard,
  SectionLabel,
  StatusPill,
  AppHeader,
  OpsChip,
  InteractiveRow,
  Stack,
  Section,
  Subtitle,
  Body,
  Value,
  FinancialValue,
  ERPLoader,
} from '../../ui/system';
import { FilterChips, SearchInput, PrimaryButton } from '../components/ui';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';
import { operationalReadModelService } from '../../services/operationalReadModelService';
import { clientProposalService } from '../../services/clientProposalService';
import { clientService } from '../../services/clientService';
import { siteService } from '../../services/siteService';
/* eslint-disable no-restricted-imports */
import { ClientProposal } from '../../features/clientPortal/storage/clientProposalStorage';
import { Client } from '../../domain/client';
import { HeroCard } from '../../components/HeroCard';

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
 * Refactored for absolute Home DNA parity (Phase 4D).
 */
export const BudgetsScreen = memo(function BudgetsScreen({ onSelectBudget, onNewBudget }: BudgetsScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [alertHub, setAlertHub] = useState<any>(null);

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
      const siteName = siteMap.get(b.siteId);
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
      <ScreenContainer className="items-center justify-center">
        <ERPLoader message="Carregando Pipeline..." />
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
      <InteractiveRow 
        key={budget.id} 
        onClick={() => onSelectBudget(budget)}
        className={cn(
          idx !== 0 ? "border-t border-white/[0.05] !py-2.5 !px-4" : "!py-2.5 !px-4",
          meta.isUrgent && "bg-red-500/[0.015] hover:bg-red-500/[0.03] active:bg-red-500/[0.05]"
        )}
        leftSlot={
          <div className={cn(
            "w-8 h-8 rounded-lg bg-white/[0.03] border grid place-items-center shrink-0 transition-colors",
            meta.isUrgent ? "border-[var(--accent-red)]/35 shadow-[0_0_12px_rgba(239,68,68,0.08)] bg-red-500/[0.02]" : "border-white/[0.07]"
          )}>
            {isHighPriority ? (
              <Eye size={13} className={cn(meta.iconColor, meta.isUrgent && "animate-pulse")} />
            ) : (
              <FileText size={13} className={meta.iconColor} />
            )}
          </div>
        }
        rightSlot={
          <Stack className="items-end gap-1 shrink-0 ml-1">
             <div className="flex items-center leading-none">
                {isHighValue && (
                  <span className="text-[7px] font-black text-black bg-[var(--accent-gold)] px-1 py-0.5 rounded tracking-widest font-mono uppercase mr-1 shadow-[0_0_8px_rgba(255,200,0,0.35)] select-none">HOT</span>
                )}
                <FinancialValue value={totals.totalComercial} compact className={cn("text-xs font-mono font-bold leading-none", isHighValue ? "text-[var(--accent-gold)]" : "text-white/80")} />
             </div>
             <StatusPill status={budget.status} className="scale-75 origin-right" />
          </Stack>
        }
      >
        <div className="flex flex-col gap-0.5 w-full">
          {/* Linha 1: Cliente e Badge de Prioridade */}
          <div className="flex items-center gap-2 justify-between">
            <span className="truncate leading-none uppercase font-black tracking-tight text-white text-[11px] font-sans">
              {budget.clientName || 'CLIENTE_AVULSO'}
            </span>
            <span className={cn("text-[7.5px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded-full uppercase shrink-0 leading-none", meta.badgeStyle)}>
              {meta.label}
            </span>
          </div>

          {/* Linha 2: Projeto e Envelhecimento */}
          <div className="flex items-center gap-2 justify-between">
            <Subtitle className="text-[9.5px] truncate text-[var(--text-secondary)] font-medium leading-none">
               {budget.title || 'PROJETO_SEM_TÍTULO'} {budget.siteName ? `· ${budget.siteName}` : ''}
            </Subtitle>
            <span className="text-[8px] font-mono text-[var(--text-muted)] tracking-wider shrink-0 leading-none">
               {getAgingText(budget.updatedAt || budget.createdAt)}
            </span>
          </div>

          {/* Linha 3: Próxima Ação */}
          <div className="flex items-center gap-1 mt-0.5 text-[8.5px] font-mono tracking-wider leading-none">
            <span className="text-[var(--text-tertiary)] uppercase font-semibold">PRÓXIMA AÇÃO:</span>
            <span className={cn(
              "font-black uppercase",
              meta.isUrgent ? "text-[var(--accent-red)] animate-pulse" : "text-[var(--accent-gold)]"
            )}>
              {meta.nextAction}
            </span>
          </div>
          {(budget.status === BUDGET_STATUS.AUTORIZADO || budget.status === BUDGET_STATUS.EM_EXECUCAO) && (
            <button
              onClick={() => openExternalGPS(budget.title)}
              className="mt-1 bg-[var(--accent-gold)] text-black font-bold py-0.5 px-2 rounded text-[7px] shadow-[0_0_6px_rgba(255,200,0,0.2)] hover:bg-[var(--accent-gold)]/90 transition"
            >
              ROTA
            </button>
          )}
        </div>
      </InteractiveRow>
    );
  };

  const totalValue = conversionData.all.reduce((acc, b) => acc + (b.chargedValue || 0), 0);

  const chips = (
    <>
      <OpsChip icon={<Eye size={11} />} label={`${conversionData.viewed.length} visualizados`} accent={conversionData.viewed.length > 0 ? "orange" : false} />
      <OpsChip icon={<MessageSquare size={11} />} label={`${alertHub?.commercialFollowUp?.length || 0} follow-ups`} accent={(alertHub?.commercialFollowUp?.length || 0) > 0 ? "red" : false} />
      <OpsChip icon={<Clock size={11} />} label={`${conversionData.draft.length} rascunhos`} accent={false} />
    </>
  );

  return (
    <ScreenContainer className="pb-32">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[124px] scrollbar-none">
        {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
        <AppHeader 
          title="Propostas."
          chips={chips}
        />

        <div className="px-4 py-3 flex flex-col gap-3.5">
          <Section className="gap-2">
            <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-b from-[#141924]/95 to-[#080b11]/98 border border-[var(--accent-gold)]/15 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_0_16px_rgba(212,169,78,0.02)] px-4 py-2">
              {/* Gold ambient radial glow */}
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[var(--accent-gold)]/5 blur-[40px] pointer-events-none" />
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7.5px] font-bold font-mono tracking-[0.2em] text-[var(--accent-gold)] uppercase opacity-80">Pipeline Comercial</span>
                  <h3 className="text-lg font-black text-white leading-none tracking-tight">{formatCurrencyBRL(totalValue)}</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <Stack className="gap-0.5 items-end">
                     <SectionLabel className="!text-[6.5px] opacity-45 uppercase tracking-wider font-mono">Visualizadas</SectionLabel>
                     <Value className="text-xs font-mono opacity-80 font-bold leading-none">{conversionData.viewed.length}</Value>
                  </Stack>
                  <div className="h-4 w-px bg-white/10" />
                  <Stack className="gap-0.5 items-end">
                     <SectionLabel className="!text-[6.5px] opacity-45 uppercase tracking-wider font-mono">Follow-ups</SectionLabel>
                     <Value className="text-xs font-mono text-[var(--accent-red)] font-bold leading-none">{alertHub?.commercialFollowUp?.length || 0}</Value>
                  </Stack>
                </div>
              </div>
            </div>
          </Section>

          {/* HERO ACTIONS */}
          <Section className="gap-2">
            <div className="flex gap-2.5">
               <button 
                 onClick={() => onNewBudget('project')} 
                 className="flex-1 h-9.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-white font-bold text-[8.5px] tracking-[0.1em] rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 uppercase"
               >
                  NOVO PROJETO <Target className="h-3 w-3 text-[var(--text-tertiary)]" />
               </button>
               <button 
                 onClick={() => onNewBudget('quick')} 
                 className="flex-1 h-9.5 bg-[var(--accent-gold)] text-black font-black text-[8.5px] tracking-[0.12em] shadow-[0_0_12px_rgba(255,200,0,0.12)] rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 uppercase"
               >
                  ATENDIMENTO RÁPIDO <Zap className="h-3 w-3 fill-black" />
               </button>
            </div>
          </Section>

          {/* 2. OPERATIONAL CRM QUEUE */}
          <Section className="gap-2">
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Localizar proposta..." 
              className="!h-9.5 px-3.5 !rounded-lg text-xs" 
            />
            
            <FilterChips 
              items={FILTER_ITEMS} 
              active={[activeFilter]} 
              onChange={(active) => setActiveFilter(active[0] || 'all')}
              className="[&_button]:min-h-[28px] [&_button]:h-[28px] [&_button]:px-3.5 [&_button]:text-[9px] pb-0"
            />

            <SurfaceCard padding="none" className="border border-white/[0.04] overflow-hidden mt-1">
               <div className="flex items-center justify-between px-4 pt-[12px] pb-[8px]">
                  <SectionLabel className="font-mono tracking-wider !text-[8.5px] uppercase opacity-60">FILA DE CONVERSÃO</SectionLabel>
                  <TrendingUp size={10} className="text-[#3A3A3A]" />
               </div>
                {activeFilter === 'all' ? (
                  <>
                    {conversionData.viewed.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-5 py-2 bg-[var(--accent-gold)]/5 border-t border-white/[0.07]">
                           <span className="text-[9px] font-black text-[var(--accent-gold)] font-mono uppercase tracking-wider">PRIORIDADE_MÁXIMA_VISUALIZADA</span>
                        </div>
                        {conversionData.viewed.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {alertHub?.commercialFollowUp?.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-5 py-2 bg-[var(--accent-red)]/5 border-t border-white/[0.07]">
                           <span className="text-[9px] font-black text-[var(--accent-red)] font-mono uppercase tracking-wider">REQUER_FOLLOW_UP_3D</span>
                        </div>
                        {alertHub.commercialFollowUp.map((b: any, i: number) => renderBudgetCard(b, i))}
                      </Stack>
                    )}

                    {conversionData.draft.length > 0 && (
                      <Stack className="gap-0">
                        <div className="px-5 py-2 border-t border-white/[0.07]">
                           <SectionLabel className="!text-[8px]">Rascunhos e Preparação</SectionLabel>
                        </div>
                        {conversionData.draft.map((b, i) => renderBudgetCard(b, i))}
                      </Stack>
                    )}
                  </>
                ) : (
                  <Stack className="gap-0">
                    {filteredBudgets.length === 0 ? (
                      <div className="py-20 text-center opacity-30">
                        <Body className="font-mono text-[10px] font-black tracking-widest">NENHUM_REGISTRO</Body>
                      </div>
                    ) : (
                      filteredBudgets.map((b, i) => renderBudgetCard(b, i))
                    )}
                  </Stack>
                )}
                <div className="h-1" />
             </SurfaceCard>
          </Section>
        </div>
      </div>
    </ScreenContainer>
  );
});

function formatCurrencyBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}
