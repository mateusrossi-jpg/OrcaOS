// src/app/screens/BudgetsScreen.tsx
import { useState, useMemo, memo, useEffect } from 'react';
import { cn } from '../../utils/ui';
import { 
  Clock, 
  Eye, 
  Target, 
  TrendingUp, 
  Zap, 
  FileText, 
  Download, 
  Copy, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import { AferixV12Tokens } from '../../ui/system/v12Tokens';
import { 
  SlimSearchInput, 
  GroupedSection, 
  PrimaryPillButton, 
  SecondaryActionButton, 
  V12StatusBadge, 
  V12HeroCard,
  EmptyState
} from '../../ui/system/v12Components';
import { ERPLoader } from '../../ui/system';
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
  { id: 'all',                    label: 'TODOS'        },
  { id: 'viewed',                 label: 'VISUALIZADOS' },
  { id: BUDGET_STATUS.ENVIADO,    label: 'ENVIADOS'     },
  { id: BUDGET_STATUS.AUTORIZADO, label: 'APROVADOS'    },
  { id: BUDGET_STATUS.FINALIZADO, label: 'HISTÓRICO'    },
];

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

function formatCurrencyBRL(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

/**
 * BudgetsScreen: Sales Hub & Conversion Pipeline.
 * Standardized on Golden V12 Dark Industrial Graphite.
 */
export const BudgetsScreen = memo(function BudgetsScreen({ onSelectBudget, onNewBudget }: BudgetsScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [alertHub, setAlertHub] = useState<any>(null);

  const handleExportCSV = async () => {
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
      <div className={cn(AferixV12Tokens.layout.pageContainer, "flex items-center justify-center")}>
        <ERPLoader message="Recuperando pipeline comercial..." />
      </div>
    );
  }

  const getPriorityMeta = (b: any) => {
    const isFollowUp = alertHub?.commercialFollowUp?.some((x: any) => x.id === b.id);
    const isViewed = b.proposalStatus === 'viewed';

    if (b.status === BUDGET_STATUS.AUTORIZADO || b.status === BUDGET_STATUS.EM_EXECUCAO) {
      return {
        label: 'Aprovada',
        tone: 'success' as const,
        nextAction: 'Iniciar Execução',
        iconColor: 'text-[#30D158]',
        isUrgent: false
      };
    }

    if (isFollowUp) {
      return {
        label: 'Requer Follow-up',
        tone: 'critical' as const,
        nextAction: 'Ligar para Cliente',
        iconColor: 'text-[#FF453A]',
        isUrgent: true
      };
    }

    if (isViewed) {
      return {
        label: 'Visualizada',
        tone: 'attention' as const,
        nextAction: 'Enviar Mensagem',
        iconColor: 'text-[#FFD60A]',
        isUrgent: true
      };
    }

    if (b.status === BUDGET_STATUS.ENVIADO) {
      return {
        label: 'Aguardando',
        tone: 'info' as const,
        nextAction: 'Cobrar Retorno',
        iconColor: 'text-[#0A84FF]',
        isUrgent: false
      };
    }

    if (b.status === BUDGET_STATUS.INICIADO || b.status === BUDGET_STATUS.EM_REVISAO) {
      return {
        label: 'Rascunho',
        tone: 'neutral' as const,
        nextAction: 'Finalizar e Enviar',
        iconColor: 'text-[#8E8E93]',
        isUrgent: false
      };
    }

    if (b.status === BUDGET_STATUS.RECUSADO || b.status === BUDGET_STATUS.CANCELADO) {
      return {
        label: 'Cancelada',
        tone: 'critical' as const,
        nextAction: 'Revisar Negociação',
        iconColor: 'text-[#FF453A]/50',
        isUrgent: false
      };
    }

    return {
      label: 'Pendente',
      tone: 'neutral' as const,
      nextAction: 'Verificar Status',
      iconColor: 'text-[#8E8E93]',
      isUrgent: false
    };
  };

  const renderBudgetCard = (budget: any, idx: number) => {
    const totals = calculateBudget(budget);
    const isHighPriority = budget.proposalStatus === 'viewed';
    const isHighValue = totals.totalComercial >= 5000;
    const meta = getPriorityMeta(budget);

    return (
      <div 
        key={budget.id} 
        className={cn(
          "group relative flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-white/[0.03] active:bg-white/[0.05]",
          idx !== 0 && "border-t border-white/5"
        )}
        onClick={() => onSelectBudget(budget)}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          <div className={cn(
            "w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border",
            meta.isUrgent 
              ? "bg-[#FF453A]/10 border-[#FF453A]/25" 
              : "bg-[#3A3A3C] border-white/5"
          )}>
            {isHighPriority ? (
              <Eye size={16} className={cn(meta.iconColor, meta.isUrgent && "animate-pulse")} />
            ) : (
              <FileText size={16} className={meta.iconColor} />
            )}
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white tracking-tight truncate">
                {budget.clientName || 'Cliente Avulso'}
              </span>
            </div>
            <span className="text-[11px] text-[#8E8E93] truncate">
              {budget.title || 'Projeto sem título'} {budget.siteName ? `· ${budget.siteName}` : ''}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E93]">Ação:</span>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider",
                meta.isUrgent ? "text-[#FF453A] animate-pulse" : "text-[#FFD60A]"
              )}>
                {meta.nextAction}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            {isHighValue && (
              <span className="text-[9px] font-extrabold bg-[#FFD60A] text-[#2C2C2E] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider leading-none">
                HOT
              </span>
            )}
            <span className={cn(
              "text-[14px] font-bold font-mono tracking-tight",
              isHighValue ? "text-[#FFD60A]" : "text-white"
            )}>
              {formatCurrencyBRL(totals.totalComercial)}
            </span>
          </div>
          <V12StatusBadge label={meta.label} tone={meta.tone} />
        </div>

        {/* Quick Duplicate Button on hover */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            operationalFacade.duplicateBudget(budget.id).then(newId => {
              window.dispatchEvent(new CustomEvent('aferix_navigate', { detail: { tab: 'budgets', id: newId } }));
            });
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-[10px] bg-[#3A3A3C] text-[#0A84FF] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-md active:scale-95"
          title="Duplicar Orçamento"
        >
          <Copy size={14} />
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
    <div className={cn(AferixV12Tokens.layout.pageContainer, "px-4 pt-4")}>
      <div className="flex flex-col gap-5 max-w-xl mx-auto w-full">
        
        {/* Apple Style Industrial Header */}
        <div className="flex flex-col gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-[0.2em] uppercase">
              {days[now.getDay()]} • {now.getDate()} DE {months[now.getMonth()]}
            </span>
            <div className="bg-[#363638] border border-white/5 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#FFD60A]" />
              <span className="text-[10px] font-bold text-[#FFD60A] font-mono leading-none">Score 94%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-black text-white tracking-tight leading-none">
              Propostas & Orçamentos
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]"></span>
              </span>
              <span className="text-[10px] font-bold text-[#30D158] uppercase tracking-wider">
                Local-first
              </span>
            </div>
          </div>

          <SlimSearchInput 
            value={search}
            onChange={setSearch}
            placeholder="Buscar por cliente, título ou projeto..."
          />
        </div>

        {/* Featured Proposal Hero Card */}
        {featuredBudget ? (
          <V12HeroCard className="relative overflow-hidden">
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#FFD60A] uppercase tracking-widest">
                  {featuredBudget.proposalStatus === 'viewed' ? 'PROPOSTA VISUALIZADA (QUENTE)' : 'DESTAQUE DO PIPELINE'}
                </span>
                <h2 className="text-[18px] font-black text-white tracking-tight leading-snug">
                  {featuredBudget.title || 'Orçamento Sem Título'}
                </h2>
                <span className="text-[12px] text-[#C7C7CC] font-semibold">
                  {featuredBudget.clientName || "Cliente Avulso"}
                </span>
              </div>
              
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[16px] font-mono font-black text-[#30D158] bg-[#363638] px-3 py-1.5 rounded-[12px] border border-white/10 shadow-inner">
                  {formatCurrencyBRL(featuredBudget.chargedValue || 0)}
                </span>
                <span className="text-[10px] text-[#8E8E93] uppercase font-bold mt-1">Valor Total</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#8E8E93] text-[12px] bg-[#363638] border border-white/5 rounded-[12px] px-3.5 py-2.5">
              <Clock size={14} className="shrink-0 text-[#FFD60A]" />
              <span className="truncate">Atualizado {getAgingText(featuredBudget.updatedAt)}</span>
            </div>

            <PrimaryPillButton 
              icon={Eye} 
              onClick={() => onSelectBudget(featuredBudget)}
              className="mt-1"
            >
              AVALIAR PROPOSTA
            </PrimaryPillButton>
          </V12HeroCard>
        ) : null}

        {/* Commercial Radar Summary */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Pipeline */}
          <div className="bg-[#363638] border border-white/5 p-4 rounded-[20px] flex flex-col justify-between h-36 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-[10px] bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center text-[#30D158]">
                <TrendingUp size={15} />
              </div>
              <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">Pipeline</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-black text-[#30D158] leading-tight">
                {formatCurrencyBRL(totalValue)}
              </span>
              <span className="text-[10px] text-[#8E8E93] mt-0.5">
                {conversionData.all.length} {conversionData.all.length === 1 ? 'proposta' : 'propostas'}
              </span>
            </div>
          </div>

          {/* Attention Items */}
          <div className="bg-[#363638] border border-white/5 p-4 rounded-[20px] flex flex-col justify-between h-36 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-[10px] bg-[#FFD60A]/10 border border-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A]">
                <Zap size={15} />
              </div>
              <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">Atenção</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-mono font-black text-[#FFD60A] leading-tight">
                {conversionData.viewed.length} / {alertHub?.commercialFollowUp?.length || 0}
              </span>
              <span className="text-[10px] text-[#8E8E93] mt-0.5">
                Vistas / Follow-ups
              </span>
            </div>
          </div>
        </div>

        {/* Primary Dual Creation Actions */}
        <div className="grid grid-cols-2 gap-3">
          <SecondaryActionButton 
            icon={Target} 
            onClick={() => onNewBudget('project')}
            className="h-14 font-bold uppercase tracking-wider text-[12px]"
          >
            NOVO PROJETO
          </SecondaryActionButton>

          <PrimaryPillButton 
            icon={Zap} 
            onClick={() => onNewBudget('quick')}
            className="h-14 text-[12px]"
          >
            ORÇAMENTO RÁPIDO
          </PrimaryPillButton>
        </div>

        {/* Conversion Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTER_ITEMS.map(item => (
            <SecondaryActionButton
              key={item.id}
              active={activeFilter === item.id}
              onClick={() => setActiveFilter(item.id)}
              className="shrink-0 h-10 px-3.5 text-[11px] font-bold uppercase tracking-wider"
            >
              {item.label}
            </SecondaryActionButton>
          ))}
        </div>

        {/* Budget List / Grouped Section */}
        <GroupedSection
          headerTitle="Fila de Conversão"
          headerAction={
            <button 
              onClick={handleExportCSV}
              className="p-1.5 rounded-[8px] bg-[#3A3A3C] border border-white/5 text-[#8E8E93] hover:text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase"
              title="Exportar CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          }
        >
          {activeFilter === 'all' ? (
            <>
              {conversionData.viewed.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-[#FFD60A]/10 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-[#FFD60A] uppercase tracking-widest">
                      PRIORIDADE MÁXIMA (VISUALIZADAS)
                    </span>
                    <span className="text-[9px] font-bold text-[#FFD60A] font-mono">
                      {conversionData.viewed.length}
                    </span>
                  </div>
                  {conversionData.viewed.map((b, i) => renderBudgetCard(b, i))}
                </div>
              )}

              {alertHub?.commercialFollowUp?.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-[#FF453A]/10 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-[#FF453A] uppercase tracking-widest">
                      REQUER FOLLOW-UP
                    </span>
                    <span className="text-[9px] font-bold text-[#FF453A] font-mono">
                      {alertHub.commercialFollowUp.length}
                    </span>
                  </div>
                  {alertHub.commercialFollowUp.map((b: any, i: number) => renderBudgetCard(b, i))}
                </div>
              )}

              {conversionData.sent.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-[#0A84FF]/10 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-[#0A84FF] uppercase tracking-widest">
                      ENVIADAS
                    </span>
                    <span className="text-[9px] font-bold text-[#0A84FF] font-mono">
                      {conversionData.sent.length}
                    </span>
                  </div>
                  {conversionData.sent.map((b, i) => renderBudgetCard(b, i))}
                </div>
              )}

              {conversionData.negotiation.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-[#C7C7CC] uppercase tracking-widest">
                      EM NEGOCIAÇÃO
                    </span>
                    <span className="text-[9px] font-bold text-white font-mono">
                      {conversionData.negotiation.length}
                    </span>
                  </div>
                  {conversionData.negotiation.map((b, i) => renderBudgetCard(b, i))}
                </div>
              )}

              {conversionData.approved.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-[#30D158]/10 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-[#30D158] uppercase tracking-widest">
                      APROVADAS
                    </span>
                    <span className="text-[9px] font-bold text-[#30D158] font-mono">
                      {conversionData.approved.length}
                    </span>
                  </div>
                  {conversionData.approved.map((b, i) => renderBudgetCard(b, i))}
                </div>
              )}

              {conversionData.draft.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-[#8E8E93] uppercase tracking-widest">
                      RASCUNHOS
                    </span>
                    <span className="text-[9px] font-bold text-[#8E8E93] font-mono">
                      {conversionData.draft.length}
                    </span>
                  </div>
                  {conversionData.draft.map((b, i) => renderBudgetCard(b, i))}
                </div>
              )}

              {filteredBudgets.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="Nenhum orçamento encontrado"
                  subtitle="Transforme oportunidades em receita criando sua primeira proposta comercial."
                  action={
                    <PrimaryPillButton onClick={() => onNewBudget('project')}>
                      CRIAR ORÇAMENTO
                    </PrimaryPillButton>
                  }
                />
              )}
            </>
          ) : (
            <>
              {filteredBudgets.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Nenhum orçamento com este filtro"
                  subtitle="Selecione outro filtro acima ou crie uma nova proposta."
                  action={
                    <SecondaryActionButton onClick={() => setActiveFilter('all')}>
                      VER TODOS
                    </SecondaryActionButton>
                  }
                />
              ) : (
                filteredBudgets.map((b, i) => renderBudgetCard(b, i))
              )}
            </>
          )}
        </GroupedSection>
      </div>
    </div>
  );
});
