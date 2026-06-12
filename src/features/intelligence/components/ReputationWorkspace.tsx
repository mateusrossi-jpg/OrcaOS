import React, { useEffect, useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Share2, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe,
  Camera,
  LayoutGrid,
  FileText,
  Clock
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
import { reputationEngine, ReputationSummary } from '../../../services/ReputationEngine';
import { db } from '../../../storage/dexieDatabase';
import { cn } from '../../../utils/ui';
import { formatCurrencyBRL } from '../../../utils/formatters';

interface ReputationWorkspaceProps {
  onNavigate: (tab: any) => void;
}

/**
 * ReputationWorkspace: Growth & Trust Intelligence (RC10).
 * Answers: "How much trust are we building?"
 */
export const ReputationWorkspace: React.FC<ReputationWorkspaceProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<ReputationSummary | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [topAdvocates, setTopAdvocates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, revs, advocates] = await Promise.all([
        reputationEngine.getGlobalReputationSummary(),
        db.reviews.orderBy('createdAt').reverse().limit(5).toArray(),
        db.reputationMetrics.orderBy('happiness').reverse().limit(5).toArray()
      ]);
      
      setSummary(s);
      setRecentReviews(revs);
      setTopAdvocates(advocates);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Mapeando reputação e confiança..." /></ScreenContainer>;

  return (
    <ScreenContainer className="pb-40">
      <ExecutiveHeader userName="Líder" score={summary?.reputationScore || 0} />

      <div className="px-6 flex flex-col gap-10">
        
        {/* REPUTATION HERO (Phase 10) */}
        <SurfaceCard padding="xl" className="bg-gradient-to-br from-[#1C2127] to-[#0A0C12] border-[var(--accent-gold)]/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-gold)]/5 rounded-full blur-[60px]" />
           <SectionLabel className="mb-2 opacity-40">Índice de Confiança do Mercado</SectionLabel>
           <div className="flex items-end gap-3 mb-6">
              <span className="text-[44px] font-black text-white font-mono tracking-tighter leading-none">{(summary?.reputationScore || 0) / 20}<span className="text-white/20 text-[24px]">/5.0</span></span>
              <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded-lg bg-[#47C46A]/10 text-[#47C46A]">
                 <TrendingUp size={12} />
                 <span className="text-[10px] font-black">EXCELENTE</span>
              </div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
              <MetricPill label="Reviews" value={summary?.totalReviews || 0} icon={<MessageCircle size={12} />} />
              <MetricPill label="Indicações" value={summary?.totalReferrals || 0} icon={<Share2 size={12} />} />
              <MetricPill label="Felicidade" value={`${summary?.happinessScore}%`} icon={<ThumbsUp size={12} />} color="text-[#47C46A]" />
           </div>
        </SurfaceCard>

        {/* GROWTH CHANNELS (Phase 9) */}
        <Section className="gap-6">
           <SectionLabel className="ml-1 uppercase tracking-widest text-white/30">Canais de Crescimento Orgânico</SectionLabel>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {}}
                className="bg-white/[0.03] border border-white/5 p-6 rounded-[28px] flex flex-col gap-4 active:scale-95 transition-all"
              >
                 <div className="w-10 h-10 rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center">
                    <Globe size={20} />
                 </div>
                 <Stack className="gap-1">
                    <span className="text-[14px] font-black text-white uppercase">Google Maps</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Link de Avaliação</span>
                 </Stack>
              </button>
              <button 
                onClick={() => {}}
                className="bg-white/[0.03] border border-white/5 p-6 rounded-[28px] flex flex-col gap-4 active:scale-95 transition-all"
              >
                 <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
                    <Share2 size={20} />
                 </div>
                 <Stack className="gap-1">
                    <span className="text-[14px] font-black text-white uppercase">Indicação</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Cupom de Desconto</span>
                 </Stack>
              </button>
           </div>
        </Section>

        {/* RECENT FEEDBACK (Phase 6) */}
        <Section className="gap-6">
           <div className="flex justify-between items-center px-1">
              <SectionLabel className="!mb-0 uppercase tracking-widest text-[#47C46A]">Últimos Testemunhos</SectionLabel>
              <OpsChip label="REAL-TIME" tone="success" />
           </div>
           
           <div className="flex flex-col gap-4">
              {recentReviews.length > 0 ? (
                recentReviews.map(rev => (
                  <FeedbackCard key={rev.id} review={rev} />
                ))
              ) : (
                <div className="py-12 text-center border border-dashed border-white/5 rounded-[28px] opacity-20">
                   <Body className="text-[10px] font-black uppercase tracking-widest">Aguardando primeira avaliação</Body>
                </div>
              )}
           </div>
        </Section>

        {/* TOP ADVOCATES (Phase 5) */}
        {topAdvocates.length > 0 && (
          <Section className="gap-6">
             <SectionLabel className="ml-1 uppercase tracking-widest text-[var(--accent-gold)]">Maiores Defensores da Marca</SectionLabel>
             <div className="flex flex-col gap-3">
                {topAdvocates.map((adv, i) => (
                  <AdvocateRow key={adv.id} advocate={adv} rank={i+1} />
                ))}
             </div>
          </Section>
        )}

      </div>
    </ScreenContainer>
  );
};

const MetricPill = ({ label, value, icon, color }: any) => (
  <div className="flex flex-col min-w-[100px] bg-white/[0.02] border border-white/5 p-3 rounded-xl">
     <div className="flex items-center gap-1.5 mb-1 opacity-30">
        {icon}
        <span className="text-[8px] font-black text-white uppercase tracking-widest">{label}</span>
     </div>
     <span className={cn("text-[13px] font-mono font-black text-white", color)}>{value}</span>
  </div>
);

const FeedbackCard = ({ review }: any) => (
  <SurfaceCard padding="lg" className="bg-[#15181D] border-white/5 shadow-xl">
     <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
           <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={cn(i < review.rating ? "text-[var(--accent-gold)] fill-current" : "text-white/10")} />
              ))}
           </div>
           <span className="text-[9px] font-mono font-bold text-white/20 uppercase">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <Body className="text-[13px] text-white/70 italic leading-relaxed">"{review.comment || 'O cliente não deixou um comentário escrito.'}"</Body>
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
           <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-white/40 uppercase">
             {review.clientId.substring(0, 2)}
           </div>
           <Subtitle className="text-[10px] uppercase font-bold tracking-widest">ID #{review.workOrderId.substring(0, 6)}</Subtitle>
        </div>
     </div>
  </SurfaceCard>
);

const AdvocateRow = ({ advocate, rank }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
     <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-mono font-black text-xs">
           #{rank}
        </div>
        <div className="flex flex-col">
           <span className="text-[14px] font-bold text-white uppercase">{advocate.clientId.substring(0, 8)}</span>
           <span className="text-[9px] text-white/30 uppercase tracking-widest">Felicidade: {advocate.happiness}%</span>
        </div>
     </div>
     <div className="flex flex-col items-end">
        <OpsChip label="PROMOTOR" tone="success" className="scale-75 origin-right" />
        <span className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-widest mt-1">CLIENTE VIP</span>
     </div>
  </div>
);
