import { aferixLogger } from '../core/debug/aferixLogger';
import { db } from '../storage/dexieDatabase';

export interface StoragePressureReport {
  usageBytes: number;
  quotaBytes: number;
  percentageUsed: number;
  pressureWarning: boolean;
  queueSizeEstimate: number;
}

class StoragePressureService {
  private WARNING_THRESHOLD = 0.8; // 80%

  async estimateStorageUsage(): Promise<{ usage: number, quota: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }

  async queueSizeEstimate(): Promise<number> {
    // Rough estimate of pending sync queue size
    const pendingBudgets = await db.budgets.filter(b => b.syncStatus === 'pending').count();
    const pendingClients = await db.clients.filter(c => c.syncStatus === 'pending').count();
    const pendingWorkOrders = await db.workOrders.filter(w => w.syncStatus === 'pending').count();
    return pendingBudgets + pendingClients + pendingWorkOrders;
  }

  async detectStoragePressure(): Promise<StoragePressureReport> {
    const { usage, quota } = await this.estimateStorageUsage();
    const percentageUsed = quota > 0 ? usage / quota : 0;
    const pressureWarning = percentageUsed >= this.WARNING_THRESHOLD;

    if (pressureWarning) {
      aferixLogger.warn('StoragePressure', `Storage pressure detected! Used: ${Math.round(percentageUsed * 100)}%`);
    }

    const queueSize = await this.queueSizeEstimate();

    return {
      usageBytes: usage,
      quotaBytes: quota,
      percentageUsed,
      pressureWarning,
      queueSizeEstimate: queueSize
    };
  }
}

export const storagePressureService = new StoragePressureService();
