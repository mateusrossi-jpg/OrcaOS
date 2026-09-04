import { ReactNode, memo } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/ui';

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  label?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * ActionSheet: V12 Slide-up drawer for high-density actions.
 * Implements bg-[#2C2C2E] border-t border-white/10 rounded-t-[28px], grab handle, backdrop blur.
 */
export const ActionSheet = memo(function ActionSheet({
  isOpen,
  onClose,
  label,
  title,
  children,
  className = '',
}: ActionSheetProps) {
  if (!isOpen) return null;

  const headerTitle = title || label;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-[#2C2C2E] border-t border-white/10 rounded-t-[28px] p-6 pb-12 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] max-w-md mx-auto w-full flex flex-col gap-4 animate-in slide-in-from-bottom duration-300",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-1" />

        {headerTitle && (
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-[15px] font-bold text-white tracking-tight uppercase">{headerTitle}</h3>
            <button
              onClick={onClose}
              className="text-[#8E8E93] hover:text-white p-1 text-sm font-bold cursor-pointer"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
});

export default ActionSheet;
