import React, { memo, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/ui';
import { ExecutiveButton } from './Controls';
import { X } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  meta?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState: Discrete context placeholder.
 */
export const EmptyState = memo(({ title, meta, icon, action, className }: EmptyStateProps) => (
  <div className={cn("py-24 px-shell text-center flex flex-col items-center gap-md rounded-[var(--radius-card)] border border-dashed var(--border-subtle) bg-white/[0.01]", className)}>
    {icon && <div className="text-[var(--text-muted)] opacity-20 mb-4 scale-[1.5]">{icon}</div>}
    <strong className="text-ui-md font-bold text-[var(--text-primary)]">{title}</strong>
    {meta && <p className="text-ui-sm text-[var(--text-muted)] leading-relaxed max-w-[280px] opacity-60">{meta}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
));

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  tone?: 'brand' | 'danger';
}

/**
 * ExecutiveModal: Portal-based high-polish interaction layer.
 */
export const ExecutiveModal = ({ isOpen, onClose, title, children, confirmLabel, onConfirm, tone = 'brand' }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-shell bg-overlay backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-[440px] bg-[var(--bg-surface)] border var(--border-soft) rounded-[var(--radius-modal)] shadow-card overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-shell pt-10 pb-6 flex items-center justify-between">
          <h2 className="text-h3 font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 opacity-30 hover:opacity-100 transition-opacity"><X className="h-5 w-5" /></button>
        </header>
        
        <div className="px-shell py-4 text-ui-base text-[var(--text-secondary)] leading-relaxed">
          {children}
        </div>
        
        <footer className="p-shell flex flex-col gap-sm pb-10 mt-6">
          {onConfirm && (
            <ExecutiveButton 
              variant={tone === 'danger' ? 'danger' : 'primary'}
              className="w-full h-16"
              onClick={onConfirm}
            >
              {confirmLabel?.toUpperCase() || 'CONFIRMAR'}
            </ExecutiveButton>
          )}
          <button 
            onClick={onClose}
            className="h-12 w-full text-ui-xs font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all tracking-[0.2em]"
          >
            CANCELAR
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

/**
 * ExecutiveSheet: Touch-first bottom sheet for secondary actions.
 */
export const ExecutiveSheet = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-end justify-center bg-overlay backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-[440px] bg-[var(--bg-surface)] border-t var(--border-soft) rounded-t-[var(--radius-modal)] shadow-card p-shell pb-[calc(env(safe-area-inset-bottom,24px)+var(--spacing-md))] animate-in slide-in-from-bottom-full duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
        {title && <h3 className="text-ui-xs font-black text-center text-[var(--text-muted)] tracking-[0.2em] mb-10">{title.toUpperCase()}</h3>}
        <div className="flex flex-col gap-sm">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
