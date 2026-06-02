import { db } from '../storage/dexieDatabase';
import type { AccountPlanRepository } from './accountPlanRepository';
import type { AferixAccountState } from '../core/access/accountPlanStorage';

export class DexieAccountPlanRepository implements AccountPlanRepository {
  private readonly SINGLETON_ID = 'singleton';

  async get(): Promise<AferixAccountState | null> {
    const record = await db.accountPlan.get(this.SINGLETON_ID);
    if (!record) return null;
     
    const { id, ...state } = record;
    return state as unknown as AferixAccountState;
  }

  async save(state: AferixAccountState): Promise<void> {
    await db.accountPlan.put({ ...state, id: this.SINGLETON_ID });
  }

  async clear(): Promise<void> {
    await db.accountPlan.delete(this.SINGLETON_ID);
  }
}

export const accountPlanRepository = new DexieAccountPlanRepository();
