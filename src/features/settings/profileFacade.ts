import { professionalProfileService } from '../../services/professionalProfileService';
import { type ProfessionalProfile } from './storage/professionalProfileStorage';

export const ProfileFacade = {
  getProfile: async (): Promise<ProfessionalProfile> => {
    return professionalProfileService.getProfile();
  }
};
