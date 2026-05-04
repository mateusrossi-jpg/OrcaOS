export interface SupplierProfile {
  id: string;
  name: string;
  document: string;
  stateRegistration?: string;
  segment: string;
  city?: string;
  state?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  catalogUrl?: string;
  paymentTerms?: string;
  averageDeliveryDays?: number;
  defaultTaxNotes?: string;
  purchaseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'orcaos:supplier-profiles:v1';
export const SUPPLIER_PROFILES_CHANGED_EVENT = 'orcaos:supplier-profiles-changed';

function safeParseProfiles(value: string | null): SupplierProfile[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SupplierProfile => {
      if (!item || typeof item !== 'object') return false;
      const profile = item as Partial<SupplierProfile>;
      return typeof profile.id === 'string' && typeof profile.name === 'string' && typeof profile.document === 'string';
    });
  } catch {
    return [];
  }
}

export function loadSupplierProfiles(): SupplierProfile[] {
  if (typeof window === 'undefined') return [];
  return safeParseProfiles(window.localStorage.getItem(STORAGE_KEY)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveSupplierProfiles(profiles: SupplierProfile[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  window.dispatchEvent(new CustomEvent(SUPPLIER_PROFILES_CHANGED_EVENT));
}

export function createSupplierProfileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `supplier-profile-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function upsertSupplierProfile(profile: SupplierProfile): { profile: SupplierProfile; action: 'created' | 'updated' } {
  const profiles = loadSupplierProfiles();
  const normalizedDocument = profile.document.replace(/\D/g, '');
  const normalizedName = profile.name.trim().toLowerCase();
  const existing = profiles.find((item) => {
    const itemDocument = item.document.replace(/\D/g, '');
    if (normalizedDocument && itemDocument) return itemDocument === normalizedDocument;
    return item.name.trim().toLowerCase() === normalizedName;
  });
  const timestamp = new Date().toISOString();

  if (existing) {
    const updatedProfile = {
      ...existing,
      ...profile,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: timestamp,
    };
    saveSupplierProfiles(profiles.map((item) => (item.id === existing.id ? updatedProfile : item)));
    return { profile: updatedProfile, action: 'updated' };
  }

  saveSupplierProfiles([{ ...profile, updatedAt: timestamp }, ...profiles]);
  return { profile, action: 'created' };
}
