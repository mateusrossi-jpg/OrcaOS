import { db } from '../storage/dexieDatabase';
import { WarrantyCoverage } from '../domain/warranty';

export class WarrantyEngine {
  static async checkAssetCoverage(companyId: string, assetId: string): Promise<{
    hasActiveCoverage: boolean;
    activeCoverages: WarrantyCoverage[];
    protectedValue: number;
  }> {
    const coverages = await db.warrantyCoverage
      .where({ companyId, status: 'ACTIVE' })
      .filter(c => c.assetId === assetId)
      .toArray();

    const protectedValue = coverages.reduce((acc, c) => acc + (c.costProtected || 0), 0);

    return {
      hasActiveCoverage: coverages.length > 0,
      activeCoverages: coverages,
      protectedValue
    };
  }

  static async registerCoverage(coverage: WarrantyCoverage): Promise<void> {
    await db.warrantyCoverage.put(coverage);
    
    await db.operationalEvents.put({
      id: `evt-warr-${Date.now()}`,
      aggregateId: coverage.assetId,
      aggregateType: 'asset',
      eventType: 'WARRANTY_CREATED',
      timestamp: new Date().toISOString(),
      actor: 'SYSTEM',
      source: 'WarrantyEngine',
      createdAt: new Date().toISOString()
    });
  }
}
