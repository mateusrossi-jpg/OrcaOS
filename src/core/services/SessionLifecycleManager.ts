import { syncHealthService } from './SyncHealthService';
import { supabase } from '../database/supabaseClient';
import { authRecoveryService } from './AuthRecoveryService';

export class SessionLifecycleManager {
  private _isRefreshing = false;
  private _lastSessionCheckTime = 0;
  private _sessionCheckCooldown = 1000 * 10; // 10 seconds cooldown
  private _cachedIsValid = false;

  async ensureValidSession(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - this._lastSessionCheckTime < this._sessionCheckCooldown) {
       return this._cachedIsValid;
    }

    if (this._isRefreshing) {
      // Wait a bit if currently refreshing
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this._lastSessionCheckTime = now;

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
       syncHealthService.setState('expired');
       this._cachedIsValid = false;
       return false;
    }

    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const isExpiredOrClose = expiresAt > 0 && expiresAt - Date.now() < 5 * 60 * 1000; // 5 minutes window

    if (isExpiredOrClose) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
         syncHealthService.setState('offline');
         this._cachedIsValid = false;
         return false; // Can't refresh offline, we return false to prevent unauthorized calls
      }

      this._isRefreshing = true;
      syncHealthService.setState('refreshing');
      syncHealthService.recordRefreshAttempt();

      try {
        const { data: newSessionData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !newSessionData.session) {
           syncHealthService.recordRefreshFailure(refreshError?.message);
           syncHealthService.setState('expired');
           this._cachedIsValid = false;
           // If it failed, let's trigger recovery to see if it's completely unrecoverable
           await authRecoveryService.retryRefresh().then(success => {
             if (!success) authRecoveryService.requireLogin();
           });
           return false;
        }

        syncHealthService.setState('authenticated');
        this._cachedIsValid = true;
        return true;
      } catch (e: any) {
        syncHealthService.recordRefreshFailure(e?.message);
        syncHealthService.setState('expired');
        this._cachedIsValid = false;
        return false;
      } finally {
        this._isRefreshing = false;
      }
    }

    syncHealthService.setState('authenticated');
    this._cachedIsValid = true;
    return true;
  }
}

export const sessionLifecycleManager = new SessionLifecycleManager();
