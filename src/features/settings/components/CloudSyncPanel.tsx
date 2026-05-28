import { useState, useEffect } from 'react';
import { Button } from '../../../app/components/ui';
import { cloudSyncService } from '../../../services/CloudSyncService';
import { isCloudEnabled } from '../../../core/cloud/supabaseClient';

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
      <section className="google-drive-backup-premium" style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <div className="backup-panel-header">
          <h2>Sincronização Multi-Dispositivo</h2>
          <p>Indisponível: Chaves de API não configuradas.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="google-drive-backup-premium">
      <div className="backup-panel-header">
        <h2>Sincronização Ativa</h2>
        <p>Seus dados operacionais são protegidos e sincronizados em tempo real entre seus dispositivos.</p>
      </div>

      <div className="backup-actions-grid-premium">
        <div className="backup-status-card">
          <span>Eventos Pendentes</span>
          <strong style={{ color: unsyncedCount > 0 ? 'var(--aferix-warning)' : 'var(--aferix-success)' }}>
            {unsyncedCount} alteração(ões)
          </strong>
        </div>

        <div className="backup-main-actions">
          <Button 
            variant="primary" 
            disabled={isBusy} 
            onClick={handleSync}
          >
            {isBusy ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        </div>
      </div>

      {feedback && <div className="backup-feedback-message" style={{ marginTop: '12px' }}>{feedback}</div>}
      
      <style>{`
        .google-drive-backup-premium {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--aferix-border, rgba(255,255,255,0.08));
        }
      `}</style>
    </section>
  );
}
