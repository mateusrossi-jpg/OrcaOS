import React from 'react';

interface ExecutionQuickActionsProps {
  readonly onAction: (actionType: 'start' | 'pause' | 'finish' | 'photo' | 'block') => void;
  readonly activeState: 'idle' | 'in_progress' | 'paused';
}

/**
 * ExecutionQuickActions
 * Thumb-safe, high-contrast, zero-friction operation buttons.
 */
export const ExecutionQuickActions: React.FC<ExecutionQuickActionsProps> = ({ onAction, activeState }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 p-4 pb-safe-bottom z-20">
      <div className="flex items-center gap-3">
        {activeState !== 'in_progress' && (
          <button 
            onClick={() => onAction('start')}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
          >
            ▶ INICIAR
          </button>
        )}

        {activeState === 'in_progress' && (
          <>
            <button 
              onClick={() => onAction('pause')}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
            >
              ⏸ PAUSAR
            </button>
            <button 
              onClick={() => onAction('finish')}
              className="flex-1 bg-brand-primary hover:bg-brand-secondary text-surface-900 font-bold py-4 rounded-xl shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform"
            >
              ✔ CONCLUIR
            </button>
          </>
        )}

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onAction('photo')}
            className="w-14 h-14 bg-surface-800 border border-surface-700 text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Tirar Foto"
          >
            📸
          </button>
        </div>
      </div>
    </div>
  );
};
