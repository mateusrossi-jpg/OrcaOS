import { syncHealthService } from './SyncHealthService';
import { deviceHealthService } from './DeviceHealthService';
import { db } from '../database/db';

export interface SyncDiagnosticReport {
  tenant: string | null;
  generatedAt: string;
  lastSync: string | null;
  pendingMutations: number;
  deadLetters: number;
  storageUsagePercentage: number;
  bootstrapStatus: string;
  isOnline: boolean;
  browserVersion: string;
  lastCrash: string | null;
  cursorCount: number;
}

export class SyncDoctorService {
  async generateReport(): Promise<SyncDiagnosticReport> {
    const health = await syncHealthService.getHealth();
    const device = await deviceHealthService.getHealth();

    // In a real app, tenant would come from auth context
    const tenant = localStorage.getItem('tenant');
    const bootstrapStatus = localStorage.getItem('aferix_bootstrap_status') || 'unknown';
    const cursors = await db.sync_cursors.count();

    return {
      tenant,
      generatedAt: new Date().toISOString(),
      lastSync: health.lastSyncAt ? health.lastSyncAt.toISOString() : null,
      pendingMutations: health.pendingCount,
      deadLetters: health.deadLetterCount,
      storageUsagePercentage: device.storagePercentage,
      bootstrapStatus,
      isOnline: device.isOnline,
      browserVersion: device.browserVersion,
      lastCrash: device.lastCrashDetected || null,
      cursorCount: cursors
    };
  }

  async exportReport(): Promise<string> {
    const report = await this.generateReport();
    return JSON.stringify(report, null, 2);
  }
}

export const syncDoctorService = new SyncDoctorService();
