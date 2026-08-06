export type QuotaState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'BLOCKED';

export interface QuotaMetrics {
  usage: number;
  quota: number;
  percentage: number;
  state: QuotaState;
}

export class StorageQuotaMonitor {
  static async estimate(): Promise<QuotaMetrics> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 1, percentage: 0, state: 'NORMAL' };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const percentage = (usage / quota) * 100;

      let state: QuotaState = 'NORMAL';
      if (percentage >= 95) state = 'BLOCKED';
      else if (percentage >= 85) state = 'CRITICAL';
      else if (percentage >= 70) state = 'WARNING';

      return { usage, quota, percentage, state };
    } catch (err) {
      console.error('[StorageQuotaMonitor] Failed to estimate storage', err);
      return { usage: 0, quota: 1, percentage: 0, state: 'NORMAL' };
    }
  }

  static async canDownloadMedia(sizeBytes: number): Promise<boolean> {
    const metrics = await this.estimate();
    if (metrics.state === 'BLOCKED') return false;
    // Don't download if it will immediately block
    if (metrics.usage + sizeBytes >= metrics.quota * 0.95) return false;
    return true;
  }
}
