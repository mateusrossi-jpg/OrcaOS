import { ReactNode, memo } from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon } from 'lucide-react';
import { cn } from '../../../utils/ui';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  label?: string;
  children: ReactNode;
}

/**
 * ActionSheet: Refactored for absolute Command Modal parity (Phase 4H).
 * Mobile-first drawer for high-density action selection.
 */
export const ActionSheet = memo(function ActionSheet({
  isOpen,
  onClose,
  label = "OPÇÕES_DE_SISTEMA",
  children
}: ActionSheetProps) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[3000] flex items-end justify-center" 
      style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
      onClick={onClose}
    >
      <div 
        className="bg-[#0F0F0F] border-t border-white/[0.1] rounded-t-[32px] w-full max-w-[430px] animate-in slide-in-from-bottom-full duration-500 cubic-bezier(0.16, 1, 0.3, 1) relative overflow-hidden shadow-[0_-12px_64px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
         {/* Cinematic Ambient Glow */}
         <div 
           className="absolute -top-[120px] -right-[120px] w-[300px] h-[300px] rounded-full pointer-events-none select-none opacity-40 z-0"
           style={{ background: 'radial-gradient(circle, rgba(212,169,78,0.12) 0%, transparent 70%)' }}
         />

         {/* Pull Bar */}
         <div className="flex justify-center pt-3 pb-2 relative z-10">
            <div className="w-12 h-1.5 rounded-full bg-white/[0.08]" />
         </div>

         <header className="px-8 pt-6 pb-4 text-center relative z-10">
            <span className="block mb-2 text-[9px] font-black font-mono text-[#4A4A4A] uppercase tracking-[0.35em]">{label}</span>
         </header>

         <div className="px-6 pb-12 pt-2 relative z-10 flex flex-col gap-2 max-h-[70vh] overflow-y-auto scrollbar-none">
            {children}
         </div>
      </div>
    </div>,
    document.body
  );
});
