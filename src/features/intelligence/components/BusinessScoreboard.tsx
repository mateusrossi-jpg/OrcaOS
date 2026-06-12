import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Clock, 
  Zap, 
  DollarSign, 
  ChevronRight,
  TrendingDown,
  Activity,
  Award
} from 'lucide-react';
import { 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Body, 
  Subtitle, 
  FinancialValue,
  ExecutiveSummaryGrid,
  ValueBlock,
  OpsChip,
  ERPLoader
} from '../../../ui/system';
import { businessScoreboardService, ScoreboardResults } from '../../../services/BusinessScoreboardService';
import { cn } from '../../../utils/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

interface BusinessScoreboardProps {
  onNavigate: (tab: any) => void;
}

/**
 * BusinessScoreboard: The high-fidelity results layer (RC16).
 * Answers: "Did I make money? What am I losing? What should I do next?"
 */
export const BusinessScoreboard: React.FC<BusinessScoreboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<ScoreboardResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results = await businessScoreboardService.getScoreboard();
      setData(results);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <div className="py-20 flex justify-center"><ERPLoader message="Consolidando resultados..." /></div>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
       
       {/* 1. TODAY'S SCOREBOARD (THE WIN/LOSS VIEW) */}
       <Section className="gap-6">
          <div className="flex justify-between items-center px-1">
             <SectionLabel className="!mb-0 uppercase tracking-[0.25em] text-[13px] font-black text-[#FFD60A]">Placar de Hoje</SectionLabel>
             <OpsChip label="REAL-TIME" tone="success" className="scale-75" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ResultCard 
               label="Receita Coletada" 
               value={formatCurrencyBRL(data.today.revenueCollected)} 
               type="success"
               icon={<CheckCircle2 size={20} />}
             />
             <ResultCard 
               label="Propostas Aprovadas" 
               value={`${data.today.proposalsApproved} Acordos`} 
               type="info"
               icon={<Zap size={20} />}
             />
             <ResultCard 
               label="Receita em Risco" 
               value={formatCurrencyBRL(data.today.revenueAtRisk)} 
               type="danger"
               icon={<AlertTriangle size={20} />}
             />
             <ResultCard 
               label="Cobranças Atrasadas" 
               value={`${data.today.delayedCollections} Pendências`} 
               type="warning"
               icon={<DollarSign size={20} />}
             />
          </div>
       </Section>

       {/* 2. WEEKLY PERFORMANCE (THE VELOCITY VIEW) */}
       <Section className="gap-6">
          <SectionLabel className="ml-1 uppercase tracking-[0.25em] text-[13px] font-black text-[#8E8E93]">Desempenho da Semana</SectionLabel>
          <ExecutiveSummaryGrid>
             <ValueBlock label="Gerado" value={formatCurrencyBRL(data.weekly.revenueGenerated)} variant="warning" />
             <ValueBlock label="Recuperado" value={formatCurrencyBRL(data.weekly.revenueRecovered)} variant="success" />
             <ValueBlock label="Protegido" value={formatCurrencyBRL(data.weekly.revenueProtected)} />
          </ExecutiveSummaryGrid>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="p-4 rounded-[20px] bg-[#363638] flex flex-col items-center gap-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-none">
                <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] text-center">Ticket Médio</span>
                <span className="text-[14px] font-black text-white">{formatCurrencyBRL(data.weekly.averageTicket)}</span>
             </div>
             <div className="p-4 rounded-[20px] bg-[#363638] flex flex-col items-center gap-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-none">
                <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] text-center">Conversão</span>
                <span className="text-[14px] font-black text-[#30D158]">{Math.round(data.weekly.proposalConversion)}%</span>
             </div>
             <div className="p-4 rounded-[20px] bg-[#363638] flex flex-col items-center gap-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-none">
                <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] text-center">Satisfação</span>
                <span className="text-[14px] font-black text-[#FFD60A]">{data.weekly.customerSatisfaction}%</span>
             </div>
          </div>
       </Section>

       {/* 3. STRATEGIC INSIGHTS (THE FUTURE VIEW) */}
       <Section className="gap-6">
          <SectionLabel className="ml-1 uppercase tracking-[0.25em] text-[13px] font-black text-[#3B82F6]">Visão Estratégica</SectionLabel>
          <div className="p-6 bg-[#363638] rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-none relative overflow-hidden">
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] border-none shadow-inner">
                         <TrendingUp size={24} />
                      </div>
                      <Stack className="gap-1">
                         <span className="text-[15px] font-bold text-white uppercase tracking-tight">Tendência de Receita</span>
                         <Subtitle className="text-[12px] text-[#C7C7CC] font-semibold uppercase tracking-wider">Crescimento constante detectado</Subtitle>
                      </Stack>
                   </div>
                   <OpsChip label="POSITIVA" tone="success" />
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black text-[#8E8E93] uppercase tracking-[0.15em]">Oportunidades em Aberto</span>
                      <FinancialValue value={data.monthly.topOpportunitiesValue} className="text-[20px] font-mono font-black text-white" />
                   </div>
                   <button 
                     onClick={() => onNavigate('revenue')}
                     className="px-6 h-12 bg-white text-[#2C2C2E] font-black text-[12px] uppercase tracking-widest rounded-[14px] active:scale-[0.975] transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-none cursor-pointer"
                   >
                      AGIR AGORA <ChevronRight size={14} />
                   </button>
                </div>
             </div>
          </div>
       </Section>

    </div>
  );
};

const ResultCard = ({ label, value, type, icon }: any) => {
  const textColors = {
    success: "text-[#30D158]",
    danger: "text-[#FF453A]",
    warning: "text-[#FFD60A]",
    info: "text-[#3B82F6]"
  };

  const iconBgColors = {
    success: "bg-[#30D158]/10 text-[#30D158]",
    danger: "bg-[#FF453A]/10 text-[#FF453A]",
    warning: "bg-[#FFD60A]/10 text-[#FFD60A]",
    info: "bg-[#3B82F6]/10 text-[#3B82F6]"
  };

  return (
    <div className="p-6 bg-[#363638] rounded-[24px] flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.12)] aferix-tactile-card border-none">
       <div className="flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">{label}</span>
          <span className={cn("text-[20px] font-black uppercase tracking-tight", textColors[type as keyof typeof textColors] || "text-white")}>{value}</span>
       </div>
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", iconBgColors[type as keyof typeof iconBgColors])}>
         {icon}
       </div>
    </div>
  );
};

const Section = ({ children, className }: any) => (
  <div className={cn("flex flex-col", className)}>{children}</div>
);
