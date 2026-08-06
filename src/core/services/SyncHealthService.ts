import { outboxRepository } from '../repositories/OutboxRepository';
import { db } from '../database/db';

export type SyncState = 'authenticated' | 'authentication_required' | 'syncing' | 'offline' | 'refreshing' | 'expired';

export interface SyncHealth {
  pendingCount: number;
  deadLetterCount: number;
  lastSyncAt: Date | null;
  lastError: string | null;
  errorCount: number;
  state: SyncState;
  pendingCleanupMediaCount: number;
  mediaCleanupErrorCount: number;
  lastMediaCleanupAt: Date | null;
  blockedByAuthCount: number;
  lastBlockReason: string | null;
  lastSuccessfulTaskAt: Date | null;
  refreshAttempts: number;
  refreshFailures: number;
  authRecoveryTriggered: number;
  lastAuthError: string | null;
  mediaPendingCount: number;
  mediaDownloadedBytes: number;
  storageUsagePercentage: number;
}

export class SyncHealthService {
  private _lastSyncAt: Date | null = null;
  private _lastMediaCleanupAt: Date | null = null;
  private _currentState: SyncState = 'authenticated';
  private _mediaCleanupErrorCount: number = 0;
  private _blockedByAuthCount: number = 0;
  private _lastBlockReason: string | null = null;
  private _lastSuccessfulTaskAt: Date | null = null;
  private _refreshAttempts: number = 0;
  private _refreshFailures: number = 0;
  private _authRecoveryTriggered: number = 0;
  private _lastAuthError: string | null = null;

  async getHealth(): Promise<SyncHealth> {
    const allOutbox = await db.sync_outbox.toArray();

    const pendingCount = allOutbox.filter(i => i.status === 'pending' || !i.status).length;
    const deadLetterCount = allOutbox.filter(i => i.status === 'dead_letter').length;

    const mediaJobs = await db.media_download_jobs.toArray();
    const mediaPendingCount = mediaJobs.filter(j => j.status === 'queued' || j.status === 'downloading').length;
    const mediaDownloadedBytes = mediaJobs.reduce((acc, curr) => acc + (curr.bytes_downloaded || 0), 0);

    const { StorageQuotaMonitor } = await import('./StorageQuotaMonitor');
    const quota = await StorageQuotaMonitor.estimate();

    const errors = allOutbox.filter(i => i.last_error != null);
    const lastErrorItem = errors.sort((a, b) => b.created_at - a.created_at)[0];
    const errorCount = errors.length;

    // Check offline natively
    if (!navigator.onLine) {
       this._currentState = 'offline';
    }

    const mediaToClean = await db.work_order_media.where('sync_status').equals('deleted_pending_cleanup').count();

    return {
      pendingCount,
      deadLetterCount,
      lastSyncAt: this._lastSyncAt,
      lastError: lastErrorItem ? lastErrorItem.last_error! : null,
      errorCount,
      state: this._currentState,
      pendingCleanupMediaCount: mediaToClean,
      mediaCleanupErrorCount: this._mediaCleanupErrorCount,
      lastMediaCleanupAt: this._lastMediaCleanupAt,
      blockedByAuthCount: this._blockedByAuthCount,
      lastBlockReason: this._lastBlockReason,
      lastSuccessfulTaskAt: this._lastSuccessfulTaskAt,
      refreshAttempts: this._refreshAttempts,
      refreshFailures: this._refreshFailures,
      authRecoveryTriggered: this._authRecoveryTriggered,
      lastAuthError: this._lastAuthError,
      mediaPendingCount,
      mediaDownloadedBytes,
      storageUsagePercentage: quota.percentage,
    };
  }

  recordRefreshAttempt() {
    this._refreshAttempts++;
  }

  recordRefreshFailure(error?: string) {
    this._refreshFailures++;
    if (error) this._lastAuthError = error;
  }

  recordAuthRecovery() {
    this._authRecoveryTriggered++;
  }

  recordBlock(reason: string) {
    this._blockedByAuthCount++;
    this._lastBlockReason = reason;
  }

  recordSuccess() {
    this._lastSuccessfulTaskAt = new Date();
  }

  markMediaCleanupComplete() {
    this._lastMediaCleanupAt = new Date();
  }

  incrementMediaCleanupError() {
    this._mediaCleanupErrorCount++;
  }

  markSyncComplete() {
    this._lastSyncAt = new Date();
    if (this._currentState === 'syncing') {
       this._currentState = 'authenticated';
    }
  }

  setState(state: SyncState) {
    this._currentState = state;
  }
}

export const syncHealthService = new SyncHealthService();
