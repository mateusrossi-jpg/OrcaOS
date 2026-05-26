import { dexieProfessionalProfileRepository } from '../repositories/dexieProfessionalProfileRepository';
import { ProfessionalProfile, createDefaultProfessionalProfile, resetProfessionalProfileIds } from '../features/settings/models/professionalProfile';

export class ProfessionalProfileService {
  constructor(private readonly repository = dexieProfessionalProfileRepository) {}

  async getProfile(): Promise<ProfessionalProfile> {
    return (await this.repository.get()) ?? createDefaultProfessionalProfile();
  }

  async saveProfile(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    const now = new Date().toISOString();
    const nextProfile: ProfessionalProfile = {
      ...profile,
      updatedAt: now,
      createdAt: profile.createdAt || now,
    };
    await this.repository.save(nextProfile);
    return nextProfile;
  }

  async regenerateIds(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    const nextProfile = resetProfessionalProfileIds(profile);
    await this.repository.save(nextProfile);
    return nextProfile;
  }
}

export const professionalProfileService = new ProfessionalProfileService();
