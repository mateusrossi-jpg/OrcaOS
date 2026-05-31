import React, { memo, useState } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/ui';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

/**
 * Aferix Notification Center: Executive HUD for system alerts.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ERPNotificationCenter = memo(function ERPNotificationCenter() {
  const [feed] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn("notification-trigger", isOpen && "bg-[var(--bg-surface-elevated)]")}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {feed.length > 0 && <span className="notification-dot" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-modal mt-4 w-[min(calc(100vw-40px),320px)] overflow-hidden rounded-[var(--radius-card)] border border-white/[0.07] bg-[var(--bg-primary)] shadow-[var(--shadow-card)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-6 py-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Alertas do Sistema</h3>
            <span className="font-mono text-[9px] font-bold opacity-50 uppercase tracking-wider">{feed.length} eventos</span>
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {feed.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-[var(--text-muted)] opacity-40">Nenhum evento registrado.</div>
            ) : (
              <div className="divide-y border-white/[0.07]">
                {feed.map((item) => (
                  <div key={item.id} className="px-6 py-4 transition-colors hover:bg-white/[0.04]">
                    <div className="flex gap-4">
                      <div className={cn(
                        "mt-1 shrink-0",
                        item.type === 'error' ? "text-[var(--accent-red)]" : "text-[var(--accent-gold)]"
                      )}>
                        {item.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold leading-tight text-[var(--text-primary)] truncate">{item.title}</span>
                          <span className="num font-mono text-[9px] opacity-40">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)] leading-relaxed opacity-70">{item.description}</p>
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
  const [active, setActive] = useState<Notification | null>(null);

  if (!active) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-toast w-full max-w-[380px] -translate-x-1/2 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-white/[0.07] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center text-[var(--accent-gold)]">
          {active.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{active.title}</p>
          <p className="text-sm font-medium text-[var(--text-muted)] truncate opacity-60">{active.description}</p>
        </div>
        <button 
          onClick={() => setActive(null)}
          className="p-2 -mr-2 text-[var(--text-muted)] opacity-30 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
