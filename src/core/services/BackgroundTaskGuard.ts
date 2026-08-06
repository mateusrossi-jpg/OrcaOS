import { syncHealthService } from './SyncHealthService';
import type { SyncState } from './SyncHealthService';
import { sessionLifecycleManager } from './SessionLifecycleManager';

export class BackgroundTaskGuard {
  async check(): Promise<SyncState> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      syncHealthService.setState('offline');
      syncHealthService.recordBlock('offline');
      return 'offline';
    }

    const isValid = await sessionLifecycleManager.ensureValidSession();

    if (!isValid) {
      // The session manager sets the state to expired or authentication_required
      // so we just record the block
      syncHealthService.recordBlock('authentication_required');
      return syncHealthService.getHealth().then(h => h.state);
    }

    syncHealthService.setState('authenticated');
    return 'authenticated';
  }
}

export const backgroundTaskGuard = new BackgroundTaskGuard();
