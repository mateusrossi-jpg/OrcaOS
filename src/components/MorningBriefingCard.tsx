import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Zap, 
  CalendarDays,
  Target,
  ArrowUpRight,
  Flame,
  Circle
} from 'lucide-react';
import { cn } from '../utils/ui';
import { 
  SurfaceCard, 
  SectionLabel, 
  Body, 
  Subtitle, 
  Stack, 
  OpsChip,
  ERPLoader,
  FinancialValue
} from '../ui/system';
import { morningBriefingService, MorningBriefing, BriefingItem } from '../services/MorningBriefingService';

interface MorningBriefingCardProps {
  onNavigate: (tab: string, id?: string) => void;
}

/**
 * MorningBriefingCard: The high-signal intelligence layer.
 * RC9.2 Command Center Edition (Noise-Free).
 */
export const MorningBriefingCard: React.FC<MorningBriefingCardProps> = ({ onNavigate }) => {
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await morningBriefingService.getBriefing();
      setBriefing(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <SurfaceCard padding="lg" className="opacity-50"><ERPLoader message="Priorizando inteligência..." /></SurfaceCard>;
  if (!briefing || briefing.items.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
       <div className="flex flex-col gap-4">
          {briefing.items.map((item) => {
            const isHot = item.temperature === 'HOT';
            const isOpportunity = item.type === 'opportunity';
            const isCritical = item.type === 'critical';

            return (
              <button 
                key={item.id}
                onClick={() => onNavigate(item.actionTab, item.actionId)}
                className={cn(
                  "w-full text-left border p-6 rounded-[32px] flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white/[0.04] bg-white/[0.02]",
                  isHot ? "border-red-500/30" : "border-white/10"
                )}
              >
                 <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border",
                      isCritical ? "bg-red-500/10 border-red-500/20 text-red-500" : 
                      isOpportunity ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/20 text-[var(--accent-gold)]" :
                      "bg-white/5 border-white/10 text-white/40"
                    )}>
                       {isCritical ? <Flame size={24} /> : isOpportunity ? <Target size={24} /> : <Zap size={24} />}
                    </div>
                    <Stack className="gap-1 items-start">
                       <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[15px] font-black uppercase tracking-tight leading-none truncate max-w-[160px]",
                            isHot ? "text-white" : "text-white/80"
                          )}>
                            {item.title}
                          </span>
                       </div>
                       <Subtitle className="text-[12px] opacity-40 font-medium leading-tight max-w-[200px]">{item.subtitle}</Subtitle>
                       
                       <div className={cn(
                         "mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                         isHot ? "bg-white text-black" : "bg-white/5 text-white/60"
                       )}>
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {item.actionLabel} {item.actionLabel.includes('RESGATAR') ? '→' : ''}
                          </span>
                       </div>
                    </Stack>
                 </div>

                 <div className="flex flex-col items-end shrink-0 relative z-10">
                    {item.value ? (
                      <div className="flex flex-col items-end">
                        <FinancialValue value={item.value} className={cn(
                          "text-[18px] font-mono font-black",
                          isHot ? "text-white" : "text-white/60"
                        )} />
                        {isHot && isOpportunity && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">EM RISCO</span>
                        )}
                        {isHot && isCritical && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">ATRASADO</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                         <ArrowUpRight size={18} />
                      </div>
                    )}
                 </div>
              </button>
            );
          })}
       </div>
    </div>
  );
};

