import React, { memo, useState } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle2, RotateCcw, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/ui';

import { useTrustLayer, trustLayer } from '../../core/trust/TrustLayer';

/**
 * Aferix Notification Center: Executive HUD for system alerts.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ERPNotificationCenter = memo(function ERPNotificationCenter() {
  const { recentEvents } = useTrustLayer();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn("notification-trigger", isOpen && "bg-[var(--bg-surface-elevated)]")}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {recentEvents.length > 0 && <span className="notification-dot" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-modal mt-4 w-[min(calc(100vw-40px),320px)] overflow-hidden rounded-[var(--radius-card)] border border-white/[0.07] bg-[var(--bg-primary)] shadow-[var(--shadow-card)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-6 py-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Histórico de Ações</h3>
            <span className="font-mono text-[9px] font-bold opacity-50 uppercase tracking-wider">{recentEvents.length} nos últimos 5m</span>
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {recentEvents.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-[var(--text-muted)] opacity-40">Nenhuma ação recente.</div>
            ) : (
              <div className="divide-y border-white/[0.07]">
                {recentEvents.map((item) => (
                  <div key={item.id} className="px-6 py-4 transition-colors hover:bg-white/[0.04]">
                    <div className="flex gap-4">
                      <div className={cn(
                        "mt-1 shrink-0",
                        item.type === 'error' ? "text-[var(--accent-red)]" : "text-[var(--accent-green)]"
                      )}>
                        {item.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold leading-tight text-[var(--text-primary)] truncate">{item.title}</span>
                          <span className="num font-mono text-[9px] opacity-40">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {item.description && <p className="mt-1 text-[11px] font-medium text-[var(--text-secondary)] leading-relaxed opacity-70">{item.description}</p>}
                        
                        <div className="mt-2 flex items-center gap-2">
                           {item.status === 'local' && <span className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded"><CloudOff size={10} /> Local</span>}
                           {item.status === 'syncing' && <span className="flex items-center gap-1 text-[9px] text-[var(--accent-gold)] font-mono uppercase tracking-wider bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded"><RefreshCw size={10} className="animate-spin" /> Sincronizando</span>}
                           {item.status === 'synced' && <span className="flex items-center gap-1 text-[9px] text-[var(--accent-green)] font-mono uppercase tracking-wider bg-[var(--accent-green)]/10 px-2 py-0.5 rounded"><Cloud size={10} /> Sincronizado</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * ERPToast: Executive transient alert.
 */
export const ERPToast = memo(function ERPToast() {
  const { activeToast: active } = useTrustLayer();

  if (!active) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[9999] w-full max-w-[420px] -translate-x-1/2 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--accent-green)]/30 bg-[var(--bg-surface)] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--accent-green)]/15 flex items-center justify-center text-[var(--accent-green)]">
          {active.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{active.title}</p>
          {active.description && <p className="text-[12px] font-medium text-[var(--text-muted)] truncate opacity-80">{active.description}</p>}
        </div>
        
        {active.onUndo && (
          <button 
            onClick={() => {
              if (active.onUndo) active.onUndo();
              trustLayer.removeEvent(active.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold tracking-wider transition-colors shrink-0"
          >
            <RotateCcw size={12} /> Desfazer
          </button>
        )}

        <button 
          onClick={() => trustLayer.removeEvent(active.id)}
          className="p-2 -mr-2 text-[var(--text-muted)] opacity-30 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
