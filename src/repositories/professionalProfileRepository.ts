import { ProfessionalProfile } from '../features/settings/models/professionalProfile';

export interface ProfessionalProfileRepository {
  get(): Promise<ProfessionalProfile | null>;
  save(profile: ProfessionalProfile): Promise<void>;
}
