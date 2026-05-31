import { useState, useMemo, memo, useEffect } from 'react';
import { Plus, Clock, Eye, MessageSquare, Target, TrendingUp } from "lucide-react";
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
// ── Unified UI Architecture ──────────────────────────────────────────────────
import { 
  ScreenContainer, 
  SurfaceCard, 
  SectionLabel,
  SemanticBadge,
  StatusPill,
  AppHeader,
  OpsChip,
  InteractiveRow,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Value,
  FinancialValue,
  ExecutiveGrid,
  ValueBlock,
  ERPLoader,
  Heading
} from '../../ui/system';
import { MoneyValue, FilterChips, SearchInput } from '../components/ui';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';
import { operationalReadModelService } from '../../services/operationalReadModelService';
import { clientProposalService } from '../../services/clientProposalService';
import { clientService } from '../../services/clientService';
import { ClientProposal } from '../../features/clientPortal/storage/clientProposalStorage';
import { Client } from '../../domain/client';

interface BudgetsScreenProps {
  onSelectBudget: (budget: Budget) => void;
  onNewBudget: () => void;
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

/**
 * BudgetsScreen: Sales Hub & Conversion Pipeline.
 * Refactored for absolute Home DNA parity (Phase 4D).
 */
export const BudgetsScreen = memo(function BudgetsScreen({ onSelectBudget, onNewBudget }: BudgetsScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [alertHub, setAlertHub] = useState<any>(null);

  async function loadAncillary() {
    const [props, hub, allClients] = await Promise.all([
      clientProposalService.getAll(),
      operationalReadModelService.getCRMAlertHubProjection(),
      clientService.getAll()
    ]);
    setProposals(props);
    setAlertHub(hub);
    setClients(allClients);
  }

  useEffect(() => {
    loadAncillary();
  }, [budgets]);

  const clientPhoneMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach(c => map.set(c.id, c.phone || ''));
    return map;
  }, [clients]);

  const proposalMap = useMemo(() => {
    const map = new Map<string, ClientProposal>();
    proposals.forEach(p => {
      if (p.budgetId) map.set(p.budgetId, p);
    });
    return map;
  }, [proposals]);

  const conversionData = useMemo(() => {
    const list = (budgets || []).map(b => {
      const proposal = proposalMap.get(b.id);
      return {
        ...b,
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
  }, [budgets, proposalMap]);

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

    return (
      <InteractiveRow 
        key={budget.id} 
        onClick={() => onSelectBudget(budget)}
        className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
        leftSlot={
          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center">
            <span className="text-lg leading-none">
              {isHighPriority ? "👁️" : "📄"}
            </span>
          </div>
        }
      >
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Body className="truncate leading-tight">
                {budget.title || 'PROJETO_SEM_TÍTULO'}
              </Body>
              {isHighPriority && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0" />
              )}
            </div>
            <Subtitle className="text-[11px] truncate uppercase font-mono tracking-wider opacity-60">
               {budget.clientName || 'CLIENTE_AVULSO'} · {formatCompactDate(budget.updatedAt || budget.createdAt || Date.now())}
            </Subtitle>
          </div>
          <Stack className="items-end gap-1 shrink-0">
             <FinancialValue value={totals.totalComercial} compact className="text-[13px] text-white" />
             <StatusPill status={budget.status} className="scale-75 origin-right" />
          </Stack>
        </div>
      </InteractiveRow>
    );
  };

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
          title="Vendas."
          action={
            <button 
              onClick={onNewBudget}
              className="flex h-[42px] items-center gap-2 px-3 rounded-[14px] bg-[var(--accent-gold)] text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-[var(--shadow-primary)]"
              title="Nova Proposta"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">Proposta</span>
            </button>
          }
          chips={chips}
        />

        <div className="px-4 flex flex-col gap-8">
          
          {/* 1. SALES HUB HERO */}
          <Section className="gap-3">
            <SectionLabel className="ml-2">Pipeline de Conversão</SectionLabel>
            <SurfaceCard variant="cinematic" padding="lg">
               <div className="flex items-center justify-between mb-8">
                  <SectionLabel className="text-[var(--accent-gold)]">Performance Comercial</SectionLabel>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                     <Target size={11} className="text-[var(--accent-gold)]" />
                     <Value className="text-[11px]">64%</Value>
                  </div>
               </div>
               
               <Heading className="text-[32px] mb-3">
                  {formatCurrencyBRL(conversionData.all.reduce((acc, b) => acc + (b.chargedValue || 0), 0))}
               </Heading>
               <Body className="text-[var(--accent-gold)] font-bold tracking-tight">
                  Valor Total em Negociação
               </Body>

               <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-2.5 mt-6">
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[8.5px]">Visualizadas</SectionLabel>
                     <Value className="text-sm">{conversionData.viewed.length}</Value>
                  </div>
                  <div className="flex justify-between items-center">
                     <SectionLabel className="!text-[8.5px]">Aguardando Follow-up</SectionLabel>
                     <Value className="text-sm text-[var(--accent-red)]">{alertHub?.commercialFollowUp?.length || 0}</Value>
                  </div>
               </div>
            </SurfaceCard>
          </Section>

          {/* 2. SEARCH & FILTER */}
          <Section className="gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Localizar proposta..." />
            <FilterChips items={FILTER_ITEMS} active={[activeFilter]} onChange={(active) => setActiveFilter(active[0] || 'all')} />
          </Section>

          {/* 3. CONVERSION QUEUES */}
          <Section className="gap-3">
             <SurfaceCard padding="none">
                <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px]">
                   <SectionLabel>Fila de Atendimento</SectionLabel>
                   <TrendingUp size={12} className="text-[#3A3A3A]" />
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
