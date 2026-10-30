import { db } from '../storage/dexieDatabase';
import { WarrantyAlert } from '../domain/warranty';
import { OperationalEvent } from '../domain/operationalEvent';

export class WarrantyAlertService {
  static async evaluateExpirations(companyId: string): Promise<void> {
    const activeCoverages = await db.warrantyCoverage
      .where({ companyId, status: 'ACTIVE' })
      .toArray();

    if (activeCoverages.length === 0) return;

    const existingSoonAlerts = await db.warrantyAlerts
      .where({ companyId, type: 'EXPIRING_SOON' })
      .toArray();

    const existingSoonAlertSet = new Set<string>();
    for (const alert of existingSoonAlerts) {
      if (alert.coverageId) {
        existingSoonAlertSet.add(alert.coverageId);
      }
    }

    const now = new Date().getTime();
    const days90 = 90 * 24 * 60 * 60 * 1000;

    const expiredUpdates: Array<{ key: string; changes: { status: 'EXPIRED' } }> = [];
    const alertsToPut: WarrantyAlert[] = [];
    const eventsToPut: OperationalEvent[] = [];

    for (const coverage of activeCoverages) {
      if (!coverage.expirationDate) continue;

      const expiration = new Date(coverage.expirationDate).getTime();
      const timeLeft = expiration - now;

      if (timeLeft <= 0) {
        // Expired
        expiredUpdates.push({
          key: coverage.id,
          changes: { status: 'EXPIRED' }
        });
        alertsToPut.push({
          id: `wa-exp-${coverage.id}`,
          companyId,
          workspaceId: coverage.workspaceId,
          coverageId: coverage.id,
          assetId: coverage.assetId,
          type: 'EXPIRED',
          message: `Garantia de ${coverage.partName} expirada.`,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      } else if (timeLeft <= days90) {
        // Expiring Soon
        if (!existingSoonAlertSet.has(coverage.id)) {
          alertsToPut.push({
            id: `wa-soon-${coverage.id}`,
            companyId,
            workspaceId: coverage.workspaceId,
            coverageId: coverage.id,
            assetId: coverage.assetId,
            type: 'EXPIRING_SOON',
            message: `Garantia de ${coverage.partName} expira em breve.`,
            resolved: false,
            createdAt: new Date().toISOString()
          });

          eventsToPut.push({
            id: `evt-wa-${coverage.id}`,
            aggregateId: coverage.assetId,
            aggregateType: 'asset',
            eventType: 'WARRANTY_EXPIRING',
            timestamp: new Date().toISOString(),
            actor: 'SYSTEM',
            source: 'WarrantyAlertService',
            createdAt: new Date().toISOString()
          });

          existingSoonAlertSet.add(coverage.id);
        }
      }
    }

    if (expiredUpdates.length > 0 || alertsToPut.length > 0 || eventsToPut.length > 0) {
      await db.transaction('rw', [db.warrantyCoverage, db.warrantyAlerts, db.operationalEvents], async () => {
        if (expiredUpdates.length > 0) {
          await db.warrantyCoverage.bulkUpdate(expiredUpdates);
        }
        if (alertsToPut.length > 0) {
          await db.warrantyAlerts.bulkPut(alertsToPut);
        }
        if (eventsToPut.length > 0) {
          await db.operationalEvents.bulkPut(eventsToPut);
        }
      });
    }
  }
}
