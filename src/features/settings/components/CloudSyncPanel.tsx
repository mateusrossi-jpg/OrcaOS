import { useState, useEffect } from 'react';
import { cloudSyncService } from '../../../services/CloudSyncService';
import { isCloudEnabled } from '../../../core/cloud/supabaseClient';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SurfaceCard } from '../../../ui/system/Cards';
import { SectionLabel } from '../../../ui/system/Typography';
import { cn } from '../../../utils/ui';

/**
 * CloudSyncPanel: Executive cloud synchronization control.
 * Redesigned for glassmorphic premium dark-mode standard.
 */
export function CloudSyncPanel() {
  const [unsyncedCount, setUnsyncedEvents] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    async function checkPending() {
      const count = await cloudSyncService.countPendingEvents();
      setUnsyncedEvents(count);
    }
    void checkPending();
    const interval = setInterval(() => void checkPending(), 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleSync() {
    setIsBusy(true);
    setFeedback(null);
    try {
      const result = await cloudSyncService.syncLocalToCloud();
      setFeedback({ type: 'success', msg: `Sincronizado: ${result.sent} eventos replicados.` });
      const count = await cloudSyncService.countPendingEvents();
      setUnsyncedEvents(count);
    } catch {
      setFeedback({ type: 'error', msg: 'Falha na sincronização cloud.' });
    } finally {
      setIsBusy(false);
    }
  }

  if (!isCloudEnabled) {
    return (
      <SurfaceCard padding="lg" className="opacity-40 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/20">
            <CloudOff size={16} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-black text-white/40 uppercase tracking-tight">Sincronização Multi-Dispositivo</span>
            <span className="text-[11px] text-white/20">Indisponível — API não configurada</span>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  const isSynced = unsyncedCount === 0;

  return (
    <SurfaceCard padding="lg" className="shadow-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className={cn(
          "w-9 h-9 rounded-xl border flex items-center justify-center transition-all",
          isSynced
            ? "bg-[#47C46A]/10 border-[#47C46A]/20 text-[#47C46A]"
            : "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
        )}>
          {isSynced ? <CheckCircle2 size={16} /> : <Cloud size={16} className="animate-pulse" />}
        </div>
        <SectionLabel className="!mb-0 opacity-40 uppercase tracking-[0.25em]">Sincronização Cloud</SectionLabel>
      </div>

      <p className="text-[12px] text-white/30 leading-relaxed mb-5">
        Dados operacionais sincronizados em tempo real entre dispositivos.
      </p>

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
          <span className="text-[8px] font-bold text-white/25 uppercase block mb-1.5">Fila</span>
          <span className={cn(
            "text-[22px] font-black font-mono leading-none",
            unsyncedCount > 0 ? "text-[var(--accent-gold)]" : "text-[#47C46A]"
          )}>
            {unsyncedCount}
          </span>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
          <span className="text-[8px] font-bold text-white/25 uppercase block mb-1.5">Status</span>
          <span className={cn(
            "text-[13px] font-black uppercase leading-none",
            isSynced ? "text-[#47C46A]" : "text-[var(--accent-gold)]"
          )}>
            {isSynced ? "EM DIA" : "PENDENTE"}
          </span>
        </div>
      </div>

      <button
        disabled={isBusy}
        onClick={handleSync}
        className="w-full h-12 bg-[#D4AF37] text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(212,169,74,0.2)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40"
      >
        <RefreshCw size={14} className={isBusy ? "animate-spin" : ""} />
        {isBusy ? 'Sincronizando...' : 'Sincronizar Agora'}
      </button>

      {feedback && (
        <div className={cn(
          "mt-4 p-3 rounded-xl text-[11px] font-bold text-center border animate-in fade-in",
          feedback.type === 'success'
            ? "bg-[#47C46A]/10 border-[#47C46A]/20 text-[#47C46A]"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {feedback.msg}
        </div>
      )}
    </SurfaceCard>
  );
}
