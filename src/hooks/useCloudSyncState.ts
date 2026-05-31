import { useState, useEffect, useCallback } from 'react';
import { cloudSyncService } from '../services/CloudSyncService';
import { syncService } from '../services/SyncService';

export type SyncState = 'synced' | 'pending' | 'offline';

export function useCloudSyncState() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkPending = useCallback(async () => {
    try {
      const { totalPending } = await syncService.getPendingChanges();
      const eventPending = await cloudSyncService.countPendingEvents();
      setPendingCount(totalPending + eventPending);
    } catch (e) {
      console.error('[SyncHook] Failed to check pending changes:', e);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline) return;
    setIsLoading(true);
    try {
      await cloudSyncService.syncLocalToCloud();
      await checkPending();
    } catch (e) {
      console.error('[SyncHook] Synchronization trigger failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, checkPending]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      void triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    void checkPending();

    // Check periodically
    const interval = setInterval(() => {
      void checkPending();
    }, 15000); // Check every 15 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkPending, triggerSync]);

  const syncState: SyncState = !isOnline 
    ? 'offline' 
    : pendingCount > 0 
      ? 'pending' 
      : 'synced';

  return {
    isOnline,
    pendingCount,
    syncState,
    isLoading,
    refresh: checkPending,
    sync: triggerSync
  };
}
