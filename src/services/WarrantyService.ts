import { db } from '../storage/dexieDatabase';

export class WarrantyService {
  static async checkActiveWarranty(assetId: string, companyId: string): Promise<boolean> {
    const activeWarranties = await db.warranties
      .where({ assetId })
      .filter(w => w.companyId === companyId && w.status === 'ACTIVE' && new Date(w.expiresAt) > new Date())
      .toArray();

    return activeWarranties.length > 0;
  }

  static async getActiveWarranties(assetId: string) {
    return await db.warranties
      .where({ assetId })
      .filter(w => w.status === 'ACTIVE' && new Date(w.expiresAt) > new Date())
      .toArray();
  }
}
