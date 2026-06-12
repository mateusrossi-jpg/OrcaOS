import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  Zap, 
  ChevronRight, 
  FileText, 
  DollarSign, 
  CalendarClock,
  Sparkles,
  ArrowUpRight,
  Target,
  BarChart3,
  ShieldCheck,
  Phone,
  Flame,
  Circle
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

interface NextMoneyWorkspaceProps {
  onNavigate: (tab: any) => void;
}

/**
 * NextMoneyWorkspace: The Revenue Command Center (RC9.1).
 * Focused on the "5-Second Rule" and "Action-First" hierarchy.
 */
export const NextMoneyWorkspace: React.FC<NextMoneyWorkspaceProps> = ({ onNavigate }) => {
  const [opps, setOpps] = useState<NextMoneyOpportunity[]>([]);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [profit, setProfit] = useState<ProfitInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [o, f, p] = await Promise.all([
        nextMoneyEngine.getNextMoneyOpportunities(),
        nextMoneyEngine.getRevenueForecast(),
        revenueIntelligenceService.getProfitIntelligence()
      ]);
      setOpps(o);
      setForecast(f);
      setProfit(p);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Ativando radar comercial..." /></ScreenContainer>;

  const weightedTotal = opps.reduce((acc, o) => acc + o.weightedValue, 0);
  const hotOpportunities = opps.filter(o => o.temperature === 'HOT').slice(0, 5);
  const allActionable = opps.filter(o => o.temperature !== 'COLD').slice(0, 10);

  return (
    <ScreenContainer className="pb-40">
      <ExecutiveHeader userName="Diretor" score={98} />

      <div className="px-6 flex flex-col gap-10">
        
        {/* PHASE 5: PRÓXIMOS R$ 10.000 PANEL */}
        <SurfaceCard padding="xl" className="bg-gradient-to-br from-[#1C2127] to-[#0A0C12] border-[var(--accent-gold)]/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-gold)]/5 rounded-full blur-[60px]" />
           <SectionLabel className="mb-2 opacity-40 uppercase tracking-[0.2em]">Fluxo Provável (Próximos R$ 10.000)</SectionLabel>
           <div className="flex items-end gap-3 mb-8">
              <span className="text-[48px] font-black text-white font-mono tracking-tighter leading-none">
                {formatCurrencyBRL(weightedTotal)}
              </span>
              <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded-lg bg-[#47C46A]/10 text-[#47C46A]">
                 <Flame size={12} className="fill-[#47C46A]" />
                 <span className="text-[10px] font-black">SCAN_REAL_TIME</span>
              </div>
           </div>
           
           {/* PHASE 6: PIPELINE BY MONEY */}
           <div className="grid grid-cols-2 gap-3">
              <MoneyPill label="Em Negociação" value={forecast?.negotiation || 0} color="text-[var(--accent-gold)]" />
              <MoneyPill label="Aguardando Receber" value={forecast?.collection || 0} color="text-[#E85D5D]" />
              <MoneyPill label="Em Execução" value={forecast?.execution || 0} color="text-[#0A84FF]" />
              <MoneyPill label="Aprovado / JIT" value={forecast?.approved || 0} color="text-[#47C46A]" />
           </div>
        </SurfaceCard>

        {/* PHASE 4: REVENUE HEATMAP - TOP ACTIONS */}
        <Section className="gap-6">
           <div className="flex justify-between items-center px-1">
             <SectionLabel className="!mb-0 uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
               <Target size={14} /> O que fazer agora?
             </SectionLabel>
             <OpsChip label="AÇÃO IMEDIATA" tone="danger" />
           </div>

           <div className="flex flex-col gap-4">
              {allActionable.length > 0 ? (
                allActionable.map(opp => (
                  <ActionOpportunityCard 
                    key={opp.id} 
                    opp={opp} 
                    onClick={() => {
                      if (opp.type === 'FOLLOW_UP') onNavigate({ tab: 'budgets', id: opp.metadata?.budgetId });
                      else if (opp.type === 'COLLECTION') onNavigate('money');
                      else onNavigate('base');
                    }}
                  />
                ))
              ) : (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-[32px] opacity-20">
                   <Body className="text-[12px] font-black uppercase tracking-widest">Nenhuma ação crítica hoje</Body>
                </div>
              )}
           </div>
        </Section>

        {/* PROFIT INTELLIGENCE */}
        {profit && profit.grossProfit > 0 && (
          <Section className="gap-6 opacity-60 hover:opacity-100 transition-opacity">
             <SectionLabel className="ml-1 uppercase tracking-widest text-[#47C46A]">Saúde das Margens</SectionLabel>
             <SurfaceCard padding="lg" className="bg-[#15181D]/40 border-white/5 shadow-xl">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <BarChart3 size={20} className="text-[#47C46A]" />
                      <Stack className="gap-0.5">
                         <span className="text-[13px] font-black text-white uppercase">Lucro Bruto Consolidado</span>
                         <span className="text-[10px] text-white/30 uppercase">Margem Real: {profit.marginPercent}%</span>
                      </Stack>
                   </div>
                   <FinancialValue value={profit.grossProfit} className="text-[18px] font-mono font-black text-[#47C46A]" />
                </div>
             </SurfaceCard>
          </Section>
        )}

      </div>
    </ScreenContainer>
  );
};

const MoneyPill = ({ label, value, color }: any) => (
  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-[20px] flex flex-col gap-1">
     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</span>
     <span className={cn("text-[14px] font-mono font-black", color)}>{formatCurrencyBRL(value)}</span>
  </div>
);

const ActionOpportunityCard = ({ opp, onClick }: { opp: NextMoneyOpportunity, onClick: () => void }) => {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (opp.type === 'RENEWAL') {
       operationalFacade.generateRenewalProposal(opp.id).then(newId => {
          window.dispatchEvent(new CustomEvent('aferix_navigate', { detail: { tab: 'budgets', id: newId } }));
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
    } else {
      onClick();
    }
  };

  const tempStyles = {
    HOT: "border-[#E85D5D]/30 bg-[#E85D5D]/[0.02] shadow-[0_0_20px_rgba(255,92,92,0.05)]",
    WARM: "border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/[0.02]",
    COLD: "border-white/10 bg-white/[0.01]"
  };

  const tempIcon = {
    HOT: <Flame size={18} className="text-[#E85D5D] fill-[#E85D5D]/20" />,
    WARM: <Circle size={18} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]/20" />,
    COLD: <Circle size={18} className="text-white/20" />
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left border p-6 rounded-[32px] flex items-center justify-between active:scale-[0.98] transition-all hover:bg-white/[0.04]",
        tempStyles[opp.temperature]
      )}
    >
       <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center border border-white/5 shadow-inner">
             {tempIcon[opp.temperature]}
          </div>
          <div className="flex flex-col">
             <div className="flex items-center gap-3">
                <span className="text-[17px] font-black text-white uppercase truncate max-w-[180px]">{opp.clientName}</span>
                {opp.temperature === 'HOT' && <Flame size={12} className="text-[#E85D5D] animate-pulse" />}
             </div>
             <div className="flex flex-col mt-1 gap-0.5">
                <span className="text-[12px] text-white/40 font-medium uppercase tracking-wide leading-none">{opp.title}</span>
                <span className="text-[10px] text-white/20 font-mono uppercase mt-1">Aguardando há {opp.timeSinceLastContact}</span>
             </div>
             
             {/* PHASE 3: THE 3 CLICK ACTION */}
             <div 
               onClick={handleAction}
               className="mt-4 inline-flex items-center gap-2 bg-[var(--accent-gold)] text-black px-4 py-2 rounded-xl active:scale-95 transition-all"
             >
                <span className="text-[10px] font-black uppercase tracking-widest">{opp.recommendedAction}</span>
                <ArrowUpRight size={14} strokeWidth={3} />
             </div>
          </div>
       </div>
       <div className="flex flex-col items-end">
          <FinancialValue value={opp.expectedRevenue} className="text-[20px] font-mono font-black text-white" />
          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">VALOR PROVÁVEL</span>
       </div>
    </button>
  );
};
