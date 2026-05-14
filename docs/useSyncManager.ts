import { useEffect, useState } from 'react';
import { triggerSupabaseSync } from './syncService';

export type SyncStatus = 'synced' | 'pending' | 'offline';

export function useSyncManager() {
  const [status, setStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    const handleOnline = () => {
      setStatus('pending');
      triggerSupabaseSync();
    };
    
    const handleOffline = () => setStatus('offline');
    
    const handleSyncCompleted = () => setStatus('synced');
    const handleSyncPending = () => setStatus('pending');

    // Verifica estado inicial ao montar o componente
    if (!navigator.onLine) {
      setStatus('offline');
    } else {
      const queueRaw = localStorage.getItem('sync_queue');
      if (queueRaw && JSON.parse(queueRaw).length > 0) {
        setStatus('pending');
        triggerSupabaseSync();
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync:completed', handleSyncCompleted);
    window.addEventListener('sync:pending', handleSyncPending);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync:completed', handleSyncCompleted);
      window.removeEventListener('sync:pending', handleSyncPending);
    };
  }, []);

  return { status };
}