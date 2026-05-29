import React from 'react';
import { Play, Pause, Check, Camera, AlertTriangle } from 'lucide-react';

interface ExecutionQuickActionsProps {
  readonly onAction: (actionType: 'start' | 'pause' | 'finish' | 'photo' | 'block') => void;
  readonly activeState: 'idle' | 'in_progress' | 'paused';
}

/**
 * ExecutionQuickActions: Field-first tactile controls.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ExecutionQuickActions: React.FC<ExecutionQuickActionsProps> = ({ onAction, activeState }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t var(--border-subtle) p-shell pb-[calc(env(safe-area-inset-bottom,24px)+var(--spacing-md))] z-sticky shadow-[0_-12px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-sm">
        {activeState !== 'in_progress' && (
          <button 
            onClick={() => onAction('start')}
            className="flex-1 h-16 bg-[var(--accent-green)] text-black font-bold rounded-[var(--radius-button)] shadow-[var(--shadow-button)] active:scale-[0.96] transition-all flex items-center justify-center gap-sm"
          >
            <Play className="h-5 w-5 fill-current" /> INICIAR
          </button>
        )}

        {activeState === 'in_progress' && (
          <>
            <button 
              onClick={() => onAction('pause')}
              className="flex-1 h-16 bg-[var(--bg-surface-elevated)] border var(--border-soft) text-[var(--accent-gold)] font-bold rounded-[var(--radius-button)] shadow-[var(--shadow-soft)] active:scale-[0.96] transition-all flex items-center justify-center gap-sm"
            >
              <Pause className="h-5 w-5 fill-current" /> PAUSAR
            </button>
            <button 
              onClick={() => onAction('finish')}
              className="flex-1 h-16 bg-[var(--accent-gold)] text-black font-bold rounded-[var(--radius-button)] shadow-[var(--shadow-button)] active:scale-[0.96] transition-all flex items-center justify-center gap-sm"
            >
              <Check className="h-5 w-5" strokeWidth={3} /> CONCLUIR
            </button>
          </>
        )}

        <div className="flex items-center gap-sm">
          <button 
            onClick={() => onAction('photo')}
            className="w-16 h-16 bg-[var(--bg-surface-glass)] border var(--border-soft) text-[var(--text-primary)] rounded-[var(--radius-button)] flex items-center justify-center active:scale-[0.95] transition-all shadow-soft"
            aria-label="Tirar Foto"
          >
            <Camera className="h-6 w-6 opacity-60" />
          </button>
          <button 
            onClick={() => onAction('block')}
            className="w-16 h-16 bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 text-[var(--accent-red)] rounded-[var(--radius-button)] flex items-center justify-center active:scale-[0.95] transition-all"
            aria-label="Bloquear Serviço"
          >
            <AlertTriangle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
