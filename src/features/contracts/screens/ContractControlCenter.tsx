import React from 'react';
import { 
  SurfaceCard, 
  ExecutiveHeader, 
  HeroCard, 
  ExecutiveSummaryGrid, 
  ValueBlock, 
  SectionLabel, 
  TimelineCard,
  Section,
  Body,
  Subtitle,
  FinancialValue,
  ScreenContainer
} from '../../../ui/system';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CalendarClock, 
  History, 
  TrendingUp,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { cn } from '../../../utils/ui';

/**
 * ContractControlCenter: High-fidelity Subscription & Retention Hub.
 * Aligned with AFERIX EXECUTIVE OS (Phase 6 Hardening).
 */
export const ContractControlCenter: React.FC = () => {
  return (
    <ScreenContainer className="pb-40 bg-aferix-bg">
      <ExecutiveHeader userName="Mateus" score={98} />

      <div className="px-6 flex flex-col gap-10">
        
        {/* HERO ESTRATÉGICO: SAÚDE DA RECEITA RECORRENTE */}
        <HeroCard 
          state="active"
          title="Faturamento Recorrente"
          client="112 Contratos em Carteira"
          time="Mês Base: Junho"
          eta="R$ 142.500 MRR"
          onAction={() => {}}
        />

        {/* SUMÁRIO EXECUTIVO DE RETENÇÃO */}
        <ExecutiveSummaryGrid>
           <ValueBlock 
            label="RECEITA PROTEGIDA" 
            value="R$ 142k" 
            icon={<ShieldCheck size={12} />} 
            variant="success"
           />
           <ValueBlock 
            label="EM RISCO" 
            value="R$ 28k" 
            icon={<AlertTriangle size={12} />} 
            variant="danger"
           />
           <ValueBlock 
            label="PROJETADO" 
            value="R$ 1.7M" 
            icon={<TrendingUp size={12} />} 
           />
        </ExecutiveSummaryGrid>

        {/* RENOVAÇÕES E TIMELINE DE CONTRATOS */}
        <Section className="gap-8">
           <SectionLabel className="ml-1 text-[11px] font-black tracking-widest text-[#D4AF37]">Ciclo de Renovações (90 dias)</SectionLabel>
           
           <div className="flex flex-col gap-0 relative">
              <TimelineCard 
                time="EM 15 DIAS"
                title="Supermercado União"
                status="R$ 6.600 / Mês"
                state="active"
              />
              <TimelineCard 
                time="EM 45 DIAS"
                title="Hospital Santa Helena"
                status="R$ 14.500 / Mês"
                state="upcoming"
              />
              <TimelineCard 
                time="EM 60 DIAS"
                title="Condomínio Vale Verde"
                status="R$ 3.200 / Mês"
                state="upcoming"
              />
           </div>
        </Section>

        {/* LISTA DE CONTRATOS ATIVOS */}
        <Section>
           <SectionLabel className="ml-1">Contratos em Vigor</SectionLabel>
           <SurfaceCard padding="none" className="border-white/[0.08] overflow-hidden shadow-2xl">
              {[
                { name: 'Clínica São Lucas', value: 8500, freq: 'Mensal', health: 'healthy' },
                { name: 'Shopping Rio Preto', value: 24000, freq: 'Trimestral', health: 'warning' },
                { name: 'Auto Center RP', value: 1800, freq: 'Mensal', health: 'healthy' }
              ].map((c, i) => (
                <div key={i} className="border-b border-white/[0.03] last:border-b-0">
                  <div className="p-6 flex items-center justify-between">
                     <div className="flex flex-col gap-1">
                        <Body className="font-black text-white leading-none uppercase">{c.name}</Body>
                        <Subtitle className="text-[11px] uppercase tracking-wider opacity-40">{c.freq} · {formatCurrencyBRL(c.value)}</Subtitle>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          c.health === 'healthy' ? "bg-[#47C46A]" : "bg-[#FFB340]"
                        )} />
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                           <ArrowUpRight size={18} />
                        </button>
                     </div>
                  </div>
                </div>
              ))}
           </SurfaceCard>
        </Section>

      </div>
    </ScreenContainer>
  );
};
