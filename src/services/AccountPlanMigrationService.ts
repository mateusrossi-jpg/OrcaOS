import { accountPlanRepository } from '../repositories/dexieAccountPlanRepository';
import { legacyLoadAccountState } from '../core/access/accountPlanStorage';

const MIGRATION_KEY = 'orcaos:migrations:accountPlan-to-dexie';

export class AccountPlanMigrationService {
  static async runIfNeeded(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // eslint-disable-next-line no-restricted-syntax
      const hasMigrated = window.localStorage.getItem(MIGRATION_KEY);
      if (hasMigrated === 'true') {
        return;
      }
      
      const legacyAccount = legacyLoadAccountState();
      
      await accountPlanRepository.save(legacyAccount);
      
      // eslint-disable-next-line no-restricted-syntax
      window.localStorage.setItem(MIGRATION_KEY, 'true');
      console.info('AccountPlan migration to Dexie completed successfully.');
    } catch (err) {
      console.error('Failed to migrate AccountPlan to Dexie:', err);
    }
  }
}
