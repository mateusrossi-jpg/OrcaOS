import { db } from '../storage/dexieDatabase';

export class WarrantyFinancialImpact {
  static async calculateImpact(companyId: string): Promise<{
    protectedRevenue: number;
    avoidedCosts: number;
    claimedWarranties: number;
  }> {
    const activeCoverages = await db.warrantyCoverage
      .where({ companyId, status: 'ACTIVE' })
      .toArray();

    const claimed = await db.warrantyClaims
      .where({ companyId, status: 'CLAIMED' })
      .toArray();

    const protectedRevenue = activeCoverages.reduce((sum, c) => sum + (c.costProtected || 0), 0);
    const avoidedCosts = claimed.reduce((sum, c) => sum + (c.financialRecovery || 0), 0);

    return {
      protectedRevenue,
      avoidedCosts,
      claimedWarranties: claimed.length
    };
  }
}
