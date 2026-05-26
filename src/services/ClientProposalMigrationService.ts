import { db } from '../storage/dexieDatabase';
import { loadClientProposals } from '../features/clientPortal/storage/clientProposalStorage';
import { dexieClientProposalRepository } from '../repositories/dexieClientProposalRepository';

export class ClientProposalMigrationService {
  private static readonly MIGRATION_KEY = 'client_proposal_dexie_migration_v1';

  async runIfNeeded(): Promise<void> {
    const migration = await db.migrations.get(ClientProposalMigrationService.MIGRATION_KEY);
    if (migration?.done) {
      return;
    }

    console.info('Starting ClientProposal migration to Dexie...');

    try {
      const legacyProposals = loadClientProposals();
      
      if (legacyProposals.length > 0) {
        await dexieClientProposalRepository.bulkAdd(legacyProposals);
        console.info(`Migrated ${legacyProposals.length} client proposals to Dexie.`);
      }

      await db.migrations.put({ key: ClientProposalMigrationService.MIGRATION_KEY, done: true });
      console.info('ClientProposal migration completed successfully.');
    } catch (error) {
      console.error('Failed to migrate ClientProposals to Dexie:', error);
    }
  }
}

export const clientProposalMigrationService = new ClientProposalMigrationService();
