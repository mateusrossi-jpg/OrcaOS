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
  ArrowUpRight
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
  ERPLoader
} from '../../../ui/system';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { cn } from '../../../utils/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

interface RevenueMemoryDashboardProps {
  onNavigate: (tab: any) => void;
}

/**
 * RevenueMemoryDashboard: Commercial Intelligence Hub.
 * RC4.2 "Memory Engine" implementation.
 * Answers: "Where is the next money?"
 */
export const RevenueMemoryDashboard: React.FC<RevenueMemoryDashboardProps> = ({ onNavigate }) => {
  const [alertHub, setAlertHub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const hub = await operationalReadModelService.getCRMAlertHubProjection();
      setAlertHub(hub);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Ativando inteligência comercial..." /></ScreenContainer>;

  const totalOpportunityValue = (alertHub?.commercialFollowUp?.reduce((acc: number, b: any) => acc + (b.chargedValue || 0), 0) || 0) +
                                (alertHub?.stalledBudgets?.reduce((acc: number, b: any) => acc + (b.chargedValue || 0), 0) || 0);

  return (
    <ScreenContainer className="pb-40">
      <ExecutiveHeader userName="Comercial" score={98} />

      <div className="px-6 flex flex-col gap-10">
        
        {/* TOP INTELLIGENCE METRICS */}
        <HeroRevenueCard value={totalOpportunityValue} />

        <ExecutiveSummaryGrid>
           <ValueBlock label="Follow-ups" value={alertHub?.commercialFollowUp?.length || 0} icon={<Clock size={12} />} variant="warning" />
           <ValueBlock label="Cobranças" value={alertHub?.debtors?.length || 0} icon={<DollarSign size={12} />} variant="danger" />
           <ValueBlock label="Retenção" value={`${alertHub?.inactive?.length || 0} Inativos`} icon={<AlertTriangle size={12} />} />
        </ExecutiveSummaryGrid>

        {/* OPPORTUNITY FEED */}
        <Section className="gap-6">
           <SectionLabel className="ml-1 uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
             <Sparkles size={14} /> Pipeline de Memória
           </SectionLabel>

           <div className="flex flex-col gap-4">
              {/* FOLLOW-UP GROUP */}
              {alertHub?.commercialFollowUp?.length > 0 && (
                <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Propostas Aguardando (3+ dias)</span>
                   {alertHub.commercialFollowUp.map((b: any) => (
                     <OpportunityCard 
                        key={b.id}
                        title={b.title}
                        client={b.clientName}
                        value={b.chargedValue}
                        type="FOLLOW_UP"
                        onClick={() => onNavigate({ tab: 'budgets', id: b.id })}
                     />
                   ))}
                </div>
              )}

              {/* RENEWALS GROUP (MOCK LOGIC FOR RC4.2) */}
              <div className="flex flex-col gap-3">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Próximas Renovações PMOC</span>
                 <OpportunityCard 
                    title="Manutenção Preventiva Q3"
                    client="Condomínio Vale Verde"
                    value={1250.00}
                    type="RENEWAL"
                    onClick={() => onNavigate('base')}
                 />
              </div>

              {/* DEBTORS GROUP */}
              {alertHub?.debtors?.length > 0 && (
                <div className="flex flex-col gap-3 mt-4">
                   <span className="text-[10px] font-black text-[#E85D5D] uppercase tracking-[0.2em] ml-1">Faturamento Pendente</span>
                   {alertHub.debtors.map((c: any) => (
                     <OpportunityCard 
                        key={c.clientId}
                        title="Recebimento em Atraso"
                        client={c.clientName}
                        value={c.openBalance}
                        type="COLLECTION"
                        onClick={() => onNavigate('money')}
                     />
                   ))}
                </div>
              )}
           </div>
        </Section>

      </div>
    </ScreenContainer>
  );
};

const HeroRevenueCard = ({ value }: { value: number }) => (
  <SurfaceCard padding="xl" className="bg-gradient-to-br from-[#1C2127] to-[#15181D] border-[var(--accent-gold)]/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
     <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-gold)]/5 rounded-full blur-[60px]" />
     <SectionLabel className="mb-2 opacity-40">Oportunidades em Aberto</SectionLabel>
     <div className="flex items-end gap-3 mb-6">
        <span className="text-[44px] font-black text-white font-mono tracking-tighter leading-none">{formatCurrencyBRL(value)}</span>
        <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded-lg bg-[#47C46A]/10 text-[#47C46A]">
           <ArrowUpRight size={12} />
           <span className="text-[10px] font-black">REVENUE_SCAN</span>
        </div>
     </div>
     <Body className="text-[12px] text-white/40 max-w-[240px] leading-relaxed">Este valor representa propostas enviadas e recorrências previstas para os próximos 30 dias.</Body>
  </SurfaceCard>
);

const OpportunityCard = ({ title, client, value, type, onClick }: any) => {
  const icons = {
    FOLLOW_UP: <Clock size={18} className="text-[var(--accent-gold)]" />,
    RENEWAL: <Zap size={18} className="text-[#0A84FF]" />,
    COLLECTION: <DollarSign size={18} className="text-[#E85D5D]" />
  };

  return (
    <button 
      onClick={onClick}
      className="w-full text-left bg-white/[0.02] border border-white/10 p-5 rounded-[22px] flex items-center justify-between active:scale-98 transition-all hover:bg-white/[0.04]"
    >
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
             {icons[type as keyof typeof icons]}
          </div>
          <div className="flex flex-col">
             <span className="text-[14px] font-bold text-white uppercase truncate max-w-[160px]">{title}</span>
             <span className="text-[11px] text-white/30 uppercase tracking-widest">{client}</span>
          </div>
       </div>
       <div className="flex flex-col items-end">
          <span className="text-[14px] font-mono font-black text-white">{formatCurrencyBRL(value)}</span>
          <span className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-widest mt-1">AÇÃO REQUERIDA</span>
       </div>
    </button>
  );
};
