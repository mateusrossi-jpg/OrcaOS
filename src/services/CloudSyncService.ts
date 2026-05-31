import { supabase, isCloudEnabled } from '../core/cloud/supabaseClient';
import { db } from '../storage/dexieDatabase';
import { aferixLogger } from '../core/debug/aferixLogger';
import { conflictDetectionService } from './ConflictDetectionService';
import { databaseRecoveryService } from './DatabaseRecoveryService';

interface SyncableEvent {
  syncStatus?: 'synced' | 'pending' | 'in-flight';
}

export type SyncStateValue = 'synced' | 'pending' | 'offline';

type SyncListener = (status: SyncStateValue, pendingCount: number) => void;

/**
 * CloudSyncService: Maestro de Sincronização e Resiliência (Fases 1-4).
 * Responsável por replicar o Event Store local para o Supabase de forma ordenada,
 * garantindo resiliência total contra quedas de energia, rede instável e conflitos offline.
 */
export class CloudSyncService {
  private static instance: CloudSyncService;
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  
  // Retry / Backoff Configuration
  private retryCount = 0;
  private retryDelay = 1000;
  private readonly maxRetryDelay = 30000;
  private retryTimeoutId: NodeJS.Timeout | null = null;
  
  // Connection state
  private isOnlineState = typeof window !== 'undefined' ? window.navigator.onLine : true;

  private constructor() {
    this.setupNetworkListeners();
    this.recoverInFlightEvents();
  }

  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  /**
   * Monitora a conectividade nativa do navegador para sincronizar assim que a rede reestabelecer.
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      aferixLogger.info('CloudSync', 'Dispositivo detectado ONLINE. Retomando sync imediato...');
      this.isOnlineState = true;
      this.resetRetryDelay();
      void this.syncLocalToCloud();
    });

    window.addEventListener('offline', () => {
      aferixLogger.warn('CloudSync', 'Dispositivo detectado OFFLINE. Pausando sync.');
      this.isOnlineState = false;
      this.notifyListeners();
    });
  }

  /**
   * Recuperação de Crash: Restaura eventos marcados como 'in-flight' (em trânsito)
   * de volta para 'pending' caso o app tenha fechado ou crashado no meio de um sync.
   */
  private async recoverInFlightEvents(): Promise<void> {
    try {
      const inFlightEvents = await db.operationalEvents
        .filter(e => (e as unknown as SyncableEvent).syncStatus === 'in-flight')
        .toArray();

      if (inFlightEvents.length > 0) {
        aferixLogger.warn('CloudSync', `Crash Recovery: Restaurando ${inFlightEvents.length} eventos pendentes do estado 'in-flight'.`);
        for (const event of inFlightEvents) {
          await db.operationalEvents.update(event.id, { syncStatus: 'pending' } as Record<string, unknown>);
        }
        this.notifyListeners();
      }
    } catch (err) {
      aferixLogger.error('CloudSync', 'Falha ao executar recuperação de crash', err);
    }
  }

  /**
   * Registra um listener para acompanhar o status e o número de itens pendentes em tempo real.
   */
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Dispara o estado atual imediatamente para o novo assinante
    void this.countPendingEvents().then(count => {
      listener(this.getSyncState(count), count);
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private getSyncState(pendingCount: number): SyncStateValue {
    if (!this.isOnlineState) return 'offline';
    return pendingCount > 0 ? 'pending' : 'synced';
  }

  private async notifyListeners(): Promise<void> {
    const pendingCount = await this.countPendingEvents();
    const state = this.getSyncState(pendingCount);
    for (const listener of this.listeners) {
      try {
        listener(state, pendingCount);
      } catch (err) {
        console.error('[CloudSync] Listener error:', err);
      }
    }
  }

  async countPendingEvents(): Promise<number> {
    try {
      return await db.operationalEvents
        .filter(e => (e as unknown as SyncableEvent).syncStatus !== 'synced')
        .count();
    } catch (err) {
      console.error('[CloudSync] Failed to count pending events:', err);
      return 0;
    }
  }

  private resetRetryDelay(): void {
    this.retryCount = 0;
    this.retryDelay = 1000;
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  /**
   * Executa a reconciliação e resolução de conflitos baseado em Last-Write-Wins (LWW).
   * Se o servidor possuir um estado mais recente, detecta e reporta ao ConflictDetectionService.
   */
  private async resolveConflictsAndValidate(event: any, userId: string): Promise<{ proceed: boolean }> {
    try {
      // Busca se o envelope já existe no Supabase (verificação causal)
      const { data, error } = await supabase
        .from('sync_envelopes')
        .select('timestamp, sequence')
        .eq('event_id', event.id)
        .maybeSingle();

      if (error) {
        // Se der erro de rede, apenas proceed
        return { proceed: true };
      }

      if (data) {
        // Conflito: O evento já foi registrado remotamente por outro dispositivo.
        const remoteTime = new Date(data.timestamp).getTime();
        const localTime = new Date(event.timestamp).getTime();

        if (remoteTime > localTime) {
          // LWW: Remoto é mais novo, descartamos o envio local e aplicamos conflito
          conflictDetectionService.detectStaleEntity(
            event.aggregateType,
            event.aggregateId,
            localTime,
            remoteTime
          );
          aferixLogger.warn('CloudSync', `Conflict LWW: Ignorando evento local ${event.id} em favor de alteração remota mais recente.`);
          // Marca como sincronizado localmente pois a verdade remota ganha
          await db.operationalEvents.update(event.id, { syncStatus: 'synced' } as Record<string, unknown>);
          await this.propagateAggregateSyncStatus(event.aggregateType, event.aggregateId);
          return { proceed: false };
        } else {
          // Local é mais novo ou igual, prosseguimos com o overwrite/sync
          conflictDetectionService.detectModifiedAfterRead(
            event.aggregateType,
            event.aggregateId,
            remoteTime,
            localTime
          );
        }
      }
    } catch (e) {
      // Ignora e tenta o proceed
    }

    return { proceed: true };
  }

  /**
   * Envia os eventos locais na fila (em ordem rigorosa) para a nuvem.
   */
  async syncLocalToCloud(): Promise<{ sent: number; errors: number }> {
    // 1. Verificações prévias de conexão e concorrência
    if (!isCloudEnabled) return { sent: 0, errors: 0 };
    if (!this.isOnlineState) {
      this.notifyListeners();
      return { sent: 0, errors: 0 };
    }
    if (this.isSyncing) return { sent: 0, errors: 0 };

    let session;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch (e) {
      aferixLogger.warn('CloudSync', 'Sem sessão Supabase ativa para sincronismo.');
    }
    
    if (!session) {
      this.notifyListeners();
      return { sent: 0, errors: 0 };
    }

    this.isSyncing = true;
    let sentCount = 0;
    let errorCount = 0;

    try {
      // Re-abre/audita o banco de dados se necessário antes de operar (Crash Safety / Autocura)
      const isDbSafe = await databaseRecoveryService.validateDatabaseState();
      if (!isDbSafe) {
        aferixLogger.warn('CloudSync', 'Banco offline ou travado. Executando Soft Recovery antes do sync.');
        await databaseRecoveryService.attemptSoftRecovery();
      }

      // 2. Busca eventos não sincronizados ordenados por timestamp
      const unsyncedEvents = await db.operationalEvents
        .filter(e => (e as unknown as SyncableEvent).syncStatus !== 'synced')
        .toArray();

      // Ordenação explícita por ordem cronológica de eventos (Importância P0 do sync ordenado)
      unsyncedEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      for (const event of unsyncedEvents) {
        // Marca como em trânsito para evitar concorrências locais (Crash Recovery)
        await db.operationalEvents.update(event.id, { syncStatus: 'in-flight' } as Record<string, unknown>);

        // 3. Resolução de conflitos
        const { proceed } = await this.resolveConflictsAndValidate(event, session.user.id);
        if (!proceed) {
          sentCount++;
          continue;
        }

        // 4. Inserção no Supabase (Envelope Auditável)
        const { error } = await supabase.from('sync_envelopes').insert({
          envelope_id: `env-${event.id}`,
          event_id: event.id,
          device_id: typeof window !== 'undefined' ? ((window as any).AFERIX_INSTALLATION_ID || 'browser') : 'test-environment',
          user_id: session.user.id,
          aggregate_id: event.aggregateId,
          aggregate_type: event.aggregateType,
          event_type: event.eventType,
          payload: {
            metadata: event.metadata,
            snapshot: event.snapshot,
            timestamp: event.timestamp,
            actor: event.actor
          },
          sequence: event.sequence || Date.now(),
          timestamp: event.timestamp
        });

        if (!error) {
          // Sucesso: Marca localmente como sincronizado
          await db.operationalEvents.update(event.id, { syncStatus: 'synced' } as Record<string, unknown>);
          await this.propagateAggregateSyncStatus(event.aggregateType, event.aggregateId);
          sentCount++;
          this.resetRetryDelay();
        } else {
          // Erro de Envio: Restaura para pendente
          await db.operationalEvents.update(event.id, { syncStatus: 'pending' } as Record<string, unknown>);
          errorCount++;
          
          aferixLogger.error('CloudSync', `Erro ao sincronizar evento ${event.id}:`, error);

          // Dispara a lógica de Retry com Backoff e Jitter
          this.retryCount++;
          const jitter = Math.random() * 200;
          this.retryDelay = Math.min(this.retryDelay * 2 + jitter, this.maxRetryDelay);
          
          aferixLogger.warn('CloudSync', `Agendando retry do sync em ${Math.round(this.retryDelay)}ms (Tentativa ${this.retryCount}).`);
          
          if (this.retryTimeoutId) clearTimeout(this.retryTimeoutId);
          this.retryTimeoutId = setTimeout(() => {
            void this.syncLocalToCloud();
          }, this.retryDelay);

          break; // Preserva a fila ordenada: não envia eventos subsequentes antes deste passar
        }
      }

      if (sentCount > 0) {
        aferixLogger.audit('CloudSync', `Replicou ${sentCount} eventos com sucesso para a nuvem.`);
        // FIX P2-02: Prevent startup degradation by compacting synchronized operational events
        await this.compactSyncedEvents();
      }
    } catch (err) {
      aferixLogger.error('CloudSync', 'Sync queue processing failed', err);
      // Tentativa de autocura na persistência caso dê crash na leitura
      await databaseRecoveryService.attemptSoftRecovery().catch(() => {});
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { sent: sentCount, errors: errorCount };
  }

  /**
   * Compacts the operational events log by removing successfully synced events
   * that are older than a threshold, preventing IndexedDB growth and startup degradation.
   * Keeps the most recent synced events to preserve recent audit history, offline reliability, and conflict resolution.
   */
  async compactSyncedEvents(keepCount = 100): Promise<number> {
    try {
      const syncedEvents = await db.operationalEvents
        .filter(e => (e as unknown as SyncableEvent).syncStatus === 'synced')
        .toArray();

      if (syncedEvents.length <= keepCount) {
        return 0;
      }

      // Sort chronological order (oldest first)
      syncedEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const eventsToDelete = syncedEvents.slice(0, syncedEvents.length - keepCount);
      const deleteIds = eventsToDelete.map(e => e.id);

      await db.transaction('rw', db.operationalEvents, async () => {
        await db.operationalEvents.bulkDelete(deleteIds);
      });

      aferixLogger.audit('CloudSync', `Compacted event store: Deleted ${deleteIds.length} historical synced events.`);
      return deleteIds.length;
    } catch (err) {
      aferixLogger.error('CloudSync', 'Failed to compact synced events', err);
      return 0;
    }
  }

  private async propagateAggregateSyncStatus(aggregateType: string, aggregateId: string): Promise<void> {
    try {
      if (aggregateType === 'client') {
        await db.clients.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      } else if (aggregateType === 'budget') {
        await db.budgets.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      } else if (aggregateType === 'workOrder') {
        await db.workOrders.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      }
    } catch (err) {
      aferixLogger.warn('CloudSync', `Failed to propagate sync status to ${aggregateType}:${aggregateId}`, err);
    }
  }
}

export const cloudSyncService = CloudSyncService.getInstance();
