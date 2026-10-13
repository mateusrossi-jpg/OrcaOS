import React, { type ReactNode, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PrimaryPillButton, SecondaryActionButton } from '../../../ui/system/v12Components';
import { cn } from '../../../utils/ui';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'brand' | 'danger';
  className?: string;
}

/**
 * ConfirmModal: Authoritative Golden V12 confirmation overlay.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = memo(({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'brand',
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className={cn(
          "bg-[#2C2C2E] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] p-6 pb-10 sm:pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] max-w-md w-full flex flex-col gap-4 animate-in slide-in-from-bottom duration-300",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip Handle for mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-1 sm:hidden" />

        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 id="confirm-modal-title" className="text-[16px] font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#8E8E93] hover:text-white p-1 text-sm font-bold cursor-pointer"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="py-2 text-[14px] text-[#C7C7CC] leading-relaxed text-center sm:text-left">
          {children}
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
          {tone === 'danger' ? (
            <button
              type="button"
              onClick={onConfirm}
              className="w-full min-h-[52px] h-14 py-3.5 px-4 bg-[#FF453A] text-white font-bold text-[14px] rounded-full active:scale-[0.975] transition-all shadow-lg flex items-center justify-center cursor-pointer uppercase tracking-[0.05em]"
            >
              {confirmLabel}
            </button>
          ) : (
            <PrimaryPillButton onClick={onConfirm} className="w-full">
              {confirmLabel}
            </PrimaryPillButton>
          )}

          <SecondaryActionButton onClick={onClose} className="w-full">
            {cancelLabel}
          </SecondaryActionButton>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default ConfirmModal;
