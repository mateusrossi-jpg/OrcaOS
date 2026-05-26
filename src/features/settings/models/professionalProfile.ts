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

function createStableId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function createDefaultProfessionalProfile(): ProfessionalProfile {
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

export function resetProfessionalProfileIds(profile: ProfessionalProfile): ProfessionalProfile {
  const timestamp = new Date().toISOString();
  return {
    ...profile,
    professionalId: createStableId('pro'),
    companyId: createStableId('company'),
    updatedAt: timestamp,
  };
}
