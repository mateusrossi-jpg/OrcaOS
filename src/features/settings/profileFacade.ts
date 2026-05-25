import { loadProfessionalProfile, type ProfessionalProfile } from './storage/professionalProfileStorage';

/**
 * ProfileFacade: Public entry point for Professional Profile data.
 */
export const ProfileFacade = {
  getProfile: (): ProfessionalProfile => {
    return loadProfessionalProfile();
  }
};
