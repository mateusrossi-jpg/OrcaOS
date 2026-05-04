import type { BudgetTemplateId, ReportTemplateId } from '../../../core/types/business';

export interface ProfessionalProfile {
  professionalId: string;
  companyId: string;
  professionalName: string;
  businessName: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string;
  logoDataUrl: string;
  mainArea: string;
  commercialNotes: string;
  defaultPaymentTerms: string;
  defaultValidity: string;
  defaultGuarantee: string;
  defaultExecutionDeadline: string;
  defaultBudgetTemplateId: BudgetTemplateId;
  defaultReportTemplateId: ReportTemplateId;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'orcaos:professional-profile:v1';

function createStableId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function createEmptyProfile(): ProfessionalProfile {
  const timestamp = new Date().toISOString();
  return {
    professionalId: createStableId('pro'),
    companyId: createStableId('company'),
    professionalName: '',
    businessName: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    logoUrl: '',
    logoDataUrl: '',
    mainArea: 'Elétrica',
    commercialNotes: '',
    defaultPaymentTerms: 'Condições de pagamento a combinar.',
    defaultValidity: '7 dias',
    defaultGuarantee: 'Garantia conforme serviço executado e materiais aplicados.',
    defaultExecutionDeadline: 'Prazo de execução a combinar após aprovação.',
    defaultBudgetTemplateId: 'simple',
    defaultReportTemplateId: 'technicalSimple',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function isProfessionalProfile(value: unknown): value is ProfessionalProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<ProfessionalProfile>;
  return typeof profile.professionalId === 'string' && typeof profile.companyId === 'string';
}

export function loadProfessionalProfile(): ProfessionalProfile {
  if (typeof window === 'undefined') return createEmptyProfile();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const emptyProfile = createEmptyProfile();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyProfile));
      return emptyProfile;
    }
    const parsed: unknown = JSON.parse(stored);
    if (!isProfessionalProfile(parsed)) return createEmptyProfile();
    return {
      ...createEmptyProfile(),
      ...parsed,
      professionalId: parsed.professionalId,
      companyId: parsed.companyId,
    };
  } catch {
    return createEmptyProfile();
  }
}

export function saveProfessionalProfile(profile: ProfessionalProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}

export function resetProfessionalProfileIds(profile: ProfessionalProfile): ProfessionalProfile {
  const timestamp = new Date().toISOString();
  return {
    ...profile,
    professionalId: createStableId('pro'),
    companyId: createStableId('company'),
    updatedAt: timestamp,
  };
}
