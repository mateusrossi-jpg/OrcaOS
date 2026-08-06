/* eslint-disable @typescript-eslint/no-explicit-any */
import { aferixLogger } from '../debug/aferixLogger';
import { db } from '../../storage/dexieDatabase';

export const safeTransaction = async <T>(
  operationName: string,
  transactionMode: 'r' | 'rw',
  tables: any[],
  callback: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      if (transactionMode === 'r') {
        const result = await db.transaction('r', tables, callback);
        return result;
      } else {
        const result = await db.transaction('rw', tables, callback);
        return result;
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      aferixLogger.error('SafeTransaction', `[${operationName}] Failed after ${duration}ms`, error);

      if (error.name === 'AbortError' || error.name === 'ConstraintError' || error.name === 'QuotaExceededError') {
        throw error; // Irrecoverable in this context
      }

      if (retryCount < maxRetries) {
        retryCount++;
        aferixLogger.warn('SafeTransaction', `[${operationName}] Retrying (${retryCount}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, retryCount))); // Exponential backoff
      } else {
        throw error;
      }
    }
  }

  throw new Error('SafeTransaction failed unexpectedly');
};
