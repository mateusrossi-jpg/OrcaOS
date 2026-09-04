import React, { useEffect, useState } from 'react';
import { Trophy, Star, CheckCircle2, DollarSign, X } from 'lucide-react';
import { CelebrationState } from '../../services/CelebrationService';
import { formatCurrencyBRL } from '../../utils/formatters';
import { cn } from '../../utils/ui';

/**
 * WOWCelebrationOverlay
 * Global listener for high-value emotional milestones.
 * Aligned with AFERIX VISUAL PROTOCOL (V8).
 */
export const WOWCelebrationOverlay: React.FC = () => {
  const [activeMoment, setActiveMoment] = useState<CelebrationState | null>(null);

  useEffect(() => {
    const handleWow = (e: any) => {
      setActiveMoment(e.detail);
    };

    window.addEventListener('aferix_wow_moment', handleWow);
    return () => window.removeEventListener('aferix_wow_moment', handleWow);
  }, []);

  if (!activeMoment) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-aferix-bg/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-gradient-to-b from-[#1A1F2B] to-[#0A0C12] border border-[var(--accent-gold)]/20 shadow-[0_40px_100px_rgba(0,0,0,0.9)] p-8 text-center animate-scale-pop">
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--accent-gold)]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          
          {/* ICON */}
          <div className="w-24 h-24 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center border border-[var(--accent-gold)]/30 shadow-[0_0_40px_rgba(212,169,78,0.1)]">
             {activeMoment.type === 'DIAMOND_CLIENT' ? (
               <Star size={48} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
             ) : (
               <Trophy size={48} className="text-[var(--accent-gold)]" />
             )}
          </div>

          {/* TEXT */}
          <div className="flex flex-col gap-2">
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{activeMoment.title}</h1>
             <p className="text-white/40 text-[13px] font-medium leading-relaxed px-4">{activeMoment.subtitle}</p>
          </div>

          {/* MONETARY VALUE (IF APPLICABLE) */}
          {activeMoment.value !== undefined && (
            <div className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1 mt-2">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Resultado Consolidado</span>
               <div className="text-[28px] font-black text-white font-mono tracking-tight">{formatCurrencyBRL(activeMoment.value)}</div>
            </div>
          )}

          {/* CTA */}
          <button 
            onClick={() => setActiveMoment(null)}
            className="w-full h-16 bg-[var(--accent-gold)] text-black font-black text-[13px] tracking-[0.25em] rounded-2xl shadow-[0_8px_30px_rgba(255,200,0,0.2)] active:scale-95 transition-all mt-4 uppercase"
          >
            CONTINUAR TRABALHO
          </button>

          <button 
            onClick={() => setActiveMoment(null)}
            className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white/40 transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>

      {/* Close shortcut */}
      <button 
        onClick={() => setActiveMoment(null)}
        className="absolute top-8 right-8 p-3 rounded-full bg-white/5 text-white/40 active:scale-90 transition-all border border-white/10"
      >
        <X size={24} />
      </button>
    </div>
  );
};
