import { ProfessionalProfile } from '../features/settings/models/professionalProfile';
import { db } from '../storage/dexieDatabase';
import { ProfessionalProfileRepository } from './professionalProfileRepository';

const PROFESSIONAL_PROFILE_ID = 'primary';

export class DexieProfessionalProfileRepository implements ProfessionalProfileRepository {
  async get(): Promise<ProfessionalProfile | null> {
    const record = await db.professionalProfiles.get(PROFESSIONAL_PROFILE_ID);
    if (!record) return null;
    const { id: _id, ...profile } = record;
    return profile;
  }

  async save(profile: ProfessionalProfile): Promise<void> {
    await db.professionalProfiles.put({ id: PROFESSIONAL_PROFILE_ID, ...profile });
  }
}

export const dexieProfessionalProfileRepository = new DexieProfessionalProfileRepository();
