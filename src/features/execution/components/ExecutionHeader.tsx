import React from 'react';
import { ChevronLeft, Zap } from 'lucide-react';

interface ExecutionHeaderProps {
  readonly clientName: string;
  readonly workOrderId: string;
  readonly status: string;
  readonly onBack: () => void;
}

/**
 * ExecutionHeader: Field-first operational header.
 * Premium glassmorphic design with atmospheric gradient bar.
 */
export const ExecutionHeader: React.FC<ExecutionHeaderProps> = ({ clientName, workOrderId, status, onBack }) => {
  return (
    <div className="sticky top-0 z-50 relative overflow-hidden">
      {/* Gradient atmospheric bar effect — the one you liked */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D12] via-[#0C1018]/95 to-[#07080A]/80 backdrop-blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      <div className="absolute top-0 left-[20%] w-[60%] h-16 bg-[#D4AF37]/8 blur-[40px] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-5 pb-4 flex items-center justify-between max-w-md mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] active:scale-95 transition-all"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[18px] font-black text-white uppercase tracking-tight leading-none truncate max-w-[200px]">
              {clientName}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-white/25 uppercase tracking-[0.2em]">
                #{workOrderId.split('-')[0].toUpperCase()}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
                </span>
                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.15em] leading-none">
                  {status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
          <Zap size={18} className="text-[#D4AF37] fill-[#D4AF37]" />
        </div>
      </div>
    </div>
  );
};
