import type { BusinessProfile } from '../../../core/types/business';

const BUSINESS_PROFILE_STORAGE_KEY = 'orcaos:business-profile:v1';

export const defaultBusinessProfile: BusinessProfile = {
  businessName: 'Minha empresa / profissional',
  documentNumber: '',
  phone: '',
  email: '',
  address: '',
  logoUrl: '',
  logoDataUrl: '',
  responsibleName: '',
  defaultPaymentTerms: 'Condições de pagamento a combinar.',
  defaultValidity: '7 dias',
  defaultGuarantee: 'Garantia conforme serviço executado e materiais aplicados.',
  defaultExecutionDeadline: 'Prazo de execução a combinar após aprovação.',
  defaultNotes: 'Valores sujeitos à confirmação após vistoria, disponibilidade de materiais e validação técnica do serviço.',
};

function isBusinessProfile(value: unknown): value is BusinessProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const profile = value as Partial<BusinessProfile>;

  return (
    typeof profile.businessName === 'string' &&
    typeof profile.documentNumber === 'string' &&
    typeof profile.phone === 'string' &&
    typeof profile.email === 'string' &&
    typeof profile.address === 'string' &&
    typeof profile.logoUrl === 'string' &&
    (typeof profile.logoDataUrl === 'string' || typeof profile.logoDataUrl === 'undefined') &&
    typeof profile.responsibleName === 'string' &&
    typeof profile.defaultPaymentTerms === 'string' &&
    typeof profile.defaultValidity === 'string' &&
    (typeof profile.defaultGuarantee === 'string' || typeof profile.defaultGuarantee === 'undefined') &&
    (typeof profile.defaultExecutionDeadline === 'string' || typeof profile.defaultExecutionDeadline === 'undefined') &&
    typeof profile.defaultNotes === 'string'
  );
}

export function loadBusinessProfile(): BusinessProfile {
  if (typeof window === 'undefined') {
    return defaultBusinessProfile;
  }

  try {
    const storedValue = window.localStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY);

    if (!storedValue) {
      return defaultBusinessProfile;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isBusinessProfile(parsedValue)) {
      return defaultBusinessProfile;
    }

    return { ...defaultBusinessProfile, ...parsedValue };
  } catch {
    return defaultBusinessProfile;
  }
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(BUSINESS_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
