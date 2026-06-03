import { generateUUID } from '../core/utils/idGenerator';
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
        .select('timestamp, sequence, payload')
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
          
          // FASE 2.6: Aplicar snapshot vencedor localmente
          if (data.payload && data.payload.snapshot) {
            await this.applyWinningSnapshot(event.aggregateType, event.aggregateId, data.payload.snapshot);
          }

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
    // 1. Verificações prévios de conexão e concorrência
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
          device_id: this.getInstallationId(),
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
        await this.compactSyncedEvents();
        await this.compactSoftDeletedRecords();
      }
    } catch (err) {
      aferixLogger.error('CloudSync', 'Sync queue processing failed', err);
      await databaseRecoveryService.attemptSoftRecovery().catch(() => {});
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { sent: sentCount, errors: errorCount };
  }

  /**
   * Compacts the operational events log by removing successfully synced events
   */
  async compactSyncedEvents(keepCount = 100): Promise<number> {
    try {
      const syncedEvents = await db.operationalEvents
        .filter(e => (e as unknown as SyncableEvent).syncStatus === 'synced')
        .toArray();

      if (syncedEvents.length <= keepCount) {
        return 0;
      }

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

  /**
   * FASE 2.6 Compactador de Soft Deleted
   * Deleta fisicamente os registros tombstones sincronizados com idade superior a 90 dias.
   */
  async compactSoftDeletedRecords(daysThreshold = 90): Promise<void> {
    try {
      const now = Date.now();
      const cutoffTime = now - (daysThreshold * 24 * 60 * 60 * 1000);

      const filterFn = (record: any) => 
        record.isDeleted === true && 
        record.syncStatus === 'synced' && 
        record.deletedAt && 
        new Date(record.deletedAt).getTime() < cutoffTime;

      const attendances = await db.attendances.filter(filterFn).toArray();
      if (attendances.length > 0) {
        await db.attendances.bulkDelete(attendances.map(a => a.id));
      }

      const budgets = await db.budgets.filter(filterFn).toArray();
      if (budgets.length > 0) {
        await db.budgets.bulkDelete(budgets.map(b => b.id));
      }

      const workOrders = await db.workOrders.filter(filterFn).toArray();
      if (workOrders.length > 0) {
        await db.workOrders.bulkDelete(workOrders.map(w => w.id));
      }

      const finances = await db.simpleFinanceRecords.filter(filterFn).toArray();
      if (finances.length > 0) {
        await db.simpleFinanceRecords.bulkDelete(finances.map(f => f.id));
      }

      aferixLogger.audit('CloudSync', `Compactor soft-deleted tombstones completed.`);
    } catch (err) {
      aferixLogger.error('CloudSync', 'Soft deleted records compaction failed', err);
    }
  }

  /**
   * FASE 2.6: Aplica o snapshot vencedor remoto localmente no IndexedDB.
   */
  async applyWinningSnapshot(aggregateType: string, aggregateId: string, snapshot: any): Promise<void> {
    if (!snapshot) return;

    try {
      const normalizedType = aggregateType.toLowerCase();
      if (normalizedType === 'budget') {
        const existing = await db.budgets.get(aggregateId);
        if (existing) {
          await db.budgets.put({ ...existing, ...snapshot, syncStatus: 'synced' });
        } else {
          await db.budgets.put({ ...snapshot, id: aggregateId, syncStatus: 'synced' });
        }
      } else if (normalizedType === 'workorder') {
        const existing = await db.workOrders.get(aggregateId);
        if (existing) {
          await db.workOrders.put({ ...existing, ...snapshot, syncStatus: 'synced' });
        } else {
          await db.workOrders.put({ ...snapshot, id: aggregateId, syncStatus: 'synced' });
        }
      } else if (normalizedType === 'attendance') {
        const existing = await db.attendances.get(aggregateId);
        if (existing) {
          await db.attendances.put({ ...existing, ...snapshot, syncStatus: 'synced' });
        } else {
          await db.attendances.put({ ...snapshot, id: aggregateId, syncStatus: 'synced' });
        }
      } else if (normalizedType === 'client') {
        const existing = await db.clients.get(aggregateId);
        if (existing) {
          await db.clients.put({ ...existing, ...snapshot, syncStatus: 'synced' });
        } else {
          await db.clients.put({ ...snapshot, id: aggregateId, syncStatus: 'synced' });
        }
      }

      // Adiciona evento de reconciliação na base local
      await db.operationalEvents.add({
        id: `rec-${Date.now()}-${generateUUID().slice(0, 8)}`,
        aggregateId,
        aggregateType: aggregateType as any,
        eventType: 'RECONCILIATION_COMPLETED' as any,
        timestamp: new Date().toISOString(),
        actor: 'system-sync',
        source: 'cloud',
        metadata: { reconciliation: true },
        createdAt: new Date().toISOString(),
        syncStatus: 'synced'
      } as any);

      aferixLogger.audit('CloudSync', `Reconciliation of winning snapshot finished for ${aggregateType}:${aggregateId}`);
    } catch (err) {
      aferixLogger.error('CloudSync', `Failed to apply winning snapshot for ${aggregateType}:${aggregateId}`, err);
    }
  }

  private async propagateAggregateSyncStatus(aggregateType: string, aggregateId: string): Promise<void> {
    try {
      const normalized = aggregateType.toLowerCase();
      if (normalized === 'client') {
        await db.clients.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      } else if (normalized === 'budget') {
        await db.budgets.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      } else if (normalized === 'workorder') {
        await db.workOrders.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      } else if (normalized === 'attendance') {
        await db.attendances.update(aggregateId, { syncStatus: 'synced', syncUpdatedAt: Date.now() });
      }
    } catch (err) {
      aferixLogger.warn('CloudSync', `Failed to propagate sync status to ${aggregateType}:${aggregateId}`, err);
    }
  }

  getInstallationId(): string {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        let id = localStorage.getItem('AFERIX_INSTALLATION_ID');
        if (!id) {
          id = 'dev-' + generateUUID().slice(0, 8);
          localStorage.setItem('AFERIX_INSTALLATION_ID', id);
        }
        return id;
      }
    } catch (e) {
      // Fallback
    }

    try {
      if (typeof window !== 'undefined' && window) {
        const win = window as any;
        if (win.AFERIX_INSTALLATION_ID) {
          return win.AFERIX_INSTALLATION_ID;
        }
      }
    } catch (e) {
      // Fallback
    }

    return 'test-environment';
  }

  private mapAggregateTypeToTable(aggregateType: string): string | null {
    const norm = aggregateType.toLowerCase();
    if (norm === 'attendance') return 'attendances';
    if (norm === 'budget') return 'budgets';
    if (norm === 'workorder') return 'workOrders';
    if (norm === 'client') return 'clients';
    return null;
  }

  async syncCloudToLocal(): Promise<{ pulled: number; errors: number }> {
    if (!isCloudEnabled) return { pulled: 0, errors: 0 };
    if (!this.isOnlineState) return { pulled: 0, errors: 0 };

    let session;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch (e) {
      aferixLogger.warn('CloudSync', 'Sem sessão Supabase ativa para pull.');
    }

    if (!session) return { pulled: 0, errors: 0 };

    try {
      const lastSeqRecord = await db.settings.get('last_synced_sequence');
      const lastSeq = lastSeqRecord ? (lastSeqRecord.value as number) : 0;

      const { data: maxSeqData, error: maxSeqError } = await supabase
        .from('sync_envelopes')
        .select('sequence')
        .order('sequence', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxSeqError) {
        aferixLogger.warn('CloudSync', 'Erro ao obter max sequence na nuvem', maxSeqError);
      }

      const maxSeq = maxSeqData ? Number(maxSeqData.sequence) : 0;
      const distance = maxSeq - lastSeq;

      // 1. Bulk Snapshot Fallback quando o delta de sequence > 10000
      if (distance > 10000) {
        aferixLogger.warn('CloudSync', `Lookback delta ${distance} excede 10.000. Ativando Bulk Snapshot Fallback.`);
        const { data: bulkEnvelopes, error: bulkError } = await supabase
          .from('sync_envelopes')
          .select('sequence, envelope_id, event_id, device_id, aggregate_type, aggregate_id, payload, timestamp')
          .gt('sequence', lastSeq)
          .order('sequence', { ascending: false })
          .limit(1000);

        if (bulkError) {
          aferixLogger.error('CloudSync', 'Erro no bulk snapshot fallback', bulkError);
          return { pulled: 0, errors: 1 };
        }

        let processed = 0;
        if (bulkEnvelopes && bulkEnvelopes.length > 0) {
          await db.transaction('rw', [db.budgets, db.attendances, db.workOrders, db.clients, db.settings, db.operationalEvents], async () => {
            const seen = new Set<string>();
            for (const env of bulkEnvelopes) {
              const key = `${env.aggregate_type}:${env.aggregate_id}`;
              if (seen.has(key)) continue;
              seen.add(key);

              if (env.device_id === this.getInstallationId()) continue;

              const targetTable = this.mapAggregateTypeToTable(env.aggregate_type);
              if (targetTable && env.payload?.snapshot) {
                await (db as any)[targetTable].put({
                  ...env.payload.snapshot,
                  id: env.aggregate_id,
                  syncStatus: 'synced',
                  syncUpdatedAt: Date.now()
                });
                processed++;
              }
            }
            await db.settings.put({ key: 'last_synced_sequence', value: maxSeq });
          });
        }
        return { pulled: processed, errors: 0 };
      }

      // 2. Pull Incremental Padrão com Buffer Temporal de 5 segundos contra invisibilidade de commits concorrentes
      const ageBufferTime = new Date(Date.now() - 5000).toISOString();

      const { data: envelopes, error: pullError } = await supabase
        .from('sync_envelopes')
        .select('sequence, envelope_id, event_id, device_id, aggregate_type, aggregate_id, payload, timestamp')
        .gt('sequence', lastSeq)
        .lt('timestamp', ageBufferTime)
        .order('sequence', { ascending: true })
        .limit(100);

      if (pullError) {
        aferixLogger.error('CloudSync', 'Erro ao carregar envelopes de sync', pullError);
        return { pulled: 0, errors: 1 };
      }

      if (!envelopes || envelopes.length === 0) {
        return { pulled: 0, errors: 0 };
      }

      let processed = 0;
      await db.transaction('rw', [db.budgets, db.attendances, db.workOrders, db.clients, db.settings, db.operationalEvents], async () => {
        let currentSeq = lastSeq;
        for (const env of envelopes) {
          currentSeq = Number(env.sequence);

          // Echo prevention
          if (env.device_id === this.getInstallationId()) {
            continue;
          }

          const remoteTime = new Date(env.timestamp).getTime();
          const targetTable = this.mapAggregateTypeToTable(env.aggregate_type);

          if (targetTable) {
            const localRecord = await (db as any)[targetTable].get(env.aggregate_id);

            // Reconciliação LWW: Se local for pendente e mais novo, ignora pull
            if (localRecord &&
                localRecord.syncStatus === 'pending' &&
                localRecord.updatedAt &&
                new Date(localRecord.updatedAt).getTime() > remoteTime) {
              continue;
            }

            const snapshot = env.payload?.snapshot;
            if (snapshot) {
              await (db as any)[targetTable].put({
                ...snapshot,
                id: env.aggregate_id,
                syncStatus: 'synced',
                syncUpdatedAt: Date.now()
              });
              processed++;
            }
          }

          // Idempotency: Gravação do evento de reconciliação
          await db.operationalEvents.put({
            id: env.event_id,
            aggregateId: env.aggregate_id,
            aggregateType: env.aggregate_type as any,
            eventType: 'RECONCILIATION_COMPLETED' as any,
            timestamp: env.timestamp,
            actor: env.payload?.actor || 'system-sync',
            syncStatus: 'synced',
            createdAt: new Date().toISOString()
          });
        }

        await db.settings.put({ key: 'last_synced_sequence', value: currentSeq });
      });

      return { pulled: processed, errors: 0 };
    } catch (err) {
      aferixLogger.error('CloudSync', 'Pull engine execution failed', err);
      return { pulled: 0, errors: 1 };
    }
  }
}

export const cloudSyncService = CloudSyncService.getInstance();


