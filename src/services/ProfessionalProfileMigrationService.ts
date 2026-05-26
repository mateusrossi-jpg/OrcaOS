import { db } from '../storage/dexieDatabase';
import { loadProfessionalProfile } from '../features/settings/storage/professionalProfileStorage';
import { professionalProfileService } from './professionalProfileService';

export class ProfessionalProfileMigrationService {
  static MIGRATION_KEY = 'migration:professional-profile:v1';

  async runIfNeeded(): Promise<void> {
    const migration = await db.migrations.get(ProfessionalProfileMigrationService.MIGRATION_KEY);
    if (migration?.done) return;

    const legacyProfile = loadProfessionalProfile();
    await professionalProfileService.saveProfile(legacyProfile);

    await db.migrations.put({ key: ProfessionalProfileMigrationService.MIGRATION_KEY, done: true });
  }
}

export const professionalProfileMigrationService = new ProfessionalProfileMigrationService();
