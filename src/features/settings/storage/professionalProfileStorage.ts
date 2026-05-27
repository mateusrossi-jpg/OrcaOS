import { createDefaultProfessionalProfile, resetProfessionalProfileIds, type ProfessionalProfile } from '../models/professionalProfile';
import { safeJsonParse } from '../../../core/runtime/safeGuards';

export { createDefaultProfessionalProfile, resetProfessionalProfileIds };
export type { ProfessionalProfile };

export const PROFESSIONAL_PROFILE_STORAGE_KEY = 'orcaos:professional-profile:v1';

function isProfessionalProfile(value: unknown): value is ProfessionalProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<ProfessionalProfile>;
  return typeof profile.professionalId === 'string' && typeof profile.companyId === 'string';
}

export function loadProfessionalProfile(): ProfessionalProfile {
  if (typeof window === 'undefined') return createDefaultProfessionalProfile();
  
  const stored = window.localStorage.getItem(PROFESSIONAL_PROFILE_STORAGE_KEY);
  const parsed = safeJsonParse<unknown>(stored, null);
  
  if (!isProfessionalProfile(parsed)) return createDefaultProfessionalProfile();
  
  return {
    ...createDefaultProfessionalProfile(),
    ...parsed,
    professionalId: parsed.professionalId,
    companyId: parsed.companyId,
  };
}

export function saveProfessionalProfile(profile: ProfessionalProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFESSIONAL_PROFILE_STORAGE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}
