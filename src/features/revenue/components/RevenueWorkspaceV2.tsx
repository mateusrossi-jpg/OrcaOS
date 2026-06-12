import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  FileText, 
  DollarSign, 
  Sparkles,
  ArrowUpRight,
  Target,
  BarChart3,
  Flame,
  Circle,
  Plus
} from 'lucide-react';
import { 
  ScreenContainer, 
  ExecutiveHeader, 
  SurfaceCard, 
  SectionLabel, 
  ExecutiveSummaryGrid, 
  ValueBlock, 
  Stack, 
  Section, 
  Body, 
  Subtitle,
  OpsChip,
  ERPLoader,
  FinancialValue
} from '../../../ui/system';
import { nextMoneyEngine, NextMoneyOpportunity, RevenueForecast } from '../../../services/NextMoneyEngine';
import { revenueIntelligenceService, ProfitInsight } from '../../../services/RevenueIntelligenceService';
import { whatsappCommercialBridge, WhatsAppTemplateType } from '../../../utils/whatsappTemplates';
import { operationalFacade } from '../../workflow/operationalFacade';
import { cn } from '../../../utils/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

interface RevenueWorkspaceV2Props {
  onNavigate: (tab: any) => void;
}

/**
 * RevenueWorkspaceV2: Strategic Revenue Command Center (RC14).
 * Focused on the question: "Como ganho dinheiro hoje?"
 */
export const RevenueWorkspaceV2: React.FC<RevenueWorkspaceV2Props> = ({ onNavigate }) => {
  const [opps, setOpps] = useState<NextMoneyOpportunity[]>([]);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [profit, setProfit] = useState<ProfitInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [o, f, p] = await Promise.all([
          nextMoneyEngine.getNextMoneyOpportunities().catch(err => {
            console.error("Error loading nextMoneyOpportunities:", err);
            return [];
          }),
          nextMoneyEngine.getRevenueForecast().catch(err => {
            console.error("Error loading revenueForecast:", err);
            return null;
          }),
          revenueIntelligenceService.getProfitIntelligence().catch(err => {
            console.error("Error loading profitIntelligence:", err);
            return null;
          })
        ]);
        setOpps(o || []);
        setForecast(f);
        setProfit(p);
      } catch (error) {
        console.error("Failed to load revenue workspace data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Mapeando fluxo de receita..." /></ScreenContainer>;

  const weightedTotal = opps.reduce((acc, o) => acc + o.weightedValue, 0);
  
  // Section filters
  const hotProposals = opps.filter(o => o.type === 'FOLLOW_UP' && o.temperature === 'HOT');
  const collections = opps.filter(o => o.type === 'COLLECTION' && o.temperature === 'HOT');
  const renewals = opps.filter(o => o.type === 'RENEWAL');
  const reactivations = opps.filter(o => o.type === 'REACTIVATION');

  const days = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
  const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  const now = new Date();

  return (
    <ScreenContainer className="pb-32 bg-background-primary pt-0 px-0 relative overflow-x-hidden min-h-screen animate-in fade-in duration-700">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/30 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#0A84FF]/5 pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/3 pointer-events-none blur-[100px] z-0" />

      <div className="px-6 py-10 flex flex-col gap-10 relative z-10">
        
        {/* CUSTOM APPLE-STYLE DASHBOARD HEADER */}
        <div className="transition-all duration-700 delay-[100ms] transform flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06] mt-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">
                {days[now.getDay()]} • {now.getDate()} DE {months[now.getMonth()]}
              </span>
              <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full flex items-center gap-2 text-white/50">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Aferix Score</span>
                <span className="text-[10px] font-black text-[var(--accent-gold)] font-mono leading-none">95%</span>
              </div>
            </div>
            <h1 className="text-[24px] font-black text-white tracking-tight leading-none mt-1">
              Gestão de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">Receita</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]"></span>
              </span>
              <span className="text-[11px] font-bold text-[#30D158] uppercase tracking-wider">
                Inteligência Comercial
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] text-white/40 font-medium">
                Local-first Ativo
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 0: REVENUE GATEWAY (SIMULATOR & NEW) */}
        <div className="flex flex-col gap-5">
           <div className="flex items-center justify-between px-1">
             <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.3em] text-[11px] font-black">Ações Comerciais</SectionLabel>
             <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em] bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.05]">Atalhos</span>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {/* Nova Proposta */}
              <div 
                onClick={() => onNavigate('new-budget')}
                className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:from-white/[0.06] hover:to-white/[0.02] border border-white/[0.07] p-4 sm:p-5 rounded-[24px] flex flex-col justify-between h-44 shadow-xl relative overflow-hidden group cursor-pointer"
              >
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--accent-gold)]/5 rounded-full blur-[30px] group-hover:bg-[var(--accent-gold)]/10 transition-all duration-500" />
                 
                 <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,169,78,0.15)] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300">
                          <Plus size={18} strokeWidth={2.5} />
                       </div>
                       <span className="text-[10px] font-black text-white/35 uppercase tracking-widest leading-none">Proposta</span>
                    </div>
                    <span className="text-[13px] min-[370px]:text-[15px] sm:text-[18px] font-black text-white mt-4 leading-tight tracking-tight uppercase">Nova Proposta</span>
                    <span className="text-[10px] text-white/40 font-semibold tracking-wide mt-1 uppercase">Criar Orçamento</span>
                 </div>
                 
                 <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-3">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">Iniciar proposta</span>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 group-hover:bg-[var(--accent-gold)]/10 group-hover:border-[var(--accent-gold)]/20 group-hover:text-[var(--accent-gold)] transition-all duration-300">
                       <ChevronRight size={14} />
                    </div>
                 </div>
              </div>

              {/* Simulador */}
              <div 
                onClick={() => onNavigate('atlas')}
                className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:from-white/[0.06] hover:to-white/[0.02] border border-white/[0.07] p-4 sm:p-5 rounded-[24px] flex flex-col justify-between h-44 shadow-xl relative overflow-hidden group cursor-pointer"
              >
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--accent-gold)]/5 rounded-full blur-[30px] group-hover:bg-[var(--accent-gold)]/10 transition-all duration-500" />
                 
                 <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] shadow-[0_0_15px_rgba(212,169,78,0.15)] group-hover:bg-[var(--accent-gold)] group-hover:text-black transition-colors duration-300">
                          <Zap size={18} />
                       </div>
                       <span className="text-[10px] font-black text-white/35 uppercase tracking-widest leading-none">Simulações</span>
                    </div>
                    <span className="text-[13px] min-[370px]:text-[15px] sm:text-[18px] font-black text-white mt-4 leading-tight tracking-tight uppercase">Simulador</span>
                    <span className="text-[10px] text-white/40 font-semibold tracking-wide mt-1 uppercase">Cenários & Metas</span>
                 </div>
                 
                 <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-3">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider group-hover:text-white/60 transition-colors">Testar cenários</span>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 group-hover:bg-[var(--accent-gold)]/10 group-hover:border-[var(--accent-gold)]/20 group-hover:text-[var(--accent-gold)] transition-all duration-300">
                       <ChevronRight size={14} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* SECTION 1: NEXT R$ 10.000 PANEL */}
        <div className="flex flex-col gap-5">
           <div className="flex items-center justify-between px-1">
             <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.3em] text-[11px] font-black">Previsão Comercial</SectionLabel>
             <span className="text-[9px] font-extrabold text-[#30D158] uppercase tracking-[0.2em] bg-[#30D158]/10 px-2.5 py-1 rounded-md border border-[#30D158]/25 flex items-center gap-1.5 shadow-sm">
                <Flame size={12} className="fill-[#30D158] animate-pulse" />
                Tempo Real
             </span>
           </div>
           
           <div className="bg-gradient-to-br from-[#1c1510] via-[#0E1016] to-[#08090C] border border-white/[0.08] rounded-[28px] p-6 md:p-8 shadow-[0_32px_70px_rgba(0,0,0,0.5)] flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent-gold)]/10 blur-3xl pointer-events-none rounded-full" />
              
              <div className="flex justify-between items-start z-10 gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Fluxo Provável (Weighted)</span>
                    <h3 className="text-[36px] font-black text-white tracking-tighter leading-none mt-2 font-mono">
                       {formatCurrencyBRL(weightedTotal)}
                    </h3>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 z-10">
                 <MoneyPill label="Em Negociação" value={forecast?.negotiation || 0} color="text-[var(--accent-gold)]" />
                 <MoneyPill label="Para Receber" value={forecast?.collection || 0} color="text-[#E85D5D]" />
                 <MoneyPill label="Em Execução" value={forecast?.execution || 0} color="text-[#0A84FF]" />
                 <MoneyPill label="Aprovado" value={forecast?.approved || 0} color="text-[#30D158]" />
              </div>
           </div>
        </div>

        {/* SECTION 2: HOT OPPORTUNITIES */}
        {hotProposals.length > 0 && (
          <div className="flex flex-col gap-5">
             <div className="flex justify-between items-center px-1">
               <SectionLabel className="!mb-0 uppercase tracking-widest text-[#E85D5D] flex items-center gap-2 font-black text-[11px] opacity-80">
                 <Flame size={14} className="fill-[#E85D5D]" /> Oportunidades Quentes
               </SectionLabel>
               <OpsChip label="FECHAR AGORA" tone="danger" />
             </div>
             <div className="flex flex-col gap-4">
                {hotProposals.slice(0, 3).map(opp => (
                  <OpportunityActionCard key={opp.id} opp={opp} onNavigate={onNavigate} />
                ))}
             </div>
          </div>
        )}

        {/* SECTION 3: COLLECTION RADAR */}
        {collections.length > 0 && (
          <div className="flex flex-col gap-5">
             <SectionLabel className="ml-1 uppercase tracking-widest text-[#E85D5D] font-black text-[11px] opacity-80">Radar de Cobrança</SectionLabel>
             <div className="flex flex-col gap-4">
                {collections.map(c => (
                  <OpportunityActionCard key={c.id} opp={c} onNavigate={onNavigate} />
                ))}
             </div>
          </div>
        )}

        {/* SECTION 4: RENEWALS & PMOC */}
        {renewals.length > 0 && (
          <div className="flex flex-col gap-5">
             <SectionLabel className="ml-1 uppercase tracking-widest text-[#0A84FF] font-black text-[11px] opacity-80">Blindagem PMOC / Renovações</SectionLabel>
             <div className="flex flex-col gap-4">
                {renewals.map(r => (
                  <OpportunityActionCard key={r.id} opp={r} onNavigate={onNavigate} />
                ))}
             </div>
          </div>
        )}

        {/* SECTION 5: REACTIVATION */}
        {reactivations.length > 0 && (
          <div className="flex flex-col gap-5">
             <SectionLabel className="ml-1 uppercase tracking-widest text-purple-400 font-black text-[11px] opacity-80">Reativação de Clientes</SectionLabel>
             <div className="flex flex-col gap-4">
                {reactivations.slice(0, 3).map(ra => (
                  <OpportunityActionCard key={ra.id} opp={ra} onNavigate={onNavigate} />
                ))}
             </div>
          </div>
        )}

        {/* PROFIT INTELLIGENCE */}
        {profit && profit.grossProfit > 0 && (
          <div className="flex flex-col gap-5">
             <SectionLabel className="ml-1 uppercase tracking-widest text-[#30D158] font-black text-[11px] opacity-80">Inteligência de Lucro</SectionLabel>
             <div className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-[24px] p-5 shadow-md">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <BarChart3 size={20} className="text-[#30D158]" />
                      <Stack className="gap-0.5">
                         <span className="text-[13px] font-black text-white uppercase tracking-tight">Margem Operacional</span>
                         <span className="text-[10px] text-white/30 uppercase font-semibold">Rentabilidade Real: {profit.marginPercent}%</span>
                      </Stack>
                   </div>
                   <FinancialValue value={profit.grossProfit} className="text-[18px] font-mono font-black text-[#30D158]" />
                </div>
             </div>
          </div>
        )}

      </div>
    </ScreenContainer>
  );
};

const MoneyPill = ({ label, value, color }: any) => (
  <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.07] p-4 rounded-xl flex flex-col gap-1 transition-all">
     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</span>
     <span className={cn("text-[14px] font-mono font-black", color)}>{formatCurrencyBRL(value)}</span>
  </div>
);

const OpportunityActionCard = ({ opp, onNavigate }: { opp: NextMoneyOpportunity, onNavigate: (tab: any) => void }) => {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (opp.type === 'RENEWAL') {
       operationalFacade.generateRenewalProposal(opp.id).then(newId => {
          onNavigate({ tab: 'revenue', budgetId: newId });
       });
       return;
    }

    const typeMap: Record<string, WhatsAppTemplateType> = {
      FOLLOW_UP: 'FOLLOW_UP',
      COLLECTION: 'COLLECTION',
      REACTIVATION: 'REACTIVATION'
    };

    const templateType = typeMap[opp.type];
    if (templateType) {
      whatsappCommercialBridge.open(templateType, '5517999999999', { 
        name: opp.clientName, 
        title: opp.title.split(': ').pop(),
        value: opp.expectedRevenue 
      });
    }
  };

  const getBoxStyle = (type: string) => {
    if (type === 'COLLECTION') {
      return "bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(255,69,58,0.15)]";
    }
    if (type === 'FOLLOW_UP') {
      return "bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] shadow-[0_0_15px_rgba(212,169,78,0.15)]";
    }
    return "bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] shadow-[0_0_15px_rgba(10,132,255,0.15)]";
  };

  return (
    <div 
      onClick={() => {
        if (opp.type === 'FOLLOW_UP') onNavigate({ tab: 'revenue', budgetId: opp.metadata?.budgetId });
        else onNavigate({ tab: 'relationships', clientId: opp.clientId });
      }}
      className="w-full text-left bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:from-white/[0.05] hover:to-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] p-5 rounded-[20px] flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer shadow-md group"
    >
       <div className="flex items-center gap-5">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", getBoxStyle(opp.type))}>
             {opp.type === 'COLLECTION' ? <DollarSign size={20} /> : <TrendingUp size={20} />}
          </div>
          <div className="flex flex-col">
             <span className="text-[15px] font-black text-white uppercase truncate max-w-[180px] tracking-tight">{opp.clientName}</span>
             <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{opp.title}</span>
             <button 
               onClick={handleAction}
               className="mt-3 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[var(--accent-gold)] hover:text-black transition-all cursor-pointer"
             >
                {opp.recommendedAction} <ArrowUpRight size={12} strokeWidth={3} />
             </button>
          </div>
       </div>
       <div className="flex flex-col items-end">
          <FinancialValue value={opp.expectedRevenue} className="text-[17px] font-mono font-black text-white" />
          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{opp.timeSinceLastContact}</span>
       </div>
    </div>
  );
};
