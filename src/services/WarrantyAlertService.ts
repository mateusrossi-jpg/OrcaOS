import { db } from '../storage/dexieDatabase';

export class WarrantyAlertService {
  static async evaluateExpirations(companyId: string): Promise<void> {
    const activeCoverages = await db.warrantyCoverage
      .where({ companyId, status: 'ACTIVE' })
      .toArray();

    const now = new Date().getTime();
    const days90 = 90 * 24 * 60 * 60 * 1000;
    const days60 = 60 * 24 * 60 * 60 * 1000;
    const days30 = 30 * 24 * 60 * 60 * 1000;
    const days7 = 7 * 24 * 60 * 60 * 1000;

    for (const coverage of activeCoverages) {
      if (!coverage.expirationDate) continue;

      const expiration = new Date(coverage.expirationDate).getTime();
      const timeLeft = expiration - now;

      if (timeLeft <= 0) {
        // Expired
        await db.warrantyCoverage.update(coverage.id, { status: 'EXPIRED' });
        await db.warrantyAlerts.put({
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
        // We could emit specific 90, 60, 30 day alerts. We'll simplify to EXPIRING_SOON
        const existingAlert = await db.warrantyAlerts
          .where({ coverageId: coverage.id, type: 'EXPIRING_SOON' })
          .first();

        if (!existingAlert) {
          await db.warrantyAlerts.put({
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

          await db.operationalEvents.put({
            id: `evt-wa-${Date.now()}`,
            aggregateId: coverage.assetId,
            aggregateType: 'asset',
            eventType: 'WARRANTY_EXPIRING',
            timestamp: new Date().toISOString(),
            actor: 'SYSTEM',
            source: 'WarrantyAlertService',
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  }
}
