import { aferixLogger } from '../debug/aferixLogger';

const activeLocks = new Map<string, number>();
const LOCK_TIMEOUT_MS = 5000;

export const writeLock = {
  acquireLock: (entityId: string): boolean => {
    const now = Date.now();
    const existingLock = activeLocks.get(entityId);
    
    if (existingLock) {
      if (now - existingLock > LOCK_TIMEOUT_MS) {
        aferixLogger.warn('WriteLock', `Stale lock cleared for ${entityId}`);
        activeLocks.delete(entityId);
      } else {
        return false; // Locked!
      }
    }
    
    activeLocks.set(entityId, now);
    return true;
  },

  releaseLock: (entityId: string) => {
    activeLocks.delete(entityId);
  },

  withDatabaseLock: async <T>(entityId: string, operation: () => Promise<T>): Promise<T> => {
    const lockAcquired = writeLock.acquireLock(entityId);
    if (!lockAcquired) {
      throw new Error(`[WriteLock] Concurrent write prevented for entity: ${entityId}`);
    }
    
    try {
      return await operation();
    } finally {
      writeLock.releaseLock(entityId);
    }
  }
};
