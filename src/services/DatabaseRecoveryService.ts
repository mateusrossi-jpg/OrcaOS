/* eslint-disable @typescript-eslint/no-explicit-any */
import { aferixLogger } from '../core/debug/aferixLogger';
import { db } from '../storage/dexieDatabase';

export interface RecoverySnapshot {
  timestamp: string;
  tablesStatus: Record<string, { count: number, accessible: boolean }>;
  corruptionDetected: boolean;
}

class DatabaseRecoveryService {
  async validateDatabaseState(): Promise<boolean> {
    try {
      await db.open();
      return true;
    } catch (e: any) {
      aferixLogger.error('DatabaseRecovery', 'Database failed to open', e);
      return false;
    }
  }

  async detectCorruption(): Promise<boolean> {
    // Attempt basic reads on critical tables
    try {
      await db.budgets.limit(1).toArray();
      await db.clients.limit(1).toArray();
      return false;
    } catch (e) {
      aferixLogger.error('DatabaseRecovery', 'Corruption detected during read test', e);
      return true;
    }
  }

  async detectPartialRestore(): Promise<boolean> {
    // A heuristic: if there are work orders but no budgets or clients, it might be partial
    const workOrderCount = await db.workOrders.count();
    const budgetCount = await db.budgets.count();
    const clientCount = await db.clients.count();

    if (workOrderCount > 0 && budgetCount === 0 && clientCount === 0) {
      aferixLogger.warn('DatabaseRecovery', 'Partial restore detected (workOrders without budgets/clients)');
      return true;
    }
    return false;
  }

  async validateCriticalTables(): Promise<void> {
    const isCorrupt = await this.detectCorruption();
    if (isCorrupt) throw new Error('Critical tables corrupted');
  }

  async generateRecoverySnapshot(): Promise<RecoverySnapshot> {
    const isCorrupt = await this.detectCorruption();
    return {
      timestamp: new Date().toISOString(),
      tablesStatus: {
        budgets: { count: await db.budgets.count().catch(() => 0), accessible: !isCorrupt },
        clients: { count: await db.clients.count().catch(() => 0), accessible: !isCorrupt },
        workOrders: { count: await db.workOrders.count().catch(() => 0), accessible: !isCorrupt },
      },
      corruptionDetected: isCorrupt
    };
  }

  async attemptSoftRecovery(): Promise<void> {
    // In the future: index rebuild, object store repair, orphan cleanup
    aferixLogger.info('DatabaseRecovery', 'Soft recovery attempted. Reopening database...');
    if (db.isOpen()) {
      db.close();
    }
    await db.open();
  }
}

export const databaseRecoveryService = new DatabaseRecoveryService();
