import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  SectionLabel, 
  ContextBanner, 
  MetricCard 
} from '../../../app/components/ui';
import { cloudSyncService } from '../../../services/CloudSyncService';
import { isCloudEnabled } from '../../../core/cloud/supabaseClient';
import { Cloud, CloudOff } from 'lucide-react';

/**
 * CloudSyncPanel: Executive cloud synchronization control.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function CloudSyncPanel() {
  const [unsyncedCount, setUnsyncedEvents] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function checkPending() {
      const count = await cloudSyncService.countPendingEvents();
      setUnsyncedEvents(count);
    }
    void checkPending();
    const interval = setInterval(() => {
      void checkPending();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleSync() {
    setIsBusy(true);
    setFeedback('Sincronizando...');
    try {
      const result = await cloudSyncService.syncLocalToCloud();
      setFeedback(`Sincronizado com sucesso: ${result.sent} eventos replicados.`);
      
      const count = await cloudSyncService.countPendingEvents();
      setUnsyncedEvents(count);
    } catch {
      setFeedback('Falha na sincronização cloud.');
    } finally {
      setIsBusy(false);
    }
  }

  if (!isCloudEnabled) {
    return (
      <div className="opacity-60 pointer-events-none grayscale">
        <ContextBanner
          title="Sincronização Multi-Dispositivo"
          meta="Indisponível: Chaves de API não configuradas no ambiente."
          icon={<CloudOff className="h-5 w-5" />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-8">
        <SectionLabel className="mt-0 mb-6">Sincronização Cloud</SectionLabel>
        <p className="text-[var(--fs-base)] font-medium text-[var(--text-secondary)] leading-relaxed mb-10">
          Seus dados operacionais são protegidos e sincronizados em tempo real entre seus dispositivos através do núcleo Aferix.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <MetricCard 
            label="Fila de Sincronismo" 
            value={unsyncedCount} 
            color={unsyncedCount > 0 ? 'var(--accent-gold)' : 'var(--accent-green)'}
          />
          <div className="p-6 rounded-2xl bg-white/[0.02] border var(--border-subtle) flex flex-col justify-center items-center gap-2">
            <Cloud className={unsyncedCount > 0 ? "text-[var(--accent-gold)] animate-pulse" : "text-[var(--accent-green)]"} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">ESTADO_CLOUD</span>
          </div>
        </div>

        <Button 
          variant="primary" 
          className="w-full"
          disabled={isBusy} 
          onClick={handleSync}
        >
          {isBusy ? 'Processando...' : 'Sincronizar Agora'}
        </Button>

        {feedback && (
          <p className="mt-6 text-[13px] font-bold text-center text-[var(--accent-gold)] animate-in fade-in">
            {feedback}
          </p>
        )}
      </Card>
    </div>
  );
}
