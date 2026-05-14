import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { BudgetSyncService } from './BudgetSyncService';

interface NetworkContextType {
  isOnline: boolean;
  isPulsing: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isPulsing, setIsPulsing] = useState(false);
  const syncService = useRef<BudgetSyncService | null>(null);

  useEffect(() => {
    syncService.current = new BudgetSyncService();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 3000);
      
      // Engatilha a sincronização automaticamente quando a internet volta
      if (syncService.current) {
        syncService.current.syncPendingBudgets();
      }

      return () => clearTimeout(timer);
    } else {
      setIsPulsing(false);
    }
  }, [isOnline]);

  return (
    <NetworkContext.Provider value={{ isOnline, isPulsing }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork deve ser usado dentro de um NetworkProvider');
  }
  return context;
};